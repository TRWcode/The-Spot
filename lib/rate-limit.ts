/**
 * Sliding-window rate limiting, held in module memory.
 *
 * Honest about its reach: on serverless every instance keeps its own counters,
 * so a flood spread across cold starts is not fully counted. It still does the
 * job it is here for — one client hammering the form keeps hitting the same
 * warm instance and is stopped after a few tries. For limits that survive a
 * restart, back `hit()` with shared storage (Vercel KV, Upstash REST) and
 * leave the call sites alone.
 *
 * Windows are checked in the order given, and a rejected attempt is not
 * recorded: being blocked must not extend your own block.
 */

export type Window = {
  /** Attempts allowed inside the window. */
  max: number;
  /** Window length in ms. */
  ms: number;
};

export type Verdict = {
  ok: boolean;
  /** How long until the caller is inside the limit again, in ms. */
  retryAfterMs: number;
};

/** key -> timestamps, newest last. */
const hits = new Map<string, number[]>();

/**
 * A ceiling on tracked keys, because the key is usually an IP and an attacker
 * can vary it. Without this the map is an unbounded memory leak wearing the
 * costume of a defence.
 */
const MAX_KEYS = 5_000;

function sweep(now: number, longest: number) {
  for (const [key, times] of hits) {
    const live = times.filter((t) => now - t < longest);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }
  if (hits.size <= MAX_KEYS) return;
  // Still over after pruning: drop the least recently seen keys. Losing the
  // oldest counters is the right failure — they are closest to expiring.
  const staleFirst = [...hits.entries()].sort((a, b) => (a[1].at(-1) ?? 0) - (b[1].at(-1) ?? 0));
  for (const [key] of staleFirst.slice(0, hits.size - MAX_KEYS)) hits.delete(key);
}

export function hit(key: string, windows: Window[], now = Date.now()): Verdict {
  const longest = Math.max(...windows.map((w) => w.ms));
  const times = (hits.get(key) ?? []).filter((t) => now - t < longest);

  for (const w of windows) {
    const inWindow = times.filter((t) => now - t < w.ms);
    if (inWindow.length >= w.max) {
      hits.set(key, times);
      return { ok: false, retryAfterMs: w.ms - (now - inWindow[0]) };
    }
  }

  times.push(now);
  hits.set(key, times);
  if (hits.size > MAX_KEYS) sweep(now, longest);
  return { ok: true, retryAfterMs: 0 };
}

/** Test seam, and a way to clear state between requests in development. */
export function reset() {
  hits.clear();
}
