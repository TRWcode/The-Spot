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

// 5. Geldige inzending. LET OP: staan RESEND_API_KEY en CONTACT_FROM in de
//    omgeving van de server waar dit tegenaan draait, dan komt dit bericht
//    écht in de inbox van CONTACT_TO. Zonder die twee hoort het luid te falen
//    in plaats van stil te doen alsof.
await page.evaluate(() => {
  const e = document.querySelector("#email");
  e.value = "";
});
await page.type("#email", "thomas@voorbeeld.nl");
// Wachten tot de vulklok voorbij MIN_FILL_MS is, anders test dit niet de
// gewone inzending maar de te-snel-regel uit lib/form-token.js.
await new Promise((r) => setTimeout(r, 4500));
console.log("5) geldige inzending ->", JSON.stringify(await submit()));

// 6. Honeypot filled = treated as a bot, answered with success, nothing sent.
//    Het veld heet `onderwerp`, niet `company`: autofill vulde die laatste in
//    bij echte bezoekers. Zie de commit die de honeypot hernoemde.
await page.evaluate(() => {
  document.querySelector("#onderwerp").value = "bot";
});
console.log("6) honeypot ingevuld ->", JSON.stringify(await submit()));

// De antispam-lagen. Vanaf hier hoort de serverlog mee gelezen te worden: een
// geblokkeerd bericht antwoordt met "verstuurd" en laat alleen daar een spoor
// na. Zie lib/spam.js en lib/form-token.js.
/**
 * Verse pagina met het formulier in beeld. Dat scrollen is nodig, niet netjes:
 * Reveal zet het blok op autoAlpha 0 tot de scroll-trigger het vrijgeeft, en
 * een onzichtbaar veld neemt geen focus, dus zonder dit haalt het formulier
 * nooit een token op.
 */
const fresh = async (fields) => {
  await page.goto(`${base}/contact`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(() => document.querySelector("form.form-card").scrollIntoView({ block: "center" }));
  await new Promise((r) => setTimeout(r, 1000));
  await page.focus("#name");
  if (fields) {
    await page.type("#name", fields.name);
    await page.type("#email", fields.email);
    await page.type("#message", fields.message);
  }
};

// 7. Het token wordt pas opgehaald zodra iemand het formulier aanraakt, niet
//    bij het laden van de pagina.
await page.goto(`${base}/contact`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1200));
await page.evaluate(() => document.querySelector("form.form-card").scrollIntoView({ block: "center" }));
await new Promise((r) => setTimeout(r, 1000));
const before = await page.$eval('input[name="token"]', (n) => n.value);
await page.focus("#name");
await new Promise((r) => setTimeout(r, 1000));
const after = await page.$eval('input[name="token"]', (n) => n.value);
console.log(
  "7) token pas na aanraking:",
  before === "" && after.length > 20 ? "JA" : `NEE (voor: ${before}, na: ${after})`,
);

const pageSubmit = async () => {
  await page.evaluate(() => document.querySelector('form.form-card button[type="submit"]').click());
  await new Promise((r) => setTimeout(r, 2000));
  return page.$eval(".form-status", (n) => n.textContent.trim());
};

// 8. Binnen vier seconden ingevuld en verstuurd. Telt zwaar, maar mag op
//    zichzelf niets blokkeren: dit hoort gewoon door te gaan.
await fresh({
  name: "Snelle Vinger",
  email: "snel@voorbeeld.nl",
  message: "Hoi, ik wil graag een video laten maken voor ons bedrijf.",
});
console.log("8) binnen 4s verstuurd ->", JSON.stringify(await pageSubmit()));

// 9. De echte spam die dit hele filter veroorzaakte. Hoort te antwoorden met
//    "verstuurd" én in de log te staan als geblokkeerd.
await fresh({
  name: "Salvador",
  email: "salvadorsancho189@hotmail.es",
  message:
    "Indexing and exponent checking service for Google and Yandex.SpeedyIndex google playWHO tin benefit from this inspection and repair?This avail is utile for internet site owners and SEO specialists who need to gain their visibility in Google and Yandex, meliorate their land site rankings, and increment constitutional traffic.",
});
await new Promise((r) => setTimeout(r, 4500));
console.log("9) echte spam ->", JSON.stringify(await pageSubmit()));

// 10. Een gewone Nederlandse aanvraag hoort er ongehinderd doorheen te gaan.
//     Zonder mailsleutels is "Versturen lukte niet" hier het goede antwoord:
//     dat betekent dat het bericht tot deliver() is gekomen.
await fresh({
  name: "Marieke Jansen",
  email: "marieke@bakkerijjansen.nl",
  message:
    "Goedemiddag, wij willen graag een bedrijfsvideo laten maken voor onze nieuwe website. Kunnen we een keer bellen om de mogelijkheden door te nemen?",
});
await new Promise((r) => setTimeout(r, 4500));
console.log("10) echte klant ->", JSON.stringify(await pageSubmit()));

await browser.close();
