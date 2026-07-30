import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared shell for the two legal pages.
 *
 * They sit behind footer links that returned 404 until now. Prose here is
 * deliberately plain — a legal page that has to be decoded is not doing its
 * job — and the measure is capped at ~68 characters so it stays readable.
 */
export function LegalPage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  /** ISO date; rendered in Dutch long form. */
  updated: string;
  children: ReactNode;
}) {
  const date = new Date(updated).toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="section-y pt-[128px]">
      <div className="shell">
        <Link href="/" className="btn-text text-ink-2 hover:text-ink">
          <span aria-hidden>←</span> Terug naar de site
        </Link>

        <p className="eyebrow mt-10">{eyebrow}</p>
        <h1 className="mt-4 max-w-[18ch] text-h2">{title}</h1>
        <p className="mt-5 text-[14px] text-ink-2">Laatst bijgewerkt: {date}</p>

        <div className="legal-prose mt-12 max-w-[68ch]">{children}</div>
      </div>
    </article>
  );
}
