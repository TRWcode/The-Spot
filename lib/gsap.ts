import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Registers ScrollTrigger once, at module scope.
 *
 * It used to be registered inside MotionProvider's effect, which runs too
 * late: React fires child effects before parent effects, so every <Reveal>
 * built its tween first and GSAP rejected the unknown `scrollTrigger`
 * property ("Missing plugin?"). The tweens then ran immediately on mount
 * instead of on scroll — the reveals were silently doing nothing.
 *
 * Import gsap and ScrollTrigger from here, never from the packages directly.
 */
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
