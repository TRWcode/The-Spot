/**
 * Social share image.
 *
 * The metadata pointed at /media/posters/hero.jpg and declared it 1920x1080;
 * the file is 1920x822. Facebook, LinkedIn and Slack all re-crop to 1.91:1
 * themselves, so the declared size being wrong meant every preview cropped
 * somewhere other than where it was framed.
 *
 * This builds the real thing at 1200x630: the hero frame, the same ink scrim
 * the hero uses so the mark stays legible over any frame, and the logo bottom
 * left. No headline baked in — every platform prints the <title> next to the
 * image already, and text in the image is the first thing they crop off.
 *
 * Run: node scripts/make-og.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const W = 1200;
const H = 630;

const frame = await sharp(path.join(ROOT, "public/media/posters/hero.jpg"))
  .resize(W, H, { fit: "cover", position: "attention" })
  .toBuffer();

// Matches .hero-scrim: heavy on the left where the mark sits, clear on the
// right so the footage still reads as footage.
const scrim = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0B0F14" stop-opacity="0.72"/>
      <stop offset="0.45" stop-color="#0B0F14" stop-opacity="0.34"/>
      <stop offset="0.85" stop-color="#0B0F14" stop-opacity="0.06"/>
    </linearGradient>
    <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.4" stop-color="#0B0F14" stop-opacity="0"/>
      <stop offset="1" stop-color="#0B0F14" stop-opacity="0.58"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#h)"/>
  <rect width="${W}" height="${H}" fill="url(#v)"/>
</svg>`);

const MARK = 132;
const mark = await sharp(path.join(ROOT, "public/brand/the-spot-mark.svg"))
  .resize(MARK, MARK, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

const out = path.join(ROOT, "public/og.jpg");
await sharp(frame)
  .composite([
    { input: scrim, top: 0, left: 0 },
    { input: mark, top: H - MARK - 64, left: 72 },
  ])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(out);

const kb = Math.round(fs.statSync(out).size / 1024);
console.log(`wrote public/og.jpg — ${W}x${H}, ${kb}KB`);
