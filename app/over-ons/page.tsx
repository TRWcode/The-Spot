import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { Reveal, MaskLines } from "@/components/motion/Reveal";
import { Trust } from "@/components/sections/Trust";
import { SMark } from "@/components/brand/SMark";
import { about } from "@/lib/content";

export const metadata: Metadata = {
  title: "Over ons",
  description: about.lead,
  alternates: { canonical: "/over-ons" },
};

/**
 * Over ons.
 *
 * The portrait is the one asset this page is still waiting on, so its absence
 * is designed for rather than assumed away: the file is checked at build time
 * and the layout falls back to a branded panel. Drop the original in
 * assets-inbox/photos/beer.jpg, run scripts/make-photos.mjs, and it takes the
 * slot — no code change and, more to the point, no broken image if it is
 * forgotten.
 */
export default function AboutPage() {
  const hasPortrait = existsSync(path.join(process.cwd(), "public", about.portrait.src));

  return (
    <>
      <article className="pt-[128px]">
        <div className="shell">
          <Reveal>
            <p className="eyebrow">{about.eyebrow}</p>
          </Reveal>

          <MaskLines
            className="mt-4 max-w-[14ch] font-display text-h1 leading-[0.98] font-semibold -tracking-[0.03em]"
            lines={["Gemaakt om", "impact te maken."]}
            delay={0.1}
          />

          <Reveal delay={0.15}>
            <p className="lead mt-7 max-w-[54ch] text-ink-2">{about.lead}</p>
          </Reveal>
        </div>

        {/* Portrait and story sit side by side, with the story given the wider
            column — the picture introduces, the words do the work. */}
        <div className="shell section-y-tight grid items-start gap-12 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
          <Reveal y={24}>
            <figure>
              <div className="about-portrait">
                {hasPortrait ? (
                  <Image
                    src={about.portrait.src}
                    alt={about.portrait.alt}
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <span className="about-portrait__placeholder" aria-hidden>
                    <SMark className="h-16 w-16" />
                  </span>
                )}
              </div>
              {hasPortrait && (
                <figcaption className="mt-5 flex items-start gap-3">
                  <span className="grad-rule mt-3 w-8 shrink-0" aria-hidden />
                  <span>
                    <span className="block font-display text-[17px] font-medium">
                      {about.portrait.name}
                    </span>
                    <span className="mt-0.5 block text-[15px] text-ink-2">{about.portrait.role}</span>
                    {/* Zijn eigen motto, en daarom een citaat in plaats van
                        nog een regel bijschrift. */}
                    <span className="mt-3 block max-w-[34ch] text-[15px] italic leading-relaxed text-ink-2">
                      “{about.portrait.quote}”
                    </span>
                  </span>
                </figcaption>
              )}
            </figure>
          </Reveal>

          <Reveal y={20} delay={0.1}>
            <h2 className="text-h3">{about.story.title}</h2>
            {about.story.body.map((p) => (
              <p key={p} className="lead mt-5 max-w-[52ch] text-ink-2">
                {p}
              </p>
            ))}
          </Reveal>
        </div>

        <div className="border-t border-line bg-paper">
          <div className="shell section-y-tight">
            <Reveal>
              <p className="eyebrow">Waar we op sturen</p>
            </Reveal>

            <Reveal stagger y={20} delay={0.1} className="mt-10 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {about.values.map((v) => (
                <div key={v.title}>
                  <div className="grad-rule mb-5 max-w-[54px] origin-left" />
                  <h3 className="text-[19px] font-medium">{v.title}</h3>
                  <p className="mt-2 max-w-[38ch] text-[15px] text-ink-2">{v.body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>
      </article>

      {/* The proof, reused rather than restated: the same marquee the homepage
          runs, so the client list has one source. */}
      <Trust />

      <section className="section-y-tight">
        <div className="shell flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <h2 className="max-w-[18ch] text-h2">{about.cta.title}</h2>
            <p className="lead mt-5 max-w-[40ch] text-ink-2">{about.cta.body}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/contact" className="btn-grad">
              {about.cta.label}
              <span aria-hidden>→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
