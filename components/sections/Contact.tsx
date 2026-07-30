"use client";

import { MaskLines, Reveal } from "@/components/motion/Reveal";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { ContactForm } from "@/components/sections/ContactForm";
import { contact } from "@/lib/content";

/**
 * Contact section: headline and details on the left, form on the right.
 *
 * The form and the details block live in their own files because /contact
 * shows the same two things — one implementation, two placements, so a change
 * to the form can never land on only one of them.
 */
export function Contact() {
  return (
    <section id="contact" className="section-y">
      <div className="shell grid gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <p className="eyebrow">{contact.eyebrow}</p>
          </Reveal>

          <MaskLines
            className="mt-6 max-w-[14ch] font-display text-h2 leading-[1.02] font-semibold -tracking-[0.03em]"
            lines={["Laten we jouw", "visie tot leven", "brengen."]}
            delay={0.1}
          />

          <Reveal className="mt-7" delay={0.15}>
            <p className="lead max-w-[42ch]">{contact.lead}</p>
          </Reveal>

          <Reveal stagger y={18} delay={0.2} className="mt-12 flex flex-col gap-4">
            <ContactDetails />
          </Reveal>
        </div>

        <Reveal y={24} delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}
