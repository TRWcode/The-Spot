"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotion } from "@/components/motion/MotionProvider";

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
 * footer. Wait for the scroll to settle first and the same click is fine,
 * which is what made it look random.
 *
 * `immediate` is the whole point: it sets Lenis's target and its animated
 * position at once, so there is no leftover animation to land afterwards.
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
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
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

    // One frame late, so the page being navigated to has laid out — "top"
    // measured against the page we are leaving is not the same number.
    const frame = requestAnimationFrame(() => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenisRef]);

  return null;
}
