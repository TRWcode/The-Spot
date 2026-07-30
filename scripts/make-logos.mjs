/**
 * Turns raw client logos into the marquee row.
 *
 *   1. drop files in  assets-inbox/logos/   (SVG best, else PNG with alpha)
 *   2. node scripts/make-logos.mjs
 *   3. done — Trust.tsx picks them up from lib/logos.ts
 *
 * The filename becomes the name, so `make-a-wish.svg` reads as "Make A Wish".
 * Rename the file, not the code.
 *
 * Name a file after a case slug (`clok.webp`, `khione-cold-therapy.webp`) and
 * two things happen: that case page shows the logo, and the marquee takes the
 * label from the case's own `client` field instead of title-casing the
 * filename — which is what keeps "CLOK" from rendering as "Clok".
 *
 * Two things this does that a plain copy would not:
 *
 * Trimming. Logo exports carry wildly different amounts of built-in padding,
 * and a row of untrimmed files looks like a row of randomly sized logos. Every
 * file is measured on its own ink and normalised from there.
 *
 * Optical sizing. Logos are matched on **area**, not on height. CLOK is a
 * stacked mark at 300x231 and De Groot is a wordmark at 579x139; giving them
 * the same height left CLOK 44px wide beside a 150px neighbour, reading as a
 * much smaller brand. Equal area is what "same size" means to the eye when the
 * shapes differ this much, so a stacked logo ends up taller and narrower —
 * which is exactly how a designer would set the row by hand.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IN = path.join(ROOT, "assets-inbox/logos");
const OUT = path.join(ROOT, "public/logos");

/**
 * Case slugs and client names, read straight out of lib/content.ts.
 * A regex rather than an import because content.ts is TypeScript and this
 * script runs on bare node — and this only needs two fields out of it.
 */
function knownCases() {
  const src = fs.readFileSync(path.join(ROOT, "lib/content.ts"), "utf8");
  const map = new Map();
  for (const m of src.matchAll(/slug:\s*"([^"]+)"[\s\S]{0,400}?client:\s*"([^"]+)"/g)) {
    map.set(m[1], m[2]);
  }
  return map;
}

const CASES = knownCases();

/**
 * Rendered size budget in CSS px. The raster output is written at 3x these.
 *
 * TARGET_AREA is tuned so a typical 3:1 wordmark lands around 30px tall. The
 * clamps stop the extremes running away: a very tall mark cannot dominate the
 * row, and a very wide one cannot push the others off it.
 */
const TARGET_AREA = 2700;
const MIN_H = 22;
const MAX_H = 42;
const MAX_W = 150;
const DPR = 3;

/**
 * The order the marquee runs in. Anything not listed follows, alphabetically.
 *
 * Worth being explicit about what this can and cannot do: the track scrolls at
 * a constant speed, so every logo is on screen for the same number of seconds.
 * What the order decides is which logos are already visible when the page
 * loads, and how long those take to leave. An item near the front of the list
 * is under the mask's fade and exits almost immediately; one around the fourth
 * or fifth slot sits in the clear middle of the first screen and is the last of
 * the initial set to go.
 *
 * VVD is placed there on request, and given extra size below.
 */
const ORDER = [
  "staatsbosbeheer",
  "talpa-studios",
  "make-a-wish",
  "vvd",
  "clok",
  "kinderfysio-haarlem",
  "khione-cold-therapy",
  "de-groot-recreatie",
  "spaarnelanden",
  "maverick",
  "brand-whispers",
  "gewoon-pleun",
  "fysiotherapie-van-ham",
  "luxe-sloepen-haarlem",
  "hygge-haarlem",
];

/**
 * Per-logo size multiplier, for when equal optical area is not what is wanted.
 *
 * VVD's mark is square, so the MAX_H clamp bites before the area target does
 * and it came out at 42x42 — an area of 1764 where a wordmark neighbour gets
 * 3750. Equal-area sizing is right by default and wrong here: the clamp exists
 * to stop a tall logo dominating, not to shrink one below everything else.
 */
const WEIGHT = { vvd: 1.3 };

/** Filenames title-case badly. These are the names as their owners write them. */
const NAME_OVERRIDES = {
  vvd: "VVD",
  "make-a-wish": "Make-A-Wish",
  maverick: "Maverick Marketing & Events",
  "fysiotherapie-van-ham": "Fysiotherapie van Ham",
};

/**
 * What share of a logo's solid ink is actually dark.
 *
 * Some of these arrived as white-on-transparent exports meant for a dark site.
 * On this marquee — light background, grayscale, half opacity — they are
 * invisible, and a client's logo silently missing from the wall of clients is
 * about the worst failure this section has. Measuring rather than keeping a
 * hand-written list means the next white export is caught too.
 *
 * The question is not "is this logo bright" — plenty of legible logos are
 * mostly pale. Gewoon Pleun is dark type inside a white box, Talpa is black
 * dots on a near-white plate, and both average light. What matters is whether
 * *any* of it is dark, so this counts rather than averages. Measured across the
 * fifteen logos here the split is absolute: the two white exports contain 0.0%
 * dark pixels and every other file at least 7%.
 *
 * Solid pixels only — antialiased edges are light by definition.
 */
async function darkInkShare(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .resize(120, 120, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let ink = 0;
  let dark = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i + 3] < 200) continue; // transparent padding and soft edges are not ink
    ink++;
    if (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2] < 128) dark++;
  }
  return ink ? dark / ink : 1;
}

/** Below this share of dark ink, a logo would disappear into a white page. */
const LIGHT_INK_SHARE = 0.02;

const titleFromFile = (file) =>
  path
    .basename(file, path.extname(file))
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Canva and Illustrator both bake provenance blobs into their SVG exports —
 * hundreds of KB of base64 that never draws a pixel.
 */
function cleanSvg(svg) {
  return svg
    .replace(/<metadata>[\s\S]*?<\/metadata>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+$/, "");
}

/** width/height attrs are unreliable in exports; the viewBox is the truth. */
function svgAspect(svg) {
  const vb = svg.match(/viewBox="([\d.\-\s,]+)"/);
  if (vb) {
    const [, , w, h] = vb[1].trim().split(/[\s,]+/).map(Number);
    if (w > 0 && h > 0) return w / h;
  }
  const w = Number(svg.match(/\bwidth="([\d.]+)/)?.[1]);
  const h = Number(svg.match(/\bheight="([\d.]+)/)?.[1]);
  return w > 0 && h > 0 ? w / h : 1;
}

const fit = (w, h, weight = 1) => {
  // Equal area first, then pull back inside the clamps — whichever bites first.
  let scale = Math.sqrt((TARGET_AREA * weight) / (w * h));
  scale = Math.min(scale, (MAX_H * weight) / h, (MAX_W * weight) / w);
  scale = Math.max(scale, MIN_H / h);
  return { w: Math.round(w * scale), h: Math.round(h * scale) };
};

fs.mkdirSync(IN, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const files = fs
  .readdirSync(IN)
  .filter((f) => /\.(svg|png|jpe?g|webp|avif)$/i.test(f))
  .sort();

const entries = [];
const warnings = [];

for (const file of files) {
  const src = path.join(IN, file);
  const slug = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  // A matching case knows the client's real name; the filename only guesses it.
  const name = NAME_OVERRIDES[slug] ?? CASES.get(slug) ?? titleFromFile(file);
  const caseSlug = CASES.has(slug) ? slug : null;
  const weight = WEIGHT[slug] ?? 1;

  if (/\.svg$/i.test(file)) {
    const raw = fs.readFileSync(src, "utf8");
    if (/xlink:href="data:image\//.test(raw)) {
      // An SVG wrapping a bitmap is a bitmap. Saying so is more useful than
      // silently shipping a 500KB "vector" that blurs on a retina screen.
      warnings.push(`${file}: SVG contains an embedded bitmap — ask for a real vector export`);
    }
    const svg = cleanSvg(raw);
    const out = path.join(OUT, `${slug}.svg`);
    fs.writeFileSync(out, svg);
    const { w, h } = fit(svgAspect(svg), 1, weight);
    entries.push({ name, caseSlug, src: `/logos/${slug}.svg`, w, h });
    console.log(`+ ${name.padEnd(24)} svg  ${(svg.length / 1024).toFixed(1)}KB${caseSlug ? "  -> case" : ""}`);
    continue;
  }

  // trim() crops to the ink, so built-in padding stops deciding the size. It
  // has to be resolved to a buffer first: metadata() reports the *input*
  // image, so measuring the pipeline would size the logo by its padding.
  const trimmed = await sharp(src).ensureAlpha().trim({ threshold: 12 }).toBuffer({ resolveWithObject: true });
  const { w, h } = fit(trimmed.info.width, trimmed.info.height, weight);

  /**
   * A white export is flipped to ink. `negate` with alpha untouched inverts
   * the colour and leaves the cut-out intact, so a white wordmark becomes a
   * black one of exactly the same shape. It is not the brand's own dark
   * version — a proper one should replace it — but it is legible, and the row
   * is grayscaled at rest anyway.
   */
  const light = (await darkInkShare(src)) < LIGHT_INK_SHARE;
  if (light) warnings.push(`${file}: lichte variant, omgekeerd naar donker — vraag om de donkere export`);

  const pipeline = sharp(trimmed.data).resize(w * DPR, h * DPR, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  const out = path.join(OUT, `${slug}.webp`);
  await (light ? pipeline.negate({ alpha: false }) : pipeline).webp({ quality: 92, effort: 6 }).toFile(out);

  entries.push({ name, caseSlug, src: `/logos/${slug}.webp`, w, h });
  console.log(
    `+ ${name.padEnd(28)} ${path.extname(file).slice(1).padEnd(4)} ${String(w).padStart(3)}x${String(h).padEnd(3)}` +
      `${caseSlug ? "  -> case" : ""}${light ? "  (omgekeerd)" : ""}`,
  );
}

/**
 * Sorted into the intended run order before it is written, so the marquee's
 * sequence is a decision in this file rather than an accident of how the
 * filesystem happened to list the directory.
 */
entries.sort((a, b) => {
  const rank = (e) => {
    const i = ORDER.indexOf(path.basename(e.src).replace(/\.(webp|svg)$/, ""));
    return i === -1 ? ORDER.length : i;
  };
  return rank(a) - rank(b) || a.name.localeCompare(b.name);
});

const manifest = `/**
 * Generated by scripts/make-logos.mjs — do not hand-edit.
 *
 * Drop client logos in assets-inbox/logos/ and re-run the script. An empty list
 * is a valid state: Trust.tsx falls back to the text wordmarks, so the section
 * never breaks while logos are still being collected.
 *
 * \`w\`/\`h\` are CSS pixels, already optically normalised — they exist so the row
 * reserves its space before the images decode.
 *
 * \`caseSlug\` is set when the filename matched a case in lib/content, which is
 * what lets the case page show its own client's logo.
 */

export type ClientLogo = {
  name: string;
  caseSlug: string | null;
  src: string;
  w: number;
  h: number;
};

/** The logo belonging to a case, if one was supplied. */
export function logoForCase(slug: string): ClientLogo | undefined {
  return clientLogos.find((l) => l.caseSlug === slug);
}

export const clientLogos: ClientLogo[] = ${JSON.stringify(entries, null, 2)};
`;

fs.writeFileSync(path.join(ROOT, "lib/logos.ts"), manifest);

if (!files.length) {
  console.log(`Geen logo's gevonden in assets-inbox/logos/ — de tekstversie blijft staan.`);
}
for (const w of warnings) console.log(`! ${w}`);
console.log(`\n${entries.length} logo(s) -> public/logos/ + lib/logos.ts`);
