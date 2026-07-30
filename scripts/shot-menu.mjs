/**
 * Dev-only: exercises the mobile nav sheet and captures it.
 *
 * A full-screen fixed overlay has three ways to go quietly wrong, so all three
 * are asserted rather than eyeballed:
 *
 *   1. while closed it must not intercept taps anywhere on the page
 *   2. while open the page behind it must not scroll under real input
 *      (a programmatic scrollTo is no test — overflow:hidden only blocks input)
 *   3. Escape must close it and return focus to the button that opened it
 *
 * It runs the sequence twice: once normally, once under prefers-reduced-motion,
 * where the blanket duration override could otherwise leave the closed panel
 * hit-testable for a third of a second.
 *
 * Usage: node scripts/shot-menu.mjs <baseUrl> <outDir>
 */

import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3130";
const outDir = process.argv[3] ?? "shots";

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (label, ok, detail) => {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
};

for (const reduced of [false, true]) {
  const label = reduced ? "reduced-motion" : "normal";
  console.log(`\n${label}`);

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  if (reduced) await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(base, { waitUntil: "networkidle0" });
  await sleep(3000);

  const sheetAt = (x, y) =>
    page.evaluate(
      ([px, py]) => Boolean(document.elementFromPoint(px, py)?.closest(".nav-sheet")),
      [x, y],
    );

  check("closed sheet does not intercept taps", !(await sheetAt(195, 400)) && !(await sheetAt(50, 700)));

  await page.click(".burger");
  await sleep(reduced ? 150 : 700);

  const open = await page.evaluate(() => {
    const sheet = document.querySelector(".nav-sheet");
    return {
      visibility: getComputedStyle(sheet).visibility,
      opacity: getComputedStyle(sheet).opacity,
      expanded: document.querySelector(".burger")?.getAttribute("aria-expanded"),
      focused: document.activeElement?.textContent?.trim().slice(0, 12),
      links: [...document.querySelectorAll(".nav-sheet__link")].map((a) =>
        a.textContent.replace(/^0\d/, "").trim(),
      ),
    };
  });

  check("sheet is visible", open.visibility === "visible" && open.opacity === "1", `${open.visibility}/${open.opacity}`);
  check("aria-expanded is true", open.expanded === "true", open.expanded);
  check("focus moved into the sheet", Boolean(open.focused), open.focused);
  check("links present", open.links.length > 0, open.links.join(", "));
  check("sheet covers the page", await sheetAt(195, 400));

  const before = await page.evaluate(() => window.scrollY);
  await page.mouse.move(195, 500);
  await page.mouse.wheel({ deltaY: 600 });
  await sleep(400);
  const after = await page.evaluate(() => window.scrollY);
  check("page behind is scroll-locked", after === before, `scrollY ${before} -> ${after}`);

  await page.screenshot({ path: `${outDir}/menu-${label}.png` });

  await page.keyboard.press("Escape");
  await sleep(reduced ? 150 : 650);

  const closed = await page.evaluate(() => ({
    visibility: getComputedStyle(document.querySelector(".nav-sheet")).visibility,
    bodyOverflow: getComputedStyle(document.body).overflow,
    focusIsBurger: document.activeElement?.classList.contains("burger"),
  }));

  check("Escape hides the sheet", closed.visibility === "hidden", closed.visibility);
  check("scroll lock released", closed.bodyOverflow !== "hidden", closed.bodyOverflow);
  check("focus returned to the burger", closed.focusIsBurger === true);
  check("closed sheet released hit-testing", !(await sheetAt(195, 400)));

  await page.close();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
process.exit(failures ? 1 : 0);
