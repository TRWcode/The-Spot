import { SMark } from "@/components/brand/SMark";

/**
 * Lockup: mark + "The SPOT". Weight contrast matches the supplied logo — "The"
 * light, "SPOT" bold.
 *
 * The mark is set larger than the cap height on purpose. In the delivered
 * lockup it overhangs the wordmark at both ends, and matching it to the type
 * left the icon reading as a bullet point rather than as the logo.
 */
export function Wordmark({
  className,
  markClassName,
  textClassName,
  showMark = true,
  handoff = false,
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showMark?: boolean;
  /**
   * Marks this instance as the landing slot for the hero's flying mark. Exactly
   * one lockup per page may set it — the flight looks up a single element, and
   * the footer carrying the same attribute would let it win the query on any
   * page that renders no header.
   */
  handoff?: boolean;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      {showMark && (
        <span data-header-mark={handoff || undefined} className={`block ${markClassName ?? "h-10 w-10"}`}>
          <SMark className="h-full w-full" />
        </span>
      )}
      <span className={`font-display leading-none tracking-[-0.02em] ${textClassName ?? "text-[19px]"}`}>
        <span className="font-normal">The</span>
        <span className="font-bold"> SPOT</span>
      </span>
    </span>
  );
}
