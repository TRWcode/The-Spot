"use client";

import { Reveal } from "@/components/motion/Reveal";
import { HoverVideo } from "@/components/ui/HoverVideo";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { services } from "@/lib/content";
import { resolveVideo } from "@/lib/video";

/**
 * Three cards, kept deliberately quiet: white surfaces, hairline borders,
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
        </Reveal>

        <Reveal stagger className="mt-16 grid gap-6 md:grid-cols-3" y={28}>
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
                {/* The mark panel is shorter than the 4/3 video slot it stands
                    in for: a line mark needs less room than footage, and 4/3
                    left it adrift in white space. */}
                {posterOnly ? (
                  <div className="svc-panel" style={{ aspectRatio: "3 / 2" }}>
                    <ServiceIcon variant={s.icon} />
                  </div>
                ) : (
                  <HoverVideo
                    asset={{ poster: s.poster, clip }}
                    alt={s.title}
                    ratio="4 / 3"
                    sizes="(max-width: 768px) 100vw, 33vw"
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
