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

/**
 * Packs PNGs into an .ico container. Every ICO reader since Vista accepts PNG
 * payloads, and at 48px a raw BMP would be three times the bytes for the same
 * pixels.
 */
const ico = (pngs) => {
  const HEADER = 6;
  const ENTRY = 16;
  let offset = HEADER + ENTRY * pngs.length;

  const header = Buffer.alloc(HEADER);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(pngs.length, 4);

  const entries = pngs.map(({ size, data }) => {
    const entry = Buffer.alloc(ENTRY);
    entry.writeUInt8(size, 0); // 0 would mean 256
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4); // colour planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
};

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
// Apple homescreen icons get composited onto white if they are transparent, and
// the gradient loses its edge against it — so this one ships its own ink field.
const ink = { r: 11, g: 15, b: 20, alpha: 1 };

await padded(512, transparent).toFile(path.join(ROOT, "app/icon.png"));
await padded(180, ink).toFile(path.join(ROOT, "app/apple-icon.png"));

// Next serves app/icon.svg directly as the scalable favicon.
fs.writeFileSync(path.join(ROOT, "app/icon.svg"), mark);

/**
 * En dan nog een ouderwetse .ico op de wortel van het domein.
 *
 * De <link>-tags hierboven zijn genoeg voor een browser die de pagina leest,
 * maar een heleboel dingen lezen de pagina niet: Safari valt bij twijfel terug
 * op /favicon.ico, en de favicon-crawler van Google, WhatsApp en RSS-lezers
 * vragen dat adres net zo goed rechtstreeks op. Zonder dit bestand kregen die
 * daar een 404-pagina van 40 kB, en een browser die géén icoon terugkrijgt
 * gooit het icoon dat hij al had niet weg — vandaar dat het oude logo bij
 * sommigen bleef staan terwijl de site allang nieuw was.
 *
 * Drie maten in één bestand: 16 voor de tab, 32 voor retina en de
 * bladwijzerbalk, 48 omdat Google die maat als bron voor het zoekresultaat
 * pakt.
 */
const sizes = [16, 32, 48];
const frames = await Promise.all(
  sizes.map(async (size) => ({ size, data: await padded(size, transparent).toBuffer() })),
);
fs.writeFileSync(path.join(ROOT, "app/favicon.ico"), ico(frames));

console.log("wrote app/icon.svg, app/icon.png, app/apple-icon.png, app/favicon.ico");
