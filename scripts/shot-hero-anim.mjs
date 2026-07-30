/** Dev-only: samples the hero load reveal frame by frame, plus the tilt. */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3000";
const dir = process.argv[3] ?? ".";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.5 });

await page.goto(base, { waitUntil: "domcontentloaded" });

// Sample the letterbox opening while it plays.
for (const t of [1150, 1350, 1700]) {
  await page.evaluate(
    (ms) => new Promise((r) => setTimeout(r, ms - performance.now() > 0 ? ms - performance.now() : 0)),
    t,
  );
  await page.screenshot({ path: `${dir}/hero-t${t}.png` });
}

await new Promise((r) => setTimeout(r, 1500));

// Push the pointer to a corner so the tilt reaches a visible angle.
await page.mouse.move(1350, 880);
await new Promise((r) => setTimeout(r, 1200));
const t = await page.$eval(".hero-tilt", (n) => n.style.transform);
console.log("tilt transform:", t || "(none)");
await page.screenshot({ path: `${dir}/hero-tilt.png` });

await browser.close();
