/**
 * Responsive audit. Walks a set of widths and reports, per page:
 *
 *   - horizontal overflow, plus the elements actually causing it
 *   - tap targets under 44x44 (WCAG 2.5.8 / practical thumb size)
 *   - text below 12px
 *
 * Usage: node scripts/check-responsive.mjs [baseUrl]
 */

import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3130";

const WIDTHS = [320, 360, 390, 430, 600, 768, 834, 1024, 1280, 1440, 1920];
const PAGES = ["/", "/werk", "/werk/clok", "/over-ons", "/contact"];

await mkdir("shots/responsive", { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let problems = 0;

for (const route of PAGES) {
  console.log(`\n=== ${route}`);
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    const touch = width < 768;
    await page.setViewport({ width, height: 900, isMobile: touch, hasTouch: touch });
    await page.goto(base + route, { waitUntil: "networkidle0" });
    await sleep(2600);

    // Scroll the whole page so reveal animations resolve before measuring —
    // an element still translated off-screen would read as false overflow.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 160));
      }
      window.scrollTo(0, 0);
    });
    await sleep(700);

    const report = await page.evaluate(() => {
      const docW = document.documentElement.clientWidth;

      // An element wider than the viewport inside a clipping ancestor is by
      // design — the hero's push-in and the logo marquee both live that way.
      // Reporting them buries the one element that actually widens the page.
      const clipped = (el) => {
        for (let n = el.parentElement; n; n = n.parentElement) {
          const ox = getComputedStyle(n).overflowX;
          if (ox === "hidden" || ox === "clip" || ox === "auto" || ox === "scroll") return true;
        }
        return false;
      };

      const overflowing = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (clipped(el)) continue;
        // 1px of slack: sub-pixel rounding on transformed elements is not a bug.
        if (r.right > docW + 1 || r.left < -1) {
          overflowing.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className?.baseVal ?? el.className ?? "").toString().slice(0, 60),
            left: Math.round(r.left),
            right: Math.round(r.right),
          });
        }
      }

      /**
       * Deliberately hidden things are not findings: the skip link is 1x1
       * until focused, the honeypot is clipped away from everyone, and
       * anything aria-hidden is decoration by declaration.
       */
      const hidden = (el) => {
        if (el.closest('[aria-hidden="true"], .sr-only, .hp')) return true;
        for (let n = el; n; n = n.parentElement) {
          const s = getComputedStyle(n);
          if (s.visibility === "hidden" || s.display === "none") return true;
          if (s.clipPath?.startsWith("inset(50%")) return true;
        }
        return false;
      };

      const small = [];
      for (const el of document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (hidden(el)) continue;
        // Inline links inside a paragraph are exempt — the rule is about
        // standalone controls, not words in a sentence.
        if (el.tagName === "A" && el.closest("p")) continue;

        // WCAG 2.5.8 (AA) puts the hard floor at 24x24. 44px is the AAA/thumb
        // figure and is what the height of a stacked row should hit; a short
        // word in a horizontal nav cannot meet it on width and does not need
        // to, so width is only judged against the 24px floor.
        // Half a pixel of slack: a box built to land on exactly 44px measures
        // 43.99 once line-height rounding is in play, and flagging that is noise.
        const failsAA = Math.min(r.width, r.height) < 23.5;
        const shortRow = r.height < 43.5;
        if (failsAA || shortRow) {
          small.push({
            level: failsAA ? "AA" : "thumb",
            tag: el.tagName.toLowerCase(),
            text: (el.textContent ?? "").trim().slice(0, 24),
            w: Math.round(r.width),
            h: Math.round(r.height),
          });
        }
      }

      const tiny = new Set();
      for (const el of document.querySelectorAll("body *")) {
        if (!el.childNodes.length) continue;
        const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) continue;
        if (hidden(el)) continue;
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size && size < 12) tiny.add(`${el.tagName.toLowerCase()} ${size}px "${el.textContent.trim().slice(0, 20)}"`);
      }

      return {
        scrollW: document.documentElement.scrollWidth,
        docW,
        overflowing: overflowing.slice(0, 6),
        small: small.slice(0, 6),
        tiny: [...tiny].slice(0, 4),
      };
    });

    const scrolls = report.scrollW > report.docW + 1;
    const flags = [];
    if (scrolls) flags.push(`OVERFLOW ${report.scrollW}>${report.docW}`);
    if (report.small.length) flags.push(`${report.small.length} small target(s)`);
    if (report.tiny.length) flags.push(`${report.tiny.length} tiny text`);
    if (flags.length) problems++;

    console.log(`${String(width).padStart(5)}px  ${flags.length ? "! " + flags.join(", ") : "ok"}`);
    for (const o of report.overflowing) console.log(`         overflow: <${o.tag}> ${o.cls} [${o.left}..${o.right}]`);
    for (const s of report.small) console.log(`         ${s.level.padEnd(5)} target: <${s.tag}> "${s.text}" ${s.w}x${s.h}`);
    for (const t of report.tiny) console.log(`         tiny: ${t}`);

    await page.screenshot({
      path: `shots/responsive/${route.replace(/\W+/g, "_")}-${width}.png`,
      fullPage: true,
    });
    await page.close();
  }
}

await browser.close();
console.log(`\n${problems ? problems + " viewport(s) with findings" : "clean across all viewports"}`);
