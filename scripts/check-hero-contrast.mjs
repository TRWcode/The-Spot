/**
 * Measures text contrast over the hero video, sampled across the whole loop.
 *
 *   node scripts/check-hero-contrast.mjs [url]
 *
 * Naive versions of this check measure the brightest pixel inside each text
 * element's bounding box, which is wrong: an h1 with `max-w-[15ch]` has a box
 * far wider than its longest line, so it reports bright footage from empty
 * space no glyph ever covers. That read 2.4:1 while the real figure was 16:1.
 *
 * So: screenshot each frame twice, once with the hero text visible and once
 * hidden, and only measure the background under pixels the text actually
 * changed. The video is paused around each pair so both shots show the same
 * frame.
 */

import puppeteer from "puppeteer-core";
import sharp from "sharp";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const url = process.argv[2] ?? "http://localhost:3000";
const SAMPLES = 10;

const lum = (r, g, b) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 3000));
// Park the pointer: the custom cursor is a real element and would land in shot.
await page.mouse.move(1430, 880);

const zones = await page.evaluate(() => {
  const g = (s) => {
    const r = document.querySelector(s).getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
  };
  return { kop: g(".hero-content h1"), lead: g(".hero-content .lead"), eyebrow: g(".hero-content .eyebrow") };
});

/** Large display type needs 3:1; body copy needs 4.5:1. */
const NEEDED = { kop: 3.0, lead: 4.5, eyebrow: 4.5 };
const worst = Object.fromEntries(Object.keys(zones).map((k) => [k, Infinity]));

for (let i = 0; i < SAMPLES; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  await page.evaluate(() => document.querySelector(".hero-media video")?.pause());

  for (const [key, clip] of Object.entries(zones)) {
    const withText = await page.screenshot({ clip });
    await page.evaluate(() => (document.querySelector(".hero-content").style.visibility = "hidden"));
    const noText = await page.screenshot({ clip });
    await page.evaluate(() => (document.querySelector(".hero-content").style.visibility = "visible"));

    const a = await sharp(withText).raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(noText).raw().toBuffer({ resolveWithObject: true });

    let maxL = 0;
    for (let j = 0; j < a.data.length; j += a.info.channels) {
      const diff =
        Math.abs(a.data[j] - b.data[j]) +
        Math.abs(a.data[j + 1] - b.data[j + 1]) +
        Math.abs(a.data[j + 2] - b.data[j + 2]);
      if (diff < 150) continue; // antialiased edges excluded, glyph cores only
      const L = lum(b.data[j], b.data[j + 1], b.data[j + 2]);
      if (L > maxL) maxL = L;
    }
    if (maxL > 0) worst[key] = Math.min(worst[key], 1.05 / (maxL + 0.05));
  }

  await page.evaluate(() => document.querySelector(".hero-media video")?.play());
}

let failed = false;
console.log(`Contrast onder de letters, slechtste van ${SAMPLES} frames:`);
for (const [key, value] of Object.entries(worst)) {
  const ok = value >= NEEDED[key];
  if (!ok) failed = true;
  console.log(`  ${key.padEnd(9)} ${value.toFixed(2)}:1   nodig ${NEEDED[key]}   ${ok ? "PASS" : "FAIL"}`);
}

await browser.close();
process.exit(failed ? 1 : 0);
