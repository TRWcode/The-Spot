"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useMotion } from "@/components/motion/MotionProvider";

const DESKTOP = "(min-width: 768px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Which cut to play, or null for none.
 *
 * useSyncExternalStore rather than reading matchMedia into state from an
 * effect: this is exactly the "subscribe to an external source" case it
 * exists for, and it keeps the server snapshot (null) honest instead of
 * rendering a guess and correcting it after hydration.
 */
function useReelSource(src: string, srcSmall: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      // Data Saver is an explicit "do not spend my bandwidth". Decoration is
      // the first thing that should honour it.
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData) return null;
      return window.matchMedia(DESKTOP).matches ? src : srcSmall;
    },
    () => null,
  );
}

/**
 * The hero's ambient loop.
 *
 * The poster stays a next/image underneath and the video fades in once it can
 * play. Using the <video poster> attribute instead would hand the LCP image
 * to the browser unoptimised, and show a hard swap when the first frame
 * decodes.
 *
 * Under reduced motion nothing plays at all — an autoplaying loop is the
 * clearest possible case of what that setting is asking you to stop.
 */
export function HeroReel({
  src,
  srcSmall,
  poster,
  ratio,
  fill = false,
  className,
}: {
  src: string;
  /** Lighter cut for phones — the desktop file is five times the size. */
  srcSmall: string;
  poster: string;
  ratio?: string;
  /** Fills its container instead of holding an aspect ratio. */
  fill?: boolean;
  className?: string;
}) {
  const { reduced } = useMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const chosen = useReelSource(src, srcSmall);

  /**
   * Tried and rejected: withholding the <video> until requestIdleCallback.
   * It moved the download out of the LCP's way but the loop then arrived so
   * late that Speed Index went from 2.7s to 5.2s — the hero sat visibly static
   * for most of the measured window. The file size was the real problem, so
   * that is where it was fixed (see scripts/make-hero-loop.mjs).
   */

  useEffect(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v || reduced) return;

    // `canplay` can fire before hydration attaches the handler — the file is
    // local and small, so it often wins that race. Without this the loop
    // plays underneath a poster stuck at opacity 0.
    if (v.readyState >= 3) setReady(true);

    // Pause off-screen: a hero loop running below the fold is decoding frames
    // nobody is looking at.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, chosen]);

  return (
    <div
      ref={wrapRef}
      className={
        fill
          ? `absolute inset-0 overflow-hidden bg-ink ${className ?? ""}`
          : `relative overflow-hidden rounded-tile bg-ink ${className ?? ""}`
      }
      style={fill ? undefined : { aspectRatio: ratio }}
    >
      {/* Slow push-in gives the loop the feel of a shot that is still being
          held, rather than a GIF sitting still.

          It scales this wrapper rather than the poster and the video
          individually. Animating a playing <video>'s own transform makes the
          compositor re-rasterise every decoded frame at a slightly different
          scale, which measured as the single largest source of dropped frames
          on the page (66fps -> 78fps to move it here). Scaling one layer that
          contains both also keeps their framing identical, so the crossfade
          has nothing to pop between. */}
      <div className="hero-reel__push">
        <Image src={poster} alt="" fill sizes="100vw" priority className="object-cover" />

        {!reduced && chosen && (
          <video
            ref={videoRef}
            src={chosen}
            autoPlay
            muted
            loop
            playsInline
            // metadata, not auto: autoplay pulls what it needs to start without
            // committing to the whole file before anything is on screen.
            preload="metadata"
            aria-hidden
            onCanPlay={() => setReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              ready ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
    </div>
  );
}
