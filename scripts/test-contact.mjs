/** Dev-only: exercises the contact form's real submit paths. */
import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3000";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--disable-gpu", "--hide-scrollbars"],
});
const page = await browser.newPage();
await page.goto(base, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => document.querySelector("#contact").scrollIntoView({ block: "center" }));
await new Promise((r) => setTimeout(r, 800));

const submit = async () => {
  await page.evaluate(() => document.querySelector('#contact button[type="submit"]').click());
  await new Promise((r) => setTimeout(r, 1600));
  return page.evaluate(() => ({
    status: document.querySelector("#contact .form-status")?.textContent?.trim() || "",
    errors: [...document.querySelectorAll("#contact .field-error")].map((n) => n.textContent.trim()),
    invalid: [...document.querySelectorAll('#contact [aria-invalid="true"]')].map((n) => n.id),
  }));
};

// 1. Browser-native required should block an empty submit before the action runs.
const native = await page.evaluate(() => document.querySelector("#contact form").checkValidity());
console.log("1) leeg formulier is native ongeldig:", native === false ? "JA (geblokkeerd)" : "NEE");

// 2. Server-side validation: bypass the native check with novalidate.
await page.evaluate(() => document.querySelector("#contact form").setAttribute("novalidate", ""));
console.log("2) leeg, novalidate ->", JSON.stringify(await submit()));

// 3. Bad email only.
await page.type("#name", "Thomas Test");
await page.type("#email", "geen-adres");
await page.type("#message", "Testbericht vanuit de e2e-check.");
console.log("3) ongeldig e-mailadres ->", JSON.stringify(await submit()));

// 4. Values must survive a rejected submit.
const kept = await page.evaluate(() => ({
  name: document.querySelector("#name").value,
  message: document.querySelector("#message").value,
}));
console.log("4) ingevulde tekst bewaard:", kept.name === "Thomas Test" && kept.message.length > 0 ? "JA" : "NEE", JSON.stringify(kept));

// 5. Valid submit — no API key configured, so this must fail loudly, not silently succeed.
await page.evaluate(() => {
  const e = document.querySelector("#email");
  e.value = "";
});
await page.type("#email", "thomas@voorbeeld.nl");
console.log("5) geldig, zonder API-key ->", JSON.stringify(await submit()));

// 6. Honeypot filled = treated as a bot, answered with success, nothing sent.
await page.evaluate(() => {
  document.querySelector("#company").value = "bot";
});
console.log("6) honeypot ingevuld ->", JSON.stringify(await submit()));

await browser.close();
