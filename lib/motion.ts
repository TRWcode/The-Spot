/**
 * One motion vocabulary for the whole site. Cinematic means slow and long:
 * if a value here starts feeling snappy, the page has drifted off-brief.
 */

export const EASE = "power3.out";
export const EASE_STRONG = "power4.out";

export const DUR = {
  /** Scroll-triggered reveals. */
  reveal: 0.9,
  /** Media scale-ins run slightly longer than text. */
  media: 1.1,
  /** Hover / state micro-interactions. */
  micro: 0.25,
} as const;

/** Line-by-line text reveal. */
export const STAGGER = 0.1;

/** ScrollTrigger default: fire once, a little before the element is centred. */
export const TRIGGER_START = "top 88%";

/**
 * Hero load timeline. Steps are scheduled at absolute times in Hero.tsx so the
 * total stays inside the 1.4–1.8s budget; the last element lands at ~1.85s.
 */
export const LOAD = {
  /** Spin + scale in at centre screen. */
  markSpin: 0.7,
  /** A beat before it travels, so the handoff reads as intent, not a stumble. */
  markHold: 0.12,
  /** Flight into the header slot. Lands at 1.54s. */
  markFly: 0.72,
} as const;
