"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { MARK } from "@/components/brand/mark-geometry";

/**
 * Fits the logo's own play triangle into this SVG's 0-100 box, centred at
 * `size` units tall. Derived rather than hand-placed, so a re-trace of the mark
 * cannot leave the cursor drawing a slightly different triangle to the logo.
 */
const GLYPH_SIZE = 46;
const [px, py, pw, ph] = MARK.playViewBox.split(" ").map(Number);
const glyphScale = GLYPH_SIZE / ph;
const glyphTransform = `translate(50 50) scale(${glyphScale.toFixed(4)}) translate(${-(px + pw / 2)} ${-(py + ph / 2)})`;

/**
 * The brand ramp, spanned across the triangle's own box rather than the SVG's.
 *
 * Stretched over the full 0-100 canvas it only ever handed the glyph the slice
 * it happened to overlap — the middle, which is teal from end to end. Fitted to
 * the shape, the same three stops read as the ramp the mark actually uses, and
 * the blue corner is what holds the triangle together against a bright wall.
 */
const GLYPH_BOX = {
  x1: 50 - (pw * glyphScale) / 2,
  y1: 50 + GLYPH_SIZE / 2,
  x2: 50 + (pw * glyphScale) / 2,
  y2: 50 - GLYPH_SIZE / 2,
};

/**
 * The signature: over anything playable ([data-cursor="play"]) the pointer
 * becomes the brand's own play triangle, and nothing else.
 *
 * It used to be that triangle inside a filled disc inside a spinning dashed
 * ring. Mass is the right answer at 13px, where the problem is finding the
 * pointer at all — but at play size it added up to a button drawn on top of
 * the film, and the tiles underneath are already playing. The glyph alone says
 * the same thing and lets the footage stay the loudest thing on the page.
 *
 * Off entirely on touch and under reduced motion — a lerping pointer is
 * exactly the kind of thing that setting exists to suppress.
 */
export function PlayCursor() {
  const { reduced } = useMotion();
  const [finePointer, setFinePointer] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, "");
  const gradId = `cur-${uid}`;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setFinePointer(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const active = finePointer && !reduced;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !active) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let shown = false;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = "1";
      }
      const target = e.target as Element | null;
      // Three states: a precise dot by default, a soft swell over anything
      // clickable, the full play mark over media. One state would either be
      // too big to aim with or too faint to notice.
      const state = target?.closest?.('[data-cursor="play"]')
        ? "play"
        : target?.closest?.('a, button, [role="button"], input, label')
          ? "link"
          : "idle";
      if (el.dataset.state !== state) el.dataset.state = state;
    };

    const hide = () => {
      shown = false;
      el.style.opacity = "0";
    };

    const loop = () => {
      // lerp 0.18 — fast enough to feel attached, slow enough to feel filmed
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    document.documentElement.classList.add("has-play-cursor");

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      document.documentElement.classList.remove("has-play-cursor");
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="play-cursor" data-state="idle" aria-hidden>
      {/* Solid gradient disc — the thin ring alone disappeared on the light
          canvas, so the mass carries the visibility and the ring is trim. */}
      <div className="play-cursor__disc" />

      <div className="play-cursor__scale">
        <svg viewBox="0 0 100 100" focusable="false">
          <defs>
            <linearGradient
              id={gradId}
              gradientUnits="userSpaceOnUse"
              x1={GLYPH_BOX.x1}
              y1={GLYPH_BOX.y1}
              x2={GLYPH_BOX.x2}
              y2={GLYPH_BOX.y2}
            >
              <stop offset="0" stopColor="#0A78EC" />
              <stop offset="0.42" stopColor="#15C6D8" />
              <stop offset="1" stopColor="#1AEBD8" />
            </linearGradient>
          </defs>

          {/* The logo's triangle, not a lookalike — same path data as the mark.
              It carries the brand ramp itself now that there is no disc under
              it to carry it, and the CSS drop-shadow is what keeps it readable
              over a blown-out sky or a white product table. */}
          <g className="play-cursor__glyph">
            <path d={MARK.play} fill={`url(#${gradId})`} transform={glyphTransform} />
          </g>
        </svg>
      </div>
    </div>
  );
}
