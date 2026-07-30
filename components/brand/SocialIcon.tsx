/**
 * Social glyphs and the Google mark.
 *
 * These are other people's trademarks, so they are drawn to their real
 * silhouettes rather than reinterpreted into our line style — a "branded"
 * LinkedIn that is not LinkedIn-shaped just reads as wrong. They inherit
 * currentColor so they sit quietly until hovered.
 */

type Social = "LinkedIn" | "Instagram" | "TikTok";

export function SocialIcon({ name, className }: { name: Social; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, "aria-hidden": true, focusable: "false" } as const;

  if (name === "Instagram") {
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="3" width="18" height="18" rx="5.2" />
        <circle cx="12" cy="12" r="4.1" />
        <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg {...common} fill="currentColor">
        <circle cx="5" cy="4.6" r="2.1" />
        <path d="M3.2 8.9h3.6V21H3.2z" />
        <path d="M9.3 8.9h3.45v1.65h.05c.5-.9 1.75-1.9 3.65-1.9 3.85 0 4.55 2.3 4.55 5.4V21h-3.6v-5.6c0-1.35-.03-3.1-1.95-3.1-1.95 0-2.25 1.45-2.25 3v5.7H9.3z" />
      </svg>
    );
  }

  // TikTok — the note with its hooked tail.
  return (
    <svg {...common} fill="currentColor">
      <path d="M16.6 2h-2.95v13.4a2.55 2.55 0 1 1-2.1-2.5V9.8a5.75 5.75 0 1 0 5.05 5.7V9.05A7.1 7.1 0 0 0 21 10.4V7.35a4.1 4.1 0 0 1-3.05-1.35A4.15 4.15 0 0 1 16.6 2z" />
    </svg>
  );
}

/** The Google G, in its four official colours. Used as a review provenance mark. */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v2.77h3.86c2.26-2.09 3.56-5.17 3.56-8.59z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
