import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: `De algemene voorwaarden van ${site.name}.`,
  robots: { index: true, follow: true },
};

/**
 * The client's own terms, vastgesteld 5 maart 2025, set in this site's type.
 *
 * This replaced a scaffold written here with placeholder numbers and a visible
 * "nog niet juridisch getoetst" banner. Nothing substantive is changed: the
 * articles, the periods and the amounts are exactly as supplied. The only edit
 * is the company name, which now names the brand and the registered entity
 * together — see `site.entity`.
 *
 * Terms only bind if they are supplied before the agreement is signed, so link
 * to this page from offertes rather than relying on it being findable.
 */
export default function Voorwaarden() {
  return (
    <LegalPage eyebrow="Juridisch" title="Algemene voorwaarden" updated="2025-03-05">
      <p>
        {site.name} is een handelsnaam van {site.entity.name}, gevestigd aan {site.address} en
        ingeschreven bij de Kamer van Koophandel onder nummer {site.entity.kvk}.
      </p>

      <h2>Artikel 1 — Definities</h2>
      <dl>
        <dt>Videoproductiebedrijf</dt>
        <dd>
          {site.entity.name}, handelend onder de naam {site.name}, gevestigd aan {site.address},
          geregistreerd onder KvK-nummer {site.entity.kvk}.
        </dd>
        <dt>Klant</dt>
        <dd>
          Iedere natuurlijke of rechtspersoon die gebruik maakt van de diensten van {site.name}.
        </dd>
        <dt>Opdracht</dt>
        <dd>Het verzoek van de klant om tegen betaling werkzaamheden te verrichten.</dd>
        <dt>Overeenkomst</dt>
        <dd>
          De rechtsgeldige verbintenis tussen de klant en {site.name} met betrekking tot de
          opdracht.
        </dd>
        <dt>Eindproduct</dt>
        <dd>Het definitieve resultaat zoals vooraf gedefinieerd in de overeenkomst.</dd>
      </dl>

      <h2>Artikel 2 — Toepasselijkheid</h2>
      <ul>
        <li>
          Door gebruik te maken van de diensten van {site.name} aanvaardt de klant deze algemene
          voorwaarden.
        </li>
        <li>
          Deze voorwaarden zijn van toepassing op alle rechtsverhoudingen tussen {site.name} en de
          klant.
        </li>
        <li>
          Afwijkingen van deze voorwaarden zijn uitsluitend geldig indien deze schriftelijk zijn
          overeengekomen.
        </li>
      </ul>

      <h2>Artikel 3 — Aanbod, offertes en tarieven</h2>
      <ul>
        <li>Offertes en prijsvoorstellen hebben een geldigheidsduur van 14 dagen, tenzij anders vermeld.</li>
        <li>Alle tarieven zijn exclusief btw en bijkomende kosten.</li>
        <li>Extra kosten kunnen in rekening worden gebracht voor aanvullende werkzaamheden.</li>
      </ul>

      <h2>Artikel 4 — Uitvoering van de opdracht</h2>
      <ul>
        <li>{site.name} zal de opdracht met de grootst mogelijke zorg uitvoeren.</li>
        <li>Weersomstandigheden en technische beperkingen kunnen invloed hebben op het eindresultaat.</li>
      </ul>

      <h2>Artikel 5 — Leveringsvoorwaarden</h2>
      <ul>
        <li>De standaard leveringstermijn bedraagt maximaal 4 weken, tenzij anders overeengekomen.</li>
        <li>De klant heeft recht op één feedbackronde binnen 5 werkdagen na levering.</li>
        <li>Extra feedbackrondes kunnen tegen meerprijs worden aangeboden.</li>
      </ul>

      <h2>Artikel 6 — Betalingsvoorwaarden</h2>
      <ul>
        <li>Facturen dienen binnen 14 dagen na factuurdatum te worden voldaan.</li>
        <li>Bij te late betaling wordt wettelijke rente vermeerderd met 2% in rekening gebracht.</li>
        <li>Alle incassokosten die voortvloeien uit te late betaling zijn voor rekening van de klant.</li>
      </ul>

      <h2>Artikel 7 — Auteursrecht en licenties</h2>
      <ul>
        <li>
          Het auteursrecht op alle gemaakte content blijft bij {site.name}, tenzij schriftelijk
          anders overeengekomen.
        </li>
        <li>
          De klant mag het geleverde materiaal niet zonder schriftelijke toestemming bewerken,
          doorverkopen of gebruiken voor andere doeleinden dan afgesproken.
        </li>
      </ul>

      <h2>Artikel 8 — Annulering en wijzigingen</h2>
      <ul>
        <li>Annuleringen dienen schriftelijk te worden gemeld.</li>
        <li>
          Bij annulering binnen 48 uur voor aanvang van de opdracht wordt het volledige bedrag in
          rekening gebracht.
        </li>
        <li>Wijzigingen in de opdracht kunnen gevolgen hebben voor de planning, levertijd en prijs.</li>
      </ul>

      <h2>Artikel 9 — Aansprakelijkheid</h2>
      <ul>
        <li>
          {site.name} is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde
          inkomsten.
        </li>
        <li>
          In geval van overmacht, waaronder ziekte, weersomstandigheden, technische storingen of
          andere onvoorziene omstandigheden, worden beide partijen ontslagen van hun verplichtingen.
        </li>
        <li>
          De aansprakelijkheid van {site.name} is in alle gevallen beperkt tot het factuurbedrag van
          de betreffende opdracht.
        </li>
      </ul>

      <h2>Vaststellingsdatum</h2>
      <p>Deze algemene voorwaarden zijn vastgesteld op 5 maart 2025 te Haarlem.</p>
    </LegalPage>
  );
}
