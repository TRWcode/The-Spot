"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { onIdle } from "@/lib/idle";
import { useMotion } from "@/components/motion/MotionProvider";
import { DUR, EASE, STAGGER, TRIGGER_START } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Travel distance in px. Tiles use 28, text a little less. */
  y?: number;
  delay?: number;
  /** Stagger direct children instead of moving the block as one. */
  stagger?: boolean;
};

/**
 * Scroll-triggered reveal. Markup renders visible; the hidden start state is
 * only ever applied by JS, so a failed script or reduced motion leaves a
 * perfectly readable page rather than a blank one.
 */
export function Reveal({
  children,
  className,
  as: Tag = "div",
  y = 28,
  delay = 0,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const targets = stagger ? Array.from(el.children) : [el];
    let ctx: gsap.Context | undefined;

    // Deferred to idle: these all start below the fold, so doing the work
    // during hydration only delays first paint.
    const cancel = onIdle(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          targets,
          { y, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: DUR.reveal,
            ease: EASE,
            delay,
            stagger: stagger ? STAGGER : 0,
            scrollTrigger: { trigger: el, start: TRIGGER_START, once: true },
          },
        );
      }, el);
      // No ScrollTrigger.refresh() here. It recalculates every trigger on the
      // page, so calling it per instance was quadratic. ScrollTrigger already
      // refreshes itself on load and resize.
    });

    return () => {
      cancel();
      ctx?.revert();
    };
  }, [reduced, y, delay, stagger]);

  return (
    <Tag ref={ref} className={className} data-reveal>
      {children}
    </Tag>
  );
}

/**
 * Masked line reveal. Lines are authored explicitly rather than split at
 * runtime: no layout thrash, no flash of unsplit text, and the copy stays
 * readable in the markup.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  play = true,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Hero passes false and drives the spans from its own load timeline. */
  play?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !play) return;

    let ctx: gsap.Context | undefined;

    const cancel = onIdle(() => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el.querySelectorAll("[data-line]"),
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: DUR.reveal,
            ease: EASE,
            delay,
            stagger: STAGGER,
            scrollTrigger: { trigger: el, start: TRIGGER_START, once: true },
          },
        );
      }, el);
    });

    return () => {
      cancel();
      ctx?.revert();
    };
  }, [reduced, delay, play]);

  return (
    <div ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className={`line-mask ${lineClassName ?? ""}`}>
          <span data-line>{line}</span>
        </span>
      ))}
    </div>
  );
}
