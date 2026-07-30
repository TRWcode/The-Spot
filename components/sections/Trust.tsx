"use client";

import Image from "next/image";
import { trust } from "@/lib/content";
import { clientLogos } from "@/lib/logos";

/**
 * Slow logo marquee. Grayscale until hover, and the whole track pauses on
 * hover so a name stays readable long enough to actually register.
 *
 * Real logos the moment there are any: drop files in assets-inbox/logos/ and
 * run `node scripts/make-logos.mjs`. Until then the same marquee runs on text
 * wordmarks, so the section is never a hole in the page while logos are still
 * being collected.
 */
export function Trust() {
  const source = clientLogos.length > 0 ? clientLogos : trust.clients.map((name) => ({ name }));

  /**
   * The keyframe travels exactly -50%, so the track is two identical halves and
   * the loop has no seam. That only holds if one half is already wider than the
   * viewport — with four logos it was not, and the row ran out mid-screen. So
   * the set is repeated until it is long enough to fill a wide display first.
   */
  const repeats = Math.max(1, Math.ceil(8 / source.length));
  const items = Array.from({ length: repeats }, () => source).flat();
  const row = [...items, ...items];

  return (
    <section aria-label={trust.label} className="border-y border-line bg-paper py-12">
      <div className="shell">
        <p className="eyebrow mb-8">{trust.label}</p>
      </div>

      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-[spot-marquee_46s_linear_infinite] items-center gap-12 group-hover:[animation-play-state:paused] motion-reduce:animate-none sm:gap-16">
          {row.map((item, i) => {
            // Only the first pass through the real list is announced. Everything
            // after it exists to fill the track, and hearing every client read
            // out six times is the only thing a screen reader would take away.
            const dupe = i >= source.length;
            return "src" in item ? (
              <Image
                key={`${item.name}-${i}`}
                src={item.src}
                alt={dupe ? "" : item.name}
                aria-hidden={dupe || undefined}
                width={item.w}
                height={item.h}
                style={{ height: item.h, width: "auto" }}
                className="client-logo"
                unoptimized={item.src.endsWith(".svg")}
              />
            ) : (
              <span
                key={`${item.name}-${i}`}
                aria-hidden={dupe || undefined}
                className="font-display text-[22px] font-medium whitespace-nowrap text-ink-2/55 transition-colors duration-300 hover:text-ink"
              >
                {item.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
