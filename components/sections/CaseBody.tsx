"use client";

import { MaskLines, Reveal } from "@/components/motion/Reveal";
import type { WorkItem } from "@/lib/content";

/**
 * Situatie / aanpak / resultaat.
 *
 * The old case page ran these as two dense columns of body copy. Here the
 * first two sit side by side with generous measure, and the result gets the
 * full width at display size — it is the part a prospect actually reads.
 */
export function CaseBody({ item }: { item: WorkItem }) {
  return (
    <>
      <div className="shell section-y-tight grid gap-14 md:grid-cols-2 md:gap-20">
        <Reveal>
          <p className="eyebrow">Situatie</p>
          <h2 className="mt-4 text-h3">De vraag</h2>
          <p className="lead mt-5 max-w-[46ch] text-ink-2">{item.situation}</p>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="eyebrow">Proces</p>
          <h2 className="mt-4 text-h3">De aanpak</h2>
          <p className="lead mt-5 max-w-[46ch] text-ink-2">{item.approach}</p>
        </Reveal>
      </div>

      <div className="border-t border-line bg-paper">
        <div className="shell section-y-tight">
          <Reveal>
            <p className="eyebrow">Impact</p>
          </Reveal>
          <MaskLines
            className="mt-5 max-w-[26ch] font-display text-h2 leading-[1.06] font-medium -tracking-[0.03em]"
            lines={[item.result]}
            delay={0.1}
          />
        </div>
      </div>
    </>
  );
}
