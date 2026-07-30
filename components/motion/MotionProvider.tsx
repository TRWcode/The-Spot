"use client";

import { createContext, useContext, useEffect, useRef, useState, type RefObject, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Lenis from "lenis";

type MotionState = {
  /** True when the user asked for reduced motion. Every animation must check this. */
  reduced: boolean;
  /**
   * A ref, not state: Lenis is an external object that consumers only touch
   * inside event handlers, so holding it in state would just cause an extra
   * render of the whole tree for no visible benefit. Read `.current` at call
   * time — it is null under reduced motion and before mount.
   */
  lenisRef: RefObject<Lenis | null>;
};

const MotionCtx = createContext<MotionState>({
  reduced: false,
  lenisRef: { current: null },
});

export const useMotion = () => useContext(MotionCtx);

export function MotionProvider({ children }: { children: ReactNode }) {
  // Starts false so server and client markup agree; corrected on mount.
  const [reduced, setReduced] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    // No smooth scroll under reduced motion — the native scroll is the honest one.
    if (reduced) return;

    const l = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = l;

    const onScroll = () => ScrollTrigger.update();
    l.on("scroll", onScroll);

    // Lenis is driven by GSAP's ticker only. The brief's stub also ran its own
    // requestAnimationFrame loop, which would advance Lenis twice per frame and
    // double the effective scroll speed.
    const tick = (time: number) => l.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      l.off("scroll", onScroll);
      l.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return <MotionCtx.Provider value={{ reduced, lenisRef }}>{children}</MotionCtx.Provider>;
}
