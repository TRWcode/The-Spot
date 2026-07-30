/**
 * Dev-only: asserts the page is fully legible with prefers-reduced-motion.
 * Nothing may depend on a transform or fade having run in order to be visible.
 */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3170";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await page.goto(base, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));

const report = await page.evaluate(() => {
  const sel = [
    "[data-hero-line]",
    "[data-hero-eyebrow]",
    "[data-hero-stagger]",
    "[data-hero-frame]",
    "[data-hero-cue]",
    "[data-header-mark]",
    "[data-reveal]",
  ];
  const bad = [];
  for (const s of sel) {
    for (const el of document.querySelectorAll(s)) {
      const cs = getComputedStyle(el);
      const hidden =
        parseFloat(cs.opacity) < 0.99 ||
        cs.visibility === "hidden" ||
        (cs.transform !== "none" && !cs.transform.startsWith("matrix(1, 0, 0, 1, 0, 0)"));
      if (hidden) bad.push({ s, opacity: cs.opacity, visibility: cs.visibility, transform: cs.transform });
    }
  }
  return {
    bad: bad.slice(0, 8),
    total: sel.reduce((n, s) => n + document.querySelectorAll(s).length, 0),
    lenisOnHtml: document.documentElement.classList.contains("lenis"),
  };
});

console.log("elements checked:", report.total);
console.log("lenis active (should be false):", report.lenisOnHtml);
console.log(report.bad.length ? "HIDDEN UNDER REDUCED MOTION:" : "OK — everything visible");
for (const b of report.bad) console.log(" ", JSON.stringify(b));

await page.screenshot({ path: process.argv[3] ?? "reduced.png" });
await browser.close();
