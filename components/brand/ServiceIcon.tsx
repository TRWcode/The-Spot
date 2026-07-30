"use client";

import { useId } from "react";

/**
 * Animated service marks, drawn in the same geometric language as the S-mark:
 * thin strokes, ink-coloured, one gradient element each and no more.
 *
 * The old site used glossy 3D renders for these. Those read as generic
 * tech-illustration and would fight the light editorial canvas, so these are
 * line marks built from the brand's own vocabulary instead.
 *
 * Motion is CSS and idles paused; the parent .svc-card starts it on hover or
 * keyboard focus. Under reduced motion the global guard collapses every
 * animation to a single instant frame, so each icon simply sits still in its
 * base state.
 */

type Variant = "film" | "camera" | "social";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ServiceIcon({ variant, className }: { variant: Variant; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const grad = `svc-${uid}`;
  const clip = `svcc-${uid}`;

  return (
    <svg viewBox="0 0 100 100" className={`svc-icon ${className ?? ""}`} aria-hidden focusable="false">
      <defs>
        <linearGradient id={grad} gradientUnits="userSpaceOnUse" x1="30" y1="70" x2="72" y2="30">
          <stop offset="0" stopColor="#0A78EC" />
          <stop offset="0.42" stopColor="#15C6D8" />
          <stop offset="1" stopColor="#1AEBD8" />
        </linearGradient>

        {variant === "film" && (
          <clipPath id={clip}>
            <rect x="11" y="29" width="78" height="42" rx="7" />
          </clipPath>
        )}
        {variant === "social" && (
          <clipPath id={clip}>
            <rect x="37" y="29" width="26" height="44" rx="4" />
          </clipPath>
        )}
      </defs>

      {variant === "film" && (
        <>
          <rect x="10" y="28" width="80" height="44" rx="8" {...STROKE} />
          {/* Sprocket rows march sideways; the clip keeps them inside the gate. */}
          <g clipPath={`url(#${clip})`}>
            <g data-anim="film">
              {Array.from({ length: 10 }, (_, i) => (
                <g key={i}>
                  <rect x={-2 + i * 12} y="33" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.32" />
                  <rect x={-2 + i * 12} y="62" width="5" height="5" rx="1.2" fill="currentColor" opacity="0.32" />
                </g>
              ))}
            </g>
          </g>
          <path data-anim="pulse" d="M45 42 L62 50 L45 58 Z" fill={`url(#${grad})`} />
        </>
      )}

      {variant === "camera" && (
        <>
          <path d="M38 32 L42 24 L58 24 L62 32" {...STROKE} />
          <rect x="10" y="32" width="80" height="42" rx="8" {...STROKE} />
          <circle cx="50" cy="53" r="14" {...STROKE} />
          {/* The iris opens and closes — a shutter, not a spinner. */}
          <g data-anim="iris">
            <path
              d="M50 45 L57 49 L57 57 L50 61 L43 57 L43 49 Z"
              fill="none"
              stroke={`url(#${grad})`}
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </g>
          <circle cx="77" cy="42" r="2.6" fill="currentColor" opacity="0.32" />
        </>
      )}

      {variant === "social" && (
        <>
          {/* Sized to sit in the same optical box as the film and camera marks
              — at full height the phone read as the biggest of the three. */}
          <rect x="35" y="20" width="30" height="60" rx="7" {...STROKE} />
          <path d="M45 26 H55" {...STROKE} />
          {/* Feed scrolls; pattern repeats every 28 units so the loop is seamless. */}
          <g clipPath={`url(#${clip})`}>
            <g data-anim="feed">
              {[31, 45, 59, 73, 87, 101].map((y, i) => (
                <rect
                  key={y}
                  x="40.5"
                  y={y}
                  width="19"
                  height="10"
                  rx="2.5"
                  fill={i % 2 ? `url(#${grad})` : "currentColor"}
                  opacity={i % 2 ? 1 : 0.22}
                />
              ))}
            </g>
          </g>
        </>
      )}
    </svg>
  );
}
