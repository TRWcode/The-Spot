import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Algemene voorwaarden",
  description: `De algemene voorwaarden van ${site.name}.`,
  robots: { index: true, follow: true },
};

/**
 * A working scaffold, not finished legal advice.
 *
 * The clauses below are the ones a video production actually needs — usage
 * rights, revision rounds, cancellation, footage retention — but the numbers in
 * them are placeholders, and terms are only binding if they are supplied before
 * the agreement is signed.
 *
 * TODO (Beer): laat deze tekst nakijken en vul de gemarkeerde bedragen en
 * termijnen in. Zolang dat niet gebeurd is, verwijs in offertes niet naar deze
 * pagina.
 */
export default function Voorwaarden() {
  return (
    <LegalPage eyebrow="Juridisch" title="Algemene voorwaarden" updated="2026-07-29">
      <p className="legal-todo">
        Deze voorwaarden staan klaar als concept. Ze zijn nog niet juridisch getoetst en de
        gemarkeerde bedragen en termijnen moeten nog ingevuld worden.
      </p>

      <h2>1. Wie we zijn</h2>
      <p>
        Deze voorwaarden gelden voor alle offertes, opdrachten en leveringen van {site.name},
        gevestigd aan {site.address}.
      </p>

      <h2>2. Offertes</h2>
      <p>
        Een offerte is vrijblijvend en dertig dagen geldig. Prijzen zijn exclusief btw. Wat niet in
        de offerte staat, valt niet binnen de opdracht — meerwerk stemmen we vooraf af en
        offreren we apart.
      </p>

      <h2>3. Planning en medewerking</h2>
      <p>
        Opnamedata leggen we samen vast. Voor het draaien hebben we toegang tot de locatie,
        contactpersonen en eventueel benodigde toestemmingen nodig; loopt dat vertraging op, dan
        schuift de oplevering mee. Een opnamedag die binnen{" "}
        <span className="legal-todo-inline">[termijn]</span> voor aanvang wordt afgezegd, brengen we
        voor <span className="legal-todo-inline">[percentage]</span> in rekening, omdat de dag dan
        niet meer opnieuw is in te plannen.
      </p>

      <h2>4. Montage en feedbackrondes</h2>
      <p>
        Bij de opdracht horen twee feedbackrondes op de montage. Feedback verzamelt de
        opdrachtgever en levert die in één keer aan. Verdere rondes en wijzigingen die het concept
        raken, rekenen we af op nacalculatie tegen{" "}
        <span className="legal-todo-inline">[uurtarief]</span> per uur.
      </p>

      <h2>5. Oplevering en goedkeuring</h2>
      <p>
        We leveren digitaal op, in de formaten die in de offerte staan. Als er binnen veertien dagen
        na oplevering geen reactie is, geldt het werk als goedgekeurd.
      </p>

      <h2>6. Gebruiksrecht</h2>
      <p>
        Na volledige betaling krijgt de opdrachtgever het recht om het opgeleverde materiaal
        onbeperkt in tijd te gebruiken voor de doelen die in de offerte staan. Gebruik daarbuiten —
        bijvoorbeeld betaalde advertenties of doorverkoop aan derden — spreken we apart af.
      </p>

      <h2>7. Auteursrecht en portfolio</h2>
      <p>
        Het auteursrecht op het werk blijft bij {site.name}. We mogen het opgeleverde werk tonen in
        ons portfolio en op onze socials, tenzij vooraf schriftelijk anders is afgesproken.
      </p>

      <h2>8. Ruwe beelden</h2>
      <p>
        Ruw en ongebruikt materiaal maakt geen deel uit van de levering. We bewaren het{" "}
        <span className="legal-todo-inline">[bewaartermijn]</span> na oplevering; daarna kan het
        worden gewist. Wil je het ruwe materiaal in handen krijgen, dan is dat een aparte afspraak.
      </p>

      <h2>9. Betaling</h2>
      <p>
        Betaling binnen veertien dagen na factuurdatum. Bij opdrachten boven{" "}
        <span className="legal-todo-inline">[bedrag]</span> factureren we een aanbetaling van{" "}
        <span className="legal-todo-inline">[percentage]</span> voor aanvang. Bij te late betaling
        zijn de wettelijke handelsrente en incassokosten verschuldigd.
      </p>

      <h2>10. Aansprakelijkheid</h2>
      <p>
        Onze aansprakelijkheid is beperkt tot het factuurbedrag van de betreffende opdracht.
        Gevolgschade, gemiste omzet en gemiste besparingen vallen daarbuiten. Deze beperking geldt
        niet bij opzet of bewuste roekeloosheid.
      </p>

      <h2>11. Overmacht</h2>
      <p>
        Bij ziekte, weer dat opnames onmogelijk maakt of uitval van apparatuur zoeken we samen een
        nieuwe datum. Kan de opdracht daardoor helemaal niet doorgaan, dan rekenen we alleen af wat
        er tot dat moment daadwerkelijk is gedaan.
      </p>

      <h2>12. Toepasselijk recht</h2>
      <p>
        Op alle opdrachten is Nederlands recht van toepassing. Geschillen leggen we voor aan de
        bevoegde rechter in het arrondissement waar {site.name} is gevestigd.
      </p>

      <h2>Vragen</h2>
      <p>
        Iets onduidelijk? Mail <a href={`mailto:${site.email}`}>{site.email}</a> of bel {site.phone}.
      </p>
    </LegalPage>
  );
}
