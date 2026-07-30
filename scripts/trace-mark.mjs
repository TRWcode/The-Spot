/**
 * Rebuilds the S-mark as true vector geometry from the supplied logo files.
 *
 * The three files in brand-source/ are Canva exports: each shape is a 1024px
 * greyscale mask over a raster gradient fill, ~540KB apiece. Shipping those as
 * the site logo means a half-megabyte header that goes soft when scaled.
 *
 * This traces the masks (marching squares at sub-pixel precision, corner split,
 * Schneider cubic fit) and reads the gradient direction and stops straight off
 * the fill rasters, so the output is the same drawing — not a redraw — as a few
 * hundred bytes of path data.
 *
 * Run: node scripts/trace-mark.mjs
 * Writes: public/brand/the-spot-mark.svg + components/brand/mark-geometry.ts
 */

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "brand-source/Icoon.svg");

/* ------------------------------------------------------------------ input */

/** Pulls the embedded rasters and the placement matrices out of the export. */
function parseCanvaSvg(svg) {
  const images = [...svg.matchAll(/xlink:href="data:image\/png;base64,([^"]+)"/g)].map((m) =>
    Buffer.from(m[1], "base64"),
  );
  const matrices = [...svg.matchAll(/matrix\(([-\d.,\s]+)\)/g)].map((m) =>
    m[1].split(",").map((n) => Number(n.trim())),
  );
  // Canva emits each layer twice — once inside <defs> for the mask, once in the
  // body for the fill — so odd/even split the two halves apart.
  return {
    masks: [images[0], images[1], images[2]],
    fills: [images[3], images[4], images[5]],
    // Same reason: the first three matrices are the mask copies of the last three.
    placements: matrices.slice(3),
  };
}

async function toGray(buf) {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

/* --------------------------------------------------------------- contours */

/**
 * Marching squares with linear interpolation along the crossing edge, so the
 * contour lands on the antialiased 50% line rather than on pixel corners.
 */
function contours({ data, w, h }, iso = 128) {
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[y * w + x]);
  const cross = (a, b) => (iso - a) / (b - a);
  const segs = [];

  for (let y = -1; y < h; y++) {
    for (let x = -1; x < w; x++) {
      const tl = at(x, y);
      const tr = at(x + 1, y);
      const br = at(x + 1, y + 1);
      const bl = at(x, y + 1);
      const code = (tl >= iso ? 8 : 0) | (tr >= iso ? 4 : 0) | (br >= iso ? 2 : 0) | (bl >= iso ? 1 : 0);
      if (code === 0 || code === 15) continue;

      // Cell corners sit at pixel centres, hence the +0.5.
      const cx = x + 0.5;
      const cy = y + 0.5;
      const top = [cx + cross(tl, tr), cy];
      const right = [cx + 1, cy + cross(tr, br)];
      const bottom = [cx + cross(bl, br), cy + 1];
      const left = [cx, cy + cross(tl, bl)];

      // Segments run so the filled side is on the left, keeping every contour
      // consistently wound before any of them is compared or rotated.
      const push = (a, b) => segs.push([a, b]);
      switch (code) {
        case 1: push(bottom, left); break;
        case 2: push(right, bottom); break;
        case 3: push(right, left); break;
        case 4: push(top, right); break;
        case 5: push(top, left); push(bottom, right); break;
        case 6: push(top, bottom); break;
        case 7: push(top, left); break;
        case 8: push(left, top); break;
        case 9: push(bottom, top); break;
        case 10: push(left, bottom); push(right, top); break;
        case 11: push(right, top); break;
        case 12: push(left, right); break;
        case 13: push(bottom, right); break;
        case 14: push(left, bottom); break;
      }
    }
  }

  // Chain segments head-to-tail into closed rings.
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const byStart = new Map();
  for (const s of segs) {
    const k = key(s[0]);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(s);
  }

  const used = new Set();
  const rings = [];
  for (const seg of segs) {
    if (used.has(seg)) continue;
    const ring = [seg[0]];
    let cur = seg;
    while (cur && !used.has(cur)) {
      used.add(cur);
      ring.push(cur[1]);
      const next = (byStart.get(key(cur[1])) ?? []).find((s) => !used.has(s));
      cur = next;
    }
    if (ring.length > 8) rings.push(ring);
  }
  return rings.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a)));
}

function area(ring) {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) a += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  return a / 2;
}

/* ------------------------------------------------------------ curve fitting */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const norm = (a) => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};

/**
 * Corners are where the shape genuinely breaks — the flat cut on the tip, the
 * points of the play triangle. Fitting a curve across one rounds it off, so
 * they are found first and every span between them is fitted independently.
 */
function findCorners(pts, span, maxCos) {
  const n = pts.length;
  const score = new Array(n).fill(1);
  for (let i = 0; i < n; i++) {
    const a = norm(sub(pts[(i - span + n * 2) % n], pts[i]));
    const b = norm(sub(pts[(i + span) % n], pts[i]));
    score[i] = dot(a, b); // -1 straight through, → 1 as the turn tightens
  }
  const corners = [];
  for (let i = 0; i < n; i++) {
    if (score[i] < maxCos) continue;
    // Keep only the sharpest point of each cluster.
    let best = true;
    for (let d = -span; d <= span; d++) {
      if (score[(i + d + n * 2) % n] > score[i]) best = false;
    }
    if (best) corners.push(i);
  }
  return corners;
}

/** Chord-length parameterisation — good enough as a seed for Newton refinement. */
function chordParams(pts) {
  const u = [0];
  for (let i = 1; i < pts.length; i++) u.push(u[i - 1] + len(sub(pts[i], pts[i - 1])));
  const total = u[u.length - 1] || 1;
  return u.map((v) => v / total);
}

function bezier(cp, t) {
  const mt = 1 - t;
  return add(
    add(mul(cp[0], mt * mt * mt), mul(cp[1], 3 * mt * mt * t)),
    add(mul(cp[2], 3 * mt * t * t), mul(cp[3], t * t * t)),
  );
}

/** Least-squares control points for fixed endpoints and tangents (Schneider). */
function fitBezier(pts, u, t1, t2) {
  const first = pts[0];
  const last = pts[pts.length - 1];
  let c00 = 0, c01 = 0, c11 = 0, x0 = 0, x1 = 0;

  for (let i = 0; i < pts.length; i++) {
    const t = u[i];
    const mt = 1 - t;
    const a1 = mul(t1, 3 * mt * mt * t);
    const a2 = mul(t2, 3 * mt * t * t);
    c00 += dot(a1, a1);
    c01 += dot(a1, a2);
    c11 += dot(a2, a2);
    const base = add(mul(first, mt * mt * mt + 3 * mt * mt * t), mul(last, 3 * mt * t * t + t * t * t));
    const tmp = sub(pts[i], base);
    x0 += dot(a1, tmp);
    x1 += dot(a2, tmp);
  }

  const det = c00 * c11 - c01 * c01;
  let alpha1 = det === 0 ? 0 : (x0 * c11 - x1 * c01) / det;
  let alpha2 = det === 0 ? 0 : (c00 * x1 - c01 * x0) / det;

  // Degenerate solve → fall back to Wu/Barsky's heuristic thirds.
  const segLen = len(sub(last, first));
  if (alpha1 < 1e-6 || alpha2 < 1e-6) {
    alpha1 = alpha2 = segLen / 3;
  }
  return [first, add(first, mul(t1, alpha1)), add(last, mul(t2, alpha2)), last];
}

function maxError(pts, u, cp) {
  let max = 0;
  let at = Math.floor(pts.length / 2);
  for (let i = 0; i < pts.length; i++) {
    const d = len(sub(bezier(cp, u[i]), pts[i]));
    if (d > max) {
      max = d;
      at = i;
    }
  }
  return { max, at };
}

function reparam(pts, u, cp) {
  return u.map((t, i) => {
    const d1 = add(
      add(mul(sub(cp[1], cp[0]), 3 * (1 - t) * (1 - t)), mul(sub(cp[2], cp[1]), 6 * (1 - t) * t)),
      mul(sub(cp[3], cp[2]), 3 * t * t),
    );
    const d2 = add(mul(sub(add(cp[2], mul(cp[1], -2)), mul(cp[0], -1)), 6 * (1 - t)), mul(add(sub(cp[3], mul(cp[2], 2)), cp[1]), 6 * t));
    const diff = sub(bezier(cp, t), pts[i]);
    const denom = dot(d1, d1) + dot(diff, d2);
    return denom === 0 ? t : Math.min(1, Math.max(0, t - dot(diff, d1) / denom));
  });
}

/** Recursive fit: split at the worst point until every span is within tol. */
function fitCubic(pts, t1, t2, tol, depth = 0) {
  if (pts.length < 3) return [[pts[0], pts[0], pts[pts.length - 1], pts[pts.length - 1]]];

  let u = chordParams(pts);
  let cp = fitBezier(pts, u, t1, t2);
  let { max, at } = maxError(pts, u, cp);

  for (let i = 0; i < 12 && max > tol; i++) {
    u = reparam(pts, u, cp);
    cp = fitBezier(pts, u, t1, t2);
    ({ max, at } = maxError(pts, u, cp));
  }
  if (max <= tol || depth > 24) return [cp];

  if (at <= 0) at = 1;
  if (at >= pts.length - 1) at = pts.length - 2;
  const tCenter = norm(sub(pts[at - 1], pts[at + 1]));
  return [
    ...fitCubic(pts.slice(0, at + 1), t1, tCenter, tol, depth + 1),
    ...fitCubic(pts.slice(at), mul(tCenter, -1), t2, tol, depth + 1),
  ];
}

/** Whole closed ring → list of cubic segments, split at detected corners. */
function fitRing(ring, { tol, cornerSpan, cornerCos, tangentSpan }) {
  const pts = ring.slice(0, -1); // drop the repeated closing point
  const n = pts.length;
  let corners = findCorners(pts, cornerSpan, cornerCos);
  if (corners.length === 0) corners = [0];

  const tangentAt = (i, dir) => {
    // Averaged over a few samples so a single jagged pixel cannot swing it.
    let acc = [0, 0];
    for (let k = 1; k <= tangentSpan; k++) {
      acc = add(acc, norm(sub(pts[(i + dir * k + n * 4) % n], pts[i])));
    }
    return norm(acc);
  };

  const out = [];
  for (let c = 0; c < corners.length; c++) {
    const start = corners[c];
    const end = corners[(c + 1) % corners.length];
    // A single corner means the span is the whole ring, so the walk has to be
    // allowed to leave the start before it can arrive back at it.
    const span = [pts[start]];
    for (let i = (start + 1) % n; ; i = (i + 1) % n) {
      span.push(pts[i]);
      if (i === end) break;
    }
    if (span.length < 3) {
      out.push([span[0], span[0], span[span.length - 1], span[span.length - 1]]);
      continue;
    }
    out.push(...fitCubic(span, tangentAt(start, 1), tangentAt(end, -1), tol));
  }
  return out;
}

/* ----------------------------------------------------------------- output */

function toPath(segments, transform, round) {
  const p = (pt) => {
    const [x, y] = transform(pt);
    return `${+x.toFixed(round)} ${+y.toFixed(round)}`;
  };
  let d = "";
  segments.forEach((cp, i) => {
    if (i === 0) d += `M${p(cp[0])}`;
    // Collapsed handles mean the fit produced a straight run — emit it as one.
    const straight = len(sub(cp[1], cp[0])) < 0.01 && len(sub(cp[2], cp[3])) < 0.01;
    d += straight ? `L${p(cp[3])}` : `C${p(cp[1])} ${p(cp[2])} ${p(cp[3])}`;
  });
  return d + "Z";
}

/**
 * Reads the gradient off the fill raster instead of guessing it: fits the axis
 * along which colour varies, then samples stops along that axis.
 */
async function readGradient(fillBuf, maskBuf) {
  const fill = await sharp(fillBuf).raw().toBuffer({ resolveWithObject: true });
  const mask = await toGray(maskBuf);
  const { data, info } = fill;
  const ch = info.channels;

  const inside = [];
  for (let y = 0; y < info.height; y += 2) {
    for (let x = 0; x < info.width; x += 2) {
      if (mask.data[y * mask.w + x] < 250) continue;
      const i = (y * info.width + x) * ch;
      inside.push({ x, y, r: data[i], g: data[i + 1], b: data[i + 2] });
    }
  }

  // The axis is whichever direction maximises colour spread; a coarse sweep is
  // plenty since the source is a plain linear gradient.
  let best = { spread: -1 };
  for (let deg = 0; deg < 180; deg += 1) {
    const a = (deg * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let minT = Infinity, maxT = -Infinity, cMin = null, cMax = null;
    for (const p of inside) {
      const t = p.x * ux + p.y * uy;
      if (t < minT) { minT = t; cMin = p; }
      if (t > maxT) { maxT = t; cMax = p; }
    }
    const spread = Math.hypot(cMax.r - cMin.r, cMax.g - cMin.g, cMax.b - cMin.b) / (maxT - minT || 1);
    if (spread > best.spread) best = { spread, deg, ux, uy, minT, maxT };
  }

  const { ux, uy, minT, maxT } = best;
  const bucket = new Map();
  for (const p of inside) {
    const t = Math.round((((p.x * ux + p.y * uy) - minT) / (maxT - minT)) * 20);
    if (!bucket.has(t)) bucket.set(t, []);
    bucket.get(t).push(p);
  }
  const stops = [...bucket.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, ps]) => {
      const avg = (k) => Math.round(ps.reduce((s, p) => s + p[k], 0) / ps.length);
      return { offset: t / 20, hex: `#${[avg("r"), avg("g"), avg("b")].map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase() };
    });

  return {
    angle: best.deg,
    x1: ux * minT, y1: uy * minT,
    x2: ux * maxT, y2: uy * maxT,
    stops,
  };
}

/* ------------------------------------------------------------------- main */

const svg = fs.readFileSync(SRC, "utf8");
const { masks, fills, placements } = parseCanvaSvg(svg);

// Canva places every layer with matrix(s,0,0,s,tx,ty); the third is negative,
// i.e. the same swoosh rotated 180deg. Verified by hashing: mask 0 === mask 2.
const place = (m) => ([x, y]) => [m[0] * x + m[4], m[3] * y + m[5]];

const swooshRings = contours(await toGray(masks[0]));
const playRings = contours(await toGray(masks[1]));
console.log(`contours — swoosh: ${swooshRings.length}, play: ${playRings.length}`);

const swooshFit = fitRing(swooshRings[0], { tol: 0.8, cornerSpan: 14, cornerCos: -0.3, tangentSpan: 4 });
const playFit = fitRing(playRings[0], { tol: 0.8, cornerSpan: 14, cornerCos: -0.3, tangentSpan: 4 });
console.log(`segments — swoosh: ${swooshFit.length}, play: ${playFit.length}`);

// Everything is expressed in the 1500-unit space of the export first, so the
// two swoosh copies and the triangle keep their exact relative placement.
const rawSwoosh = swooshFit.map((cp) => cp.map(place(placements[0])));
const rawPlay = playFit.map((cp) => cp.map(place(placements[1])));
const rawSwooshB = swooshFit.map((cp) => cp.map(place(placements[2])));

const all = [...rawSwoosh, ...rawPlay, ...rawSwooshB].flat();
const minX = Math.min(...all.map((p) => p[0]));
const maxX = Math.max(...all.map((p) => p[0]));
const minY = Math.min(...all.map((p) => p[1]));
const maxY = Math.max(...all.map((p) => p[1]));

// Normalise into a 0–100 box sized by the wider axis, centred on the other, so
// the mark is centred in a square viewBox with no baked-in padding.
const size = Math.max(maxX - minX, maxY - minY);
const scale = 100 / size;
const offX = (size - (maxX - minX)) / 2;
const offY = (size - (maxY - minY)) / 2;
const T = ([x, y]) => [(x - minX + offX) * scale, (y - minY + offY) * scale];

const dSwoosh = toPath(rawSwoosh, T, 2);
const dPlay = toPath(rawPlay, T, 2);
const dSwooshB = toPath(rawSwooshB, T, 2);

// The play triangle doubles as the standalone play glyph (cursor, poster
// buttons), so its own bounds are exported: cropping to them keeps that glyph
// literally the same shape as the one inside the logo, at any size.
const playPts = rawPlay.flat().map(T);
const pad = 6;
const pBox = {
  x: Math.min(...playPts.map((p) => p[0])) - pad,
  y: Math.min(...playPts.map((p) => p[1])) - pad,
};
pBox.w = Math.max(...playPts.map((p) => p[0])) + pad - pBox.x;
pBox.h = Math.max(...playPts.map((p) => p[1])) + pad - pBox.y;
const playViewBox = [pBox.x, pBox.y, pBox.w, pBox.h].map((n) => +n.toFixed(2)).join(" ");

const gSwoosh = await readGradient(fills[0], masks[0]);
const gPlay = await readGradient(fills[1], masks[1]);
console.log("gradient stops — swoosh:", gSwoosh.stops.map((s) => s.hex).join(" "));
console.log("gradient stops — play:", gPlay.stops.map((s) => s.hex).join(" "));

// Gradient endpoints ride along with their layer into the normalised box.
const gLine = (g, m) => {
  const [x1, y1] = T(place(m)([g.x1, g.y1]));
  const [x2, y2] = T(place(m)([g.x2, g.y2]));
  return { x1: +x1.toFixed(2), y1: +y1.toFixed(2), x2: +x2.toFixed(2), y2: +y2.toFixed(2) };
};
const lineSwoosh = gLine(gSwoosh, placements[0]);
const linePlay = gLine(gPlay, placements[1]);
const lineSwooshB = gLine(gSwoosh, placements[2]);

const pick = (stops, offsets) =>
  offsets.map((o) => {
    const s = stops.reduce((a, b) => (Math.abs(b.offset - o) < Math.abs(a.offset - o) ? b : a));
    return { offset: o, hex: s.hex };
  });
const stopsSwoosh = pick(gSwoosh.stops, [0, 0.25, 0.5, 0.75, 1]);
const stopsPlay = pick(gPlay.stops, [0, 0.5, 1]);

const stopTags = (stops) => stops.map((s) => `      <stop offset="${s.offset}" stop-color="${s.hex}"/>`).join("\n");
const gradTag = (id, line, stops) =>
  `    <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}">\n${stopTags(stops)}\n    </linearGradient>`;

const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="1000" height="1000">
  <title>The SPOT</title>
  <defs>
${gradTag("a", lineSwoosh, stopsSwoosh)}
${gradTag("b", lineSwooshB, stopsSwoosh)}
${gradTag("c", linePlay, stopsPlay)}
  </defs>
  <path d="${dSwoosh}" fill="url(#a)"/>
  <path d="${dSwooshB}" fill="url(#b)"/>
  <path d="${dPlay}" fill="url(#c)"/>
</svg>
`;

fs.writeFileSync(path.join(ROOT, "public/brand/the-spot-mark.svg"), out);

const ts = `/**
 * Generated by scripts/trace-mark.mjs — do not hand-edit.
 *
 * Traced from brand-source/Icoon.svg (the supplied logo). Coordinates live in a
 * 0-100 viewBox. The two swoosh paths are the same shape 180deg apart, which is
 * what lets the mark spin without wobbling.
 */

export const MARK = {
  swooshA: "${dSwoosh}",
  swooshB: "${dSwooshB}",
  play: "${dPlay}",
  /** Crop for the play triangle on its own, so the glyph is never redrawn. */
  playViewBox: "${playViewBox}",
  gradient: {
    swooshA: ${JSON.stringify(lineSwoosh)},
    swooshB: ${JSON.stringify(lineSwooshB)},
    play: ${JSON.stringify(linePlay)},
    swooshStops: ${JSON.stringify(stopsSwoosh)},
    playStops: ${JSON.stringify(stopsPlay)},
  },
} as const;
`;
fs.writeFileSync(path.join(ROOT, "components/brand/mark-geometry.ts"), ts);

/* --------------------------------------------------------------- validate */

// The export carries padding inside its 1500 box and the trace does not, so
// both are trimmed to their own ink before being compared at the same size.
const render = async (buf, name) => {
  const flat = await sharp(buf)
    .resize(1400, 1400, { fit: "inside" })
    .trim({ threshold: 1 })
    .resize(512, 512, { fit: "fill" })
    .png()
    .toBuffer();
  if (name) fs.writeFileSync(path.join(ROOT, ".tmp-logo", name), flat);
  return sharp(flat).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
};

const a = await render(fs.readFileSync(SRC), "verify-original.png");
const b = await render(Buffer.from(out), "verify-traced.png");
let diff = 0;
let ink = 0;
for (let i = 0; i < a.data.length; i += a.info.channels) {
  const alphaA = a.data[i + a.info.channels - 1];
  const alphaB = b.data[i + b.info.channels - 1];
  if (alphaA > 128) ink++;
  if (Math.abs(alphaA - alphaB) > 100) diff++;
}
console.log(`\ncoverage mismatch: ${diff} px of ${ink} inked (${((diff / ink) * 100).toFixed(2)}%)`);
console.log(`svg size: ${(out.length / 1024).toFixed(1)}KB (was ${(svg.length / 1024).toFixed(0)}KB)`);
