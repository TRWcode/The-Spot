import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description: `Hoe ${site.name} omgaat met persoonsgegevens.`,
  robots: { index: true, follow: true },
};

/**
 * Written against what this site actually does, not from a generic template:
 * one contact form (Resend), YouTube embeds in nocookie mode, self-hosted
 * fonts, no analytics and no tracking cookies. If any of that changes, this
 * page has to change with it.
 *
 * TODO (Beer): vul de bedrijfsgegevens hieronder aan — KvK-nummer, en de
 * bewaartermijn die je zelf aanhoudt. De rest klopt met de techniek.
 */
export default function Privacy() {
  return (
    <LegalPage eyebrow="Juridisch" title="Privacyverklaring" updated="2026-07-29">
      <p>
        {site.name} verwerkt persoonsgegevens van bezoekers van deze website en van klanten. Deze
        verklaring legt uit welke gegevens dat zijn, waarom we ze verwerken en hoe lang we ze
        bewaren.
      </p>

      <h2>Wie is verantwoordelijk</h2>
      <p>
        {site.name}, {site.address}. Vragen over je gegevens kun je stellen via{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a> of {site.phone}.
      </p>
      <p className="legal-todo">Nog aan te vullen: KvK-nummer en btw-identificatienummer.</p>

      <h2>Het contactformulier</h2>
      <p>
        Als je het formulier invult, verwerken we je naam, e-mailadres, telefoonnummer (optioneel)
        en de inhoud van je bericht. Die gegevens gebruiken we alleen om je vraag te beantwoorden.
        De grondslag is je toestemming, en bij een lopende opdracht de uitvoering van de
        overeenkomst.
      </p>
      <p>
        De verzending loopt via Resend, een e-maildienst die als verwerker optreedt. Je bericht
        wordt daar verwerkt om het bij ons af te leveren. We slaan formulierinzendingen niet op in
        een database — ze komen binnen als e-mail en blijven in onze mailbox staan.
      </p>
      <p className="legal-todo">Nog aan te vullen: hoe lang je e-mail van aanvragen bewaart.</p>

      <h2>Cookies</h2>
      <p>
        Deze site plaatst zelf geen cookies en gebruikt geen analytics- of advertentiescripts. De
        lettertypen staan op onze eigen server, dus daarvoor gaat er niets naar een derde partij.
      </p>

      <h2>Video&apos;s van YouTube</h2>
      <p>
        De video&apos;s op de casepagina&apos;s staan op YouTube en zijn ingesloten via
        youtube-nocookie.com. Zolang je niet op afspelen klikt, wordt er geen verbinding met Google
        gemaakt en worden er geen cookies geplaatst. Druk je wel op afspelen, dan verwerkt Google
        gegevens volgens{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer noopener">
          het eigen privacybeleid van Google
        </a>
        .
      </p>

      <h2>Beeldmateriaal</h2>
      <p>
        Bij opnames leggen we mensen vast op beeld. Voor publicatie van herkenbaar beeld maken we
        vooraf afspraken met de opdrachtgever, en waar nodig vragen we toestemming aan de personen
        in beeld. Wil je dat een opname waarin jij herkenbaar bent van deze site verdwijnt, mail
        ons dan — dat regelen we.
      </p>

      <h2>Je rechten</h2>
      <p>
        Je hebt het recht om je gegevens in te zien, te laten corrigeren of te laten verwijderen, om
        bezwaar te maken tegen de verwerking en om je gegevens over te laten dragen. Stuur een
        bericht naar <a href={`mailto:${site.email}`}>{site.email}</a>; we reageren binnen vier
        weken. Kom je er met ons niet uit, dan kun je een klacht indienen bij de{" "}
        <a href="https://autoriteitpersoonsgegevens.nl" target="_blank" rel="noreferrer noopener">
          Autoriteit Persoonsgegevens
        </a>
        .
      </p>

      <h2>Beveiliging</h2>
      <p>
        De site draait volledig over HTTPS. Gegevens uit het formulier gaan versleuteld naar onze
        mailbox en worden niet met anderen gedeeld, behalve met de genoemde verwerker en wanneer we
        daartoe wettelijk verplicht zijn.
      </p>
    </LegalPage>
  );
}
