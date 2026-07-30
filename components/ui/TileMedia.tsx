"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PlayGlyph } from "@/components/brand/SMark";
import type { ClientLogo } from "@/lib/logos";
import { useLoopsAllowed } from "@/lib/useLoopsAllowed";

/**
 * A case tile that plays its loop while it is on screen.
 *
 * It used to wait for hover, which meant the grid spent most of its life as
 * four stills — and these stills are the weakest thing on the page. Three of
 * the four films only exist as low-bitrate downloads (640x360 and 848x480), so
 * a large, sharp, motionless frame is exactly the presentation that shows every
 * artefact. Moving footage is the fix, not a workaround: the eye tracks motion
 * and stops resolving detail, and the grain layer breaks up whatever blocking
 * survives in the flat areas.
 *
 * No click handling of its own — a <Link> wraps it, so a button here would nest
 * interactive elements. Tiles without a clip stay posters, which is how a case
 * still waiting on footage behaves.
 */
export function TileMedia({
  poster,
  clip,
  alt,
  ratio,
  sizes,
  logo,
}: {
  poster: string;
  clip?: string;
  alt: string;
  ratio: string;
  sizes: string;
  logo?: ClientLogo;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScreen = useRef(false);
  const [playable, setPlayable] = useState(Boolean(clip));
  const [warm, setWarm] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Both refusals fall back to the poster, which is why the poster still has to
  // hold up on its own — see the "live" branch of data-state below.
  const loops = useLoopsAllowed();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !clip || !loops) return;

    /**
     * Two observers, because fetching and playing are not the same moment.
     *
     * With one observer at the play threshold, the request only leaves when the
     * tile is already half on screen, so every tile is a still for the second
     * or two it takes to arrive — and the still is the weakest state this grid
     * has. Starting the fetch a screen early means that by the time a tile is
     * looked at, there are frames. That is the whole difference between a grid
     * that moves and a grid of photographs that eventually move.
     */
    const warmer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setWarm(true);
        warmer.disconnect();
      },
      { rootMargin: "800px 0px" },
    );
    warmer.observe(el);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting;
        const v = videoRef.current;
        // No src yet means React has not committed the warm render, and play()
        // on an empty element rejects — which would retire the tile to its
        // poster permanently. The effect below picks it up instead.
        if (!v || !v.currentSrc) return;
        if (entry.isIntersecting) {
          void v.play().catch(() => setPlayable(false));
        } else {
          // Paused, not reset: scrolling back to a tile should not restart the
          // shot, and a decoder that keeps its position resumes instantly.
          v.pause();
        }
      },
      // Half the tile: enough that a loop is never running for a strip of pixels
      // at the very edge of the viewport.
      { threshold: 0.5 },
    );
    io.observe(el);

    return () => {
      warmer.disconnect();
      io.disconnect();
    };
  }, [clip, loops]);

  /**
   * A tile that is already on screen at load gets both observer callbacks in
   * the same task, before React has committed the src — so the play call above
   * finds an empty element and gives up. Above the fold is exactly where that
   * must not happen, so the src landing is a second chance to start.
   */
  useEffect(() => {
    if (!warm || !onScreen.current) return;
    void videoRef.current?.play().catch(() => setPlayable(false));
  }, [warm]);

  return (
    <div ref={wrapRef} className="work-tile__media" style={{ aspectRatio: ratio }}>
      {/* Poster and loop share one frame so the hover push-in moves whichever is
          currently showing. Two transform layers on purpose: the frame owns the
          push-in, the poster owns the slow drift, and one element cannot run a
          transition and a keyframe animation on transform at the same time. */}
      {/* `data-state` is what the poster's treatment hangs off: a tile that is
          waiting on its loop presents the still differently from one that has
          no loop coming. "still" is also the server-rendered default for any
          tile with a clip, so the treated frame is in the first paint rather
          than fading on a beat later. See .work-tile__frame[data-state]. */}
      <div
        className="work-tile__frame"
        data-state={clip && playable && loops && !showVideo ? "still" : "live"}
      >
        <Image src={poster} alt={alt} fill sizes={sizes} className="work-tile__img" />

        {clip && playable && (
          <video
            ref={videoRef}
            // Set on warm-up rather than at mount, and `preload` left at the
            // default: assigning src is what actually starts the fetch, so this
            // is one switch instead of an attribute the browser may ignore.
            src={warm ? clip : undefined}
            muted
            loop
            playsInline
            // `playing`, not the play() call: the poster stays up until real
            // frames exist, so there is never a flash of empty black underneath.
            onPlaying={() => setShowVideo(true)}
            onError={() => {
              // Ignore the error an empty src fires before warm-up; only a
              // clip that genuinely failed should retire the tile.
              if (warm) setPlayable(false);
            }}
            aria-hidden
            className={`work-tile__video ${showVideo ? "is-playing" : ""}`}
          />
        )}
      </div>

      {/* Fine grain over everything. On these sources it is doing real work:
          compression damage reads as blotches in flat sky and wall, and grain
          gives those areas a texture to hide in. It also happens to be what
          makes footage look like film rather than like a file. */}
      <span className="work-tile__grain" aria-hidden />

      {/* Grade, not decoration: lifts the frame off white and gives the mark
          something to sit on. Pulled back once the pointer is on the tile. */}
      <span className="work-tile__scrim" aria-hidden />

      {logo && (
        <span className="work-tile__brand" aria-hidden>
          <Image
            src={logo.src}
            alt=""
            width={logo.w}
            height={logo.h}
            /* lib/logos already normalises these heights against each other, so
               the chip scales that height rather than flattening every mark to
               one number — a stacked mark and a wordmark are not the same size
               to the eye. Clamped so neither extreme breaks the chip. */
            style={
              {
                "--logo-h": `${Math.round(Math.min(26, Math.max(16, logo.h * 0.62)))}px`,
                // --logo-scale is inherited from the chip, so the narrow-screen
                // rule can shrink the mark without fighting this inline height.
                height: "calc(var(--logo-h) * var(--logo-scale, 1))",
                width: "auto",
              } as React.CSSProperties
            }
            unoptimized={logo.src.endsWith(".svg")}
          />
        </span>
      )}

      {/* Only painted on touch, where there is no play cursor to stand in for
          it. The glyph is the logo's own triangle, not a lookalike. */}
      <span className="work-tile__badge" aria-hidden>
        <PlayGlyph mono />
      </span>
    </div>
  );
}
