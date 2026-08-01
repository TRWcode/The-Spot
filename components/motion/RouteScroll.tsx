"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotion } from "@/components/motion/MotionProvider";

/** useLayoutEffect warns when it runs through renderToString; this never does. */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Puts a new page at the top, and tells Lenis about it.
 *
 * The router already scrolls to the top on navigation. The problem is that
 * Lenis owns the scroll position, and it does not stop easing just because the
 * page changed: click a case tile within about half a second of scrolling the
 * homepage — which is exactly what happens when you scroll to the grid and
 * click a tile — and Lenis writes its stale position back over the router's
 * reset a frame later. On a page shorter than that offset the browser clamps
 * it, and you arrive at the bottom of the case you just opened, next to the
 * footer.
 *
 * Two resets, because the two halves fail differently:
 *
 * `beforePaint` is the one the visitor feels. A plain `useEffect` runs *after*
 * the browser has painted, so the new page always got one frame at the old
 * offset — clamped to the shorter document, which is its own footer — and a
 * `requestAnimationFrame` on top of that made it two. Measured per frame, every
 * route showed the new page's last screen for two frames before snapping up;
 * on a throttled machine that is about 400ms of reading the wrong end of a
 * page. Running before paint means those frames never exist.
 *
 * The frame later is for Lenis, which may still be mid-ease at the moment of
 * the click and would otherwise write its stale position back afterwards. It is
 * also the safety net for a route whose content lands in a later commit than
 * the pathname.
 *
 * `immediate` sets Lenis's target and its animated position at once, so there
 * is no leftover animation to land. `force` is there because `scrollTo` is a
 * no-op on a stopped instance, and the mobile nav navigates from inside a sheet
 * that stops Lenis while it is open. The bare `window.scrollTo` is not
 * redundant: Lenis returns early when the target equals its own `targetScroll`,
 * which is exactly the state it is in when the browser has already clamped the
 * document underneath it.
 */
export function RouteScroll() {
  const pathname = usePathname();
  const { lenisRef } = useMotion();
  const firstRender = useRef(true);
  const popped = useRef(false);

  // Back and forward are the router's to restore — this only governs the
  // forward navigations that should always start at the top.
  useEffect(() => {
    const onPop = () => {
      popped.current = true;
      // Only the render this popstate triggers may be skipped. The flag is
      // otherwise cleared by the effect below, which does not run when a
      // popstate leaves the pathname alone — a hash-only back — so it would
      // stay set and swallow the reset on the next forward navigation. That
      // path did not reproduce, so this is a guard rather than a fix; the
      // effect still clears the flag itself for the ordinary case.
      requestAnimationFrame(() => {
        popped.current = false;
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useBeforePaint(() => {
    // A cold load is already where it belongs, hash or not.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (popped.current) {
      popped.current = false;
      return;
    }
    // An incoming #hash has its own destination; see section[id]'s
    // scroll-margin-top in globals.css.
    if (window.location.hash) return;

    const toTop = () => {
      window.scrollTo(0, 0);
      lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    };

    toTop();
    const frame = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenisRef]);

  return null;
}
