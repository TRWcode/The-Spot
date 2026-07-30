import type { Metadata } from "next";
import Link from "next/link";
import { work } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pagina niet gevonden",
  robots: { index: false, follow: true },
};

/**
 * 404.
 *
 * Next's default is an unstyled black-on-white line, which on a site like this
 * reads as "broken" rather than "wrong address". This one keeps the header and
 * footer, says what happened in one sentence, and — more usefully than any
 * apology — offers the way on: the newest case, the work, or a conversation.
 */
export default function NotFound() {
  const latest = work.items[0];

  return (
    <article className="section-y pt-[128px]">
      <div className="shell">
        <div className="grad-rule mb-7 max-w-[96px] origin-left" />
        <p className="eyebrow">404</p>
        <h1 className="mt-4 max-w-[18ch] text-h1">Deze pagina bestaat niet.</h1>
        <p className="lead mt-7 max-w-[46ch] text-ink-2">
          Mogelijk is de link verouderd of staat er een typefout in het adres. Hieronder kom je
          alsnog waar je wilde zijn.
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link href="/werk" className="btn-grad">
            Bekijk ons werk
            <span aria-hidden>→</span>
          </Link>
          <Link href="/contact" className="btn-text">
            Contact
          </Link>
        </div>

        <div className="mt-16 border-t border-line pt-8">
          <p className="eyebrow">Meest recente case</p>
          <Link href={`/werk/${latest.slug}`} className="case-next group">
            <span className="text-h3">{latest.project}</span>
            <span className="case-next__arrow" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
