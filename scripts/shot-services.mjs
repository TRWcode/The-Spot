/** Dev-only: captures the Diensten cards idle and mid-hover. */
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
await new Promise((r) => setTimeout(r, 2500));

await page.evaluate(() => document.querySelector("#diensten")?.scrollIntoView());
await new Promise((r) => setTimeout(r, 1500));

const section = await page.$("#diensten");
await section.screenshot({ path: `${dir}/services-idle.png` });

// Hover the middle card and let each loop reach a telling frame.
const cards = await page.$$(".svc-card");
await cards[1].hover();
await new Promise((r) => setTimeout(r, 700));
await section.screenshot({ path: `${dir}/services-hover.png` });

await cards[0].hover();
await new Promise((r) => setTimeout(r, 400));
await section.screenshot({ path: `${dir}/services-hover-film.png` });

console.log("cards:", cards.length);
await browser.close();
