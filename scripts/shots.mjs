/**
 * Dev-only visual check: drives real Chrome so animations settle before the
 * screenshot (Chrome's --virtual-time-budget snapshots mid-timeline and gives
 * misleading results for a GSAP/rAF page).
 *
 * Usage: node scripts/shots.mjs <baseUrl> <outDir>
 */

import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3130";
const outDir = process.argv[3] ?? "shots";

const VIEWS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "mobile", width: 390, height: 844, mobile: true },
  { name: "narrow", width: 360, height: 780, mobile: true },
];

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const v of VIEWS) {
  const page = await browser.newPage();
  await page.setViewport({
    width: v.width,
    height: v.height,
    deviceScaleFactor: 1,
    isMobile: !!v.mobile,
    hasTouch: !!v.mobile,
  });

  await page.goto(base, { waitUntil: "networkidle0" });
  // Let the ~1.85s load timeline finish and settle.
  await sleep(3200);

  await page.screenshot({ path: `${outDir}/${v.name}-hero.png` });

  // Scroll through so ScrollTriggers fire, then capture the whole page.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 260));
    }
    window.scrollTo(0, 0);
  });
  await sleep(1200);

  await page.screenshot({ path: `${outDir}/${v.name}-full.png`, fullPage: true });
  console.log(`${v.name}: ${v.width}x${v.height}`);
  await page.close();
}

await browser.close();
console.log("done ->", outDir);
