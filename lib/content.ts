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
  city: "Wormerveer",
  email: "beer@dikkeboomspotproducties.nl",
  phone: "+31 6 22 82 99 16",
  phoneHref: "+31622829916",
  address: "Witte Vlinderweg 12C, 1521 PS Wormerveer",
  /**
   * One name everywhere: SPOT post & video Producties is per 02-08-2026 geen
   * handelsnaam meer, dus de juridische pagina's noemen alleen The SPOT en is
   * er niets meer om naast `name` te zetten. Het KvK-nummer verandert niet mee.
   */
  kvk: "96981547",
  socials: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/beer-dikkeboom-b768a0264/" },
    { label: "Instagram", href: "https://www.instagram.com/spotvideoproducties/" },
    // Zonder de tracking-parameters waarmee TikTok deelt: die horen bij het
    // apparaat dat de link kopieerde, niet bij het profiel.
    { label: "TikTok", href: "https://www.tiktok.com/@spotvideoproducties31" },
  ],
} as const;

/**
 * Two kinds of destination in one list: a `#hash` is a section of the
 * homepage, a `/path` is a page of its own. Everything that renders this list
 * runs the href through `navHref()` in lib/nav.ts, which is what makes the
 * hashes work from a case page as well as from the homepage.
 */
export const nav = [
  { label: "Werk", href: "/werk" },
  { label: "Diensten", href: "#diensten" },
  { label: "Over", href: "/over-ons" },
  { label: "Contact", href: "/contact" },
] as const;

export const hero = {
  eyebrow: "Videoproductie en social media content",
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
  lead: "Wij maken video en content die aandacht pakt en blijft plakken, van particulier tot merk. Geen standaard formats, wel beeld dat beweegt.",
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

/**
 * The title deliberately does not count the cards. "Twee manieren" read as a
 * menu with exactly two items on it, while the work is regelmatig een mix of
 * iets wat hieronder niet staat — vandaar de `lead` die het open zet.
 */
export const services = {
  eyebrow: "Wat we bieden",
  title: "Zo brengen we je merk in beweging.",
  lead: "Dit zijn de twee waar we meestal beginnen. Zit jouw vraag er niet tussen, dan bouwen we het op maat om je verhaal heen.",
  items: [
    {
      title: "Videoproductie op maat",
      body: "Van concept tot eindmontage. Bedrijfsfilms, commercials en aftermovies die precies vertellen wat jij bedoelt.",
      icon: "film",
      poster: "/media/posters/service-video.jpg", // TODO: echte still; tot dan toont de kaart het geanimeerde mark
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
  /** /werk — the index the homepage section links through to. */
  page: {
    eyebrow: "Werk",
    title: "Wat we hebben gemaakt.",
    lead: "Bedrijfsfilms, aftermovies, productvideo's en merkverhalen. Elke case laat zien wat de vraag was, hoe we hem hebben aangepakt en wat het opleverde.",
  },
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
        "We hebben een dag meegelopen en de sfeer op de praktijk vastgelegd zoals die is: rustig, speels en zonder geregisseerde momenten.",
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
    { title: "Kwaliteit die opvalt", body: "Beeld dat je twee keer laat kijken, en dat naast de grote merken kan staan." },
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

/**
 * /contact. The homepage keeps its own shorter invitation (`contact` below);
 * this is the page someone lands on when they have already decided to write.
 */
export const contactPage = {
  eyebrow: "Contact",
  title: "Vertel wat je voor ogen hebt.",
  lead: "Een idee, een deadline of alleen een vraag. Het mag allemaal kort. Je krijgt binnen één werkdag antwoord van iemand die de productie ook echt draait.",
  /** Set against the promise in `lead`: what happens after the send button. */
  steps: [
    {
      title: "Je krijgt binnen één werkdag antwoord",
      body: "Geen automatische bevestiging, maar een echt bericht van Beer.",
    },
    {
      title: "We bellen of drinken koffie",
      body: "Twintig minuten is meestal genoeg om te weten of het klikt en wat het ongeveer kost.",
    },
    {
      title: "Je krijgt een voorstel op maat",
      body: "Concept, planning en prijs op één pagina. Geen offertemolen.",
    },
  ],
  /** Sits under the details block; the studio is a real place you can visit. */
  studioNote: "Een complete studio in Wormerveer, uitgerust voor iedere productie.",
} as const;

/**
 * /over-ons.
 *
 * Adapted from The SPOT's own existing about copy rather than written fresh —
 * the claims are theirs, only the voice is brought in line with the rest of
 * this site. Nothing here asserts a fact (team size, years, awards) that the
 * client has not already published about themselves.
 */
export const about = {
  eyebrow: "Over ons",
  title: "Gemaakt om impact te maken.",
  lead: "Wij maken video en social media content op maat: beeld dat je merk versterkt, je verhaal vertelt en blijft hangen. Geen standaard formats, geen bestelling afleveren.",
  /**
   * Portrait. Generated from assets-inbox/photos/ by scripts/make-photos.mjs;
   * app/over-ons/page.tsx checks the file exists at build time and falls back
   * to a branded panel, so a missing photo is never a broken image.
   *
   * `quote` staat onder de naam in het bijschrift: Beers eigen motto, niet
   * onze samenvatting van hem.
   */
  portrait: {
    src: "/media/about/beer.jpg",
    alt: "Beer Dikkeboom, oprichter van The SPOT",
    name: "Beer Dikkeboom",
    role: "Oprichter en eigenaar",
    quote: "Fouten maken is menselijk. Reflecteren is groeien. De volgende keer doe ik het beter.",
  },
  /**
   * Beer's own words, aangeleverd 02-08-2026 — first person on purpose. The
   * rest of the site speaks as "wij", and it should: a client hires a studio.
   * But the one place where a founder's face is on the page is the one place
   * where "ik" is the honest pronoun, and a story that starts at fifteen is
   * worth more than another paragraph of we-make-beautiful-images.
   *
   * Overgenomen zoals aangeleverd. SPOT post & video Producties wordt hier
   * genoemd als geschiedenis, niet als handelsnaam — vandaar de verleden tijd.
   */
  story: {
    title: "Wie is Beer Dikkeboom?",
    body: [
      "Mijn naam is Beer Dikkeboom, oprichter van The SPOT. Op mijn 15e begon ik als freelancer onder de naam SPOT post & video Producties. Wat startte met het maken van video's voor ondernemers en merken, groeide al snel uit tot een volledig videoproductiebedrijf. Later breidden we onze dienstverlening uit met social media management, zodat we klanten niet alleen konden helpen met sterke content, maar ook met de strategie en zichtbaarheid daaromheen.",
      "Die groei leidde tot een nieuwe stap. Vandaag de dag gaan we verder als The SPOT: een naam die beter past bij onze ambitie en toekomstvisie. We bouwen niet alleen aan een succesvol bedrijf, maar aan een sterk merk dat staat voor kwaliteit, creativiteit en innovatie.",
      "Ondernemen draait voor mij om blijven ontwikkelen. Nieuwe ideeën bedenken, kansen zien en telkens een stap verder zetten. Die mentaliteit heeft The SPOT gebracht waar het nu staat en vormt de basis voor alles wat we in de toekomst willen realiseren.",
    ],
  },
  /** Condensed from the wel/niet section, so the two never contradict. */
  values: [
    {
      title: "Kwaliteit die opvalt",
      body: "Beeld dat je twee keer laat kijken, en dat naast de grote merken kan staan.",
    },
    {
      title: "Korte lijnen",
      body: "Vandaag bellen kan morgen draaien betekenen. Geen ruis, geen tussenlagen.",
    },
    {
      title: "Fris maar ervaren",
      body: "De energie van een nieuw merk, de rust van honderden producties.",
    },
    {
      title: "Meedenken als partner",
      body: "We leveren geen bestelling af, we bouwen mee aan wat je wilt bereiken.",
    },
  ],
  cta: {
    title: "Benieuwd wat we voor je kunnen maken?",
    body: "Vertel kort wat er speelt. Je hoort binnen één werkdag van ons.",
    label: "Start jouw project",
  },
} as const;

export const contact = {
  eyebrow: "Sparren met of zonder koffie?",
  /**
   * Stond hier als "Laten we jouw visie tot leven brengen" — een zin die op
   * duizend bureausites staat en nergens iets belooft. Deze sluit aan op de
   * eyebrow erboven en klinkt als een mens.
   */
  title: "Laten we het erover hebben.",
  cta: "Start jouw project",
  lead: "Vertel kort wat je voor ogen hebt. Je krijgt binnen één werkdag antwoord. Geen offertemolen, gewoon een gesprek.",
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
  { label: "Disclaimer", href: "/disclaimer" },
] as const;
