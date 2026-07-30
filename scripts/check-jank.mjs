/**
 * Finds what is dropping frames.
 *
 * Measures real frame timing while scrolling the page, then re-measures with
 * individual suspects disabled, so the cost of each is a number rather than a
 * hunch. Runs with 4x CPU throttling: on an unthrottled desktop almost
 * anything holds 60fps, which is exactly how jank ships.
 *
 * Usage: node scripts/check-jank.mjs [baseUrl]
 */

import puppeteer from "puppeteer-core";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const base = process.argv[2] ?? "http://localhost:3000";

/**
 * Each suspect is CSS injected to neutralise one thing, and nothing else, so
 * the gap against baseline is that thing's cost in frames.
 *
 * Findings so far, for anyone re-running this:
 *   - The hero push-in was worth 66 -> 78fps once it stopped scaling the
 *     <video> element directly. That fix is in; "push-in off" is the ceiling.
 *   - `will-change: transform` on the push-in made it slightly WORSE. It is
 *     not a free win, do not sprinkle it on.
 *   - Marquee, logo filters, cursor and tile transitions each cost ~2fps.
 *     Nothing there is worth changing.
 */
const SUSPECTS = [
  { name: "baseline (nothing disabled)", css: "" },
  {
    name: "hero push-in off (ceiling)",
    css: `.hero-reel__push{animation:none!important}`,
  },
  {
    name: "hero video hidden",
    css: `.hero-reel__push video{display:none!important}`,
  },
  {
    name: "marquee paused",
    css: `.animate-\\[spot-marquee_46s_linear_infinite\\]{animation:none!important}`,
  },
  {
    name: "logo grayscale filter off",
    css: `.client-logo{filter:none!important}`,
  },
  {
    name: "custom cursor off",
    css: `.play-cursor{display:none!important}`,
  },
  {
    name: "tile posters static",
    css: `.work-tile__img{transition:none!important;animation:none!important}`,
  },
  {
    name: "tile grain off",
    css: `.work-tile__grain{display:none!important}`,
  },
  {
    // display:none also stops the decoders, which is the point — this is the
    // cost of the whole in-view autoplay decision, not just of compositing it.
    name: "tile loops off",
    css: `.work-tile__video{display:none!important}`,
  },
];

/**
 * Scroll handlers that read layout (scrollHeight, getBoundingClientRect) force
 * the browser to recalculate the whole document mid-frame. With Lenis driving
 * scroll every frame, one such read is enough to cap the frame rate — and it
 * gets worse as the page grows. Counted separately because no CSS can disable it.
 */
const LAYOUT_READS = `
  (() => {
    window.__reads = 0;
    const el = Object.getOwnPropertyDescriptor(Element.prototype, "scrollHeight");
    Object.defineProperty(Element.prototype, "scrollHeight", {
      get() { window.__reads++; return el.get.call(this); },
      configurable: true,
    });
    const rect = Element.prototype.getBoundingClientRect;
    Element.prototype.getBoundingClientRect = function () {
      window.__reads++;
      return rect.call(this);
    };
  })();
`;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--hide-scrollbars"],
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function measure(css) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const client = await page.createCDPSession();
  // A desktop with nothing else running hides jank that a real visitor feels.
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  // "load", not "networkidle0": the hero loop holds a connection open, so
  // idle never arrives — and under CPU throttling the wait times out instead.
  await page.evaluateOnNewDocument(LAYOUT_READS);
  await page.goto(base, { waitUntil: "load", timeout: 90_000 });
  if (css) await page.addStyleTag({ content: css });
  await sleep(3000);
  await page.evaluate(() => (window.__reads = 0));

  // Start recording, then drive the page with REAL wheel events.
  //
  // window.scrollTo() would be measuring a path no visitor takes: Lenis
  // intercepts the wheel and animates scroll itself, so a programmatic jump
  // skips the entire layer under test.
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    window.__stop = false;
    const tick = (now) => {
      window.__frames.push(now - last);
      last = now;
      if (!window.__stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.mouse.move(720, 450);
  for (let i = 0; i < 45; i++) {
    await page.mouse.wheel({ deltaY: 220 });
    await sleep(55);
  }
  await sleep(400);

  const result = await page.evaluate(async () => {
    window.__stop = true;
    const frames = window.__frames;

    // Drop the first few frames: they cover the scroll starting, not steady state.
    const f = frames.slice(5);
    const sorted = f.slice().sort((a, b) => a - b);
    const long = f.filter((d) => d > 33).length; // missed 2+ frames at 60Hz
    return {
      fps: Math.round(1000 / (f.reduce((a, b) => a + b, 0) / f.length)),
      p95: Math.round(sorted[Math.floor(sorted.length * 0.95)]),
      worst: Math.round(sorted[sorted.length - 1]),
      longFrames: long,
      total: f.length,
      layoutReads: window.__reads,
    };
  });

  await page.close();
  return result;
}

/**
 * Repeats matter more than they look like they should. Single runs put the
 * same variant anywhere between 65 and 83 fps on this machine, which is wide
 * enough to "prove" whichever conclusion you were hoping for. Median of N.
 */
const RUNS = Number(process.env.RUNS ?? 3);
const median = (xs) => xs.slice().sort((a, b) => a - b)[Math.floor(xs.length / 2)];

/**
 * Suspects are interleaved — one full pass through the list per round, rather
 * than all repeats of one variant back to back.
 *
 * Running them in blocks made whichever variant went first look best: the
 * machine drifts over a multi-minute profiling session (thermals, background
 * work, page cache), and a block absorbs that drift entirely. Interleaving
 * spreads it across every variant equally, which is the only way the numbers
 * are comparable to each other at all.
 */
const results = new Map(SUSPECTS.map((s) => [s.name, []]));

console.log(`profiling ${base} @ 4x CPU throttle, median of ${RUNS} interleaved runs\n`);

for (let round = 0; round < RUNS; round++) {
  for (const s of SUSPECTS) {
    results.get(s.name).push(await measure(s.css));
  }
  process.stdout.write(`  round ${round + 1}/${RUNS} done\n`);
}

console.log("");
console.log("suspect".padEnd(32), "fps".padStart(5), "p95".padStart(7), "worst".padStart(7), "janky".padStart(10));
for (const s of SUSPECTS) {
  const runs = results.get(s.name);
  console.log(
    s.name.padEnd(32),
    String(median(runs.map((r) => r.fps))).padStart(5),
    (median(runs.map((r) => r.p95)) + "ms").padStart(7),
    (median(runs.map((r) => r.worst)) + "ms").padStart(7),
    `${median(runs.map((r) => r.longFrames))}/${median(runs.map((r) => r.total))}`.padStart(10),
  );
}

await browser.close();
