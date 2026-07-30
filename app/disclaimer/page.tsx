import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: `De disclaimer van ${site.name}.`,
  robots: { index: true, follow: true },
};

/**
 * The client's own disclaimer, vastgesteld 5 maart 2025.
 *
 * Supplied alongside the terms and the privacy statement; only the company
 * name and the contact details are brought in line with the rest of this site
 * — the address and KvK number are the same, the e-mail is not. See the note
 * in lib/content.
 */
export default function Disclaimer() {
  return (
    <LegalPage eyebrow="Juridisch" title="Disclaimer" updated="2025-03-05">
      <h2>1. Algemeen</h2>
      <p>
        Deze website wordt beheerd door {site.name}, handelsnaam van {site.entity.name}, gevestigd
        aan {site.address}. Door deze website te gebruiken, stemt u in met deze disclaimer.
      </p>

      <h2>2. Intellectuele eigendomsrechten</h2>
      <p>
        Alle inhoud op deze website, inclusief maar niet beperkt tot teksten, afbeeldingen,
        video&apos;s, logo&apos;s en ontwerpen, is eigendom van {site.name} of wordt met toestemming
        gebruikt. Het is niet toegestaan om zonder voorafgaande schriftelijke toestemming van{" "}
        {site.name} materiaal van deze website te kopiëren, verspreiden, reproduceren of op andere
        wijze te gebruiken.
      </p>

      <h2>3. Aansprakelijkheid</h2>
      <p>
        Wij streven ernaar om de informatie op deze website zo actueel en correct mogelijk te
        houden. Desondanks kunnen er onjuistheden of onvolledigheden voorkomen. {site.name}{" "}
        aanvaardt geen enkele aansprakelijkheid voor schade die voortvloeit uit het gebruik van deze
        website of de daarop verstrekte informatie.
      </p>

      <h2>4. Externe links</h2>
      <p>
        Deze website kan links bevatten naar externe websites die door derden worden beheerd.{" "}
        {site.name} heeft geen controle over de inhoud of beschikbaarheid van deze websites en is
        niet verantwoordelijk of aansprakelijk voor enige schade of verlies veroorzaakt door het
        gebruik van deze externe links.
      </p>

      <h2>5. Wijzigingen</h2>
      <p>
        {site.name} behoudt zich het recht voor om deze disclaimer op elk moment te wijzigen. Wij
        raden u aan deze pagina regelmatig te raadplegen voor de meest actuele versie.
      </p>

      <h2>6. Contact</h2>
      <p>
        Voor vragen over deze disclaimer kunt u contact met ons opnemen:
        <br />
        {site.entity.name}
        <br />
        E-mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        <br />
        Adres: {site.address}
        <br />
        Telefoon: <a href={`tel:${site.phoneHref}`}>{site.phone}</a>
        <br />
        KvK-nummer: {site.entity.kvk}
      </p>
    </LegalPage>
  );
}
