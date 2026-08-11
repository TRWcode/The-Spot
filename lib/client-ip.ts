import { headers } from "next/headers";

/**
 * The client address, as far as it can be trusted.
 *
 * `x-forwarded-for` is a client-settable header everywhere except behind a
 * proxy that overwrites it, which Vercel does: the real address is the first
 * entry and the rest are hops. Self-hosted behind something that does not
 * rewrite it, this is spoofable and any limit built on it degrades to
 * honour-system.
 *
 * Lives in its own file because both the contact action and the token endpoint
 * need the same answer, and two copies of this reasoning is one too many.
 */
export async function clientKey() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}
