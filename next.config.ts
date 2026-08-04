import type { NextConfig } from "next";

/**
 * Het oude domein wijst naar het nieuwe, pagina voor pagina.
 *
 * spotvideoproducties.nl draaide de vorige WordPress-site en staat nog vol in
 * Google. Het domein alleen maar naar de homepage sturen zou werken, maar dan
 * komt iedereen die nu op een case zoekt op de voorpagina uit en is de plek in
 * de zoekresultaten van die pagina weg. Daarom staat elke oude URL hieronder
 * met zijn nieuwe adres erbij.
 *
 * De paden verschillen echt: de cases stonden op de root (`/clok/`) en hangen
 * nu onder `/werk/`, en `/algemene-voorwaarden/` heet nu `/voorwaarden`.
 *
 * Voorwaarde is wel dat het oude domein in Vercel als gewoon domein aan dit
 * project hangt en niet als "redirect to". In dat tweede geval stuurt Vercel
 * het verkeer al aan de rand door en komt dit bestand nooit aan bod.
 *
 * De oude URL's eindigen allemaal op een slash, en die kost een extra sprong:
 * Next haalt de slash er zelf af vóórdat deze regels worden bekeken, dus
 * `/clok/` wordt eerst `/clok` op het oude domein en pas daarna het nieuwe
 * adres. Bewust zo gelaten. Het in één sprong doen kan alleen met middleware,
 * en dat draait dan op élke request van de live site — het hoofddomein
 * belasten om één hop te besparen op een domein dat we juist opheffen is de
 * verkeerde ruil. Zoekmachines volgen een ketting van twee moeiteloos.
 */
const NEW_ORIGIN = "https://www.thespotproducties.nl";

/** Matcht het oude domein met en zonder www, en niets anders. */
const OLD_HOST = "(www\\.)?spotvideoproducties\\.nl";

/** Oud pad -> nieuw pad. Alles wat hier niet in staat gaat naar de homepage. */
const MOVED: Record<string, string> = {
  "/": "/",
  "/portfolio": "/werk",
  "/cases": "/werk",
  "/over-ons": "/over-ons",
  "/contact": "/contact",
  "/privacy": "/privacy",
  "/algemene-voorwaarden": "/voorwaarden",
  "/disclaimer": "/disclaimer",
  "/kinderfysio-haarlem": "/werk/kinderfysio-haarlem",
  "/khione-cold-therapy": "/werk/khione-cold-therapy",
  "/de-groot-recreatie": "/werk/de-groot-recreatie",
  "/clok": "/werk/clok",
};

/**
 * Het Place ID van de Google-vermelding, te vinden met de Place ID Finder.
 *
 * Leeg laten kan: dan bestaat /review gewoon niet, en dat is beter dan een
 * kort adres dat mensen naar een kapot Google-scherm stuurt.
 */
const REVIEW_PLACE_ID = "";

const nextConfig: NextConfig = {
  async redirects() {
    const onOldHost = [{ type: "host" as const, value: OLD_HOST }];

    /**
     * Een adres dat je kunt opnoemen aan de telefoon.
     *
     * Reviews komen van mensen die net een oplevering achter de rug hebben,
     * niet van bezoekers van de site — die hebben nog nergens iets over te
     * schrijven. Daarom geen knop op een pagina maar een kort adres dat onder
     * een mail of in een appje past, en dat rechtstreeks het sterrenvenster
     * van Google opent in plaats van de kaart waar je het zelf nog moet zoeken.
     *
     * Tijdelijk, want zodra de vermelding geclaimd is geeft Google er een eigen
     * korte deel-link bij en verhuist de bestemming daarheen. Een permanente
     * redirect blijft in de browser van iedereen die hem één keer volgde
     * hangen, en dan wijst /review bij je vaste klanten voor altijd naar het
     * oude adres.
     */
    const review = REVIEW_PLACE_ID
      ? [
          {
            source: "/review",
            destination: `https://search.google.com/local/writereview?placeid=${REVIEW_PLACE_ID}`,
            permanent: false,
          },
        ]
      : [];

    const moved = Object.entries(MOVED).map(([from, to]) => ({
      source: from,
      has: onOldHost,
      destination: `${NEW_ORIGIN}${to}`,
      permanent: true,
    }));

    return [
      ...review,
      ...moved,
      {
        // Alles wat hierboven niet staat: oude blogposts, /wp-admin, /feed en
        // wat er verder nog aan WordPress-restanten geïndexeerd is. Dat mag de
        // homepage worden — een 404 op een domein dat je aan het opheffen bent
        // is precies de rare pagina die niemand hoort te zien.
        source: "/:path*",
        has: onOldHost,
        destination: NEW_ORIGIN,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
