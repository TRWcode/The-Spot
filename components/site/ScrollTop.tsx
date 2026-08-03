"use client";

import { SMark } from "@/components/brand/SMark";
import { useMotion } from "@/components/motion/MotionProvider";
import { ANCHOR } from "@/lib/motion";

/**
 * The mark sits still here. It used to loop slowly, but a logo rotating
 * forever reads as a gimmick rather than a signature.
 */
export function ScrollTop() {
  const { lenisRef } = useMotion();

  const toTop = () => {
    const lenis = lenisRef.current;
    // Zelfde easing als elke andere sprong naar een sectie: dit is de langste
    // reis van de site en hoort niet als enige anders te bewegen.
    if (lenis) lenis.scrollTo(0, { duration: ANCHOR.toTop, easing: ANCHOR.ease });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={toTop}
      className="group flex min-h-[44px] items-center gap-3"
      aria-label="Terug naar boven"
    >
      <span className="block h-9 w-9">
        <SMark className="h-full w-full" />
      </span>
      <span className="eyebrow transition-colors group-hover:text-ink">Naar boven</span>
    </button>
  );
}
