"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/app/actions/contact";
import { contact } from "@/lib/content";

const initial: ContactState = { ok: false, message: "" };

/**
 * The form itself, so the homepage section and /contact are the same form
 * rather than two that drift apart.
 *
 * It posts to a Server Action, so it submits and reports errors even with
 * JavaScript disabled — no fetch wiring, no client-side state machine. Errors
 * come back from the server with the typed values attached, so a rejected
 * submit never empties the fields.
 */
export function ContactForm({ className }: { className?: string }) {
  const [state, formAction, pending] = useActionState(sendContact, initial);
  const f = contact.form;
  const v = state.values ?? {};
  const err = state.errors ?? {};

  /** Ties an input to its error text so screen readers announce the reason. */
  const describedBy = (field: string) => (err[field] ? `${field}-error` : undefined);

  return (
    <form action={formAction} className={`form-card ${className ?? ""}`}>
      {/* Honeypot. Hidden from sight and from assistive tech, and taken out of
          the tab order, so only a bot ever fills it.

          Deliberately not named "company", "url" or anything else a browser
          maps to an autofill token: a field autofill recognises is a field it
          will fill for a real visitor, and that visitor's message then gets
          thrown away as spam. `.hp` is display:none for the same reason. */}
      <div className="hp" aria-hidden>
        <label htmlFor="onderwerp">Onderwerp</label>
        <input id="onderwerp" name="onderwerp" type="text" tabIndex={-1} autoComplete="off" />
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

      {/* Announced on change, so the outcome reaches screen readers without
          moving focus away from the form. */}
      <p
        aria-live="polite"
        className={`form-status ${state.message ? "is-shown" : ""} ${state.ok ? "is-ok" : "is-error"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
