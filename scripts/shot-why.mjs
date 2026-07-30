/** Dev-only: captures the wel/niet section in both states. */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3000";
const dir = process.argv[3] ?? ".";
const width = Number(process.argv[4] ?? 1440);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars", "--disable-gpu"],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
await page.goto(base, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2500));

await page.evaluate(() => document.querySelector("#waarom")?.scrollIntoView());
await new Promise((r) => setTimeout(r, 1400));

const tag = width < 600 ? "m" : "d";
const section = await page.$("#waarom");
await section.screenshot({ path: `${dir}/why-${tag}-wel.png` });

const [, zonder] = await page.$$("#waarom .why-seg");
await zonder.click();
// Park the pointer off the control: the custom cursor is a real element and
// would otherwise sit on top of the button in the capture.
await page.mouse.move(width - 10, 10);
await new Promise((r) => setTimeout(r, 900));
await section.screenshot({ path: `${dir}/why-${tag}-niet.png` });

console.log("captured", tag);
await browser.close();
