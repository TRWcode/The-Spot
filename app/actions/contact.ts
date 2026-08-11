"use server";

import { createHash } from "node:crypto";
import { clientKey } from "@/lib/client-ip";
import { site } from "@/lib/content";
import { hit } from "@/lib/rate-limit";
import { verifyToken } from "@/lib/form-token";
import { assessMessage, BLOCK_SCORE, TAG_SCORE } from "@/lib/spam";

/**
 * Contact form handler.
 *
 * A Server Action compiles to a public POST endpoint — anyone can call it
 * without going through the form, so every check here is server-side. The
 * client-side `required` attributes are a convenience, never a guarantee.
 *
 * Spam is handled in layers, none of which can reject a message on its own:
 * the honeypot below, the rate limits, a signed token proving the form was
 * opened (`lib/form-token.ts`), and a score for what the message says
 * (`lib/spam.ts`). Only the sum decides, and the middle band is delivered with
 * a marked subject rather than dropped.
 *
 * Delivery goes through Resend's REST API over plain fetch, so there is no
 * extra dependency to install or keep updated. To switch providers, replace
 * `deliver()` and nothing else.
 *
 * SETUP:
 *   RESEND_API_KEY=re_xxx        from resend.com
 *   CONTACT_FROM="The SPOT <thespot@stapit.com>"
 *   CONTACT_TO=beer@...          optional, defaults to site.email
 *
 * Only the from-domain needs to be verified in Resend; the recipient can be
 * any address. That is what lets one verified domain serve every client site.
 * Without the key the action refuses cleanly rather than pretending it sent.
 */

export type ContactState = {
  ok: boolean;
  message: string;
  /** Field name -> error, so the UI can mark the offending input. */
  errors?: Record<string, string>;
  /** Echoed back so a failed submit does not wipe what was typed. */
  values?: Record<string, string>;
};

const MAX = { name: 100, email: 200, phone: 40, message: 4000 };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/**
 * Two tiers, because they defend different things.
 *
 * `ATTEMPTS` is checked before anything else and is deliberately loose: it
 * exists so a flood of junk cannot keep the function busy, and it has to leave
 * room for a real person mistyping their email a few times.
 *
 * `SENDS` is checked at the last moment, so only submissions that were going
 * to become an email count against it. That is what keeps the inbox — and the
 * Resend quota — from being drained by one client.
 *
 * `GLOBAL` is the backstop for the case the per-IP limits cannot see: many
 * addresses, a few messages each.
 */
const LIMITS = {
  attempts: [{ max: 15, ms: 10 * MINUTE }],
  sends: [
    { max: 3, ms: 10 * MINUTE },
    { max: 8, ms: HOUR },
  ],
  global: [{ max: 60, ms: HOUR }],
};

/** How long an identical message is treated as a double-click rather than news. */
const DUPLICATE_MS = 10 * MINUTE;

/** A hung provider must not hold the request — and the visitor — open. */
const DELIVER_TIMEOUT_MS = 10_000;

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * What an unproven submission is worth, in the same units as `lib/spam.ts`.
 *
 * None of these blocks anything on its own, and that is the whole design.
 * Roughly one visitor in five hundred browses without JavaScript, and this
 * site renders fine for them; their message has to arrive. So a missing token
 * only tips a message over the edge when the text is also asking for it.
 *
 * "too-fast" is weighted hardest because it is the one a person cannot
 * produce: the clock starts when the form is first touched, and nobody types
 * a name, an address and a message in four seconds.
 */
const TOKEN_PENALTY: Record<string, number> = {
  valid: 0,
  unconfigured: 0,
  expired: 1,
  missing: 2,
  invalid: 3,
  "too-fast": 4,
};

function tooManyMessage(retryAfterMs: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterMs / MINUTE));
  return (
    `Je hebt net al een bericht gestuurd. Probeer het over ${minutes} ` +
    `${minutes === 1 ? "minuut" : "minuten"} nog eens, of mail direct naar ${site.email}.`
  );
}

async function deliver(subject: string, text: string, replyTo: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  // Env-var first so this file can be reused for another client without a
  // code change; site.email keeps it working when nobody sets it.
  const to = process.env.CONTACT_TO || site.email;

  if (!key || !from) {
    // Loud, not silent: a form that looks like it worked but dropped the
    // message is worse than one that admits it is not configured.
    console.error("[contact] RESEND_API_KEY or CONTACT_FROM is not set — message not sent.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: replyTo,
        subject,
        text,
      }),
      signal: AbortSignal.timeout(DELIVER_TIMEOUT_MS),
    });

    if (!res.ok) {
      console.error("[contact] Resend rejected the message:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    // A timeout or a network fault. Reported as a failure, which sends the
    // visitor to the direct address rather than leaving them on a spinner.
    console.error("[contact] Delivery failed:", err);
    return false;
  }
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const who = await clientKey();

  // Before any work: a flood should cost this function as little as possible.
  const attempt = hit(`attempt:${who}`, LIMITS.attempts);
  if (!attempt.ok) {
    return { ok: false, message: tooManyMessage(attempt.retryAfterMs) };
  }

  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const phone = str(formData.get("phone"));
  const message = str(formData.get("message"));
  const values = { name, email, phone, message };

  // Honeypot: a real person never fills a field they cannot see. Answer with
  // success so bots get no signal about why they failed.
  //
  // Logged, because this branch throws a message away while telling the sender
  // it arrived. If that ever happens to a real visitor — a browser autofilling
  // the hidden field, say — the log is the only trace there would be.
  if (str(formData.get("onderwerp"))) {
    console.warn("[contact] Honeypot filled — treated as a bot, message not sent.");
    return { ok: true, message: "Bericht verstuurd. Je hoort snel van ons." };
  }

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Vul je naam in.";
  else if (name.length > MAX.name) errors.name = "Dat is wel erg lang.";

  if (!email) errors.email = "Vul je e-mailadres in.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > MAX.email)
    errors.email = "Dit e-mailadres klopt niet.";

  if (phone && phone.length > MAX.phone) errors.phone = "Dit telefoonnummer klopt niet.";

  if (!message) errors.message = "Laat even weten waar het over gaat.";
  else if (message.length > MAX.message) errors.message = "Dit bericht is te lang.";

  if (Object.keys(errors).length) {
    return { ok: false, message: "Controleer de gemarkeerde velden.", errors, values };
  }

  // How much this submission looks like spam: how it was sent, plus what it
  // says. Judged after validation so a visitor fixing a typo is scored on the
  // message they meant to send.
  const verdict = verifyToken(str(formData.get("token")));
  const penalty = TOKEN_PENALTY[verdict] ?? 0;
  const assessment = assessMessage({ name, email, message });
  const score = assessment.score + penalty;
  const reasons = penalty ? [...assessment.reasons, `token: ${verdict}`] : assessment.reasons;

  if (score >= BLOCK_SCORE) {
    // Same shape as the honeypot: answered as success so a bot learns nothing
    // from the response, and logged because this is the one branch that throws
    // a message away. If a real enquiry ever lands here, this line is the only
    // way anyone would find out, so it carries enough to tune the weights.
    console.warn(
      `[contact] Blocked as spam (score ${score}): ${reasons.join(", ")} | from ${email}`,
    );
    return { ok: true, message: "Bericht verstuurd. Je hoort snel van ons." };
  }

  const suspicious = score >= TAG_SCORE;

  // A double-click, a retried submit, or a bot replaying the same payload.
  // Answered as success because the first one did go through — telling the
  // visitor it failed would only make them send it a third time.
  //
  // The length prefix is what keeps the two fields apart: concatenated raw,
  // "a@b.nl" + " hoi" and "a@b.nl " + "hoi" hash the same and one of the two
  // would be swallowed as a duplicate. A separator character would do the same
  // job, but any byte that cannot appear in the input is a byte that makes git
  // treat this file as binary — and this is the last file you want undiffable.
  const fingerprint = createHash("sha256")
    .update(`${email.length}:${email}${message}`)
    .digest("hex");
  if (!hit(`dupe:${fingerprint}`, [{ max: 1, ms: DUPLICATE_MS }]).ok) {
    // Same reason as the honeypot: a success message over a message that was
    // not sent needs to leave a trace somewhere.
    console.warn("[contact] Duplicate within the window — not sent a second time.");
    return { ok: true, message: "Bericht verstuurd. Je hoort snel van ons." };
  }

  // Checked here rather than at the top so a typo in your own email never
  // costs you one of the three real sends.
  const send = hit(`send:${who}`, LIMITS.sends);
  if (!send.ok) {
    return { ok: false, message: tooManyMessage(send.retryAfterMs), values };
  }

  if (!hit("global", LIMITS.global).ok) {
    console.warn("[contact] Global send limit reached — form is shedding load.");
    return {
      ok: false,
      message: `Het formulier is even overbelast. Mail ons gerust direct op ${site.email}.`,
      values,
    };
  }

  // Marked, not withheld. A borderline score is a guess, and the person best
  // placed to settle it is the one reading the mail — with a subject they can
  // point a mail rule at, so guessing wrong costs a folder and not a client.
  const sent = await deliver(
    `${suspicious ? "[MOGELIJK SPAM] " : ""}Nieuw bericht via thespotproducties.nl — ${name}`,
    [
      `Naam:     ${name}`,
      `E-mail:   ${email}`,
      `Telefoon: ${phone || "—"}`,
      "",
      message,
      ...(suspicious
        ? ["", "---", `Automatisch gemarkeerd als mogelijk spam: ${reasons.join(", ")}.`]
        : []),
    ].join("\n"),
    email,
  );

  if (!sent) {
    return {
      ok: false,
      message: `Versturen lukte niet. Mail ons gerust direct op ${site.email}.`,
      values,
    };
  }

  return { ok: true, message: "Bericht verstuurd. Je hoort snel van ons." };
}
