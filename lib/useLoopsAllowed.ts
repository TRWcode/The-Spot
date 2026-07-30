"use client";

import { useSyncExternalStore } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Whether this visitor gets moving footage at all.
 *
 * A wall of autoplaying loops is a fair trade on a video studio's own site —
 * but not on a metered connection, and not for someone who asked the OS to
 * stop things moving.
 *
 * Same shape as useReelSource in HeroReel: an external source read through
 * useSyncExternalStore, so the server snapshot is honest (assume loops, which
 * is the common case) instead of a guess corrected after hydration.
 *
 * Every caller must degrade to a poster when this is false.
 */
export function useLoopsAllowed() {
  return useSyncExternalStore(
    subscribe,
    () => {
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      return !conn?.saveData && !window.matchMedia(REDUCED).matches;
    },
    () => true,
  );
}
