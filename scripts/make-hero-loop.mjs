/**
 * Builds the hero's ambient loop: a short montage cut from the strongest
 * moments across the cases, at 21:9.
 *
 *   node scripts/make-hero-loop.mjs
 *
 * Why a montage rather than one clip: the hero has to say "we make films",
 * not "here is one client". Until there is a real showreel this stands in
 * for one, built only from footage that already exists.
 *
 * Both sources get cropped to 21:9 from a deliberate edge:
 *   CLOK        crop from the TOP — that is where its event watermark sits,
 *               so the reel reads as The SPOT's, not the client's.
 *   Kinderfysio crop from the BOTTOM — burned-in subtitles live there.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat, mkdir } from "node:fs/promises";

const run = promisify(execFile);

const CLOK = "assets-inbox/video/Aftermovie V4  CLOK 1.mp4";
const KF = "assets-inbox/video/kinderfysio Haarlem V3 - SPOT post & video Producties (1080p).mp4";

const OUT = "public/media/clips/hero-loop.mp4";
const OUT_SMALL = "public/media/clips/hero-loop-sm.mp4";
const POSTER = "public/media/posters/hero.jpg";

const W = 1920;
// Rounded to an even number: H.264 cannot encode odd dimensions, and 21:9 of
// 1920 lands on 822.86. An odd height fails with a bare "error opening
// encoder", which points nowhere near the actual cause.
const H = Math.round((W * 9) / 21 / 2) * 2; // 822

/** src, start, duration, and which edge to crop the 21:9 window from. */
const SHOTS = [
  { src: CLOK, start: 6.2, dur: 3.0, from: "top" }, // red-carpet entrance
  { src: KF, start: 31.4, dur: 2.8, from: "bottom" }, // ball throw, practice
  { src: CLOK, start: 117.4, dur: 3.0, from: "top" }, // champagne tower
  { src: CLOK, start: 127.6, dur: 3.2, from: "top" }, // the toast
];

const XFADE = 0.4;

await mkdir("public/media/clips", { recursive: true });

// Each input is trimmed, cropped to 21:9 from its chosen edge, scaled, and
// normalised to 25fps so the concat has a single consistent timebase.
const inputs = SHOTS.flatMap((s) => ["-ss", String(s.start), "-t", String(s.dur), "-i", s.src]);

const chains = SHOTS.map((s, i) => {
  const y = s.from === "top" ? "ih-oh" : "0";
  return (
    `[${i}:v]crop=iw:iw*9/21:0:${y},scale=${W}:${H}:flags=lanczos,` +
    `fps=25,format=yuv420p,setsar=1[v${i}]`
  );
});

// Cross-dissolve between shots: a hard cut every three seconds reads as a
// glitch when the clip silently loops.
let last = "v0";
let offset = SHOTS[0].dur - XFADE;
const fades = [];
for (let i = 1; i < SHOTS.length; i++) {
  const out = i === SHOTS.length - 1 ? "vout" : `x${i}`;
  fades.push(`[${last}][v${i}]xfade=transition=fade:duration=${XFADE}:offset=${offset.toFixed(2)}[${out}]`);
  last = out;
  offset += SHOTS[i].dur - XFADE;
}

const filter = [...chains, ...fades].join(";");

await run("ffmpeg", [
  "-y",
  ...inputs,
  "-filter_complex", filter,
  "-map", "[vout]",
  "-an",
  "-c:v", "libx264",
  "-profile:v", "high",
  "-pix_fmt", "yuv420p",
  "-crf", "24",
  "-preset", "slow",
  "-movflags", "+faststart",
  OUT,
]);

/**
 * A phone gets a much smaller file. The desktop cut is ~3MB, which is most of
 * the page weight and rude to send over cellular for decoration.
 *
 * This was 960px / crf 29, which came to 578KB — around 2.9s of download on
 * Lighthouse's throttled mobile profile, competing with the poster that is the
 * LCP. Deferring the request was tried and made Speed Index worse, so the size
 * is capped directly instead:
 *
 *   -maxrate/-bufsize   a hard ceiling, because CRF alone lets a busy shot
 *                       (the champagne tower) spike well past the average
 *   704px               below any phone's 3x DPR, but this sits behind a heavy
 *                       scrim and moves constantly — nobody reads its detail
 *   fps 24              one frame in 25 nobody sees, ~4% off for free
 */
const SMALL_W = 704;
const SMALL_H = Math.round((SMALL_W * 9) / 21 / 2) * 2;
await run("ffmpeg", [
  "-y",
  "-i", OUT,
  "-vf", `scale=${SMALL_W}:${SMALL_H}:flags=lanczos,fps=24`,
  "-an",
  "-c:v", "libx264",
  "-profile:v", "high",
  "-pix_fmt", "yuv420p",
  "-crf", "31",
  "-maxrate", "220k",
  "-bufsize", "440k",
  "-preset", "slow",
  "-movflags", "+faststart",
  OUT_SMALL,
]);

// Poster = the loop's own first frame, so there is no jump when it starts.
await run("ffmpeg", ["-y", "-i", OUT, "-frames:v", "1", "-q:v", "3", POSTER]);

const kb = async (f) => Math.round((await stat(f)).size / 1024);
const total = SHOTS.reduce((a, s) => a + s.dur, 0) - XFADE * (SHOTS.length - 1);
console.log(`hero-loop.mp4     ${W}x${H}  ${total.toFixed(1)}s  ${await kb(OUT)}kb`);
console.log(`hero-loop-sm.mp4  ${SMALL_W}x${SMALL_H}  ${await kb(OUT_SMALL)}kb`);
console.log(`hero.jpg          ${await kb(POSTER)}kb (eerste frame van de loop)`);
