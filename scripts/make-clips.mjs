/**
 * Turns full exports into web-ready hover loops + poster frames.
 *
 *   node scripts/make-clips.mjs                     # process everything
 *   node scripts/make-clips.mjs clok                # just one
 *
 * Drop full-quality exports in assets-inbox/video/ named after the case slug
 * (clok.mp4, khione-cold-therapy.mov, …). Length does not matter — the CLIPS
 * table below decides which seconds get used.
 *
 * A tile loop is a montage, not a fragment. One continuous window out of a
 * finished film is almost always eight seconds of the same shot, which on a
 * tile reads as a frozen picture with something twitching in it. Cutting three
 * or four short shots together gives the loop a wide/close/detail rhythm, and
 * that rhythm is the thing that makes a small silent rectangle feel alive.
 *
 * Why not a plain "convert to mp4":
 *   -pix_fmt yuv420p   cameras and editors often export 4:2:2 or 4:4:4, which
 *                      Safari and iOS refuse to decode at all. Silent failure.
 *   -movflags faststart  puts the index at the front so playback can start
 *                      before the file finishes downloading.
 *   -an                a loop is always muted, so the audio track is dead
 *                      weight on every tile that loads it.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const run = promisify(execFile);

const IN = "assets-inbox/video";
const OUT_CLIPS = "public/media/clips";
const OUT_POSTERS = "public/media/posters";

/**
 * slug -> { shots, frame, target, cropBottom?, posterAt? }
 *
 * `shots` is a list of { at, len } in source seconds, cut together in the order
 * given. They were picked off scene-detection plus a per-second contact sheet,
 * not guessed: every boundary below sits inside one detected shot, so no
 * segment carries a cut of the original edit in the middle of it.
 *
 * A shot may carry its own `grade` (any ffmpeg filter string). That is for
 * exposure only — a montage is cut from moments that were lit for different
 * purposes, and one of them landing three stops under the others is a hole in
 * the grid, not a mood. Grading the whole clip instead would wash out the
 * shots that were already correct.
 *
 * `frame` is the tile's aspect ratio from lib/content, and it MUST match —
 * these two numbers are one decision in two files. Encoding to the tile's shape
 * instead of the source's is worth real quality on the weak sources: a 640x360
 * film in a 5/4 tile had 30% of every encoded frame cropped away by the browser,
 * so a third of the bitrate was being spent on pixels nobody sees.
 *
 * `target` is the width the tile actually gets on a retina screen. See
 * outputSize() for why that number, and not the source width, is the ceiling.
 *
 * `cropBottom` is a fraction of frame height to cut away. These films carry
 * burned-in subtitles along the lower edge, which are meaningless in a muted
 * loop and just add noise at tile size.
 *
 * `posterAt` is a second on the FINISHED loop's timeline — the poster is cut
 * from the encoded clip, so it is by definition a frame the loop really shows.
 */
const CLIPS = {
  clok: {
    frame: 16 / 9,
    target: 1280,
    // 1080p and already full of motion: the champagne tower pouring into the
    // crowd toast carries eight seconds on its own without a cut.
    shots: [{ at: 117, len: 8 }],
    posterAt: 4,
  },

  "kinderfysio-haarlem": {
    frame: 16 / 9,
    target: 1280,
    cropBottom: 0.19,
    // Ball throw into treatment-room footage; subtitles run almost throughout.
    shots: [{ at: 31, len: 8 }],
    posterAt: 4,
  },

  /**
   * Khione is a 480p instructional export — mostly a hand and a coupling
   * against black, which is why one window of it read as a single still. The
   * variety is there, it is just spread across the film, so the loop goes and
   * collects it: product, water, texture, hands.
   *
   * Opens on the wide setup on purpose. It is the brightest thing in the film,
   * and this tile sits next to three daylit ones — leading on the dark water
   * shot made the whole grid look like it had a hole in it.
   *
   * TODO: ask for the master export, this is the ceiling on a 0.4Mbit source.
   */
  "khione-cold-therapy": {
    frame: 5 / 4,
    target: 1000,
    shots: [
      // Wide: pump, controller and hoses on white — the product, all of it.
      { at: 118.0, len: 2.0 },
      /**
       * Water arcing into the tub. The only real movement in the film, and it
       * was shot for a black tub against a black wall — ungraded it is two
       * seconds of near-black next to three daylit tiles, which reads as the
       * tile having failed to load. Gamma alone lifts the midtones so the tub
       * wall exists; the contrast bump puts the black point back, because a
       * lift on its own turns the shot grey and grey is worse than dark.
       */
      { at: 98.4, len: 2.0, grade: "eq=gamma=1.28:contrast=1.08:saturation=1.05" },
      // Macro: ribbed hose, water beading, warm rim light.
      { at: 110.0, len: 2.0, grade: "eq=gamma=1.15" },
      // Hands pushing the coupling into the green collar.
      { at: 84.4, len: 2.0 },
    ],
    posterAt: 0.9,
  },

  /**
   * Wadlopen. The film's problem is that two thirds of it is the same grey
   * horizon, and a single window lands in the middle of that stretch. These
   * four are the ones that are not: arrival, faces, scale, and a close moment.
   *
   * Re-cut against the 1080p50 "klant correctie" master (30-07-2026), which
   * replaced a 640x360 download. Two of the old timings fell across cuts in
   * this edit, so all four were re-picked off scene detection — do not carry
   * timestamps over from an older export by hand.
   *
   * `target` is above the tile's own 1000px on purpose: this clip is also the
   * case page's player, which runs to 1440 CSS px. At 1000 that page was
   * enlarging it 1.44x, which is exactly the softness the new master was
   * uploaded to fix; 1280 puts it back to a mild 1.13x, and the tile simply
   * downsamples further.
   */
  "de-groot-recreatie": {
    frame: 5 / 4,
    target: 1280,
    shots: [
      { at: 16.4, len: 2.0 }, // boarding the old red bus — arrival, and the only warm colour
      { at: 62.0, len: 2.0 }, // group laughing at the water's edge — faces, not backs
      { at: 65.3, len: 1.8 }, // wide: the party spread out across the Wad, with reflections
      { at: 96.95, len: 1.7 }, // close: finding something in the mud, hand to hand
    ],
    posterAt: 0.9,
  },

  // TODO: the VVD film is a static client greeting with subtitles and a VVD
  // endcard — wrong material for The SPOT's own hero. Awaiting a showreel.
  // hero: { frame: 16 / 9, target: 1600, shots: [{ at: 3, len: 8 }] },
};

/**
 * Files arrive named after their YouTube titles ("Aftermovie V4  CLOK 1.mp4"),
 * so match on a keyword rather than demanding an exact filename. Renaming by
 * hand is the kind of step that silently goes wrong.
 */
const MATCH = [
  [/clok/i, "clok"],
  [/kinderfysio/i, "kinderfysio-haarlem"],
  [/khione/i, "khione-cold-therapy"],
  [/groot/i, "de-groot-recreatie"],
  [/vvd|kerstgroet/i, "hero"],
];

const slugFor = (file) => MATCH.find(([re]) => re.test(file))?.[1] ?? null;

const only = process.argv[2];

async function ffprobe(file) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height,pix_fmt,r_frame_rate:format=duration",
    "-of", "json",
    file,
  ]);
  const j = JSON.parse(stdout);
  const [num, den] = String(j.streams?.[0]?.r_frame_rate ?? "25/1").split("/");
  return {
    width: j.streams?.[0]?.width,
    height: j.streams?.[0]?.height,
    pixFmt: j.streams?.[0]?.pix_fmt,
    fps: Number(num) / Number(den || 1),
    duration: Number(j.format?.duration ?? 0),
  };
}

/**
 * Output frame rate. High-frame-rate masters get halved — 50 to 25, 60 to 30.
 *
 * Exactly every other frame, so there is no resampling judder, and a muted
 * loop has no reason to carry twice the frames of every other clip in the
 * grid: it is double the bitrate and double the decode for motion smoothness
 * nobody reads at tile size. Anything at or under 30 is left alone, because
 * pulling 30 down to 25 *would* have to resample.
 */
const outputFps = (info) => (info.fps > 30 ? info.fps / 2 : null);

/** Even numbers only — H.264 refuses odd dimensions in yuv420p. */
const even = (n) => Math.max(2, Math.round(n / 2) * 2);

/** Anything at or under this is a download, not a master. */
const isWeak = (info) => info.width <= 960;

/**
 * The visible rectangle, in source pixels.
 *
 * Crop to the tile's aspect here rather than letting `object-fit: cover` do it
 * in the browser: same picture on screen, but every encoded pixel is one the
 * visitor actually sees, and the frame is resampled once instead of twice.
 */
function visible(info, cropBottom, frame) {
  const w = info.width;
  const h = Math.floor(info.height * (1 - (cropBottom ?? 0)));
  if (!frame) return { w: even(w), h: even(h), x: 0, y: 0 };

  // Fit the widest rectangle of `frame` that still lives inside the source.
  const byWidth = w / h > frame;
  const cw = even(byWidth ? h * frame : w);
  const ch = even(byWidth ? h : w / frame);
  return { w: cw, h: ch, x: Math.floor((w - cw) / 2), y: 0 };
}

/** How far past the source we are willing to enlarge before encoding. */
const MAX_UPSCALE = 1.6;

/**
 * Somebody has to enlarge these. The 5/4 tiles are about 490 CSS px wide, so on
 * a retina screen they are asking for roughly a thousand device pixels, and the
 * Khione and De Groot crops only carry 600 and 450. The choice is not "upscale
 * or don't" — it is "ffmpeg with lanczos, once, at build time, or the browser
 * with a cheap filter, on every visit".
 *
 * ffmpeg wins, but only up to a point: past ~1.6x it is inventing pixels and
 * charging bitrate for them, and a browser downscaling a clean 1.6x frame looks
 * better than either. So the ceiling is the smaller of the two.
 */
function outputSize(info, cfg) {
  const v = visible(info, cfg.cropBottom, cfg.frame);
  const w = even(Math.min(cfg.target, Math.round(v.w * MAX_UPSCALE)));
  const h = even(Math.round(w / (cfg.frame ?? v.w / v.h)));
  return { ...v, outW: w, outH: h, upscale: w / v.w };
}

/**
 * `hqdn3d` is here for one reason: these are 0.4–0.5 Mbit downloads, not
 * masters. Their mosquito noise around edges is not detail — it is the previous
 * encoder's damage, and re-encoding it costs bitrate that would otherwise go to
 * the picture. Denoising first is what makes the weak sources read as *soft*
 * rather than as *broken*, which is the whole difference at tile size.
 *
 * `gradfun` is for Khione specifically: half that film is a dark gradient on a
 * black tub, and an 8-bit 480p encode of that is stepped into visible rings.
 * Dithering them out costs nothing and is the single biggest visible win there.
 *
 * `unsharp` runs *after* the enlargement, never before — sharpening first would
 * just enlarge the sharpened block edges along with everything else.
 */
function filterChain(info, cfg, shot) {
  const s = outputSize(info, cfg);
  const weak = isWeak(info);

  const steps = [];
  if (cfg.cropBottom) steps.push(`crop=iw:ih*${(1 - cfg.cropBottom).toFixed(3)}:0:0`);
  steps.push(`crop=${s.w}:${s.h}:${s.x}:${s.y}`);
  steps.push(weak ? "hqdn3d=2:1.5:8:8" : "hqdn3d=0.8:0.8:4:4");
  // Exposure before the banding pass, so gradfun dithers the levels that end up
  // on screen. Lifting a black tub afterwards would just pull the rings back up
  // with it.
  if (shot.grade) steps.push(shot.grade);
  if (weak) steps.push("gradfun=3.5:16");
  if (s.outW !== s.w) steps.push(`scale=${s.outW}:${s.outH}:flags=lanczos`);
  if (weak) steps.push("unsharp=3:3:0.55:3:3:0");
  const fps = outputFps(info);
  if (fps) steps.push(`fps=${fps}`);
  steps.push("setsar=1");
  return steps.join(",");
}

/**
 * One ffmpeg pass, one encode. The source is opened once per shot with its own
 * `-ss`/`-t` (input seeking, so it is a jump and not a decode of everything
 * before it), each stream gets the identical filter chain, and `concat` welds
 * them. Cutting to intermediate files and joining afterwards would put a second
 * generation of compression on footage that cannot spare a first.
 *
 * Hard cuts, no crossfades: this is a production company's own grid, and an
 * edit that cuts is the thing being advertised. A dissolve between two
 * unrelated shots reads as a slideshow.
 */
async function makeClip(src, slug, cfg, info) {
  const out = path.join(OUT_CLIPS, `${slug}.mp4`);

  const args = ["-y"];
  for (const { at, len } of cfg.shots) {
    args.push("-ss", String(at), "-t", String(len), "-i", src);
  }

  const labels = cfg.shots.map((_, i) => `[v${i}]`);
  const graph =
    cfg.shots.map((shot, i) => `[${i}:v]${filterChain(info, cfg, shot)}[v${i}]`).join(";") +
    `;${labels.join("")}concat=n=${cfg.shots.length}:v=1:a=0[out]`;

  /**
   * The weak sources used to get the *lower* CRF, on the reasoning that the
   * browser was about to enlarge whatever survived. It isn't any more — ffmpeg
   * hands it a frame that is already bigger than the tile, so the browser
   * shrinks it and every remaining artefact shrinks with it. Spending 21 there
   * now buys a two-megabyte file to protect detail that the denoiser has
   * already established isn't in the source.
   */
  const crf = isWeak(info) ? "23" : "24";

  args.push(
    "-filter_complex", graph,
    "-map", "[out]",
    "-an",                                  // no audio track at all
    "-c:v", "libx264",
    "-profile:v", "high",
    "-pix_fmt", "yuv420p",                  // the one that makes Safari work
    "-crf", crf,
    // Keeps texture instead of smearing it flat — the default psy settings are
    // tuned for PSNR, which on footage this soft means "blur it until it scores".
    "-tune", "film",
    "-preset", "slow",
    // A cut every two seconds needs a keyframe on it, or the first frames of
    // each shot are predicted from the last frames of a completely different
    // one and break up visibly. Scene detection at 25fps costs nothing here.
    "-sc_threshold", "40",
    "-g", "50",
    "-movflags", "+faststart",
    out,
  );

  await run("ffmpeg", args);
  return out;
}

/**
 * Cut straight out of the finished loop rather than re-derived from the source.
 *
 * The poster's only job is to be the frame that is already on screen when the
 * loop starts, so taking it from anywhere else is a chance for the picture to
 * jump. It also means the grade, the crop and the enlargement can never drift
 * apart between the two files — there is one filter chain, and the poster is
 * downstream of it.
 */
async function makePoster(clip, slug, cfg) {
  const out = path.join(OUT_POSTERS, `${slug}.jpg`);
  await run("ffmpeg", [
    "-y",
    "-ss", String(cfg.posterAt ?? 0.5),
    "-i", clip,
    "-frames:v", "1",
    "-q:v", "2",
    out,
  ]);
  return out;
}

const kb = async (f) => Math.round((await stat(f)).size / 1024);

await mkdir(OUT_CLIPS, { recursive: true });
await mkdir(OUT_POSTERS, { recursive: true });

let files = [];
try {
  files = await readdir(IN);
} catch {
  console.error(`Map ${IN} bestaat niet. Zet je exports daar neer.`);
  process.exit(1);
}

const videos = files.filter((f) => /\.(mp4|mov|m4v|mkv|avi|webm)$/i.test(f));
if (!videos.length) {
  console.error(`Geen videobestanden in ${IN}/.`);
  process.exit(1);
}

for (const file of videos) {
  const slug = slugFor(file);
  if (!slug) {
    console.log(`- ${file}: geen case herkend`);
    continue;
  }
  if (only && slug !== only) continue;

  const src = path.join(IN, file);
  const cfg = CLIPS[slug];
  if (!cfg) {
    console.log(`- ${slug.padEnd(22)} bewust overgeslagen (zie CLIPS)`);
    continue;
  }

  const info = await ffprobe(src);

  // A shot that runs off the end of the film encodes as black rather than
  // failing, so it has to be caught here or it ships.
  const overrun = cfg.shots.find(({ at, len }) => info.duration && at + len > info.duration);
  if (overrun) {
    console.log(
      `! ${slug}: shot op ${overrun.at}s valt buiten de bron (${info.duration.toFixed(1)}s)`,
    );
    continue;
  }

  const size = outputSize(info, cfg);
  const clip = await makeClip(src, slug, cfg, info);
  const poster = await makePoster(clip, slug, cfg);
  const total = cfg.shots.reduce((n, { len }) => n + len, 0);

  console.log(
    `+ ${slug.padEnd(22)} ${info.width}x${info.height} ${info.pixFmt} -> ` +
      `${size.outW}x${size.outH} (${size.upscale.toFixed(2)}x), ` +
      `${cfg.shots.length} shot(s) / ${total}s, ` +
      `clip ${await kb(clip)}kb, poster ${await kb(poster)}kb`,
  );
}

console.log("\nKlaar. Zet CLIPS_AVAILABLE in lib/video.ts op true om ze te tonen.");
