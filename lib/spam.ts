/**
 * Content scoring for the contact form.
 *
 * The token in `lib/form-token.ts` raises the cost of sending; this raises the
 * cost of the message itself being junk. Neither is a wall, and that is on
 * purpose: a wall you cannot see through throws away the one real enquiry it
 * gets wrong, and a video production company notices a lost lead long before
 * it notices a spam mail.
 *
 * So this returns a score, not a yes or no. Three outcomes at the call site:
 *
 *   below TAG    send it, no trace
 *   TAG to BLOCK send it, with a marked subject so a mail rule can sort it
 *   BLOCK and up do not send, log why
 *
 * Every signal on its own is weak enough to be wrong about a real visitor.
 * Only a message tripping several at once gets stopped, and the weights are
 * set so that no single signal can reach BLOCK by itself.
 */

export type SpamReport = {
  score: number;
  /** Human-readable, and written into the mail when a message is tagged. */
  reasons: string[];
};

/** From here up, the subject is marked. */
export const TAG_SCORE = 3;
/** From here up, the message is not sent at all. */
export const BLOCK_SCORE = 6;

/**
 * The vocabulary of automated form spam: SEO services, gambling, crypto,
 * pharma. Kept clear of anything a real enquiry might use, which for this
 * client rules out the obvious ones. "content", "marketing", "social media"
 * and "video" are what the company actually sells, so they can never appear
 * here no matter how often spam uses them too.
 */
const SPAM_TERMS = [
  "seo",
  "serp",
  "backlinks?",
  "index(ing|er|ed)",
  "rankings?",
  "rank higher",
  "search engine",
  "keywords?",
  "link ?building",
  "guest post(s|ing)?",
  "domain authority",
  "web ?traffic",
  "organic traffic",
  "yandex",
  "crypto(currency)?",
  "bitcoin",
  "forex",
  "casino",
  "betting",
  "viagra",
  "escorts?",
  "make money",
  "passive income",
  "work from home",
  "loan offer",
];

const TERMS_RE = new RegExp(`\\b(?:${SPAM_TERMS.join("|")})\\b`, "gi");

/**
 * Common Dutch function words. A message to a Wormerveerse videomaker that
 * contains not one of these was almost certainly not written for this company
 * by a person. Function words only, because those are what a real sentence
 * cannot avoid and a spam template full of nouns will miss.
 *
 * Every word that English also uses is left out, and that turns out to matter
 * more than the list being long: "is", "was", "of", "we", "van", "met" and
 * "over" all read as Dutch to a regex, and between them they let good English
 * spam pass as a Dutch sentence. What is left is short and unambiguous.
 */
const DUTCH_RE =
  /\b(de|het|een|en|ik|wij|je|jij|jullie|zijn|heb|hebben|heeft|voor|aan|op|bij|naar|graag|hallo|hoi|goedemorgen|goedemiddag|goedendag|beste|groet|groeten|bedankt|dank|kunnen|kunt|kan|willen|wil|zou|zouden|mogen|mag|moet|gaan|doen|maken|zien|laten|komen|ons|onze|mijn|jouw|wat|hoe|waar|wanneer|waarom|niet|geen|ook|nog|wel|even|dus|maar|omdat|zodat|dit|dat|deze|er|ze|hij)\b/i;

/** Non-Latin writing systems: Cyrillic, CJK, Arabic, Hebrew, Thai. */
const FOREIGN_SCRIPT_RE = /[Ѐ-ӿ一-鿿぀-ヿ؀-ۿ֐-׿฀-๿]/;

/** Anything with a scheme or a www, plus bare domains on TLDs nobody local uses. */
const URL_RE =
  /(https?:\/\/\S+|www\.[a-z0-9-]+\.[a-z]{2,}|\b[a-z0-9-]+\.(?:com|net|org|ru|su|cn|xyz|top|shop|online|site|info|biz|club|icu|live|store|link|click)\b)/gi;

const MARKUP_RE = /(<a\s|<\/a>|\[url|\[link|\[\/url\])/i;

const EMAIL_IN_TEXT_RE = /[^\s@]+@[^\s@]+\.[a-z]{2,}/gi;

/**
 * Text that has been scraped, spun and reassembled loses its spacing at the
 * seams: "repair?This", "pages,and". A person typing in a textarea does this
 * once by accident, never three times.
 */
const GLUED_PUNCTUATION_RE = /[.!?,][A-Za-z]/g;

export function assessMessage(input: {
  name: string;
  email: string;
  message: string;
}): SpamReport {
  const reasons: string[] = [];
  let score = 0;

  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(reason);
  };

  const { message, email } = input;
  const haystack = `${input.name}\n${message}`;

  const terms = new Set((haystack.match(TERMS_RE) ?? []).map((t) => t.toLowerCase()));
  if (terms.size) {
    // Capped, so a message about one subject cannot be blocked on vocabulary
    // alone no matter how often it repeats itself.
    add(Math.min(terms.size * 1.5, 4.5), `spamwoorden (${[...terms].join(", ")})`);
  }

  if (FOREIGN_SCRIPT_RE.test(haystack)) {
    add(4, "niet-Latijns schrift");
  }

  if (MARKUP_RE.test(message)) {
    add(4, "opmaakcode in het bericht");
  }

  const links = message.match(URL_RE) ?? [];
  if (links.length === 1) add(1, "1 link");
  else if (links.length === 2) add(2.5, "2 links");
  else if (links.length > 2) add(4, `${links.length} links`);

  // URLs out of the way first: a link is full of the exact punctuation the
  // next check is looking for.
  const prose = message.replace(URL_RE, " ");

  if (message.trim().length > 40 && !DUTCH_RE.test(prose)) {
    add(2, "geen Nederlands");
  }

  if ((prose.match(GLUED_PUNCTUATION_RE) ?? []).length >= 3) {
    add(2, "ontbrekende spaties na leestekens");
  }

  const others = (message.match(EMAIL_IN_TEXT_RE) ?? []).filter(
    (found) => found.toLowerCase() !== email.toLowerCase(),
  );
  if (others.length) {
    add(1, "ander e-mailadres in het bericht");
  }

  return { score, reasons };
}
