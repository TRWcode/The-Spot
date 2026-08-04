import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { GoogleMark } from "@/components/brand/SocialIcon";
import { reviewPage, testimonial } from "@/lib/content";

export const metadata: Metadata = {
  title: "Review",
  description: reviewPage.lead,
  // Deze pagina hoort niet in de zoekresultaten. Hij is er voor wie de link
  // krijgt doorgestuurd, niet voor wie op The SPOT zoekt — en een pagina die
  // om een gunst vraagt is het laatste wat je als eerste indruk wilt.
  robots: { index: false, follow: true },
};

/**
 * /review.
 *
 * Was eerst een kale redirect naar Google. Dat werkte, maar wie de link kreeg
 * sprong meteen van een bericht van Beer naar een schermvullende kaart van
 * Google en moest daar zelf uitvogelen wat de bedoeling was. Nu is er eerst
 * een pagina in dezelfde stijl als de rest, en die zegt in één zin waarom het
 * gevraagd wordt.
 *
 * Wat er níet staat is een formulier. Reviews horen op Google geschreven te
 * worden, ingelogd, anders zijn het geen reviews maar overgetypte citaten.
 */
export default function ReviewPage() {
  return (
    <article className="section-y pt-[128px]">
      <div className="shell">
        <div className="grad-rule mb-7 max-w-[96px] origin-left" />

        <Reveal>
          <p className="eyebrow">{reviewPage.eyebrow}</p>
          <h1 className="mt-4 max-w-[18ch] text-h1">{reviewPage.title}</h1>
          <p className="lead mt-7 max-w-[46ch] text-ink-2">{reviewPage.lead}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <a
            href={reviewPage.href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-grad mt-12"
          >
            {reviewPage.cta}
            <span aria-hidden>→</span>
          </a>
          <p className="mt-5 text-[14px] text-ink-2">{reviewPage.note}</p>
        </Reveal>

        {/* Twee dingen die het schrijven makkelijker maken: drie vragen om op
            te antwoorden, en één review die er al staat zodat zichtbaar is hoe
            kort het mag zijn. */}
        <div className="mt-20 grid gap-14 border-t border-line pt-12 md:grid-cols-2 md:gap-x-20">
          <Reveal stagger y={18}>
            <p className="eyebrow">Weet je niet wat je moet schrijven?</p>
            <ul className="mt-6 flex flex-col gap-4">
              {reviewPage.prompts.map((prompt) => (
                <li key={prompt} className="text-[17px] text-ink-2">
                  {prompt}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal y={24} delay={0.1}>
            <p className="eyebrow">Zo deed iemand het voor je</p>
            <figure className="mt-6">
              <blockquote className="font-display text-[21px] leading-[1.35] font-medium -tracking-[0.02em]">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-5 flex flex-wrap items-center gap-3">
                <span className="font-display text-[15px] font-medium">{testimonial.name}</span>
                <span className="h-[1px] w-6 bg-line" aria-hidden />
                <span className="inline-flex items-center gap-2">
                  <GoogleMark className="h-4 w-4" />
                  <span className="eyebrow">{testimonial.source}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
