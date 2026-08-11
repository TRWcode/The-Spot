import { clientKey } from "@/lib/client-ip";
import { issueToken } from "@/lib/form-token";
import { hit } from "@/lib/rate-limit";

/**
 * Hands out the form token. See `lib/form-token.ts` for what it is for.
 *
 * The form asks for one the moment a visitor first touches it, not on page
 * load, so the pages stay statically served and a visitor who never uses the
 * form never costs a request.
 *
 * Anyone can call this, which is fine: the token proves when it was issued,
 * nothing more. The limit below is only so this cannot be turned into a way to
 * keep the function warm and busy.
 */

/** Never prerendered, never cached at the edge: a stale token is a dead one. */
export const dynamic = "force-dynamic";

export async function GET() {
  const who = await clientKey();

  if (!hit(`token:${who}`, [{ max: 30, ms: 10 * 60_000 }]).ok) {
    return new Response(null, { status: 429, headers: { "cache-control": "no-store" } });
  }

  const token = issueToken();
  if (!token) {
    // No signing key. The form then submits without a token and the action
    // scores it as missing, which on its own never blocks anything.
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }

  return Response.json({ token }, { headers: { "cache-control": "no-store" } });
}
