"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PlayGlyph } from "@/components/brand/SMark";
import { useLoopsAllowed } from "@/lib/useLoopsAllowed";
import { youtubeEmbed } from "@/lib/video";

/**
 * Facade player: a poster and a play button until the visitor asks for the
 * video, then the iframe mounts.
 *
 * Embedding YouTube directly costs roughly half a megabyte of player script
 * per instance, on every page load, whether or not anyone watches. With four
 * cases on the homepage that is most of the performance budget spent on
 * nothing. It also means youtube-nocookie is never contacted until there is
 * an actual intent to play.
 *
 * With a `clip`, the facade is not a still but a silent loop cut from the same
 * film — the case pages use this. Autoplaying the YouTube embed itself would
 * get the same motion at the price the facade exists to avoid, plus YouTube's
 * own chrome over the first frame; a local loop keeps the frame ours and the
 * player unloaded until someone actually presses play.
 */
export function YouTubeEmbed({
  id,
  poster,
  title,
  ratio = "16 / 9",
  priority = false,
  sizes = "100vw",
  className,
  alwaysShowPlay = false,
  clip,
}: {
  id: string;
  poster: string;
  title: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  /** Case pages set this: there the film is the point, so the affordance
   *  should not depend on the visitor happening to hover it. */
  alwaysShowPlay?: boolean;
  /** Local muted loop shown in place of the still, if the visitor takes one. */
  clip?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loopOk, setLoopOk] = useState(true);
  const [loopLive, setLoopLive] = useState(false);

  // Falls back to the poster, so the still still has to hold up on its own.
  const loops = useLoopsAllowed();
  const preview = Boolean(clip) && loops && loopOk && !playing;

  useEffect(() => {
    const el = wrapRef.current;
    const v = videoRef.current;
    if (!el || !v) return;

    // canplay can fire before hydration attaches the handler — the file is
    // local and small, so it often wins that race. Without this the loop plays
    // underneath a poster stuck at opacity 0.
    if (v.readyState >= 3) setLoopLive(true);

    // Pause off-screen: a loop decoding frames below the fold buys nothing.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [preview]);

  return (
    <div
      ref={wrapRef}
      className={`group relative overflow-hidden rounded-tile bg-ink ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
    >
      {playing ? (
        <iframe
          src={youtubeEmbed(id)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full"
          aria-label={`${title} afspelen`}
          data-cursor="play"
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.03]"
          />

          {preview && (
            <video
              ref={videoRef}
              src={clip}
              autoPlay
              muted
              loop
              playsInline
              // metadata, not auto: autoplay pulls what it needs to start
              // without committing to the whole file before anything is on
              // screen — the poster is carrying the frame until then anyway.
              preload="metadata"
              aria-hidden
              onCanPlay={() => setLoopLive(true)}
              // A clip that genuinely fails retires the loop rather than
              // leaving a black hole where the poster used to be.
              onError={() => setLoopOk(false)}
              className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.03] ${
                loopLive ? "opacity-100" : "opacity-0"
              }`}
            />
          )}

          {/* Visible affordance for touch, where there is no custom cursor to
              signal that the poster is playable. Over a running loop it is
              also the thing that says the real film has sound. */}
          <span className={`yt-play ${alwaysShowPlay ? "" : "md:opacity-0"}`}>
            <PlayGlyph className="h-5 w-5" />
          </span>
        </button>
      )}
    </div>
  );
}
