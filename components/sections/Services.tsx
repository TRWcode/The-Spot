"use client";

import { Reveal } from "@/components/motion/Reveal";
import { HoverVideo } from "@/components/ui/HoverVideo";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { services } from "@/lib/content";
import { resolveVideo } from "@/lib/video";

/**
 * Two cards, kept deliberately quiet: white surfaces, hairline borders,
 * no icon soup. The only gradient is the single accent inside each mark.
 *
 * While there is no service footage, the card leads with an animated line
 * mark rather than a fake dark poster — a placeholder image would just be
 * pretending. The moment real clips land, `resolveVideo` stops reporting
 * posterOnly and these switch to hover-to-play on their own.
 */
export function Services() {
  return (
    <section id="diensten" className="section-y">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{services.eyebrow}</p>
          <h2 className="mt-5 max-w-[18ch] text-h2">{services.title}</h2>
          <p className="lead mt-6 max-w-[46ch] text-ink-2">{services.lead}</p>
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-6 md:grid-cols-2" y={28}>
          {services.items.map((s) => {
            // Services carry no `clip` until real service footage exists, so
            // this resolves to poster-only and the animated mark is shown.
            const clip = "clip" in s ? (s.clip as string) : undefined;
            const { posterOnly } = resolveVideo({ poster: s.poster, clip });

            return (
              <article
                key={s.title}
                className="svc-card overflow-hidden rounded-card border border-line bg-paper"
              >
                {/* Two-up the cards are half the page wide, so the panel is
                    kept wide and shallow: at 3/2 a 132px line mark floated in
                    an empty field. Same reason the video slot is 16/9 here. */}
                {posterOnly ? (
                  <div className="svc-panel" style={{ aspectRatio: "16 / 9" }}>
                    <ServiceIcon variant={s.icon} />
                  </div>
                ) : (
                  <HoverVideo
                    asset={{ poster: s.poster, clip }}
                    alt={s.title}
                    ratio="16 / 9"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                )}

                <div className="p-6">
                  <h3 className="text-h3">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-2">{s.body}</p>
                </div>
              </article>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
