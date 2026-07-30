"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { why } from "@/lib/content";

/**
 * The wel/niet switch.
 *
 * Two buttons rather than one toggle: a lone switch announces "off", which
 * tells a screen-reader user nothing about what is on screen. Here each
 * option carries its own label and pressed state.
 *
 * Cards keep a stable key across a flip, so only their text changes. Keying
 * them by mode would remount all six and restart the entrance every time the
 * switch is touched, which reads as twitchy rather than tight.
 */
export function Why() {
  const [on, setOn] = useState(true);
  const items = on ? why.with : why.without;

  return (
    <section id="waarom" className="section-y">
      <div className="shell">
        <Reveal className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow">{why.eyebrow}</p>

            <h2 className="mt-5 max-w-[20ch] text-h2">
              {why.titleLead}{" "}
              {/* The swapping word rides in a fixed-width slot so the rest of
                  the line never shifts when it changes. */}
              <span className="why-word" data-on={on}>
                <span className="why-word__on">{why.labels.with}</span>
                <span className="why-word__off">{why.labels.without}</span>
              </span>{" "}
              {why.titleTail}
            </h2>

            <div
              className="mt-8 inline-flex items-center gap-1 rounded-full border border-line bg-paper p-1"
              role="group"
              aria-label="Kies weergave"
            >
              <button type="button" onClick={() => setOn(true)} aria-pressed={on} className="why-seg" data-active={on}>
                Met The SPOT
              </button>
              <button
                type="button"
                onClick={() => setOn(false)}
                aria-pressed={!on}
                className="why-seg"
                data-active={!on}
              >
                Zonder
              </button>
            </div>
          </div>

          <p className="lead max-w-[36ch] lg:pb-2">{why.intro}</p>
        </Reveal>

        <Reveal className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger y={24}>
          {items.map((item, i) => (
            <article key={i} className="why-card" data-on={on}>
              {/* Only this inner block is keyed by mode. The card itself stays
                  mounted so Reveal owns its entrance, while the content
                  remounts and replays the swap on every toggle — the two
                  animations never touch the same element. */}
              <div key={on ? "on" : "off"} className="why-card__swap" style={{ animationDelay: `${i * 45}ms` }}>
                <span className="why-dot" aria-hidden />
                <h3 className="mt-5 text-[19px] font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{item.body}</p>
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
