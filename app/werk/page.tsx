import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { WorkGrid } from "@/components/sections/WorkGrid";
import { work } from "@/lib/content";

export const metadata: Metadata = {
  title: "Werk",
  description: work.page.lead,
  alternates: { canonical: "/werk" },
};

/**
 * The case index.
 *
 * Same grid as the homepage — one component, so a change to a tile lands in
 * both — under a header that says what the collection is. This is also where
 * "← Alle cases" on a case page goes, which used to be a jump back to a
 * section of the homepage.
 */
export default function WorkPage() {
  return (
    <article className="section-y-tight pt-[128px]">
      <div className="shell">
        <Reveal>
          <div className="grad-rule mb-7 max-w-[96px] origin-left" />
          <p className="eyebrow">{work.page.eyebrow}</p>
          <h1 className="mt-4 max-w-[16ch] text-h1">{work.page.title}</h1>
          <p className="lead mt-7 max-w-[54ch] text-ink-2">{work.page.lead}</p>
        </Reveal>

        <WorkGrid className="mt-16" />

        <Reveal delay={0.1} className="mt-20 border-t border-line pt-10">
          <p className="lead max-w-[40ch] text-ink-2">
            Iets in gedachten dat hier nog niet tussen staat?
          </p>
          <Link href="/contact" className="btn-grad mt-6">
            Start jouw project
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </article>
  );
}
