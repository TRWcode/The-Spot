"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { nav, site } from "@/lib/content";
import { navHref } from "@/lib/nav";
import { socialProfiles } from "@/lib/socials";
import { useMotion } from "@/components/motion/MotionProvider";
import { useHashScroll } from "@/components/motion/useHashScroll";

/**
 * Transparent over the hero, then backdrop-blur + hairline once scrolled.
 * Carries the gradient scroll-progress line — one of the few places the
 * gradient is allowed to appear as a rule.
 *
 * Below md the nav becomes a full-screen sheet. It animates with CSS
 * transitions rather than a JS timeline: transitions reverse themselves for
 * free, so closing is as considered as opening, and the whole thing runs on
 * compositor properties only — which is what keeps it smooth on a mid-range
 * phone.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const { lenisRef } = useMotion();
  const hashScroll = useHashScroll();
  const panelId = useId();
  const pathname = usePathname();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /**
   * While the sheet is open the page behind it must not move. Lenis drives the
   * scroll, so stopping the body alone is not enough — it would keep its own
   * virtual position and the page would jump on close. `overscroll-behavior`
   * on the panel stops a scroll at its end from chaining to the page.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const lenis = lenisRef.current;
    lenis?.stop();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = overflow;
    };
  }, [menuOpen, lenisRef]);

  /**
   * A full-screen sheet is a modal surface: Escape closes it, Tab stays inside
   * it, and focus returns to the button that opened it. Without the last part
   * closing the menu drops focus back to the top of the document.
   */
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    const opener = burgerRef.current;

    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [menuOpen, closeMenu]);

  // Anything wide enough for the desktop nav must not be left with an open
  // sheet — rotating a phone into landscape crosses this line.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => mq.matches && closeMenu();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [closeMenu]);

  // True while the fixed header physically sits over the dark hero. This is
  // deliberately independent from "has the page scrolled?": hash restores,
  // Lenis movement and small scrolls inside the hero still need white header
  // text until the header has actually left the dark surface.
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        /**
         * Re-queried on every measure rather than captured once. The header
         * lives in the layout and survives client-side navigation, so a
         * reference taken at mount outlives the page it came from: leaving the
         * homepage left the header reporting a hero that was no longer in the
         * document, and it painted white nav on a white case page until the
         * visitor happened to scroll.
         */
        const hero = document.querySelector<HTMLElement>("[data-dark-hero]");
        if (!hero) {
          setOnDark(false);
          return;
        }
        const headerHeight = headerRef.current?.offsetHeight ?? 72;
        const sampleY = Math.max(1, Math.min(headerHeight - 1, headerHeight * 0.5));
        const rect = hero.getBoundingClientRect();
        setOnDark(rect.top <= sampleY && rect.bottom >= sampleY);
      });
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("hashchange", measure);
    window.addEventListener("pageshow", measure);

    document.fonts?.ready.then(measure).catch(() => {});
    const timeout = window.setTimeout(measure, 120);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      window.removeEventListener("hashchange", measure);
      window.removeEventListener("pageshow", measure);
    };
    // A route change is the one moment that changes the answer without firing
    // any of the events above — the new page is simply a different surface.
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? y / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${pct})`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * Half the nav points at sections of the homepage and half at pages of their
   * own, so a link is one of three things depending on where the visitor is
   * standing: a scroll, a trip home, or a plain navigation. `onHome` decides
   * that once and `navHref` applies it — which also means the links are real,
   * crawlable URLs on a case page rather than hashes that resolve to nothing.
   */
  const onHome = pathname === "/";
  const to = (href: string) => navHref(href, onHome);

  // Not curried: a factory called from JSX reads as a render-time ref access.
  const jump = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Closing first hands scrolling back to Lenis before it is asked to move;
    // scrolling a stopped instance silently does nothing. It runs for the
    // cross-page links too, so the sheet is never left open behind a route
    // change.
    setMenuOpen(false);
    // De reis zelf staat in useHashScroll, omdat de hero en de footer naar
    // dezelfde secties wijzen en anders anders zouden bewegen.
    hashScroll(e);
  };

  const headerOnDark = onDark && !menuOpen;
  const headerLifted = scrolled && !headerOnDark && !menuOpen;

  return (
    <header
      ref={headerRef}
      data-on-dark={headerOnDark}
      className={`site-header fixed inset-x-0 top-0 z-[100] transition-[background-color,backdrop-filter,border-color] duration-300 ${
        headerLifted ? "border-b border-line bg-paper/75 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="shell relative z-[2] flex h-[72px] items-center justify-between">
        {/* No aria-label: the visible wordmark is the accessible name. An
            aria-label that restates it trips WCAG 2.5.3 (label-in-name). */}
        <Link href={onHome ? "#top" : "/"} onClick={jump}>
          <Wordmark handoff />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Hoofdnavigatie">
          {nav.map((item) => (
            <Link key={item.href} href={to(item.href)} onClick={jump} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/contact" className="pill-outline hidden sm:inline-flex">
            Let&apos;s talk
          </Link>

          <button
            ref={burgerRef}
            type="button"
            className="burger -mr-2 md:hidden"
            aria-expanded={menuOpen}
            aria-controls={panelId}
            aria-label={menuOpen ? "Menu sluiten" : "Menu openen"}
            onClick={() => setMenuOpen((v) => !v)}
            data-open={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile sheet. Kept mounted so both directions animate; it is taken out
          of the a11y tree and the tab order while closed. */}
      <div
        ref={panelRef}
        id={panelId}
        className="nav-sheet md:hidden"
        data-open={menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
      >
        <nav className="nav-sheet__inner" aria-label="Mobiele navigatie">
          <ul>
            {nav.map((item, i) => (
              // --i drives the stagger from CSS, so the order is declared once
              // here rather than duplicated across two keyframe sets.
              <li key={item.href} style={{ "--i": i } as React.CSSProperties}>
                <Link href={to(item.href)} onClick={jump} className="nav-sheet__link">
                  <span className="nav-sheet__index" aria-hidden>
                    0{i + 1}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav-sheet__foot" style={{ "--i": nav.length } as React.CSSProperties}>
            <Link href="/contact" onClick={closeMenu} className="btn-grad w-full justify-center !px-6">
              Start jouw project
            </Link>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
              <div className="flex flex-col gap-1">
                <a href={`mailto:${site.email}`} className="nav-sheet__meta">
                  {site.email}
                </a>
                <a href={`tel:${site.phoneHref}`} className="nav-sheet__meta">
                  {site.phone}
                </a>
                <p className="nav-sheet__meta !text-ink-2">{site.city}</p>
              </div>

              <ul className="flex gap-2">
                {socialProfiles.map((s) => (
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
        </nav>
      </div>

      {/* Scroll progress */}
      <div
        ref={barRef}
        className="grad-fill relative z-[2] h-[2px] w-full origin-left"
        style={{ transform: "scaleX(0)" }}
        aria-hidden
      />
    </header>
  );
}
