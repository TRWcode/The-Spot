import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import { CaseBody } from "@/components/sections/CaseBody";
import { work, site } from "@/lib/content";
import { logoForCase } from "@/lib/logos";

type Params = { slug: string };

/**
 * The generated logo sizes are tuned for the 30px marquee row. On a case page
 * the client's mark is a piece of evidence rather than a texture, so it is set
 * larger — still well inside the 3x raster the pipeline writes.
 */
const CASE_LOGO_SCALE = 1.7;

/** Every case is known at build time, so all of these are static pages. */
export function generateStaticParams() {
  return work.items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const item = work.items.find((i) => i.slug === slug);
  if (!item) return {};

  const title = `${item.project} — ${item.kind}`;
  return {
    title,
    description: item.intro,
    openGraph: {
      title: `${title} | ${site.name}`,
      description: item.intro,
      // No width/height: the posters are cut from the source films and run from
      // 640x360 to 1920x1080. Declaring one size for all of them made every
      // preview crop somewhere other than where the frame was chosen.
      images: [{ url: item.poster }],
      type: "article",
    },
  };
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const item = work.items.find((i) => i.slug === slug);
  if (!item) notFound();

  const index = work.items.findIndex((i) => i.slug === slug);
  const next = work.items[(index + 1) % work.items.length];
  // Absent until a logo with this slug is dropped in assets-inbox/logos/.
  const logo = logoForCase(slug);

  return (
    <>
      <article className="case-page pt-[124px] md:pt-[132px]">
        <div className="case-hero shell">
          <Link href="/#werk" className="btn-text text-ink-2 hover:text-ink">
            <span aria-hidden>←</span> Alle cases
          </Link>

          <p className="case-kicker eyebrow mt-9">{item.kind}</p>
          <h1 className="mt-4 max-w-[16ch] text-h1">{item.project}</h1>

          <div className="case-meta mt-10 flex flex-wrap items-end justify-between gap-x-16 gap-y-8 border-t border-line pt-8">
            <dl className="flex flex-wrap gap-x-16 gap-y-6">
              <div>
                <dt className="eyebrow">Klant</dt>
                <dd className="mt-2 text-[17px]">{item.client}</dd>
              </div>
              <div>
                <dt className="eyebrow">Jaar</dt>
                <dd className="mt-2 text-[17px]">{item.year}</dd>
              </div>
              <div>
                <dt className="eyebrow">Soort</dt>
                <dd className="mt-2 text-[17px]">{item.kind}</dd>
              </div>
            </dl>

            {/* In full colour, unlike the marquee: here it is the client's own
                mark standing next to their name, not one texture in a row.
                aria-hidden because "Klant — CLOK" is already stated above it. */}
            {logo && (
              <Image
                src={logo.src}
                alt=""
                aria-hidden
                width={logo.w}
                height={logo.h}
                style={{ height: Math.round(logo.h * CASE_LOGO_SCALE), width: "auto" }}
                className="max-w-[220px] object-contain"
                unoptimized={logo.src.endsWith(".svg")}
              />
            )}
          </div>
        </div>

        {/* Wide film. The case exists to be watched, without swallowing the page chrome. */}
        <div className="case-film-wrap mt-12 px-[clamp(20px,5vw,72px)]">
          <YouTubeEmbed
            id={item.youtube}
            poster={item.poster}
            clip={item.clip}
            title={`${item.project} — ${item.kind}`}
            priority
            sizes="(min-width: 1680px) 1560px, calc(100vw - 80px)"
            className="case-film"
            alwaysShowPlay
          />
        </div>

        <CaseBody item={item} />
      </article>

      <section className="section-y-tight border-t border-line bg-paper">
        <div className="shell">
          <p className="eyebrow">Volgende case</p>
          <Link href={`/werk/${next.slug}`} className="case-next group">
            <span className="text-h2">{next.project}</span>
            <span className="case-next__arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </section>
    </>
  );
}
