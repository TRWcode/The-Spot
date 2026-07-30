/** Dev-only: reports the LCP element under Lighthouse-like mobile throttling. */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3150";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

const client = await page.createCDPSession();
await client.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.evaluateOnNewDocument(() => {
  window.__lcp = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      window.__lcp.push({
        time: Math.round(e.startTime),
        tag: e.element?.tagName,
        cls: e.element?.className?.toString().slice(0, 70),
        text: e.element?.textContent?.trim().slice(0, 45),
      });
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
});

await page.goto(base, { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 6000));

const lcp = await page.evaluate(() => window.__lcp);
console.log("LCP candidates (last one wins):");
for (const c of lcp) console.log(` ${String(c.time).padStart(5)}ms  <${c.tag}> ${c.text ?? ""} | ${c.cls ?? ""}`);

await browser.close();
