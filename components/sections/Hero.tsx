"use client";

import { useEffect, useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
import { SMark } from "@/components/brand/SMark";
import { HeroReel } from "@/components/ui/HeroReel";
import { useMotion } from "@/components/motion/MotionProvider";
import { hero } from "@/lib/content";
import { EASE, EASE_STRONG, LOAD } from "@/lib/motion";

/**
 * The load sequence, in order:
 *   1. the S-mark spins in at centre screen
 *   2. it flies to its slot in the header (shared-element handoff)
 *   3. a gradient hairline sweeps across
 *   4. eyebrow, then headline line-by-line behind masks
 *   5. lead + CTAs stagger up
 *   6. the reel frame opens like a lens and starts its ambient loop
 *
 * Lands at ~1.7s. Under reduced motion none of it runs and the markup is
 * already in its final state.
 */

/** Rendered size of the flying stand-in. Shared so the flight's target scale
 *  can never drift away from the element's actual size. */
const FLY_SIZE = 120;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const fly = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const { reduced } = useMotion();

  useIsomorphicLayoutEffect(() => {
    if (reduced) return;

    const ctx = gsap.context(() => {
      const headerMark = document.querySelector<HTMLElement>("[data-header-mark]");
      const flyEl = fly.current;
      if (!headerMark || !flyEl) return;

      // The stand-in is centred with a -50% CSS translate, which GSAP bakes
      // into x/y as pixels the first time it writes a transform. So the flight
      // has to be RELATIVE ("+="): assigning an absolute delta would wipe that
      // centring offset and make the mark jump at the handoff.
      const delta = (axis: "x" | "y") => () => {
        const f = flyEl.getBoundingClientRect();
        const t = headerMark.getBoundingClientRect();
        return axis === "x"
          ? `+=${t.left + t.width / 2 - (f.left + f.width / 2)}`
          : `+=${t.top + t.height / 2 - (f.top + f.height / 2)}`;
      };

      const tl = gsap.timeline({ defaults: { ease: EASE } });

      tl.fromTo(
        flyEl,
        { rotate: -220, scale: 0.35, autoAlpha: 0 },
        { rotate: 0, scale: 1, autoAlpha: 1, duration: LOAD.markSpin, ease: EASE_STRONG },
        0,
      )
        // Measured at tween start, not at mount: fonts and layout have settled
        // by then, so it lands exactly on the header slot.
        .to(
          flyEl,
          {
            x: delta("x"),
            y: delta("y"),
            scale: () => headerMark.getBoundingClientRect().width / FLY_SIZE,
            duration: LOAD.markFly,
            ease: "power2.inOut",
          },
          LOAD.markSpin + LOAD.markHold,
        )
        // Hand off in one frame, under the timeline's control rather than a
        // CSS timer that would drift the moment these durations change.
        .set(headerMark, { autoAlpha: 1 })
        .set(flyEl, { autoAlpha: 0 });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  /**
   * The two live effects on the showreel, both cinema references rather than
   * generic web motion: the frame tilts a couple of degrees toward the
   * pointer like a camera finding focus, and the image slowly pushes in as
   * the page scrolls past it.
   */
  useEffect(() => {
    const el = tilt.current;
    if (!el || reduced) return;

    const ctx = gsap.context(() => {
      // Slow push-in on the poster. The image lives inside YouTubeEmbed, so it
      // is reached through the DOM rather than a ref it does not expose. Once
      // the visitor presses play the <img> is gone and this simply finds
      // nothing — the iframe is left alone, which is what we want.
      const img = el.querySelector("img");
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1 },
          {
            scale: 1.12,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
      }
    }, el);

    // Tilt is pointer-only; there is nothing to follow on a touch screen.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let frame = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)));
    };

    const loop = () => {
      // Heavily damped: the frame should drift, not track the mouse.
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      el.style.transform = `perspective(1600px) rotateY(${cx * 2.4}deg) rotateX(${-cy * 1.6}deg)`;
      frame = requestAnimationFrame(loop);
    };

    if (fine) {
      window.addEventListener("pointermove", onMove, { passive: true });
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      ctx.revert();
    };
  }, [reduced]);

  return (
    <section ref={root} id="top" data-dark-hero className="hero-full">
      {/* Flying mark — only ever visible during the load sequence. */}
      {!reduced && (
        <div
          ref={fly}
          aria-hidden
          style={{ width: FLY_SIZE, height: FLY_SIZE }}
          className="pointer-events-none fixed left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2 opacity-0"
        >
          <SMark className="h-full w-full" />
        </div>
      )}

      {/* Full-bleed film. The brief argued for light and editorial; the
          client asked for cinema on arrival, so the hero is the one place
          that goes dark and the rest of the page stays as it was. */}
      <div className="hero-media">
        <HeroReel
          src="/media/clips/hero-loop.mp4"
          srcSmall="/media/clips/hero-loop-sm.mp4"
          poster="/media/posters/hero.jpg"
          fill
        />
      </div>

      {/* Scrim, not a flat tint: heaviest exactly where the type sits, so the
          footage stays readable as footage higher up. */}
      <div className="hero-scrim" aria-hidden />

      {/* Letterbox bars that retract on load. */}
      {!reduced && (
        <>
          <div data-hero-bar="top" className="hero-bar hero-bar--top" aria-hidden />
          <div data-hero-bar="bottom" className="hero-bar hero-bar--bottom" aria-hidden />
        </>
      )}

      <div className="hero-content shell">
        <div data-hero-rule className="grad-rule mb-8 max-w-[140px] origin-left" style={{ animationDelay: "0.45s" }} />

        <p data-hero-eyebrow className="eyebrow !text-white/70" style={{ animationDelay: "0.6s" }}>
          {hero.eyebrow}
        </p>

        <h1 className="mt-5 max-w-[15ch] text-h1 font-semibold text-white">
          {hero.headline.map((line, i) => (
            <span key={i} className="line-mask">
              <span data-hero-line style={{ animationDelay: `${0.72 + i * 0.08}s` }}>
                {line.accent ? (
                  <span className="grad-text-dark grad-shimmer">{line.text}</span>
                ) : (
                  line.text
                )}
              </span>
            </span>
          ))}
        </h1>

        <p data-hero-stagger className="lead mt-7 max-w-[46ch] !text-white/80" style={{ animationDelay: "1s" }}>
          {hero.lead}
        </p>

        <div
          data-hero-stagger
          className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4"
          style={{ animationDelay: "1.08s" }}
        >
          <a href={hero.primaryCta.href} className="btn-grad">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20">
              <svg viewBox="0 0 100 100" className="h-3 w-3" aria-hidden>
                <path d="M32 24 L76 50 L32 76 Z" fill="currentColor" />
              </svg>
            </span>
            {hero.primaryCta.label}
          </a>

          <a href={hero.secondaryCta.href} className="btn-text !text-white">
            {hero.secondaryCta.label}
            <span className="arrow" aria-hidden>
              ↓
            </span>
          </a>
        </div>
      </div>

      <div data-hero-cue className="hero-cue" style={{ animationDelay: "1.45s" }} aria-hidden>
        <span className="hero-cue__line" />
        <span className="eyebrow !text-white/60">{hero.scrollCue}</span>
      </div>
    </section>
  );
}
