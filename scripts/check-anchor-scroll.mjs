/**
 * Bewijst dat een klik op een #sectie-link scrollt in plaats van springt.
 *
 * Meet scrollY per frame na de klik. Een native anchor-sprong geeft precies
 * twee waarden (start en doel); een echte reis geeft er tientallen. Bestaat
 * omdat dit stilzwijgend uit elkaar is gelopen: de header scrolde netjes via
 * Lenis terwijl de hero-CTA's kale anchors waren, en `.lenis-smooth` zet
 * `scroll-behavior: auto`, dus daar sprong dezelfde link hard.
 *
 * Let op bij het lezen van "grootste stap": de eerste case in de reeks toont
 * er structureel een van 400-600px, ook als je de volgorde omdraait. Dat is
 * een koude headless Chrome die frames laat vallen, geen jank in de scroll —
 * gecontroleerd door de reeks om te keren, waarna de piek meeverhuisde naar
 * wat er dan vooraan stond. Beoordeel dus de tweede case en verder.
 *
 * Usage: node scripts/check-anchor-scroll.mjs [baseUrl]
 */

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3000";

const CASES = [
  { name: "hero CTA 'Diensten'", selector: 'a.btn-text[href="#diensten"]' },
  { name: "hero CTA 'Bekijk ons werk'", selector: 'a.btn-grad[href="#werk"]' },
  { name: "header nav 'Diensten'", selector: 'nav[aria-label="Hoofdnavigatie"] a[href="#diensten"]' },
  { name: "footer 'Diensten'", selector: 'nav[aria-label="Footernavigatie"] a[href="/#diensten"]' },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

for (const { name, selector } of CASES) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(base, { waitUntil: "networkidle0" });
  // De hero-timeline landt rond 1,85s; pas daarna is klikken realistisch.
  await new Promise((r) => setTimeout(r, 2200));

  const el = await page.$(selector);
  if (!el) {
    console.log(`${name.padEnd(30)} SELECTOR NIET GEVONDEN (${selector})`);
    await page.close();
    continue;
  }

  const result = await page.evaluate(async (sel) => {
    const samples = [];
    let running = true;
    const tick = () => {
      samples.push(Math.round(window.scrollY));
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    document.querySelector(sel).click();
    await new Promise((r) => setTimeout(r, 2500));
    running = false;

    return { samples, hash: window.location.hash };
  }, selector);

  const { samples, hash } = result;
  const unique = new Set(samples).size;
  const from = samples[0];
  const to = samples[samples.length - 1];
  // Grootste sprong tussen twee opeenvolgende frames: dat is wat je als schok ziet.
  let biggestStep = 0;
  for (let i = 1; i < samples.length; i++) {
    biggestStep = Math.max(biggestStep, Math.abs(samples[i] - samples[i - 1]));
  }
  const moving = samples.filter((v, i) => i > 0 && v !== samples[i - 1]).length;

  const verdict = unique > 20 ? "GEANIMEERD" : "SPRONG";
  console.log(
    `${name.padEnd(30)} ${verdict.padEnd(11)} ${from} -> ${to}px | ${unique} standen, ` +
      `~${moving} bewegende frames, grootste stap ${biggestStep}px | url ${hash || "(geen hash)"}`,
  );

  await page.close();
}

// Reduced motion moet de native sprong houden, niet een kortere animatie.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(base, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 800));

  const r = await page.evaluate(async () => {
    const samples = [];
    let running = true;
    const tick = () => {
      samples.push(Math.round(window.scrollY));
      if (running) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    document.querySelector('a.btn-text[href="#diensten"]').click();
    await new Promise((res) => setTimeout(res, 1200));
    running = false;
    return { unique: new Set(samples).size, end: samples[samples.length - 1] };
  });
  console.log(
    `${"reduced motion".padEnd(30)} ${(r.unique <= 3 ? "SPRONG (goed)" : "GEANIMEERD (fout)").padEnd(11)} eindigt op ${r.end}px, ${r.unique} standen`,
  );
  await page.close();
}

await browser.close();
