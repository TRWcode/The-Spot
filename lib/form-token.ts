import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * A signed "this form was really opened" token.
 *
 * The problem it solves: a Server Action is a public POST endpoint, so the
 * cheapest kind of form spam is a script that posts straight at it, thousands
 * of sites an hour, never loading a page. This token is issued by
 * `/api/form-token` when a visitor first touches the form, and carries the
 * moment it was handed out, signed so it cannot be written by hand.
 *
 * That forces two things on a sender: fetch a token first, then wait. Both are
 * free for a human filling in a form and ruinous for anything blasting at
 * volume, which is the entire economics of this kind of spam.
 *
 * What it deliberately does not do is prove there was a browser. A determined
 * script can fetch a token and sleep. That is why a missing or stale token is
 * scored rather than refused: see `lib/spam.ts` for the other half.
 *
 * SETUP: nothing, in the normal case. The signing key comes from
 * `FORM_SECRET` if you set one, and otherwise is derived from the Resend key
 * that has to be present anyway for the form to send at all. That is what lets
 * this drop into another client site without a single new variable.
 */

/** Bumping this invalidates every token in flight. */
const VERSION = "1";

/** After this the token is stale. Long enough to write a message, then reread it. */
export const TOKEN_MAX_AGE_MS = 6 * 60 * 60 * 1000;

/**
 * Nobody fills in name, email and a message this fast. The clock starts when
 * the visitor first touches the form, not at page load, so this is time spent
 * on the form itself.
 */
export const MIN_FILL_MS = 4_000;

export type TokenVerdict =
  /** Signed by us, inside the window, and not suspiciously fast. */
  | "valid"
  /** No token at all: no JavaScript, or a script that never asked for one. */
  | "missing"
  /** Present but not ours, or mangled. */
  | "invalid"
  /** Ours, but older than the window. A tab left open overnight looks like this. */
  | "expired"
  /** Ours, and submitted faster than a person can type. */
  | "too-fast"
  /** No signing key configured, so there is nothing to check. */
  | "unconfigured";

/**
 * Derived rather than required, so a new client site needs no extra env var.
 * The derivation is a one-way HMAC with a fixed label, so the token signature
 * never exposes anything about the API key it came from.
 */
function signingKey(): string | null {
  const explicit = process.env.FORM_SECRET;
  if (explicit) return explicit;

  const resend = process.env.RESEND_API_KEY;
  if (resend) return createHmac("sha256", resend).update("form-token-v1").digest("hex");

  return null;
}

function sign(key: string, issuedAt: number) {
  return createHmac("sha256", key).update(`${VERSION}:${issuedAt}`).digest("base64url");
}

/** A token, or null when there is no key to sign it with. */
export function issueToken(now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  return `${VERSION}.${now}.${sign(key, now)}`;
}

export function verifyToken(raw: string, now = Date.now()): TokenVerdict {
  const key = signingKey();
  if (!key) return "unconfigured";
  if (!raw) return "missing";

  const [version, stamp, signature] = raw.split(".");
  if (version !== VERSION || !stamp || !signature) return "invalid";

  const issuedAt = Number(stamp);
  if (!Number.isFinite(issuedAt)) return "invalid";

  const expected = sign(key, issuedAt);
  // Equal-length check first: timingSafeEqual throws on a length mismatch, and
  // the length of a base64url SHA-256 is not a secret anyway.
  if (signature.length !== expected.length) return "invalid";
  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return "invalid";

  const age = now - issuedAt;
  // A token from the future is a clock skew or a replay attempt; either way it
  // cannot be trusted to measure fill time.
  if (age < 0) return "invalid";
  if (age > TOKEN_MAX_AGE_MS) return "expired";
  if (age < MIN_FILL_MS) return "too-fast";

  return "valid";
}
