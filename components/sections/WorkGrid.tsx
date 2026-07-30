"use client";

import Link from "next/link";
import { TileMedia } from "@/components/ui/TileMedia";
import { Reveal } from "@/components/motion/Reveal";
import { work } from "@/lib/content";
import { logoForCase } from "@/lib/logos";

/**
 * The bento grid of cases, shared by the homepage section and /werk.
 *
 * Tiles navigate to the case rather than opening a lightbox: there is a real
 * page behind each one, with the film, the brief and the outcome. A modal
 * would hide all of that behind a play button.
 *
 * Brand colour stays out of the resting state and arrives on hover — as the
 * index, the arrow and the rule under the caption. That is the same "gradient
 * on the active thing only" rule the nav underline follows.
 */
export function WorkGrid({ className }: { className?: string }) {
  return (
    <Reveal stagger y={28} className={`grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-12 ${className ?? ""}`}>
      {work.items.map((item, i) => (
        <figure key={item.slug} className={`work-item col-span-1 ${item.span}`}>
          <Link href={`/werk/${item.slug}`} className="work-tile" data-cursor="play">
            <TileMedia
              poster={item.poster}
              clip={"clip" in item ? item.clip : undefined}
              alt={`${item.project} — ${item.kind}`}
              ratio={item.ratio}
              sizes="(max-width: 768px) 100vw, (max-width: 1240px) 50vw, 620px"
              // Absent while a client's mark is still being collected — the tile
              // just keeps the grade and drops the chip.
              logo={logoForCase(item.slug)}
            />
          </Link>

          <figcaption className="work-cap">
            <span className="work-cap__index" aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>

            <span className="work-cap__head">
              {/* Stretched over the whole caption, so the title, the meta and the
                  arrow are one target rather than three neighbours with dead
                  space between them. */}
              <Link href={`/werk/${item.slug}`} className="work-cap__title">
                {item.project}
              </Link>
              {/* Directly after the title rather than at the tile's edge — out
                  there it sat close enough to the next tile's caption to read as
                  belonging to neither. */}
              <span className="work-cap__arrow" aria-hidden>
                →
              </span>
            </span>

            <span className="work-cap__meta">
              {item.kind}
              <span className="work-cap__sep" aria-hidden />
              {item.year}
            </span>
          </figcaption>
        </figure>
      ))}
    </Reveal>
  );
}
