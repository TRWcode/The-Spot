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
 * Reis naar een #sectie op dezelfde pagina.
 *
 * De lengte hangt aan de afstand, niet aan een vast getal. Eén vaste duur laat
 * het sprongetje van hero naar diensten opgerekt aanvoelen en de tocht naar
 * contact gehaast: de snelheid hoort constant te zijn en de duur mag vertellen
 * hoe ver je bent gegaan. `max` is er zodat een lange pagina nooit een wachtrij
 * wordt.
 */
export const ANCHOR = {
  /** Ondergrens, voor een doel dat al bijna in beeld staat. */
  base: 0.62,
  /** Erbij per schermhoogte die daadwerkelijk wordt overbrugd. */
  perScreen: 0.34,
  max: 1.5,
  /** Terug naar de top vanaf de footer is altijd de volle hoogte. */
  toTop: 1.4,
  /**
   * easeInOutCubic. Vertrekt en landt traag, dus het leest als aankomen in
   * plaats van stoppen. Bewust niet `power4.out`: die knalt weg bij de klik,
   * wat bij een reveal goed werkt maar bij scrollen als een sprong voelt.
   */
  ease: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
} as const;

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
