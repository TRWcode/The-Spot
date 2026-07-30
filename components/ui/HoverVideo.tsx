"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { resolveVideo, type VideoAsset } from "@/lib/video";

type Props = {
  asset: VideoAsset;
  alt: string;
  /** CSS aspect-ratio string, e.g. "16 / 10". Reserves space, so no CLS. */
  ratio?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  onOpen?: () => void;
  children?: React.ReactNode;
};

/**
 * Poster-first media surface.
 *
 * Desktop: hovering starts a muted preview. Touch: no preview at all, a tap
 * opens the lightbox instead. Off-screen playback is always paused.
 *
 * If the clip is missing or fails to load (which is the case for every tile
 * until real footage arrives) it silently stays a poster — the layout and the
 * play affordance are identical either way, so swapping footage in later
 * changes nothing structural.
 */
export function HoverVideo({
  asset,
  alt,
  ratio = "16 / 10",
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  onOpen,
  children,
}: Props) {
  const { src, poster, posterOnly } = resolveVideo(asset);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playable, setPlayable] = useState(!posterOnly);
  const [showVideo, setShowVideo] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const apply = () => setCanHover(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Never let an off-screen tile keep decoding frames.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          videoRef.current?.pause();
          setShowVideo(false);
        }
      },
      { rootMargin: "100px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const start = useCallback(() => {
    if (!canHover || !playable || !src) return;
    setShowVideo(true);
    const v = videoRef.current;
    if (v) void v.play().catch(() => setPlayable(false));
  }, [canHover, playable, src]);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setShowVideo(false);
  }, []);

  const interactive = Boolean(onOpen);

  return (
    <div
      ref={wrapRef}
      className={`group relative overflow-hidden rounded-tile bg-line ${className ?? ""}`}
      style={{ aspectRatio: ratio }}
      onPointerEnter={start}
      onPointerLeave={stop}
      data-cursor={interactive ? "play" : undefined}
      onClick={onOpen}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen?.();
              }
            }
          : undefined
      }
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `${alt} — bekijk video` : undefined}
    >
      <Image
        src={poster}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-[1.03]"
      />

      {playable && src && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload={priority ? "metadata" : "none"}
          onError={() => setPlayable(false)}
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            showVideo ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {children}
    </div>
  );
}
