/**
 * Favicon + app icons, generated from the traced mark so they can never drift
 * away from the logo in the header.
 *
 * Run after scripts/trace-mark.mjs:  node scripts/make-icons.mjs
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const mark = fs.readFileSync(path.join(ROOT, "public/brand/the-spot-mark.svg"), "utf8");

/**
 * Tab icons render at 16px, where the mark's own bounding box leaves it
 * touching the edges. Padding it into the canvas is what makes it read as a
 * mark rather than as a smudge.
 */
const padded = (size, background) => {
  const inner = Math.round(size * 0.78);
  return sharp(Buffer.from(mark))
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: Math.round((size - inner) / 2),
      bottom: size - inner - Math.round((size - inner) / 2),
      left: Math.round((size - inner) / 2),
      right: size - inner - Math.round((size - inner) / 2),
      background,
    })
    .png();
};

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
// Apple homescreen icons get composited onto white if they are transparent, and
// the gradient loses its edge against it — so this one ships its own ink field.
const ink = { r: 11, g: 15, b: 20, alpha: 1 };

await padded(512, transparent).toFile(path.join(ROOT, "app/icon.png"));
await padded(180, ink).toFile(path.join(ROOT, "app/apple-icon.png"));

// Next serves app/icon.svg directly as the scalable favicon; the .ico that
// shipped before predates the real logo.
fs.writeFileSync(path.join(ROOT, "app/icon.svg"), mark);
fs.rmSync(path.join(ROOT, "app/favicon.ico"), { force: true });

console.log("wrote app/icon.svg, app/icon.png, app/apple-icon.png");
