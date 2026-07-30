import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { legal, nav, site } from "@/lib/content";
import { ScrollTop } from "@/components/site/ScrollTop";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="shell py-16">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.2fr]">
          <div>
            {/* The lockup, at the size the mark is actually legible. `handoff`
                stays with the header: the hero's flying mark has exactly one
                landing slot and it is not this one. */}
            <Wordmark markClassName="h-12 w-12" textClassName="text-[22px]" />
            <p className="mt-4 max-w-[34ch] text-[15px] text-ink-2">{site.tagline}</p>
            <p className="mt-1 text-[15px] text-ink-2">{site.city}</p>
          </div>

          <nav aria-label="Footernavigatie">
            <p className="eyebrow mb-2">Menu</p>
            {/* Rows rather than a gap-spaced list: the padding is what makes
                each link a 44px tap target on a phone. */}
            <ul className="flex flex-col">
              {/* Absolute, not bare hashes: this footer also renders under the
                  case pages and the legal pages, where "#werk" resolves to
                  nothing at all. A Link keeps the same-page case a scroll
                  rather than a reload. */}
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`/${item.href}`}
                    className="flex min-h-[44px] items-center text-[15px] hover:text-blue"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-2">Contact</p>
            <ul className="flex flex-col">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="flex min-h-[44px] items-center text-[15px] [overflow-wrap:anywhere] hover:text-blue"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phoneHref}`} className="flex min-h-[44px] items-center text-[15px] hover:text-blue">
                  {site.phone}
                </a>
              </li>
              <li className="mt-2 text-[15px] text-ink-2">{site.address}</li>
            </ul>

            <ul className="mt-6 flex gap-2">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    className="social-btn"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={s.label}
                  >
                    <SocialIcon name={s.label} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back-to-top belongs on the last line, not in a column of its own —
            as a fourth column it left a hole between the contact block and the
            edge of the shell. */}
        <div className="mt-16 flex flex-wrap items-center justify-between gap-x-8 gap-y-6 border-t border-line pt-8">
          <p className="text-[13px] text-ink-2">
            © {new Date().getFullYear()} {site.name}
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <ul className="flex gap-6">
              {legal.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="flex min-h-[44px] items-center text-[13px] text-ink-2 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <ScrollTop />
          </div>
        </div>
      </div>
    </footer>
  );
}
