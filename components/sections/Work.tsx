"use client";

import { TileMedia } from "@/components/ui/TileMedia";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { work } from "@/lib/content";
import { logoForCase } from "@/lib/logos";

/**
 * Bento grid — the second place the page is allowed to be bold.
 *
 * Tiles navigate to the case rather than opening a lightbox: there is a real
 * page behind each one now, with the film, the brief and the outcome. A modal
 * would hide all of that behind a play button.
 *
 * The captions carry an index and a year because that data already exists in
 * the content and the section was reading as four loose images otherwise. Brand
 * colour stays out of the resting state and arrives on hover — as the index,
 * the arrow and the rule under the caption. That is the same "gradient on the
 * active thing only" rule the nav underline follows.
 */
export function Work() {
  return (
    <section id="werk" className="section-y-tight bg-paper">
      <div className="shell">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            {/* The hairline is the one gradient the section shows unprompted —
                enough to place it in the brand without colouring the grid. */}
            <div className="grad-rule mb-7 max-w-[96px] origin-left" />
            <p className="eyebrow">{work.eyebrow}</p>
            <h2 className="mt-4 text-h2">{work.title}</h2>
          </div>

          <p className="eyebrow pb-2">
            {String(work.items.length).padStart(2, "0")} cases
          </p>
        </Reveal>

        <Reveal stagger y={28} className="mt-12 grid grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-12">
          {work.items.map((item, i) => (
            <figure key={item.slug} className={`work-item col-span-1 ${item.span}`}>
              <Link href={`/werk/${item.slug}`} className="work-tile" data-cursor="play">
                <TileMedia
                  poster={item.poster}
                  clip={"clip" in item ? item.clip : undefined}
                  alt={`${item.project} — ${item.kind}`}
                  ratio={item.ratio}
                  sizes="(max-width: 768px) 100vw, (max-width: 1240px) 50vw, 620px"
                  // Absent while a client's mark is still being collected — the
                  // tile just keeps the grade and drops the chip.
                  logo={logoForCase(item.slug)}
                />
              </Link>

              <figcaption className="work-cap">
                <span className="work-cap__index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>

                <span className="work-cap__head">
                  {/* Stretched over the whole caption, so the title, the meta and
                      the arrow are one target rather than three neighbours with
                      dead space between them. */}
                  <Link href={`/werk/${item.slug}`} className="work-cap__title">
                    {item.project}
                  </Link>
                  {/* Directly after the title rather than at the tile's edge —
                      out there it sat close enough to the next tile's caption to
                      read as belonging to neither. */}
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
      </div>
    </section>
  );
}
