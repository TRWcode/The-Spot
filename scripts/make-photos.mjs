/**
 * Turns photo originals into web-ready files.
 *
 *   1. drop files in  assets-inbox/photos/
 *   2. node scripts/make-photos.mjs
 *
 * The filename is the slug: `beer.jpg` becomes /media/about/beer.jpg, which is
 * what lib/content points at. Rename the file, not the code.
 *
 * Camera and studio exports arrive at print size — the portrait that prompted
 * this was 1772x2480 and 1.3MB. Next/Image would resize it on request anyway,
 * but the original still has to be stored, deployed and decoded by the
 * optimiser every time the cache is cold. Capping the master at the largest
 * size any layout actually asks for costs nothing visible and takes about 80%
 * off the file.
 *
 * Nothing is cropped here. Framing is a layout decision and lives in CSS with
 * object-fit, where it can differ per breakpoint.
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const IN = path.join(ROOT, "assets-inbox/photos");
const OUT = path.join(ROOT, "public/media/about");

/**
 * The widest any of these is rendered is the /over-ons portrait at roughly
 * 640 CSS px, so 1400 covers it at 2x with room for a wider layout later.
 */
const MAX_W = 1400;

fs.mkdirSync(IN, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const files = fs.readdirSync(IN).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));

if (!files.length) {
  console.log(`Geen foto's in assets-inbox/photos/.`);
  process.exit(0);
}

for (const file of files) {
  const slug = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const src = path.join(IN, file);
  const out = path.join(OUT, `${slug}.jpg`);

  const meta = await sharp(src).metadata();
  await sharp(src)
    // withoutEnlargement: a photo that is already small is left alone rather
    // than upscaled into softness.
    .resize({ width: MAX_W, withoutEnlargement: true })
    // mozjpeg at 82 is visually clean on a portrait and well under half the
    // size of the same quality from libjpeg.
    .jpeg({ quality: 82, mozjpeg: true, progressive: true })
    // Strips EXIF along the way, which on a phone photo includes GPS.
    .toFile(out);

  const kb = (f) => Math.round(fs.statSync(f).size / 1024);
  const after = await sharp(out).metadata();
  console.log(
    `+ ${slug.padEnd(16)} ${meta.width}x${meta.height} ${kb(src)}KB -> ` +
      `${after.width}x${after.height} ${kb(out)}KB`,
  );
}
