/**
 * UI line icons, drawn in the same language as the service marks: 24px box,
 * 1.6 stroke, round caps and joins, currentColor.
 *
 * Deliberately few. The brief calls for no icon soup, so these only appear
 * where they do real work — labelling the contact details you scan for.
 */

type Name = "mail" | "phone" | "pin";

const PATHS: Record<Name, React.ReactNode> = {
  mail: (
    <>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="3" />
      <path d="M3.5 8 L12 13.4 L20.5 8" />
    </>
  ),
  phone: (
    <path d="M8.4 3.5 H5.6a2 2 0 0 0-2 2.2c.5 5.3 4.3 9.7 9.5 10.9a2 2 0 0 0 2.3-1.6l.4-2.2-3.7-1.5-1.3 1.7a11 11 0 0 1-3.9-4.6l1.9-1z" />
  ),
  pin: (
    <>
      <path d="M12 21.3c3.9-4 6.2-7.2 6.2-10.2a6.2 6.2 0 1 0-12.4 0c0 3 2.3 6.2 6.2 10.2z" />
      <circle cx="12" cy="10.9" r="2.4" />
    </>
  ),
};

export function Icon({ name, className }: { name: Name; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}
