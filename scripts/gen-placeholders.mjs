/**
 * Generates duotone placeholder posters for the parts of the page that are
 * still waiting on real photography.
 *
 * TEMPORARY. Delete this script once the service stills are shot.
 * Run with: node scripts/gen-placeholders.mjs
 *
 * Deliberately restrained: near-black cool fields with one soft brand glow and
 * a faint S-mark watermark. No text is drawn (labels are real DOM), and no big
 * gradient fields — placeholders must not fake the finished look.
 *
 * Two things this script got wrong before and must not get wrong again:
 *
 *   - It listed `hero` and four case posters as targets. Those are real frames
 *     cut from real footage now, so running it would have overwritten them with
 *     placeholder gradients. Only genuinely placeholder images belong below.
 *   - It carried its own copy of the S-mark path data, from a redraw that no
 *     longer matches the logo. The geometry is read from the generated mark
 *     instead, so there is one source for the shape.
 */

import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";

const OUT = "public/media/posters";
const MARK_SVG = "public/brand/the-spot-mark.svg";

const mark = await readFile(MARK_SVG, "utf8");
const PATHS = [...mark.matchAll(/\sd="([^"]+)"/g)].map((m) => m[1]);
if (PATHS.length !== 3) {
  throw new Error(`Expected 3 paths in ${MARK_SVG}, found ${PATHS.length}. Re-run scripts/trace-mark.mjs.`);
}

/** name, width, height, hue seed. 4:3 — the ratio the service cards use. */
const TARGETS = [
  ["service-video", 1200, 900, 1],
  ["service-foto", 1200, 900, 2],
  ["service-social", 1200, 900, 3],
];

const GLOWS = ["#1AEBD8", "#15C6D8", "#0A78EC", "#056DE9"];

function poster(w, h, seed) {
  const glow = GLOWS[seed % GLOWS.length];
  const cx = 20 + ((seed * 27) % 60);
  const cy = 25 + ((seed * 19) % 50);
  const markSize = Math.min(w, h) * 0.42;
  const markX = w - markSize * (1.28 + (seed % 3) * 0.1);
  const markY = h - markSize * (1.22 + (seed % 2) * 0.12);
  const tilt = -12 + ((seed * 7) % 24);

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="base" x1="0" y1="0" x2="${w}" y2="${h}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B0F14"/>
      <stop offset="0.55" stop-color="#16212C"/>
      <stop offset="1" stop-color="#0E1720"/>
    </linearGradient>
    <radialGradient id="glow" cx="${cx}%" cy="${cy}%" r="62%">
      <stop offset="0" stop-color="${glow}" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="${glow}" stop-opacity="0.07"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#base)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <g transform="translate(${markX} ${markY}) rotate(${tilt}) scale(${markSize / 100})"
     fill="#FFFFFF" opacity="0.05">
${PATHS.map((d) => `    <path d="${d}"/>`).join("\n")}
  </g>
</svg>`);
}

await mkdir(OUT, { recursive: true });

for (const [name, w, h, seed] of TARGETS) {
  const file = `${OUT}/${name}.jpg`;
  await sharp(poster(w, h, seed)).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log(`${file}  ${w}x${h}`);
}
