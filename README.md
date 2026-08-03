# The SPOT — homepage

Videoproductie | Social media content — Wormerveer.
Rebrand van "Spot Video Producties" naar The SPOT.

Next.js 16 (App Router) · TypeScript · Tailwind v4 · GSAP + Lenis · Vercel.

```bash
npm run dev      # http://localhost:3000
npm run build
npm start
```

## Art direction in één zin

Licht, redactioneel, high-end. Veel wit, groot geometrisch type, en het beeld
levert de rijkdom. De gradient is een **accent, geen thema**.

### Waar de gradient wél mag

Play-marks · custom cursor · actieve nav-underline · scroll-progress · CTA-fill ·
sectie-hairlines · **één** keyword in de hero-headline. Verder nergens — geen
grote vlakken, geen gradient op tekstblokken.

## Structuur

| Pad | Wat |
| --- | --- |
| `app/globals.css` | Tokens (`@theme`), componentklassen, hero-load-sequence, reduced-motion |
| `lib/content.ts` | **Alle copy en data.** Tekst wijzigen doe je hier, niet in componenten |
| `lib/video.ts` | Video-hosting adapter — één bestand om naar Mux/Stream te switchen |
| `lib/motion.ts` | Easings, durations, stagger. Het bewegingsvocabulaire |
| `components/brand/SMark.tsx` | Het S-mark als échte vector (zie hieronder) |
| `components/ui/PlayCursor.tsx` | De signature play-cursor |
| `components/sections/` | De zeven homepage-secties, in vaste volgorde |

## Twee dingen die niet vanzelfsprekend zijn

**Het S-mark is getráceerd, niet nagetekend.** De aangeleverde `.svg`-bestanden
zijn Canva-exports die embedded raster in clip-paths verpakken (±500 KB per
stuk, 6 `<image>`-tags) — die worden zacht zodra je ze schaalt of laat draaien.
`scripts/trace-mark.mjs` haalt de maskers eruit, trekt er met marching squares +
Schneider-curvefit echte paden overheen en leest de gradient rechtstreeks van de
fill-rasters af. Uitkomst: **3,4 KB in plaats van 509 KB, met 1% afwijking in
dekking** — en dat laatste is puur antialiasing op de rand.

Belangrijk: dit is dus hetzelfde logo, geen interpretatie ervan. Een eerdere
handgetekende versie week net iets af en is verwijderd. Verandert het logo, dan
draai je het script opnieuw; `components/brand/mark-geometry.ts` en
`public/brand/the-spot-mark.svg` zijn beide gegenereerd en horen niet met de
hand aangepast te worden. De originele Canva-bestanden staan in `brand-source/`
— bewust buiten `public/`, zodat ze niet meegeserveerd worden.

**De hero-load-sequence draait op CSS, niet op GSAP.** Eerst was het een
GSAP-timeline; dat betekende dat de hero verborgen bleef tot React gehydrateerd
was. Op een getruttelde telefoon verscheen de eerste regel tekst pas na 5,1 s en
landde LCP op 3,5 s. Een load-animatie die alleen op snelle hardware speelt is
geen load-animatie. Nu leveren `animation-fill-mode: both` + delays de
begintoestand, dus het start bij de eerste paint — zonder JS, op elk apparaat.
GSAP houdt alleen het S-mark dat naar de header vliegt, want dat moet echte
layout opmeten.

## Status: wat er nog moet gebeuren

De site is compleet en meetbaar in orde; wat ontbreekt is **echt materiaal en
een paar besluiten van Beer**. Alle plekken staan gemarkeerd met `TODO`.

Blokkerend voor livegang:

- [ ] **"Vertrouwd door 120+ merken".** De balk toont 15 échte klantlogo's. Het
      label erboven claimt 120+ en is niet onderbouwd; `trust.clients` in
      `lib/content.ts` bevat daarnaast nog een lijst voorbeeldnamen die alleen
      dient als terugval wanneer er géén logo's zijn. Pas het label aan naar wat
      klopt, of onderbouw het.
- [ ] **E-mailadres.** `site.email` is `beer@dikkeboomspotproducties.nl`, een
      adres op het oude merkdomein, terwijl de site op thespotproducties.nl
      staat en de mails die het formulier stuurt dat domein in het onderwerp
      noemen. Bevestigen of hier een adres op het nieuwe domein hoort.
- [ ] **Case-teksten.** `situation` en `approach` komen nu van Beers eigen
      cases op spotvideoproducties.nl, ingekort naar de toon van deze site.
      Twee dingen blijven open. De aanpak van Kinderfysio stond op de oude site
      woord voor woord gelijk aan die van Khione — een kopieerfout die bij een
      instructievideo klopt en bij een bedrijfsvideo niet, dus die is opnieuw
      geschreven vanuit de vraag en moet langs Beer. En de vier `result`-regels
      zijn van ons: de oude site liet dat blok leeg, er staat alleen een video
      onder "Resultaat". Ze beweren niets meetbaars, maar het is wel Beers naam
      eronder.
- [ ] **Review op de homepage.** De quote van Pleunie Groen prijst "vette
      foto's". Fotografie is per 02-08-2026 geen dienst meer; vervang de review
      of accepteer de verwijzing bewust.
- [x] **Social-URL's.** Wijzen naar de echte profielen. De Instagram- en
      TikTok-handles zijn nog `spotvideoproducties`; die volgen de rebrand pas
      als Beer ze omzet.
- [x] **Domein.** `lib/site-url.ts` valt terug op `https://thespotproducties.nl`
      en pakt op Vercel automatisch de productie-URL, dus
      `NEXT_PUBLIC_SITE_URL` is optioneel.
- [ ] **Juridische pagina's.** `/privacy` en `/voorwaarden` staan er met het
      KvK-nummer ingevuld. De bewaartermijnen en de bedragen in de voorwaarden
      zijn overgenomen zoals aangeleverd en nog niet juridisch nagekeken. De
      vaststellingsregel onderaan de voorwaarden noemt nog Haarlem, wat klopte
      op 5 maart 2025 maar niet meer bij het huidige vestigingsadres past.
- [x] **Contactformulier.** Draait op Resend en staat ingesteld in Vercel.
      Nodig zijn `RESEND_API_KEY` en `CONTACT_FROM` (`The SPOT
      <thespot@stapit.com>`, zonder aanhalingstekens in Vercel); optioneel
      `CONTACT_TO`, dat anders terugvalt op `site.email`. Zonder die eerste
      twee weigert het formulier bewust te versturen in plaats van te doen
      alsof. Alleen het afzenderdomein hoeft in Resend geverifieerd te zijn,
      de ontvanger nergens — daarom bedient één domein alle klantsites.
      Lokaal zet je dezelfde waarden in `.env.local`; dat bestand hoort
      nergens in git, net als elk ander `.env`-bestand.

Beter maken zodra het materiaal er is:

- [ ] **Meer klantlogo's.** Zet ze in `assets-inbox/logos/` en draai
      `node scripts/make-logos.mjs`. Noem een bestand naar een case-slug
      (`clok.webp`) en het logo verschijnt óók op die casepagina.
- [ ] **Khione en De Groot draaien op lage-resolutiebronnen** (848×480 en
      640×360 YouTube-rips). De tiles spelen nu wel af, maar zacht. Met een
      master-export levert `scripts/make-clips.mjs` direct scherpere loops.
- [ ] **Showreel.** De hero draait een montage uit bestaand casemateriaal, geen
      echte showreel. Zodra die er is: hero-CTA erop richten en de runtime in
      het label terugzetten.
- [ ] **Diensten-posters** (`/public/media/posters/service-*.jpg`) zijn nog
      placeholders; de kaarten tonen tot die tijd het geanimeerde mark.
- [ ] Ondertiteling (`<track kind="captions">`) bij de definitieve showreel.

## Meetwaarden

Lighthouse, productie-build, tegen `next start` (mobiel = mediaan van drie
runs, want één run is ruis):

| | Performance | A11y | Best practices | SEO | LCP | SI | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop | 99 | 100 | 100 | 100 | 0,8 s | — | 0 |
| Mobiel (throttled) | 88 | 100 | 100 | 100 | 3,9 s | 2,9 s | 0 |

Het LCP-element is de **tekst van het woordmerk in de header**, niet het
hero-beeld — vandaar dat `app/fonts.ts` alleen General Sans preloadt en Switzer
op de fallback laat starten. De mobiele hero-loop is teruggebracht van 578 KB
naar 279 KB (704px, harde bitrate-cap in `scripts/make-hero-loop.mjs`).

Wat níet werkte: de `<video>` uitstellen tot `requestIdleCallback`. Dat haalde
de download weg bij de LCP maar liet de hero zo lang stilstaan dat Speed Index
van 2,9 s naar 5,2 s ging. Niet doen.

### Soepelheid tijdens scrollen

Gemeten met `scripts/check-jank.mjs` (4x CPU-throttle, echte wheel-events zodat
Lenis in de meting zit — `window.scrollTo` slaat die laag over en meet niets):

**De hero push-in schaalde de `<video>` zelf.** Een `transform: scale` op een
spelende video dwingt de compositor elk gedecodeerd frame opnieuw te
rasteriseren. Dat kostte de hele pagina **66 → 81 fps**. De animatie staat nu op
`.hero-reel__push`, één laag om poster én video heen, dus ze schalen samen en er
is ook geen sprongetje meer bij de crossfade.

`will-change: transform` maakte het meetbaar *slechter*. Geen gratis winst.

Marquee, logo-filters, cursor en tile-transities kosten elk ~2 fps — niets daar
is het aanpassen waard.

Draai je dit zelf: **interleave de varianten** (dat doet het script) en kijk naar
de mediaan. Losse runs op deze machine schommelen tussen 65 en 83 fps, ruim
genoeg om elke gewenste conclusie te "bewijzen".

Getest van 320px t/m 1920px met `scripts/check-responsive.mjs` — geen
horizontale overflow, geen tapdoel onder de norm.
`prefers-reduced-motion` schakelt smooth scroll, de cursor en alle animaties
uit; niets is afhankelijk van een transform om leesbaar te zijn.

## Dev-scripts

Alleen voor ontwikkeling, niet onderdeel van de build:

```bash
# assets — draaien pas als er nieuw materiaal binnenkomt
node scripts/trace-mark.mjs               # logo -> vectorpaden + favicon-bron
node scripts/make-icons.mjs               # favicon + apple-icon uit het mark
node scripts/make-logos.mjs               # klantlogo's -> /public/logos + lib/logos.ts
node scripts/make-clips.mjs [slug]        # exports -> hover-loops + posters
node scripts/make-og.mjs                  # social share-image (1200x630)

# controles
node scripts/check-responsive.mjs <url>   # overflow + tapdoelen, 11 breedtes
node scripts/check-jank.mjs <url>         # fps tijdens scrollen, per verdachte
node scripts/check-a11y-motion.mjs <url>  # controleert reduced-motion
node scripts/check-anchor-scroll.mjs <url> # #sectie-links scrollen, niet springen
node scripts/check-hero-contrast.mjs <url># contrast onder de hero-tekst
node scripts/shots.mjs <url> <outDir>     # screenshots, 4 viewports
node scripts/lcp.mjs <url>                # welk element is LCP
```

`trace-mark`, `make-icons` en `make-og` schrijven bestanden die zijn
gecommit — je hoeft ze alleen te draaien als de bron verandert.
