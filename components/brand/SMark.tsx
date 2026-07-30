"use client";

import { useId } from "react";
import { MARK } from "@/components/brand/mark-geometry";

/**
 * The SPOT S-mark — the supplied logo, as vector geometry.
 *
 * The delivered files (brand-source/Icoon*.svg) are Canva exports that wrap
 * embedded 1024px rasters in clip paths: half a megabyte each, and soft the
 * moment they are scaled or spun. `scripts/trace-mark.mjs` traces those masks
 * and reads the gradient straight off the fill rasters, so what renders here is
 * the same drawing rather than an approximation of it — see mark-geometry.ts.
 *
 * The two swoosh paths are one shape and its 180deg copy, which is what lets
 * the load-spin and the scroll-to-top loop turn without wobbling.
 */

type Props = {
  className?: string;
  /** "mono" paints in currentColor — for places the gradient budget is spent. */
  variant?: "gradient" | "mono";
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string;
};

export function SMark({ className, variant = "gradient", title }: Props) {
  const uid = useId().replace(/:/g, "");
  const mono = variant === "mono";
  const { gradient: g } = MARK;

  // userSpaceOnUse, so the 180deg copy gets a 180deg-rotated ramp: light at
  // each outer tip, deep blue through the crossing. One shared ramp across both
  // arms would smear the mark's own symmetry.
  type Line = { x1: number; y1: number; x2: number; y2: number };
  type Stops = readonly { offset: number; hex: string }[];

  const grad = (id: string, line: Line, stops: Stops) => (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" {...line}>
      {stops.map((s) => (
        <stop key={s.offset} offset={s.offset} stopColor={s.hex} />
      ))}
    </linearGradient>
  );

  const paint = (id: string) => (mono ? "currentColor" : `url(#${id})`);

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {!mono && (
        <defs>
          {grad(`sa-${uid}`, g.swooshA, g.swooshStops)}
          {grad(`sb-${uid}`, g.swooshB, g.swooshStops)}
          {grad(`sp-${uid}`, g.play, g.playStops)}
        </defs>
      )}
      <path d={MARK.swooshA} fill={paint(`sa-${uid}`)} />
      <path d={MARK.swooshB} fill={paint(`sb-${uid}`)} />
      <path d={MARK.play} fill={paint(`sp-${uid}`)} />
    </svg>
  );
}

/**
 * Just the play triangle — used by the cursor and by every play affordance, so
 * the "loop-to-play" idea stays one shape across the whole site. It is the
 * logo's own triangle cropped to its bounds, not a lookalike.
 */
export function PlayGlyph({ className, mono = false }: { className?: string; mono?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const { gradient: g } = MARK;
  return (
    <svg viewBox={MARK.playViewBox} className={className} aria-hidden focusable="false">
      {!mono && (
        <defs>
          <linearGradient id={`pg-${uid}`} gradientUnits="userSpaceOnUse" {...g.play}>
            {g.playStops.map((s) => (
              <stop key={s.offset} offset={s.offset} stopColor={s.hex} />
            ))}
          </linearGradient>
        </defs>
      )}
      <path d={MARK.play} fill={mono ? "currentColor" : `url(#pg-${uid})`} />
    </svg>
  );
}
