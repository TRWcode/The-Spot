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
 * one contact form (Resend), rate limiting op IP in `lib/rate-limit.ts`,
 * hosting bij Vercel, YouTube embeds in nocookie mode achter een facade,
 * self-hosted fonts, no analytics and no tracking cookies. If any of that
 * changes, this page has to change with it.
 *
 * Deliberately kept over the generic statement supplied with the terms and the
 * disclaimer. That one announces the processing of "IP-adres, browserinformatie
 * en bezoekgedrag", which this site does not do — claiming to collect data you
 * do not collect is its own kind of inaccurate. The company details from it are
 * merged in below.
 */
export default function Privacy() {
  return (
    <LegalPage eyebrow="Juridisch" title="Privacyverklaring" updated="2026-08-03">
      <p>
        {site.name} verwerkt persoonsgegevens van bezoekers van deze website en van klanten. Deze
        verklaring legt uit welke gegevens dat zijn, waarom we ze verwerken en hoe lang we ze
        bewaren.
      </p>

      <h2>Wie is verantwoordelijk</h2>
      <p>
        {site.name} is gevestigd aan {site.address} en ingeschreven bij de Kamer van Koophandel
        onder nummer {site.kvk}. Vragen over je gegevens kun je stellen via <a href={`mailto:${site.email}`}>{site.email}</a> of{" "}
        <a href={`tel:${site.phoneHref}`}>{site.phone}</a>.
      </p>

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
        een database. Ze komen binnen als e-mail en blijven in onze mailbox staan.
      </p>

      <h2>Misbruik van het formulier tegengaan</h2>
      <p>
        Om te voorkomen dat het formulier wordt volgespamd, houdt de server kort bij hoeveel
        berichten er per bezoeker binnenkomen. Daarvoor gebruiken we je IP-adres en een
        onomkeerbare vingerafdruk van je e-mailadres en bericht, waarmee we een dubbele verzending
        herkennen zonder de inhoud te bewaren. Die gegevens staan alleen in het werkgeheugen van de
        server, verdwijnen binnen een uur vanzelf en komen niet in een database of een profiel
        terecht. De grondslag is ons gerechtvaardigd belang om de mailbox bruikbaar te houden.
      </p>

      <h2>Hosting</h2>
      <p>
        Deze site draait bij Vercel, dat daarbij als verwerker optreedt. Zoals elke webserver legt
        Vercel technische gegevens over opgevraagde pagina&apos;s vast, waaronder je IP-adres, om de
        site te kunnen leveren en storingen te kunnen onderzoeken.
      </p>

      <h2>Hoe lang we gegevens bewaren</h2>
      <p>
        We bewaren persoonsgegevens niet langer dan nodig is voor het doel waarvoor ze zijn
        verzameld, tenzij we wettelijk verplicht zijn ze langer te bewaren. Voor de administratie
        geldt bijvoorbeeld de fiscale bewaarplicht van zeven jaar. Een aanvraag die niet tot een
        opdracht leidt, verwijderen we uit onze mailbox zodra het contact is afgerond.
      </p>

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
        ons dan, dat regelen we.
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
