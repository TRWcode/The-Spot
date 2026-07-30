import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ContactDetails } from "@/components/sections/ContactDetails";
import { ContactForm } from "@/components/sections/ContactForm";
import { contactPage, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: contactPage.lead,
  alternates: { canonical: "/contact" },
};

/**
 * The contact page.
 *
 * Same form as the homepage section — one component, so the two can never
 * drift — but the page around it does a different job. On the homepage the
 * form is the last thing you scroll past; here it is the reason you came, so
 * the column beside it answers the question people actually hesitate over:
 * what happens after I press send.
 */
export default function ContactPage() {
  return (
    <article className="section-y pt-[128px]">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">{contactPage.eyebrow}</p>
          <h1 className="mt-4 max-w-[16ch] text-h1">{contactPage.title}</h1>
          <p className="lead mt-7 max-w-[52ch] text-ink-2">{contactPage.lead}</p>
        </Reveal>

        {/* Three blocks, explicitly placed. Stacked on a phone the DOM order is
            what you get — details, then the form, then the rest — so the thing
            the page exists for is not three screens down. On a wide screen the
            form moves into its own column beside both. */}
        <div className="mt-16 grid gap-14 lg:mt-20 lg:grid-cols-[1fr_1.05fr] lg:gap-x-20 lg:gap-y-16">
          <div className="lg:col-start-1 lg:row-start-1">
            <Reveal stagger y={18} className="flex flex-col gap-4">
              <ContactDetails />
            </Reveal>

            <Reveal delay={0.1}>
              <p className="mt-6 text-[15px] text-ink-2">{contactPage.studioNote}</p>
            </Reveal>
          </div>

          <Reveal y={24} delay={0.1} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <ContactForm />

            {/* The action refuses to send if the mail key is missing, and says
                so. This line means nobody has to discover that the hard way. */}
            <p className="mt-5 text-center text-[14px] text-ink-2">
              Liever direct mailen?{" "}
              <a href={`mailto:${site.email}`} className="underline underline-offset-4 hover:text-ink">
                {site.email}
              </a>
            </p>
          </Reveal>

          {/* Ordered, and marked up as such: these are three steps in time, not
              three features. */}
          <Reveal delay={0.15} className="lg:col-start-1 lg:row-start-2">
            <p className="eyebrow">Hoe het daarna gaat</p>
            <ol className="mt-6 flex flex-col gap-6">
              {contactPage.steps.map((step, i) => (
                <li key={step.title} className="flex gap-5">
                  <span className="contact-step__index" aria-hidden>
                    0{i + 1}
                  </span>
                  <span>
                    <span className="block font-display text-[17px] font-medium">{step.title}</span>
                    <span className="mt-1.5 block max-w-[42ch] text-[15px] text-ink-2">{step.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </article>
  );
}
