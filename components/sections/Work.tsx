"use client";

import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { WorkGrid } from "@/components/sections/WorkGrid";
import { work } from "@/lib/content";

/**
 * Bento grid — the second place the page is allowed to be bold, and the first
 * thing under the hero now: a production company is judged on what it made.
 *
 * The grid itself lives in WorkGrid, because /werk shows the same one.
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

          <Link href="/werk" className="btn-text pb-2">
            {work.ctaLabel}
            <span aria-hidden>→</span>
          </Link>
        </Reveal>

        <WorkGrid className="mt-12" />
      </div>
    </section>
  );
}
