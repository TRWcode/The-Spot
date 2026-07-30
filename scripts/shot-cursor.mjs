/** Dev-only: captures the three play-cursor states over the hero. */
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
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(base, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 3000));

const at = async (sel, name) => {
  const el = await page.$(sel);
  if (!el) return console.log("missing", sel);
  // Scroll it into view first: a centre point below the fold gets clamped and
  // the pointer never lands on the element at all.
  await el.evaluate((n) => n.scrollIntoView({ block: "center", behavior: "instant" }));
  await new Promise((r) => setTimeout(r, 600));
  const b = await el.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: `${dir}/cursor-${name}.png` });
  const state = await page.$eval(".play-cursor", (n) => n.dataset.state);
  console.log(name, "-> state:", state);
};

await at("[data-hero-frame]", "play");
await at("header .pill-outline", "link");
await at("h1", "idle");

await browser.close();
