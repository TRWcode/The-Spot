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
 * 1600, not the source's 1920.
 *
 * The hero is one continuously moving, heavily scrimmed surface — the least
 * detail-critical pixel on the site. 1920x1080 for eighteen seconds came to
 * well over four megabytes, which is the whole page budget spent on the
 * background of the first screen. 1600 is still above the CSS width of every
 * laptop it will play on.
 */
const W = 1600;
const H = Math.round((W * 9) / 16 / 2) * 2; // 900

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
   * 30, which is high for a hero and deliberate.
   *
   * Eighteen seconds of hard cuts, concert lighting and a drone pass is
   * expensive footage: at the usual 25 this file came out at 6MB. Compared
   * side by side at 1:1 against 1440/crf28, this is indistinguishable — on a
   * surface that is always moving and sits under a heavy scrim, the pixels
   * buy more than the bitrate does. It lands at ~3.4MB, which is where the
   * old (shorter) hero sat per second of footage.
   */
  "-crf", "30",
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
 *   704px               below any phone's 3x DPR, but this sits behind a heavy
 *                       scrim and moves constantly — nobody reads its detail
 *   fps 24              one frame in 25 nobody sees, ~4% off for free
 *
 * The ceiling is what actually binds here: at eighteen seconds it is the
 * difference between roughly half a megabyte and well over one.
 */
const SMALL_W = 704;
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
   * The ceiling, not the CRF, is what sets this file's size — and the film got
   * half again as long when the real intro replaced the stand-in reel. At 200k
   * it came to 449KB and cost the homepage five Lighthouse points, because on
   * a throttled phone it is downloading in the same window as the LCP. 150k
   * brings it back to roughly what the shorter loop used to weigh. It is a
   * 704px surface under a heavy scrim that never stops moving; the difference
   * is not visible, the half second is.
   */
  "-crf", "32",
  "-maxrate", "150k",
  "-bufsize", "300k",
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
