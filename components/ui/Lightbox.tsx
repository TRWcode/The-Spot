"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMotion } from "@/components/motion/MotionProvider";
import { youtubeEmbed } from "@/lib/video";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** YouTube video ID — the path everything uses now. */
  youtubeId?: string;
  /** Self-hosted fallback, kept for if video ever moves off YouTube. */
  src?: string;
  poster?: string;
};

/**
 * Full showreel with sound. Deliberately plain: a dialog, a close button,
 * native controls. Video controls must stay reachable, so nothing custom
 * covers them and the native UI is never suppressed.
 */
export function Lightbox({ open, onClose, title, youtubeId, src, poster }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const { lenisRef } = useMotion();

  useEffect(() => {
    if (!open) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const lenis = lenisRef.current;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      // Keep focus inside the dialog.
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], video, iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lenis?.start();
      restoreRef.current?.focus?.();
    };
  }, [open, onClose, lenisRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/90 p-4 backdrop-blur-sm md:p-10"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="w-full max-w-[1100px]">
        <div className="mb-3 flex items-center justify-between">
          <p className="eyebrow !text-white/70">{title}</p>
          <button
            ref={closeRef}
            onClick={onClose}
            className="rounded-full border border-white/25 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            Sluiten
          </button>
        </div>

        <div className="overflow-hidden rounded-card bg-black" style={{ aspectRatio: "16 / 9" }}>
          {youtubeId ? (
            // Only mounted while the dialog is open, so YouTube is never
            // contacted for a visitor who does not press play.
            <iframe
              src={youtubeEmbed(youtubeId)}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          ) : src ? (
            // TODO: add a <track kind="captions"> when the subtitled master lands.
            <video src={src} poster={poster} controls autoPlay playsInline className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-8 text-center">
              <p className="text-sm text-white/60">
                Showreel volgt zodra de definitieve montage er is.
                {/* TODO: remove this branch once the real showreel is wired up. */}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
