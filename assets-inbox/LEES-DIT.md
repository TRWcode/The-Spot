# Assets inbox

Dump hier alles in, **precies zoals je het hebt**. Namen, formaten en groottes
maken niet uit — ik hernoem, snij bij, comprimeer en koppel het aan de juiste
plek in de site.

```
assets-inbox/
  logos/     klantlogo's (Staatsbosbeheer, Talpa, Make-A-Wish, VVD, Khione, SBB, …)
  posters/   stills / poster frames per case + één voor de hero
  video/     showreel + clips per case
```

Deze map wordt **niet** meegecommit (staat in `.gitignore`) — het zijn de ruwe
originelen. De verwerkte, geoptimaliseerde versies belanden in `public/`.

## Handig om te weten

**Klantlogo's** — dit is de map die je zoekt:

```
assets-inbox/logos/
```

Gooi ze daar neer en draai daarna één commando:

```bash
node scripts/make-logos.mjs
```

Dat snijdt de witruimte eraf, zet ze allemaal op dezelfde optische grootte en
zet ze in de balk onder de hero. Zolang die map leeg is, blijven de namen als
tekst staan — de site breekt er niet van.

Twee dingen die helpen:

- **De bestandsnaam wordt de naam op de site.** `make-a-wish.svg` wordt
  "Make A Wish". Hernoem het bestand, niet de code.
- **SVG is het beste**, anders PNG met transparante achtergrond en minimaal
  400px breed. Ze worden grijs getoond en kleuren in bij hover, dus een
  enkelkleurige versie werkt beter dan een variant met verlopen. Let op: een
  SVG uit Canva is vaak een verkapte bitmap — het script zegt het als dat zo
  is, vraag dan om een echte vectorversie.

**Posters** — liever te groot dan te klein; ik schaal terug. Deze beeldverhoudingen
gebruikt de bento-grid nu, maar zeg het als je materiaal anders uitkomt, dan pas
ik de grid aan in plaats van jouw beeld bij te snijden:

| Case | Verhouding |
| --- | --- |
| Hero | 21:9 (breed, filmisch) |
| Kinderfysio Haarlem · EventSummit | 16:9 |
| Khione · Zomerbries | 5:4 |
| Staatsbosbeheer | 21:9 (volle breedte) |
| Diensten (3×) | 4:3 |

**Video** — twee soorten:

1. Eén **hero-loop** van 6–10 seconden, zonder geluid. Dit is de sfeerloop achter
   de hero, niet de hele film.
2. De **volledige showreel** (met geluid, opent in de lightbox) en per case een
   korte clip voor de hover-preview.

MP4/H.264 of je master-export is prima. Grote bestanden zijn geen probleem —
zodra er een Mux- of Cloudflare-account is verhuist dit naar adaptive streaming
en hoeft er in de code niets te veranderen behalve `lib/video.ts`.

## Geen compleet materiaal?

Stuur wat er is. Alles waar nog niets voor is blijft gewoon op de placeholder
staan; de site breekt daar niet van.
