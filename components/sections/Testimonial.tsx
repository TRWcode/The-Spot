"use client";

import { MaskLines, Reveal } from "@/components/motion/Reveal";
import { GoogleMark } from "@/components/brand/SocialIcon";
import { testimonial } from "@/lib/content";

/** One review, large and still. No card, no stars, no decoration. */
export function Testimonial() {
  return (
    <section className="section-y bg-paper">
      <div className="shell">
        <div className="grad-rule mb-16 max-w-[120px]" />

        <figure>
          <blockquote>
            <MaskLines
              className="max-w-[22ch] font-display text-h2 leading-[1.06] font-medium -tracking-[0.03em]"
              lines={[`“${testimonial.quote}”`]}
            />
          </blockquote>

          <Reveal as="figcaption" className="mt-10 flex flex-wrap items-center gap-4" delay={0.15}>
            <span className="font-display text-[17px] font-medium">{testimonial.name}</span>
            <span className="h-[1px] w-8 bg-line" aria-hidden />
            {/* The Google mark does the work the words alone could not: it is
                what makes the review read as verifiable rather than claimed. */}
            <span className="inline-flex items-center gap-2">
              <GoogleMark className="h-4 w-4" />
              <span className="eyebrow">{testimonial.source}</span>
            </span>
          </Reveal>
        </figure>
      </div>
    </section>
  );
}
