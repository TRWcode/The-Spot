/**
 * Runs work once the browser is idle, with a hard timeout so it always lands.
 *
 * Used for scroll-reveal setup. Every reveal target starts below the fold, so
 * building its ScrollTrigger during hydration only competes with first paint —
 * on throttled mobile that cost ~0.8s of LCP. Returns a cancel function.
 */
export function onIdle(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  // Read off the object rather than using `in`, which narrows window to never
  // in the fallback branch.
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric.call(window, fn, { timeout: 600 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}
