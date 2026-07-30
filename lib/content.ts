/**
 * All homepage copy and data in one place, so wording changes never require
 * touching a component. Voice: confident brand "wij" (decision, 26-07-2026).
 *
 * Every `poster` / `src` below is a placeholder. Real footage from Beer
 * replaces the values here and nothing else — see TODO markers.
 */

export const site = {
  name: "The SPOT",
  tagline: "Videoproductie | Social media content",
  city: "Haarlem",
  email: "beer@dikkeboomspotproducties.nl",
  phone: "+31 6 22 82 99 16",
  phoneHref: "+31622829916",
  address: "Tappersweg 14-011, 2031 EV Haarlem",
  socials: [
    { label: "LinkedIn", href: "https://linkedin.com" }, // TODO: real profile
    { label: "Instagram", href: "https://instagram.com" }, // TODO: real profile
    { label: "TikTok", href: "https://tiktok.com" }, // TODO: real profile
  ],
} as const;

export const nav = [
  { label: "Werk", href: "#werk" },
  { label: "Diensten", href: "#diensten" },
  { label: "Over", href: "#waarom" },
  { label: "Contact", href: "#contact" },
] as const;

export const hero = {
  eyebrow: "Videoproductie — Social media content",
  /**
   * Authored as explicit lines so the mask reveal is deterministic.
   * "spot" carries the single permitted gradient keyword — it is the pun the
   * whole rebrand hangs on (de plek én de commercial).
   */
  headline: [
    { text: "Elk merk", accent: null },
    { text: "heeft z'n", accent: null },
    { text: "spot.", accent: "spot." },
  ],
  lead: "Wij maken video en content die aandacht pakt en blijft plakken — van particulier tot merk. Geen standaard formats, wél beeld dat beweegt.",
  /**
   * The hero plays an ambient montage cut from existing case footage
   * (scripts/make-hero-loop.mjs), not a full film.
   * TODO: when a real showreel exists, point the primary CTA at it and give
   * the label its runtime back — "Bekijk de showreel — 02:14".
   */
  primaryCta: { label: "Bekijk ons werk", href: "#werk" },
  secondaryCta: { label: "Diensten", href: "#diensten" },
  scrollCue: "Scroll",
} as const;

export const trust = {
  label: "Vertrouwd door 120+ merken",
  // TODO: replace with real client logo SVGs in /public/logos
  clients: [
    "Staatsbosbeheer",
    "Talpa",
    "Make-A-Wish",
    "VVD",
    "Khione",
    "SBB",
    "Kinderfysio Haarlem",
    "Zomerbries",
  ],
} as const;

export const services = {
  eyebrow: "Wat we bieden",
  title: "Drie manieren waarop we je merk laten bewegen.",
  items: [
    {
      title: "Videoproductie op maat",
      body: "Van concept tot eindmontage. Bedrijfsfilms, commercials en aftermovies die precies vertellen wat jij bedoelt.",
      icon: "film",
      poster: "/media/posters/service-video.jpg", // TODO: echte still; tot dan toont de kaart het geanimeerde mark
    },
    {
      title: "Professionele fotografie",
      body: "Scherpe merkbeelden, portretten en productfotografie — klaar voor web, print en socials.",
      icon: "camera",
      poster: "/media/posters/service-foto.jpg", // TODO
    },
    {
      title: "Social media content",
      body: "Reels, shorts en campagnes die het algoritme snapt. Gemaakt om te scrollen, gebouwd om te blijven hangen.",
      icon: "social",
      poster: "/media/posters/service-social.jpg", // TODO
    },
  ],
} as const;

/**
 * Bento grid. `span` drives the 12-column desktop layout; everything collapses
 * to a single column under 768px.
 *
 * Ratios are chosen so each desktop row resolves to almost the same height
 * (7-col 16/9 ≈ 378px, 5-col 5/4 ≈ 390px). Portrait tiles next to landscape
 * ones left ~270px of dead white per row, because a CSS grid row is as tall
 * as its tallest cell.
 */
/**
 * Real cases, with real YouTube IDs and posters pulled from those videos.
 *
 * `situation` / `approach` / `result` carry Beer's own words for CLOK. The
 * other three are STUBS — deliberately generic framing, because inventing
 * specifics about someone's client work would put words in their mouth.
 * TODO: replace the marked copy per case.
 */
export const work = {
  eyebrow: "Selected work",
  title: "Recent werk",
  ctaLabel: "Alle cases",
  items: [
    {
      slug: "kinderfysio-haarlem",
      kind: "Bedrijfsvideo",
      project: "Kinderfysio Haarlem",
      client: "Kinderfysio Haarlem",
      year: "2025",
      youtube: "04F0yBpYV7g",
      poster: "/media/posters/kinderfysio-haarlem.jpg",
      clip: "/media/clips/kinderfysio-haarlem.mp4",
      span: "md:col-span-7",
      ratio: "16 / 9",
      intro: "Een bedrijfsvideo die laat zien hoe de praktijk werkt en voor wie.",
      // TODO: vervang door de echte case-tekst
      situation:
        "De praktijk wilde ouders vooraf laten zien hoe een behandeling eruitziet, zodat kinderen met een vertrouwd gevoel binnenkomen.",
      approach:
        "We hebben een dag meegelopen en de sfeer op de praktijk vastgelegd zoals die is — rustig, speels en zonder geregisseerde momenten.",
      result:
        "Een video die de drempel verlaagt en op de site en socials het eerste beeld vormt dat ouders van de praktijk krijgen.",
    },
    {
      slug: "khione-cold-therapy",
      kind: "Productvideo",
      project: "Khione Cold Therapy",
      client: "Khione",
      year: "2025",
      youtube: "T1fnpahch_Y",
      poster: "/media/posters/khione-cold-therapy.jpg",
      clip: "/media/clips/khione-cold-therapy.mp4",
      span: "md:col-span-5",
      ratio: "5 / 4",
      intro: "Productbeeld dat de ervaring van koudetherapie invoelbaar maakt.",
      // TODO: vervang door de echte case-tekst
      situation:
        "Khione wilde het product laten zien zonder het als een klinisch apparaat neer te zetten.",
      approach:
        "Strakke productbeelden afgewisseld met het moment zelf, zodat je de kou bijna voelt in plaats van er alleen naar kijkt.",
      result: "Beeld dat op de webshop en in campagnes hetzelfde verhaal vertelt.",
    },
    {
      slug: "de-groot-recreatie",
      kind: "Merkvideo",
      project: "De Groot Recreatie",
      client: "De Groot Recreatie",
      year: "2025",
      youtube: "b2jzuCYWGIM",
      poster: "/media/posters/de-groot-recreatie.jpg",
      clip: "/media/clips/de-groot-recreatie.mp4",
      span: "md:col-span-5",
      ratio: "5 / 4",
      intro: "De ervaring van een dag bij De Groot, in beeld gebracht.",
      // TODO: vervang door de echte case-tekst
      situation: "De Groot wilde de beleving van hun locatie overbrengen aan wie er nog nooit was.",
      approach: "We hebben een dag gefilmd op de momenten waarop het er het drukst en het mooist is.",
      result: "Een merkvideo die de sfeer verkoopt in plaats van de faciliteiten op te sommen.",
    },
    {
      slug: "clok",
      kind: "Aftermovie",
      project: "CLOK",
      client: "CLOK",
      year: "2025",
      youtube: "KKfTxySg9Ms",
      poster: "/media/posters/clok.jpg",
      clip: "/media/clips/clok.mp4",
      span: "md:col-span-7",
      ratio: "16 / 9",
      intro: "Aftermovie van de Dag van Economische Zaken in Apeldoorn.",
      situation:
        "De klant wilde een krachtige aftermovie van de Dag van Economische Zaken in Apeldoorn. Een event op een unieke locatie die zich perfect leent voor zowel reguliere camerabeelden als drone-opnames. Het doel was om de sfeer, energie en schaal van de dag vast te leggen in één sterke video.",
      approach:
        "We hebben gefocust op het vastleggen van de volledige beleving van de dag, inclusief de verschillende deelsessies en momenten verspreid over het terrein. Door de omvang van de locatie en het aantal ruimtes was een strakke planning en goede afstemming binnen het team essentieel. Met een combinatie van camera- en dronebeelden hebben we gezorgd voor variatie, overzicht en dynamiek in de uiteindelijke productie.",
      result:
        "Eén video die de schaal en de energie van de dag terugbrengt, en die CLOK breed heeft ingezet richting leden en partners.",
    },
  ],
} as const;

export type WorkItem = (typeof work.items)[number];

/**
 * Two sides of the same six points. The toggle section shows one set at a
 * time, so `with` and `without` are deliberately kept in the same order —
 * flipping the switch should feel like the same list changing its mind, not
 * like a different list appearing.
 */
export const why = {
  eyebrow: "Waarom The SPOT",
  titleLead: "Wanneer merken",
  titleTail: "met ons werken",
  intro:
    "Bij ons reken je op scherpe concepten, korte lijnen en beeld dat aansluit op wat je écht wilt bereiken.",
  labels: { with: "wel", without: "niet" },
  with: [
    { title: "Kwaliteit die opvalt", body: "Beeld dat je twee keer laat kijken — en dat naast de grote merken kan staan." },
    { title: "Snel schakelen", body: "Korte lijnen, geen ruis. Vandaag bellen kan morgen draaien betekenen." },
    { title: "Fris maar ervaren", body: "De energie van een nieuw merk, de rust van honderden producties." },
    { title: "Alles onder één dak", body: "Concept, opname, montage, kleur en muziek. Eén aanspreekpunt." },
    { title: "Focus op resultaat", body: "Mooi is het startpunt. Het gaat ons om wat het beeld voor je doet." },
    { title: "Meedenken als partner", body: "We leveren geen bestelling af, we bouwen mee aan wat je wilt bereiken." },
  ],
  without: [
    { title: "Content die opvalt", body: "Je blijft hangen in middelmatige producties die niemand onthoudt." },
    { title: "Snelheid en flexibiliteit", body: "Trage communicatie en lange doorlooptijden kosten je het momentum." },
    { title: "Een actuele blik", body: "Je mist aansluiting op wat nú werkt binnen content en media." },
    { title: "Consistente kwaliteit", body: "Losse partijen aan elkaar knopen levert wisselende resultaten op." },
    { title: "Meetbaar resultaat", body: "Mooie beelden zonder strategie leveren uiteindelijk weinig op." },
    { title: "Een betrokken partner", body: "Je werkt met uitvoerders in plaats van mensen die meedenken." },
  ],
} as const;

export const testimonial = {
  quote:
    "Geweldig geholpen aan vette foto's en een gave aftermovie met drone-beelden. Alles liep vlekkeloos.",
  name: "Pleunie Groen",
  source: "Review via Google",
} as const;

export const contact = {
  eyebrow: "Sparren met of zonder koffie?",
  title: "Laten we jouw visie tot leven brengen.",
  cta: "Start jouw project",
  lead: "Vertel kort wat je voor ogen hebt. Je krijgt binnen één werkdag antwoord — geen offertemolen, gewoon een gesprek.",
  form: {
    name: "Naam",
    namePlaceholder: "Jouw naam",
    email: "E-mail",
    emailPlaceholder: "jij@bedrijf.nl",
    phone: "Telefoon",
    phonePlaceholder: "06 12345678",
    phoneOptional: "optioneel",
    message: "Bericht",
    messagePlaceholder: "Waar wil je het over hebben?",
    submit: "Verstuur bericht",
    sending: "Versturen…",
    success: "Bericht verstuurd. Je hoort snel van ons.",
  },
} as const;

export const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Algemene voorwaarden", href: "/voorwaarden" },
] as const;
