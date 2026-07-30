"use server";

import { site } from "@/lib/content";

/**
 * Contact form handler.
 *
 * A Server Action compiles to a public POST endpoint — anyone can call it
 * without going through the form, so every check here is server-side. The
 * client-side `required` attributes are a convenience, never a guarantee.
 *
 * Delivery goes through Resend's REST API over plain fetch, so there is no
 * extra dependency to install or keep updated. To switch providers, replace
 * `deliver()` and nothing else.
 *
 * SETUP (one env var):
 *   RESEND_API_KEY=re_xxx        from resend.com
 *   CONTACT_FROM="The SPOT <formulier@dikkeboomspotproducties.nl>"
 * The from-domain must be verified in Resend, otherwise the API rejects it.
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

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

async function deliver(subject: string, text: string, replyTo: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;

  if (!key || !from) {
    // Loud, not silent: a form that looks like it worked but dropped the
    // message is worse than one that admits it is not configured.
    console.error("[contact] RESEND_API_KEY or CONTACT_FROM is not set — message not sent.");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [site.email],
      reply_to: replyTo,
      subject,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[contact] Resend rejected the message:", res.status, await res.text());
    return false;
  }
  return true;
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const name = str(formData.get("name"));
  const email = str(formData.get("email"));
  const phone = str(formData.get("phone"));
  const message = str(formData.get("message"));
  const values = { name, email, phone, message };

  // Honeypot: a real person never fills a field they cannot see. Answer with
  // success so bots get no signal about why they failed.
  if (str(formData.get("company"))) {
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

  const sent = await deliver(
    `Nieuw bericht via thespot.nl — ${name}`,
    [
      `Naam:     ${name}`,
      `E-mail:   ${email}`,
      `Telefoon: ${phone || "—"}`,
      "",
      message,
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
