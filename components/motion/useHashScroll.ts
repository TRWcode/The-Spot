"use client";

import { useCallback } from "react";
import { useMotion } from "@/components/motion/MotionProvider";
import { ANCHOR } from "@/lib/motion";

/**
 * Eén manier om naar een #sectie op dezelfde pagina te reizen, voor elke
 * knop die daarheen wijst.
 *
 * De header deed dit al zelf. De hero-CTA's en het footermenu niet: dat zijn
 * gewone anchors, en `.lenis-smooth` zet `scroll-behavior: auto !important`
 * (globals.css), dus die landden in één frame terwijl dezelfde link in de
 * header rustig doorliep. Zelfde bestemming, twee verschillende producten —
 * vandaar dat de logica hier staat en niet in één component.
 */

/**
 * De hash als het doel in dit document ligt, anders null.
 *
 * De footer schrijft altijd `/#diensten` omdat hij ook onder de casepagina's
 * en de juridische pagina's hangt, waar een kale `#diensten` nergens op slaat.
 * Op de homepage is dat dus een scroll en elders een echte navigatie, en dat
 * verschil kun je alleen aan het pad zien.
 */
function sameDocumentHash(href: string | null): string | null {
  if (!href) return null;
  if (href.startsWith("#")) return href.length > 1 ? href : null;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return null;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin) return null;
  if (url.pathname !== window.location.pathname) return null;
  return url.hash.length > 1 ? url.hash : null;
}

export function useHashScroll() {
  const { lenisRef, reduced } = useMotion();

  return useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Ctrl/cmd-klik en middenklik horen bij de browser: openen in een nieuw
      // tabblad moet blijven werken, en dat is precies wat preventDefault sloopt.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const hash = sameDocumentHash(e.currentTarget.getAttribute("href"));
      if (!hash) return;

      // Onder reduced motion niets onderscheppen. De native sprong is dan de
      // eerlijke: wie animatie uitzet vraagt niet om een kortere animatie.
      if (reduced) return;

      const el = document.querySelector(hash);
      if (!el) return;

      e.preventDefault();

      // De hash hoort wel in de balk te blijven staan, anders is de sectie niet
      // meer te delen. `replaceState` in plaats van push, zodat vier keer door
      // het menu klikken geen vier stappen terug oplevert.
      if (window.location.hash !== hash) {
        window.history.replaceState(null, "", hash);
      }

      // Een frame wachten geeft het mobiele menu de kans zichzelf te sluiten:
      // dat stopt Lenis terwijl het open staat, en scrollen op een gestopte
      // instantie doet stilzwijgend niets.
      requestAnimationFrame(() => {
        const lenis = lenisRef.current;
        if (!lenis) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }

        // Afstand tot de bovenkant van het doel is precies wat er gescrold gaat
        // worden. Geen offset meegeven: `section[id] { scroll-margin-top }` is
        // de enige plek waar de vaste header wordt verrekend.
        const screens = Math.abs(el.getBoundingClientRect().top) / Math.max(1, window.innerHeight);
        const duration = Math.min(ANCHOR.max, ANCHOR.base + screens * ANCHOR.perScreen);

        lenis.scrollTo(el as HTMLElement, { duration, easing: ANCHOR.ease });
      });
    },
    [lenisRef, reduced],
  );
}
