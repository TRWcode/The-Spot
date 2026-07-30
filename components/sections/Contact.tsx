"use client";

import { useActionState } from "react";
import { MaskLines, Reveal } from "@/components/motion/Reveal";
import { Icon } from "@/components/brand/Icon";
import { SocialIcon } from "@/components/brand/SocialIcon";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { contact, site } from "@/lib/content";

const initial: ContactState = { ok: false, message: "" };

/**
 * Contact section: headline and details on the left, form on the right.
 *
 * The form posts to a Server Action, so it submits and reports errors even
 * with JavaScript disabled — no fetch wiring, no client-side state machine.
 * Errors come back from the server with the typed values attached, so a
 * rejected submit never empties the fields.
 */
export function Contact() {
  const [state, formAction, pending] = useActionState(sendContact, initial);
  const f = contact.form;
  const v = state.values ?? {};
  const err = state.errors ?? {};

  /** Ties an input to its error text so screen readers announce the reason. */
  const describedBy = (field: string) => (err[field] ? `${field}-error` : undefined);

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

          {/* The icons replace the eyebrow labels rather than joining them —
              "E-MAIL" above an address that is visibly an address was saying
              the same thing twice. */}
          <Reveal stagger y={18} delay={0.2} className="mt-12 flex flex-col gap-4">
            <a href={`mailto:${site.email}`} className="contact-row">
              <Icon name="mail" className="contact-row__icon" />
              <span>{site.email}</span>
            </a>
            <a href={`tel:${site.phoneHref}`} className="contact-row">
              <Icon name="phone" className="contact-row__icon" />
              <span>{site.phone}</span>
            </a>
            <p className="contact-row is-static">
              <Icon name="pin" className="contact-row__icon" />
              <span>{site.address}</span>
            </p>

            <ul className="mt-3 flex gap-2.5">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="social-btn"
                    aria-label={`${s.label} (opent in nieuw tabblad)`}
                  >
                    <SocialIcon name={s.label} className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal y={24} delay={0.1}>
          <form action={formAction} className="form-card">
            {/* Honeypot. Hidden from sight and from assistive tech, and taken
                out of the tab order, so only a bot ever fills it. */}
            <div className="hp" aria-hidden>
              <label htmlFor="company">Bedrijf</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="field">
              <label htmlFor="name">{f.name}</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                maxLength={100}
                defaultValue={v.name}
                placeholder={f.namePlaceholder}
                aria-invalid={!!err.name}
                aria-describedby={describedBy("name")}
              />
              {err.name && (
                <p id="name-error" className="field-error">
                  {err.name}
                </p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="email">{f.email}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={200}
                  defaultValue={v.email}
                  placeholder={f.emailPlaceholder}
                  aria-invalid={!!err.email}
                  aria-describedby={describedBy("email")}
                />
                {err.email && (
                  <p id="email-error" className="field-error">
                    {err.email}
                  </p>
                )}
              </div>

              <div className="field">
                <label htmlFor="phone">
                  {f.phone} <span className="text-ink-2">({f.phoneOptional})</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                  defaultValue={v.phone}
                  placeholder={f.phonePlaceholder}
                  aria-invalid={!!err.phone}
                  aria-describedby={describedBy("phone")}
                />
                {err.phone && (
                  <p id="phone-error" className="field-error">
                    {err.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="field">
              <label htmlFor="message">{f.message}</label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                maxLength={4000}
                defaultValue={v.message}
                placeholder={f.messagePlaceholder}
                aria-invalid={!!err.message}
                aria-describedby={describedBy("message")}
              />
              {err.message && (
                <p id="message-error" className="field-error">
                  {err.message}
                </p>
              )}
            </div>

            <button type="submit" className="btn-grad w-full justify-center" disabled={pending}>
              {pending ? f.sending : f.submit}
              {!pending && <span aria-hidden>→</span>}
            </button>

            {/* Announced on change, so the outcome reaches screen readers
                without moving focus away from the form. */}
            <p
              aria-live="polite"
              className={`form-status ${state.message ? "is-shown" : ""} ${state.ok ? "is-ok" : "is-error"}`}
            >
              {state.message}
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
