/**
 * Encodes the hero's ambient loop for the web.
 *
 *   node scripts/make-hero-loop.mjs
 *
 * The source is the studio's own intro film — already cut, graded and timed by
 * the people whose work it advertises. This script deliberately does not touch
 * the edit: no montage, no re-crop, no dissolves. It transcodes, sizes and
 * budgets, and that is all. (It used to assemble a stand-in reel out of two
 * client films because no intro existed yet; that job is over.)
 *
 * Why not ship the .webm as-is: it is VP9, which Safari only decodes on recent
 * hardware and iOS did not support at all until 14.5 — a hero that is a black
 * rectangle on an iPhone is worse than no hero. H.264 plays everywhere.
 *
 * The framing is left at the source's 16:9. The hero is a full-bleed
 * `object-fit: cover` surface, so anything wider than the viewport gets cropped
 * at the sides — the old 21:9 cut threw away a third of a 16:9 phone screen.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat, mkdir } from "node:fs/promises";

const run = promisify(execFile);

const SRC = "assets-inbox/video/gBvfiz8kp8qh3wHtyTLIZKMHyo.webm";

const OUT = "public/media/clips/hero-loop.mp4";
const OUT_SMALL = "public/media/clips/hero-loop-sm.mp4";
const POSTER = "public/media/posters/hero.jpg";

/**
 * The master's own 1920, not a downscale.
 *
 * This ran at 1600 to save weight, on the reasoning that the hero is a moving,
 * heavily scrimmed surface where detail matters least. That is true of most of
 * the film and wrong about the shots that sell it: the showroom, the dashboard
 * and the drone pass carry fine detail, and at 1:1 the native encode is
 * visibly crisper than a 1600 cut enlarged back to the same size. It is the
 * first thing a visitor sees and the only proof on the page that this studio
 * can shoot — so it gets the resolution it was delivered in.
 */
const W = 1920;
const H = Math.round((W * 9) / 16 / 2) * 2; // 1080

await mkdir("public/media/clips", { recursive: true });

await run("ffmpeg", [
  "-y",
  "-i", SRC,
  "-vf", `scale=${W}:${H}:flags=lanczos,format=yuv420p,setsar=1`,
  "-an",                                   // a loop is always muted
  "-c:v", "libx264",
  "-profile:v", "high",
  "-pix_fmt", "yuv420p",                   // the one Safari will decode
  /**
   * 28 at full resolution, measured against the alternatives.
   *
   * Eighteen seconds of hard cuts, concert lighting and a drone pass is
   * expensive footage. The options that land in the same weight class are
   * 1920/crf28 at 5.8MB and 1600/crf26 at 5.4MB; compared at 1:1 the native
   * encode holds number plates, print on a door and reflections that the
   * upscaled 1600 loses. Going further (1920/crf26) costs another 1.4MB for a
   * difference that does not survive the scrim.
   *
   * Phones never see this file — they get the cut below.
   */
  "-crf", "28",
  // The cuts in this edit are hard and frequent; scene detection puts a
  // keyframe on each one instead of predicting the first frames of a new shot
  // from the last frames of an unrelated one.
  "-sc_threshold", "40",
  "-g", "48",
  "-preset", "slow",
  "-tune", "film",
  "-movflags", "+faststart",               // playable before it finishes
  OUT,
]);

/**
 * A phone gets a much smaller file — the desktop cut is most of the page
 * weight and rude to send over cellular for decoration.
 *
 *   -maxrate/-bufsize   a hard ceiling, because CRF alone lets a busy shot
 *                       (the concert, the parade) spike well past the average
 *   832px               below any phone's 3x DPR, but this sits behind a heavy
 *                       scrim and moves constantly. It was 704; the hero is the
 *                       one thing on the page that has to look expensive, and
 *                       this is the cheapest place to buy that back.
 *   fps 24              one frame in 25 nobody sees, ~4% off for free
 *
 * The ceiling is what actually binds here: at eighteen seconds it is the
 * difference between roughly half a megabyte and well over one.
 */
const SMALL_W = 832;
const SMALL_H = Math.round((SMALL_W * 9) / 16 / 2) * 2;
await run("ffmpeg", [
  "-y",
  "-i", OUT,
  "-vf", `scale=${SMALL_W}:${SMALL_H}:flags=lanczos,fps=24`,
  "-an",
  "-c:v", "libx264",
  "-profile:v", "high",
  "-pix_fmt", "yuv420p",
  /**
   * The ceiling, not the CRF, is what sets this file's size.
   *
   * It went 200k, then down to 150k on the suspicion that it was costing the
   * homepage Lighthouse points. Measuring killed that suspicion: dropping
   * 109KB moved the LCP not at all, because the LCP here is the hero's own
   * load animation finishing, not this file arriving. So the ceiling went back
   * up — 220k buys a visibly cleaner picture on a phone for bytes that were
   * not paying for speed anyway.
   */
  "-crf", "30",
  "-maxrate", "220k",
  "-bufsize", "440k",
  "-preset", "slow",
  "-movflags", "+faststart",
  OUT_SMALL,
]);

/**
 * Poster = the loop's own first frame, so there is no jump when it starts.
 *
 * Taken a third of a second in rather than at 0: this edit opens on a fade
 * from black, and frame one is a poster of nothing at all.
 */
await run("ffmpeg", ["-y", "-ss", "0.35", "-i", OUT, "-frames:v", "1", "-q:v", "3", POSTER]);

const kb = async (f) => Math.round((await stat(f)).size / 1024);
const dur = async (f) => {
  const { stdout } = await run("ffprobe", [
    "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f,
  ]);
  return Number(stdout).toFixed(1);
};

console.log(`hero-loop.mp4     ${W}x${H}  ${await dur(OUT)}s  ${await kb(OUT)}kb`);
console.log(`hero-loop-sm.mp4  ${SMALL_W}x${SMALL_H}  ${await kb(OUT_SMALL)}kb`);
console.log(`hero.jpg          ${await kb(POSTER)}kb`);
