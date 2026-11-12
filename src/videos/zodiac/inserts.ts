// Picture inserts: full-frame storybook cutaways drawn in Canvas2D over the 3D stage, showing what a line is about
// on the word that names it (the 12 animals, the Jade Emperor's river race, the 60-year cycle). Same cartoon language
// as the cast: flat fills with a soft radial shade, plum ink outlines, no text anywhere. Design space 1080 x 1920.
import { Pen, bodyFront, Outfit } from "../bridge/toon";
import { T2, T3 } from "./story";
import { OUTFITS } from "./cast";

type G = CanvasRenderingContext2D;
export type Insert = { a: number; b: number; draw: (g: G, t: number) => void; frame?: boolean; full?: boolean };

const INK = "#241726", GOLD = "#f3c44e", RED = "#e03a3a", PINK = "#f3a6b5", WHITE = "#f7f3ee", NAVY = "#1d2260";
const LW = 6;

// ---------------- paint helpers ----------------
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const tone = (c: string, k: number) => {
  const v = rgb(c).map((x) => Math.round(k >= 0 ? x + (255 - x) * k : x * (1 + k)));
  return `rgb(${v[0]},${v[1]},${v[2]})`;
};
const shadeOf = (g: G, x: number, y: number, r: number, c: string) => {
  const gr = g.createRadialGradient(x - 0.35 * r, y - 0.4 * r, 0.1 * r, x, y, 1.15 * r);
  gr.addColorStop(0, tone(c, 0.2)); gr.addColorStop(0.55, c); gr.addColorStop(1, tone(c, -0.22));
  return gr;
};
const finish = (g: G, fill: string | CanvasGradient, lw = LW) => {
  g.fillStyle = fill; g.fill();
  if (lw > 0) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = "round"; g.stroke(); }
};
/** inked, shaded ellipse */
const el = (g: G, x: number, y: number, rx: number, ry: number, c: string, rot = 0, lw = LW) => {
  g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2);
  finish(g, shadeOf(g, x, y, Math.max(rx, ry), c), lw);
};
/** flat ellipse, no ink */
const fl = (g: G, x: number, y: number, rx: number, ry: number, c: string, rot = 0) => {
  g.beginPath(); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.fillStyle = c; g.fill();
};
const poly = (g: G, pts: number[][], c: string, lw = LW) => {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); finish(g, c, lw);
};
const line = (g: G, pts: number[][], w: number, c = INK) => {
  g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.lineWidth = w; g.strokeStyle = c; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
};
/** a coloured stroke with an ink edge (horns, whiskers, ribbons) */
const band = (g: G, pts: number[][], w: number, c: string) => { line(g, pts, w + 2 * LW, INK); line(g, pts, w, c); };
const eyes = (g: G, x: number, y: number, s: number, dx: number, dy: number, r = 0.085) => {
  for (const sd of [-1, 1]) fl(g, x + sd * dx * s, y + dy * s, r * s, r * 1.15 * s, INK);
};
const wideEyes = (g: G, x: number, y: number, s: number, dx: number, dy: number) => {
  for (const sd of [-1, 1]) { el(g, x + sd * dx * s, y + dy * s, 0.15 * s, 0.16 * s, "#ffffff", 0, 4); fl(g, x + sd * dx * s, y + dy * s, 0.065 * s, 0.075 * s, INK); }
};
const smile = (g: G, x: number, y: number, r: number, w: number) => { g.beginPath(); g.arc(x, y, r, 0.15 * Math.PI, 0.85 * Math.PI); g.lineWidth = w; g.strokeStyle = INK; g.lineCap = "round"; g.stroke(); };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
const easeOut = (x: number) => 1 - (1 - clamp01(x)) ** 3;
/** overshooting pop 0 -> 1.12 -> 1 */
const pop = (x: number) => { if (x <= 0) return 0; if (x >= 1) return 1; const c = 1.9, u = x - 1; return 1 + (c + 1) * u * u * u + c * u * u; };
const at = (g: G, x: number, y: number, k: number, rot: number, fn: () => void) => {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k); g.translate(-x, -y); fn(); g.restore();
};
const rnd = (i: number) => { const v = Math.sin(i * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };

// ---------------- the twelve animals (head portraits, radius ~s) ----------------
type Mood = "" | "o";
type Draw = (g: G, x: number, y: number, s: number, mood?: Mood) => void;
const rat: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) { el(g, x + sd * 0.62 * s, y - 0.58 * s, 0.36 * s, 0.36 * s, "#9aa0ab"); fl(g, x + sd * 0.62 * s, y - 0.58 * s, 0.2 * s, 0.2 * s, PINK); }
  el(g, x, y, 0.78 * s, 0.68 * s, "#9aa0ab");
  el(g, x, y + 0.3 * s, 0.36 * s, 0.25 * s, "#cdd2da", 0, 4);
  for (const sd of [-1, 1]) for (const dy of [-0.07, 0.09]) line(g, [[x + sd * 0.3 * s, y + 0.32 * s], [x + sd * 0.98 * s, y + (0.24 + dy) * s]], 0.028 * s);
  el(g, x, y + 0.19 * s, 0.1 * s, 0.08 * s, PINK, 0, 3);
  eyes(g, x, y, s, 0.3, -0.12);
};
const ox: Draw = (g, x, y, s, mood) => {
  for (const sd of [-1, 1]) band(g, [[x + sd * 0.45 * s, y - 0.55 * s], [x + sd * 0.92 * s, y - 0.72 * s], [x + sd * 1.02 * s, y - 1.08 * s]], 0.15 * s, "#f1e3c2");
  for (const sd of [-1, 1]) el(g, x + sd * 0.86 * s, y - 0.28 * s, 0.3 * s, 0.14 * s, "#7a4c30", sd * 0.35);
  el(g, x, y, 0.74 * s, 0.8 * s, "#8a5a3b");
  fl(g, x, y - 0.62 * s, 0.22 * s, 0.12 * s, "#5e3b25");
  el(g, x, y + 0.45 * s, 0.56 * s, 0.34 * s, "#e8b4a0");
  for (const sd of [-1, 1]) fl(g, x + sd * 0.19 * s, y + 0.42 * s, 0.07 * s, 0.09 * s, INK);
  if (mood === "o") { wideEyes(g, x, y, s, 0.3, -0.18); fl(g, x, y + 0.64 * s, 0.09 * s, 0.07 * s, INK); }
  else eyes(g, x, y, s, 0.3, -0.15);
};
const tiger: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) { el(g, x + sd * 0.6 * s, y - 0.6 * s, 0.25 * s, 0.25 * s, "#f08a2c"); fl(g, x + sd * 0.6 * s, y - 0.6 * s, 0.12 * s, 0.12 * s, "#3a2420"); }
  el(g, x, y, 0.85 * s, 0.76 * s, "#f08a2c");
  line(g, [[x, y - 0.74 * s], [x, y - 0.46 * s]], 0.08 * s);
  for (const sd of [-1, 1]) {
    line(g, [[x + sd * 0.22 * s, y - 0.72 * s], [x + sd * 0.18 * s, y - 0.52 * s]], 0.07 * s);
    line(g, [[x + sd * 0.84 * s, y - 0.08 * s], [x + sd * 0.56 * s, y]], 0.07 * s);
    line(g, [[x + sd * 0.8 * s, y + 0.2 * s], [x + sd * 0.56 * s, y + 0.2 * s]], 0.07 * s);
  }
  for (const sd of [-1, 1]) el(g, x + sd * 0.17 * s, y + 0.33 * s, 0.22 * s, 0.18 * s, "#fff6e8", 0, 4);
  poly(g, [[x - 0.12 * s, y + 0.13 * s], [x + 0.12 * s, y + 0.13 * s], [x, y + 0.27 * s]], "#e07a8a", 3);
  eyes(g, x, y, s, 0.32, -0.15);
};
const rabbit: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) { el(g, x + sd * 0.3 * s, y - 1.0 * s, 0.19 * s, 0.55 * s, WHITE, sd * 0.12); fl(g, x + sd * 0.3 * s, y - 0.98 * s, 0.08 * s, 0.38 * s, PINK, sd * 0.12); }
  el(g, x, y, 0.7 * s, 0.64 * s, WHITE);
  el(g, x, y + 0.16 * s, 0.09 * s, 0.07 * s, PINK, 0, 3);
  line(g, [[x - 0.11 * s, y + 0.31 * s], [x, y + 0.22 * s], [x + 0.11 * s, y + 0.31 * s]], 0.03 * s);
  g.beginPath(); g.rect(x - 0.09 * s, y + 0.3 * s, 0.18 * s, 0.15 * s); finish(g, "#ffffff", 3);
  line(g, [[x, y + 0.3 * s], [x, y + 0.45 * s]], 3);
  eyes(g, x, y, s, 0.28, -0.06);
};
const dragon: Draw = (g, x, y, s) => {
  for (let k = -3; k <= 3; k++) el(g, x + k * 0.27 * s, y - 0.6 * s - (3 - Math.abs(k)) * 0.07 * s, 0.2 * s, 0.32 * s, "#3fa66b", k * 0.25, 4);
  for (const sd of [-1, 1]) {
    band(g, [[x + sd * 0.3 * s, y - 0.55 * s], [x + sd * 0.45 * s, y - 0.9 * s], [x + sd * 0.72 * s, y - 1.18 * s]], 0.09 * s, GOLD);
    band(g, [[x + sd * 0.45 * s, y - 0.9 * s], [x + sd * 0.24 * s, y - 1.12 * s]], 0.07 * s, GOLD);
  }
  el(g, x, y, 0.8 * s, 0.7 * s, "#d23b3b");
  el(g, x, y + 0.38 * s, 0.6 * s, 0.34 * s, "#ef6a3a");
  for (const sd of [-1, 1]) {
    poly(g, [[x + sd * 0.38 * s, y + 0.6 * s], [x + sd * 0.24 * s, y + 0.6 * s], [x + sd * 0.31 * s, y + 0.78 * s]], "#ffffff", 3);
    fl(g, x + sd * 0.2 * s, y + 0.3 * s, 0.07 * s, 0.06 * s, INK);
    band(g, [[x + sd * 0.55 * s, y + 0.38 * s], [x + sd * 1.0 * s, y + 0.26 * s], [x + sd * 1.32 * s, y + 0.62 * s]], 0.055 * s, GOLD);
    line(g, [[x + sd * 0.12 * s, y - 0.3 * s], [x + sd * 0.5 * s, y - 0.42 * s]], 0.09 * s);
  }
  wideEyes(g, x, y, s, 0.3, -0.13);
};
const snake: Draw = (g, x, y, s) => {
  el(g, x, y + 0.78 * s, 0.98 * s, 0.38 * s, "#4aa53c");
  fl(g, x, y + 0.78 * s, 0.55 * s, 0.16 * s, "#9ad97f");
  el(g, x, y, 0.6 * s, 0.72 * s, "#5fbf4a");
  for (const [dx, dy] of [[0, -0.45], [-0.22, -0.32], [0.22, -0.32]]) fl(g, x + dx * s, y + dy * s, 0.08 * s, 0.07 * s, "#3c8a30");
  line(g, [[x, y + 0.62 * s], [x, y + 0.9 * s]], 0.045 * s, RED);
  line(g, [[x - 0.09 * s, y + 1.02 * s], [x, y + 0.9 * s], [x + 0.09 * s, y + 1.02 * s]], 0.045 * s, RED);
  smile(g, x, y + 0.3 * s, 0.25 * s, 0.035 * s);
  for (const sd of [-1, 1]) { el(g, x + sd * 0.25 * s, y - 0.12 * s, 0.13 * s, 0.13 * s, "#ffe35a", 0, 4); fl(g, x + sd * 0.25 * s, y - 0.12 * s, 0.035 * s, 0.1 * s, INK); }
};
const horse: Draw = (g, x, y, s) => {
  el(g, x - 0.12 * s, y - 0.55 * s, 0.45 * s, 0.42 * s, "#4a2d1f");
  for (const sd of [-1, 1]) poly(g, [[x + sd * 0.16 * s, y - 0.72 * s], [x + sd * 0.42 * s, y - 0.72 * s], [x + sd * 0.33 * s, y - 1.12 * s]], "#a8693d");
  el(g, x, y, 0.5 * s, 0.92 * s, "#a8693d");
  fl(g, x, y - 0.12 * s, 0.09 * s, 0.34 * s, "#fff6e8");
  el(g, x, y - 0.74 * s, 0.24 * s, 0.17 * s, "#4a2d1f", 0.3);
  el(g, x, y + 0.6 * s, 0.44 * s, 0.33 * s, "#d9a07a");
  for (const sd of [-1, 1]) fl(g, x + sd * 0.15 * s, y + 0.62 * s, 0.06 * s, 0.085 * s, INK);
  eyes(g, x, y, s, 0.3, -0.22);
};
const goat: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) band(g, [[x + sd * 0.2 * s, y - 0.62 * s], [x + sd * 0.45 * s, y - 0.98 * s], [x + sd * 0.72 * s, y - 0.86 * s]], 0.11 * s, "#8d8478");
  for (const sd of [-1, 1]) el(g, x + sd * 0.72 * s, y - 0.3 * s, 0.3 * s, 0.12 * s, "#efe6d2", sd * 0.3);
  poly(g, [[x - 0.17 * s, y + 0.6 * s], [x + 0.17 * s, y + 0.6 * s], [x, y + 1.12 * s]], WHITE);
  el(g, x, y, 0.6 * s, 0.76 * s, "#efe6d2");
  el(g, x, y + 0.44 * s, 0.13 * s, 0.08 * s, "#c9a27e", 0, 3);
  eyes(g, x, y, s, 0.25, -0.15);
};
const monkey: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) { el(g, x + sd * 0.8 * s, y, 0.27 * s, 0.27 * s, "#7a4f33"); fl(g, x + sd * 0.8 * s, y, 0.15 * s, 0.15 * s, "#e9c49a"); }
  el(g, x, y, 0.78 * s, 0.76 * s, "#7a4f33");
  for (const sd of [-1, 1]) fl(g, x + sd * 0.2 * s, y - 0.12 * s, 0.3 * s, 0.3 * s, "#e9c49a");
  fl(g, x, y + 0.25 * s, 0.46 * s, 0.36 * s, "#e9c49a");
  for (const sd of [-1, 1]) fl(g, x + sd * 0.06 * s, y + 0.16 * s, 0.035 * s, 0.03 * s, INK);
  smile(g, x, y + 0.22 * s, 0.22 * s, 0.035 * s);
  eyes(g, x, y, s, 0.2, -0.12);
};
const rooster: Draw = (g, x, y, s) => {
  el(g, x - 0.25 * s, y - 0.76 * s, 0.2 * s, 0.22 * s, RED); el(g, x + 0.25 * s, y - 0.78 * s, 0.2 * s, 0.22 * s, RED); el(g, x, y - 0.9 * s, 0.22 * s, 0.26 * s, RED);
  el(g, x, y, 0.62 * s, 0.72 * s, WHITE);
  el(g, x, y + 0.5 * s, 0.13 * s, 0.2 * s, RED, 0, 4);
  poly(g, [[x - 0.17 * s, y + 0.06 * s], [x + 0.17 * s, y + 0.06 * s], [x, y + 0.36 * s]], GOLD, 4);
  eyes(g, x, y, s, 0.28, -0.18);
};
const dog: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) el(g, x + sd * 0.7 * s, y + 0.08 * s, 0.24 * s, 0.5 * s, "#7a4f33", -sd * 0.28);
  el(g, x, y, 0.74 * s, 0.7 * s, "#d9a477");
  el(g, x, y + 0.32 * s, 0.4 * s, 0.3 * s, "#f4e4cc", 0, 4);
  el(g, x, y + 0.6 * s, 0.12 * s, 0.13 * s, "#ef7b8b", 0, 3);
  line(g, [[x, y + 0.22 * s], [x, y + 0.42 * s]], 0.03 * s);
  fl(g, x, y + 0.18 * s, 0.15 * s, 0.1 * s, INK);
  eyes(g, x, y, s, 0.3, -0.15);
};
const pig: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) poly(g, [[x + sd * 0.32 * s, y - 0.56 * s], [x + sd * 0.76 * s, y - 0.5 * s], [x + sd * 0.68 * s, y - 0.94 * s]], "#f4a9b8");
  el(g, x, y, 0.82 * s, 0.72 * s, "#f4a9b8");
  el(g, x, y + 0.22 * s, 0.32 * s, 0.23 * s, "#e88aa0", 0, 4);
  for (const sd of [-1, 1]) fl(g, x + sd * 0.1 * s, y + 0.22 * s, 0.05 * s, 0.08 * s, "#7a2f45");
  eyes(g, x, y, s, 0.34, -0.18);
};
export const ANIMAL: Draw[] = [rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig];

// ---------------- the five elements (icons, radius ~s) ----------------
const ELEM_COL = ["#5fbf4a", "#ff5a36", "#c98a3a", "#e8c45a", "#4aa3ff"];
const ELEMENT: Draw[] = [
  (g, x, y, s) => { g.beginPath(); g.rect(x - 0.12 * s, y + 0.1 * s, 0.24 * s, 0.75 * s); finish(g, "#8a5a3b"); el(g, x, y - 0.22 * s, 0.7 * s, 0.6 * s, "#5fbf4a"); el(g, x - 0.35 * s, y + 0.05 * s, 0.32 * s, 0.28 * s, "#4aa53c"); },
  (g, x, y, s) => {
    const fire = (k: number, c: string) => { g.beginPath(); g.moveTo(x, y - 0.95 * s * k); g.bezierCurveTo(x + 0.75 * s * k, y - 0.2 * s * k, x + 0.6 * s * k, y + 0.8 * s * k, x, y + 0.8 * s * k);
      g.bezierCurveTo(x - 0.6 * s * k, y + 0.8 * s * k, x - 0.75 * s * k, y - 0.2 * s * k, x, y - 0.95 * s * k); finish(g, c); };
    fire(1, "#ff5a36"); at(g, x, y + 0.8 * s, 1, 0, () => fire(0.55, GOLD));
  },
  (g, x, y, s) => { g.beginPath(); g.ellipse(x, y + 0.7 * s, 0.95 * s, 1.2 * s, 0, Math.PI, 2 * Math.PI); g.closePath(); finish(g, shadeOf(g, x, y + 0.2 * s, s, "#c98a3a"));
    for (const [dx, dy] of [[-0.4, 0.3], [0.2, 0.1], [0.45, 0.45], [-0.05, 0.5]]) el(g, x + dx * s, y + dy * s, 0.1 * s, 0.07 * s, "#8a5a3b", 0, 3); },
  (g, x, y, s) => { g.beginPath(); g.moveTo(x - 0.95 * s, y - 0.1 * s); g.quadraticCurveTo(x, y + 1.05 * s, x + 0.95 * s, y - 0.1 * s); g.quadraticCurveTo(x + 0.5 * s, y + 0.15 * s, x, y + 0.05 * s);
    g.quadraticCurveTo(x - 0.5 * s, y + 0.15 * s, x - 0.95 * s, y - 0.1 * s); finish(g, shadeOf(g, x, y + 0.3 * s, s, GOLD)); el(g, x, y - 0.1 * s, 0.4 * s, 0.32 * s, GOLD); },
  (g, x, y, s) => { g.beginPath(); g.moveTo(x, y - 0.95 * s); g.bezierCurveTo(x + 0.25 * s, y - 0.5 * s, x + 0.72 * s, y + 0.05 * s, x + 0.72 * s, y + 0.35 * s);
    g.arc(x, y + 0.35 * s, 0.72 * s, 0, Math.PI); g.bezierCurveTo(x - 0.72 * s, y + 0.05 * s, x - 0.25 * s, y - 0.5 * s, x, y - 0.95 * s); finish(g, shadeOf(g, x, y + 0.2 * s, s, "#4aa3ff"));
    line(g, [[x - 0.35 * s, y + 0.45 * s], [x - 0.15 * s, y + 0.3 * s], [x + 0.05 * s, y + 0.45 * s], [x + 0.25 * s, y + 0.3 * s]], 0.06 * s, "#d6ecff"); },
];

// ---------------- backgrounds ----------------
const W = 1080, H = 1920;
/** night-blue storybook panel with twinkling stars and a gold frame (the stall's back panel, up close) */
const night = (g: G, t: number) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "#2b2f78"); gr.addColorStop(1, "#141842");
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 110; i++) {
    const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (1 + rnd(i + 3)) + 6 * rnd(i)));
    fl(g, rnd(i * 2 + 1) * W, rnd(i * 2 + 2) * H, 2.2 + 2.5 * rnd(i + 9), 2.2 + 2.5 * rnd(i + 9), `rgba(255,240,200,${a.toFixed(2)})`);
  }
};
const frame = (g: G) => {
  g.lineJoin = "round";
  for (const [w, c] of [[30, INK], [18, GOLD]] as const) { g.lineWidth = w; g.strokeStyle = c; g.beginPath(); g.roundRect(34, 34, W - 68, H - 68, 40); g.stroke(); }
};
const coin = (g: G, x: number, y: number, r: number) => {
  el(g, x, y, r, r, GOLD); el(g, x, y, 0.78 * r, 0.78 * r, "#e8b93e", 0, 4);
  g.beginPath(); g.rect(x - 0.3 * r, y - 0.3 * r, 0.6 * r, 0.6 * r); finish(g, "#9b1c2c");
};
const rays = (g: G, x: number, y: number, r0: number, r1: number, n: number, rot: number, c: string) => {
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n, d = Math.PI / n / 2;
    g.beginPath(); g.moveTo(x + r0 * Math.cos(a - d), y + r0 * Math.sin(a - d)); g.lineTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a));
    g.lineTo(x + r0 * Math.cos(a + d), y + r0 * Math.sin(a + d)); g.closePath(); g.fillStyle = c; g.fill();
  }
};
const confetti = (g: G, x: number, y: number, dt: number, n = 46) => {
  if (dt < 0 || dt > 1.6) return;
  const cols = [GOLD, RED, "#5fbf4a", "#4aa3ff", "#ff8a3d", WHITE];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI * (0.1 + 0.8 * rnd(i + 40)), v = 700 + 700 * rnd(i + 70);
    const px = x + Math.cos(a) * v * dt, py = y + Math.sin(a) * v * dt + 900 * dt * dt;
    at(g, px, py, 1, dt * (4 + 6 * rnd(i)), () => { g.fillStyle = cols[i % cols.length]; g.fillRect(px - 11, py - 6, 22, 12); });
  }
};

// ---------------- scene 2 pictures ----------------
/** "your sign depends on your birth year": a baby rocks in a cradle under a gold coin that flips to its year animal */
const birth = (g: G, t: number) => {
  night(g, t);
  const k = pop((t - 1.95) / 0.35), u = clamp01((t - 3.15) / 0.4);
  rays(g, 540, 640, 250, 520, 16, t * 0.3, `rgba(255,214,90,${(0.22 * ease((t - 3.4) / 0.3)).toFixed(2)})`);
  at(g, 540, 640, k, 0, () => at(g, 540, 640, 1, 0, () => {
    g.save(); g.translate(540, 640); g.scale(Math.max(0.02, Math.abs(Math.cos(Math.PI * u))), 1); g.translate(-540, -640);
    if (u < 0.5) coin(g, 540, 640, 220); else { el(g, 540, 640, 220, 220, "#c8263a"); g.lineWidth = 14; g.strokeStyle = GOLD; g.beginPath(); g.arc(540, 640, 196, 0, 7); g.stroke(); dragon(g, 540, 660, 125); }
    g.restore();
  }));
  cradle(g, t);
};
const cradle = (g: G, t: number) => {
  at(g, 540, 1460, 1, 0.05 * Math.sin(t * 2.6), () => {
    el(g, 540, 1250, 250, 110, WHITE);                                                     // swaddle
    el(g, 330, 1215, 92, 88, "#e8b48a");                                                  // head
    line(g, [[318, 1150], [332, 1132], [348, 1146]], 6);                                  // curl
    for (const dx of [-30, 26]) { g.beginPath(); g.arc(330 + dx, 1212, 13, 0.1 * Math.PI, 0.9 * Math.PI); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
    g.beginPath(); g.ellipse(540, 1290, 340, 200, 0, 0, Math.PI); g.closePath(); finish(g, shadeOf(g, 540, 1350, 340, "#b8743f"), 8);
    g.beginPath(); g.ellipse(540, 1300, 380, 230, 0, 0.12 * Math.PI, 0.88 * Math.PI); g.lineWidth = 22; g.strokeStyle = INK; g.stroke();
    g.lineWidth = 12; g.strokeStyle = "#8a5a3b"; g.stroke();
  });
};
const sky = (g: G, t: number, top: string, bot: string) => {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, H);
};
const cloud = (g: G, x: number, y: number, s: number, c = "#ffffff") => {
  for (const [dx, dy, r] of [[-0.9, 0.15, 0.5], [-0.35, -0.2, 0.62], [0.3, -0.25, 0.7], [0.9, 0.1, 0.5], [0, 0.25, 0.6]]) el(g, x + dx * s, y + dy * s, r * s, r * 0.8 * s, c, 0, 5);
};
let emperorCan: HTMLCanvasElement | null = null, emperorCrown = 120;
const EMPEROR: Outfit = { jacket: "#f3c44e", pants: "#f3c44e", boots: "#7a4f33", hat: "hair", hair: "#1e1a1c", skin: "#f2cfa6", dress: "#f3c44e",
  buttons: "#d23b3b", beard: "#1e1a1c", moustache: "#1e1a1c" };
const emperor = () => {
  if (emperorCan) return emperorCan;
  const c = document.createElement("canvas"); c.width = 600; c.height = 1000;
  const g = c.getContext("2d")!;
  bodyFront(new Pen(g), EMPEROR, { mode: "stand", expr: "smile", gesture: "up", facing: 0, seed: 4, light: -Math.PI / 2 });
  const px = g.getImageData(300, 0, 1, 1000).data;
  for (let y = 0; y < 1000; y++) if (px[y * 4 + 3] > 128) { emperorCrown = y; break; }
  emperorCan = c; return c;
};
/** "The Jade Emperor held a river race": the emperor on his cloud, mian crown on, hand raised to start it */
const jade = (g: G, t: number) => {
  sky(g, t, "#8fc4ff", "#ffe2a0");
  rays(g, 540, 700, 120, 1400, 20, t * 0.25, "rgba(255,236,170,0.35)");
  for (let i = 0; i < 4; i++) cloud(g, ((i * 330 + t * 40) % 1500) - 200, 300 + i * 340, 70 + 20 * (i % 2));
  const c = emperor(), k = 1.25, x0 = 540 - 300 * k, y0 = 1560 - 975 * k;
  cloud(g, 540, 1600, 190); cloud(g, 330, 1680, 130); cloud(g, 760, 1690, 140);
  g.drawImage(c, x0, y0, 600 * k, 1000 * k);
  // mian: flat board with bead strings, on top of the head
  const cy = y0 + emperorCrown * k + 6;
  poly(g, [[540 - 70, cy - 40], [540 + 70, cy - 40], [540 + 60, cy + 12], [540 - 60, cy + 12]], "#1e1a1c");
  poly(g, [[540 - 190, cy - 70], [540 + 190, cy - 70], [540 + 175, cy - 40], [540 - 175, cy - 40]], "#1e1a1c");
  for (let i = -5; i <= 5; i++) { const bx = 540 + i * 34; line(g, [[bx, cy - 40], [bx, cy + 40]], 3); el(g, bx, cy + 44, 9, 9, i % 2 ? RED : GOLD, 0, 3); }
  el(g, 540, cy - 56, 16, 12, GOLD, 0, 3);
};
const river = (g: G, t: number, y0: number, y1: number) => {
  const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, "#5aa8e6"); gr.addColorStop(1, "#2f74c0"); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0);
  for (let r = 0; r < 14; r++) {
    const y = y0 + 40 + r * ((y1 - y0 - 60) / 14), off = (t * (70 + 15 * (r % 3)) + 200 * rnd(r)) % 240;
    for (let x = -240 + off; x < W + 240; x += 240) line(g, [[x, y], [x + 30, y - 12], [x + 60, y]], 6, "rgba(214,236,255,0.7)");
  }
};
const bank = (g: G, y0: number, y1: number, edgeDown: boolean, t: number) => {
  g.fillStyle = "#7cc35a"; g.fillRect(0, y0, W, y1 - y0);
  for (let i = 0; i < 18; i++) { const x = rnd(i + 5) * W, y = y0 + 30 + rnd(i + 50) * (y1 - y0 - 60); line(g, [[x - 12, y], [x - 4, y - 22], [x, y], [x + 6, y - 26], [x + 12, y]], 5, "#4f9a3a"); }
  const ey = edgeDown ? y1 : y0;
  g.beginPath(); for (let x = 0; x <= W; x += 60) g.lineTo(x, ey + (edgeDown ? 1 : -1) * 10 * Math.sin(x * 0.05 + t * 0)); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
};
const posts = (g: G, x0: number, x1: number, y: number, h: number) => {
  for (const x of [x0, x1]) { g.beginPath(); g.rect(x - 16, y - h, 32, h + 40); finish(g, shadeOf(g, x, y - h / 2, h, RED)); el(g, x, y - h, 26, 26, GOLD); }
};
const swimmer = (g: G, d: Draw, x: number, y: number, s: number, t: number, mood?: Mood) => {
  for (const sd of [-1, 1]) line(g, [[x + sd * 0.6 * s, y + 0.5 * s], [x + sd * 1.15 * s, y + 1.25 * s]], 7, "rgba(255,255,255,0.85)");
  fl(g, x, y + 0.62 * s, 0.95 * s, 0.22 * s, "rgba(255,255,255,0.6)");
  d(g, x, y + 4 * Math.sin(t * 6 + x), s, mood);
};
/** the race seen whole: swimmers crossing toward the ribbon on the far bank, the Rat riding on the Ox */
const raceWide = (g: G, t: number) => {
  river(g, t, 440, 1500); bank(g, 0, 440, true, t); bank(g, 1500, H, false, t);
  posts(g, 110, 970, 420, 170);
  band(g, [[110, 330], [540, 360], [970, 330]], 14, RED);
  const lanes: [Draw, number, number, number][] = [[tiger, 150, 0.84, 62], [rabbit, 340, 0.62, 56], [ox, 540, 1.0, 74], [dragon, 750, 0.55, 66], [horse, 935, 0.76, 60]];
  for (const [d, x, sp, s] of lanes) {
    const p = easeOut(((t - 20.3) / 4.9) * sp), y = 1640 - (1640 - 560) * p;
    swimmer(g, d, x, y, s, t);
    if (d === ox) rat(g, x, y - 0.95 * s - 22 + 3 * Math.sin(t * 9), 30);
  }
};
/** "...riding on the Ox, then jumping off right at the finish line!": the Rat leaps over the ribbon first */
const raceFinish = (g: G, t: number) => {
  river(g, t, 560, H); bank(g, 0, 560, true, t);
  const tj = 27.78, tl = 28.75;
  posts(g, 110, 970, 560, 200);
  const broke = t >= 28.6;
  if (!broke) band(g, [[110, 470], [540, 500], [970, 470]], 16, RED);
  else { const a = ease((t - 28.6) / 0.35) * 1.25; band(g, [[110, 470], [110 + 430 * Math.cos(a), 470 + 430 * Math.sin(a)]], 16, RED); band(g, [[970, 470], [970 - 430 * Math.cos(a), 470 + 430 * Math.sin(a)]], 16, RED); }
  swimmer(g, tiger, 210, 1720 - 220 * ease((t - 25.2) / 4.5), 90, t);
  swimmer(g, dragon, 880, 1800 - 200 * ease((t - 25.2) / 4.5), 95, t);
  const oy = 1700 - 640 * easeOut((t - 25.2) / 2.4) - 70 * ease((t - 27.6) / 2.1), os = 190;
  swimmer(g, ox, 540, oy, os, t, t > tj + 0.1 ? "o" : "");
  const head = oy - 0.95 * os - 52;
  if (t < tj) rat(g, 540, head + 5 * Math.sin(t * 9), 75);
  else {
    const u = clamp01((t - tj) / (tl - tj)), x = 540, y = head + (330 - head) * u - 380 * Math.sin(Math.PI * u);
    const land = t > tl ? -40 * Math.abs(Math.sin((t - tl) * 8)) * Math.exp(-(t - tl) * 2) : 0;
    at(g, x, y + land, 1 + 0.15 * Math.sin(Math.PI * u), u < 1 ? u * 2 * Math.PI : 0, () => rat(g, x, y + land, 75));
  }
  confetti(g, 540, 470, t - 28.75);
};
/** "The cycle repeats every twelve years, and five elements ... add more layers": the wheel turns once; the
 *  element icons arrive; a ring of ten coloured segments (each element rules two years in a row) wraps it: 12 x 5 = 60 */
const cycle = (g: G, t: number) => {
  night(g, t);
  const cx = 540, cy = 800, k = pop((t - 31.85) / 0.35), spin = -2 * Math.PI * ease((t - 32.3) / 1.4);
  at(g, cx, cy, k, 0, () => {
    const lay = clamp01((t - 38.2) / 0.7);
    if (lay > 0) for (let j = 0; j < 10; j++) {
      const a0 = -Math.PI / 2 + (j * 2 * Math.PI) / 10, a1 = a0 + ((2 * Math.PI) / 10) * clamp01(lay * 10 - j);
      if (a1 <= a0) continue;
      g.beginPath(); g.arc(cx, cy, 455, a0, a1); g.arc(cx, cy, 395, a1, a0, true); g.closePath(); finish(g, ELEM_COL[Math.floor(j / 2)], 6);
    }
    g.beginPath(); g.arc(cx, cy, 385, 0, 7); g.arc(cx, cy, 215, 7, 0, true); finish(g, NAVY, 8);
    g.lineWidth = 9; g.strokeStyle = GOLD; for (const r of [374, 226]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
    for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 12 + spin; ANIMAL[i](g, cx + 300 * Math.cos(a), cy + 300 * Math.sin(a) + 8, 50); }
    coin(g, cx, cy, 130);
    poly(g, [[cx - 34, cy - 470], [cx + 34, cy - 470], [cx, cy - 405]], GOLD, 6);
  });
  for (let e = 0; e < 5; e++) {
    const p = pop((t - (T2.elements[e] - 0.06)) / 0.3);
    if (p <= 0) continue;
    const x = [150, 345, 540, 735, 930][e], y = 1500 - (t < T2.elements[e] + 0.6 ? 12 * Math.sin((t - T2.elements[e]) * 10) : 0);
    el(g, x, 1510, 92, 92, NAVY, 0, 6); g.lineWidth = 7; g.strokeStyle = ELEM_COL[e]; g.beginPath(); g.arc(x, 1510, 82, 0, 7); g.stroke();
    at(g, x, y, p, 0, () => ELEMENT[e](g, x, y + 4, 56));
  }
};

// ---------------- the twelve rashis (Vedic signs) as icons, radius ~s ----------------
const spiral = (cx: number, cy: number, r0: number, sd: number, turns = 1.4) => {
  const pts: number[][] = [];
  for (let i = 0; i <= 28; i++) { const u = i / 28, a = -Math.PI / 2 + sd * u * turns * 2 * Math.PI, r = r0 * (1 - 0.7 * u); pts.push([cx + sd * r * Math.cos(a) * -1, cy + r * Math.sin(a)]); }
  return pts;
};
const ram: Draw = (g, x, y, s) => {
  el(g, x, y + 0.1 * s, 0.5 * s, 0.64 * s, "#efe6d2");
  for (const sd of [-1, 1]) band(g, spiral(x + sd * 0.62 * s, y - 0.2 * s, 0.38 * s, sd), 0.13 * s, "#c9a27e");
  el(g, x, y + 0.5 * s, 0.22 * s, 0.14 * s, "#d9b8a0", 0, 3);
  for (const sd of [-1, 1]) fl(g, x + sd * 0.08 * s, y + 0.5 * s, 0.035 * s, 0.03 * s, INK);
  eyes(g, x, y, s, 0.22, 0.02);
};
const kid = (g: G, x: number, y: number, s: number, hair: string, skin: string) => {
  el(g, x, y, 0.36 * s, 0.4 * s, skin);
  g.beginPath(); g.ellipse(x, y - 0.06 * s, 0.38 * s, 0.36 * s, 0, Math.PI, 2 * Math.PI); g.closePath(); finish(g, hair, 4);
  eyes(g, x, y + 0.04 * s, s, 0.13, 0, 0.055); smile(g, x, y + 0.08 * s, 0.13 * s, 0.03 * s);
};
const twins: Draw = (g, x, y, s) => { kid(g, x - 0.42 * s, y, s * 1.15, "#2a1a1a", "#e8b48a"); kid(g, x + 0.42 * s, y, s * 1.15, "#2a1a1a", "#d9a477"); };
export const crab = (g: G, x: number, y: number, s: number, wave = 0) => {
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) line(g, [[x + sd * 0.5 * s, y + (0.05 + k * 0.15) * s], [x + sd * 0.9 * s, y + (0.15 + k * 0.2) * s], [x + sd * 1.0 * s, y + (0.4 + k * 0.18) * s]], 0.06 * s);
  for (const sd of [-1, 1]) {
    const lift = sd * wave;
    band(g, [[x + sd * 0.5 * s, y - 0.1 * s], [x + sd * 0.8 * s, y - (0.45 + 0.1 * lift) * s]], 0.1 * s, "#e5533a");
    el(g, x + sd * 0.86 * s, y - (0.66 + 0.12 * lift) * s, 0.26 * s, 0.2 * s, "#e5533a", sd * 0.5);
    poly(g, [[x + sd * 0.86 * s, y - (0.62 + 0.12 * lift) * s], [x + sd * 1.15 * s, y - (0.86 + 0.12 * lift) * s], [x + sd * 0.96 * s, y - (0.92 + 0.12 * lift) * s]], "#1d2260", 0);
  }
  for (const sd of [-1, 1]) { line(g, [[x + sd * 0.18 * s, y - 0.35 * s], [x + sd * 0.24 * s, y - 0.68 * s]], 0.05 * s); el(g, x + sd * 0.24 * s, y - 0.72 * s, 0.11 * s, 0.11 * s, "#ffffff", 0, 4); fl(g, x + sd * 0.24 * s, y - 0.72 * s, 0.05 * s, 0.05 * s, INK); }
  el(g, x, y, 0.75 * s, 0.5 * s, "#e5533a");
  smile(g, x, y + 0.02 * s, 0.2 * s, 0.035 * s);
};
const crabD: Draw = (g, x, y, s) => crab(g, x, y, s);
export const lion: Draw = (g, x, y, s) => {
  const pts: number[][] = []; for (let i = 0; i < 28; i++) { const a = (i * Math.PI) / 14, r = (i % 2 ? 0.74 : 0.98) * s; pts.push([x + r * Math.cos(a), y + r * Math.sin(a)]); }
  poly(g, pts, "#c4682a");
  for (const sd of [-1, 1]) el(g, x + sd * 0.42 * s, y - 0.46 * s, 0.15 * s, 0.15 * s, "#f2a93b");
  el(g, x, y, 0.62 * s, 0.6 * s, "#f2a93b");
  el(g, x, y + 0.26 * s, 0.3 * s, 0.21 * s, "#fff0d0", 0, 4);
  poly(g, [[x - 0.1 * s, y + 0.12 * s], [x + 0.1 * s, y + 0.12 * s], [x, y + 0.24 * s]], "#5e3b25", 3);
  eyes(g, x, y, s, 0.25, -0.1);
};
const maiden: Draw = (g, x, y, s) => {
  el(g, x, y + 0.18 * s, 0.62 * s, 0.82 * s, "#2a1a1a");
  el(g, x, y - 0.02 * s, 0.45 * s, 0.5 * s, "#e8b48a");
  g.beginPath(); g.ellipse(x, y - 0.18 * s, 0.47 * s, 0.38 * s, 0, Math.PI, 2 * Math.PI); g.closePath(); finish(g, "#2a1a1a", 4);
  for (let i = 0; i < 5; i++) { const a = (i * 2 * Math.PI) / 5; el(g, x + 0.4 * s + 0.12 * s * Math.cos(a), y - 0.4 * s + 0.12 * s * Math.sin(a), 0.09 * s, 0.09 * s, "#ff7aa8", 0, 3); }
  fl(g, x + 0.4 * s, y - 0.4 * s, 0.06 * s, 0.06 * s, GOLD);
  eyes(g, x, y + 0.02 * s, s, 0.17, 0, 0.065); smile(g, x, y + 0.1 * s, 0.14 * s, 0.03 * s);
};
const scales: Draw = (g, x, y, s, mood) => {
  const tilt = mood === "o" ? 0.12 : 0;
  band(g, [[x, y - 0.7 * s], [x, y + 0.6 * s]], 0.08 * s, GOLD); el(g, x, y + 0.66 * s, 0.4 * s, 0.12 * s, GOLD);
  const L: number[] = [x - 0.75 * s, y - 0.55 * s + tilt * s * 0.75 * -1], R: number[] = [x + 0.75 * s, y - 0.55 * s + tilt * s * 0.75];
  band(g, [L, R], 0.07 * s, GOLD); el(g, x, y - 0.7 * s, 0.1 * s, 0.1 * s, GOLD, 0, 4);
  for (const P of [L, R]) { line(g, [P, [P[0] - 0.25 * s, P[1] + 0.55 * s]], 3); line(g, [P, [P[0] + 0.25 * s, P[1] + 0.55 * s]], 3);
    g.beginPath(); g.ellipse(P[0], P[1] + 0.55 * s, 0.32 * s, 0.15 * s, 0, 0, Math.PI); g.closePath(); finish(g, GOLD, 4); }
};
const scorpion: Draw = (g, x, y, s) => {
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) line(g, [[x + sd * 0.25 * s, y + (0.15 + k * 0.15) * s], [x + sd * 0.62 * s, y + (0.3 + k * 0.17) * s]], 0.05 * s);
  band(g, [[x, y + 0.3 * s], [x + 0.45 * s, y - 0.25 * s], [x + 0.25 * s, y - 0.72 * s], [x - 0.05 * s, y - 0.62 * s]], 0.16 * s, "#8c2f3a");
  poly(g, [[x - 0.05 * s, y - 0.7 * s], [x - 0.25 * s, y - 0.52 * s], [x - 0.02 * s, y - 0.5 * s]], GOLD, 4);
  for (const sd of [-1, 1]) { band(g, [[x + sd * 0.2 * s, y], [x + sd * 0.55 * s, y - 0.1 * s]], 0.08 * s, "#8c2f3a"); el(g, x + sd * 0.66 * s, y - 0.2 * s, 0.17 * s, 0.13 * s, "#8c2f3a", sd * 0.6); }
  el(g, x, y + 0.25 * s, 0.32 * s, 0.4 * s, "#8c2f3a");
  eyes(g, x, y + 0.05 * s, s, 0.12, 0, 0.06);
};
const bow: Draw = (g, x, y, s) => {
  const pts: number[][] = []; for (let i = 0; i <= 16; i++) { const a = -1.05 + (2.1 * i) / 16; pts.push([x - 0.45 * s + 0.85 * s * Math.cos(a), y + 0.85 * s * Math.sin(a)]); }
  line(g, [pts[0], pts[16]], 4);
  band(g, pts, 0.1 * s, "#8a5a3b");
  band(g, [[x - 0.75 * s, y], [x + 0.62 * s, y]], 0.05 * s, "#c9a27e");
  poly(g, [[x + 0.6 * s, y - 0.14 * s], [x + 0.92 * s, y], [x + 0.6 * s, y + 0.14 * s]], "#9aa0ab", 4);
  for (const sd of [-1, 1]) poly(g, [[x - 0.75 * s, y], [x - 0.95 * s, y + sd * 0.16 * s], [x - 0.6 * s, y + sd * 0.02 * s]], RED, 3);
};
const makara: Draw = (g, x, y, s) => {
  el(g, x, y + 0.3 * s, 0.38 * s, 0.62 * s, "#3fa66b");
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) poly(g, [[x + sd * 0.34 * s, y + (0.3 + k * 0.17) * s], [x + sd * 0.46 * s, y + (0.36 + k * 0.17) * s], [x + sd * 0.34 * s, y + (0.42 + k * 0.17) * s]], "#ffffff", 2);
  el(g, x, y - 0.25 * s, 0.58 * s, 0.44 * s, "#3fa66b");
  for (const sd of [-1, 1]) { el(g, x + sd * 0.3 * s, y - 0.56 * s, 0.15 * s, 0.15 * s, "#3fa66b"); fl(g, x + sd * 0.3 * s, y - 0.56 * s, 0.06 * s, 0.07 * s, INK);
    fl(g, x + sd * 0.1 * s, y + 0.8 * s, 0.04 * s, 0.04 * s, INK); }
};
const pot: Draw = (g, x, y, s) => {
  band(g, [[x + 0.22 * s, y - 0.48 * s], [x + 0.7 * s, y - 0.4 * s], [x + 0.85 * s, y + 0.55 * s]], 0.14 * s, "#4aa3ff");
  for (const [dx, dy] of [[0.95, 0.75], [0.75, 0.82]]) el(g, x + dx * s, y + dy * s, 0.06 * s, 0.08 * s, "#4aa3ff", 0, 3);
  el(g, x, y + 0.2 * s, 0.58 * s, 0.55 * s, "#c96a3a");
  g.beginPath(); g.rect(x - 0.2 * s, y - 0.45 * s, 0.4 * s, 0.2 * s); finish(g, "#c96a3a");
  el(g, x, y - 0.46 * s, 0.32 * s, 0.1 * s, "#e08a54");
  band(g, [[x - 0.45 * s, y + 0.15 * s], [x + 0.45 * s, y + 0.15 * s]], 0.06 * s, GOLD);
};
const fishOne = (g: G, x: number, y: number, s: number, dir: number, c: string) => {
  poly(g, [[x - dir * 0.38 * s, y], [x - dir * 0.7 * s, y - 0.2 * s], [x - dir * 0.7 * s, y + 0.2 * s]], c);
  el(g, x, y, 0.45 * s, 0.22 * s, c); fl(g, x + dir * 0.25 * s, y - 0.04 * s, 0.045 * s, 0.045 * s, INK);
};
const fish: Draw = (g, x, y, s) => { fishOne(g, x, y - 0.3 * s, s, 1, "#4aa3ff"); fishOne(g, x, y + 0.3 * s, s, -1, "#5fc7d9"); };
export const RASHI: Draw[] = [ram, ox, twins, crabD, lion, maiden, scales, scorpion, bow, makara, pot, fish];

// ---------------- the nine grahas (in weekday order: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn; then Rahu, Ketu) ----------------
const planet = (g: G, x: number, y: number, s: number, k: number) => {
  switch (k) {
    case 0: rays(g, x, y, 0.8 * s, 1.25 * s, 12, 0, "#ffcf3e"); el(g, x, y, 0.85 * s, 0.85 * s, "#ffcf3e"); break;
    case 1: el(g, x, y, 0.75 * s, 0.75 * s, "#e8eeff"); for (const [dx, dy, r] of [[-0.25, -0.2, 0.15], [0.25, 0.15, 0.12], [-0.05, 0.35, 0.09]]) fl(g, x + dx * s, y + dy * s, r * s, r * s, "#c3cbe0"); break;
    case 2: el(g, x, y, 0.7 * s, 0.7 * s, "#e0533a"); for (const [dx, dy, r] of [[-0.2, -0.15, 0.13], [0.22, 0.2, 0.1]]) fl(g, x + dx * s, y + dy * s, r * s, r * s, "#b33a26"); break;
    case 3: el(g, x, y, 0.55 * s, 0.55 * s, "#7fc06a"); break;
    case 4: el(g, x, y, 0.92 * s, 0.92 * s, "#f0a860"); for (const dy of [-0.35, 0, 0.35]) line(g, [[x - 0.8 * s, y + dy * s], [x + 0.8 * s, y + dy * s]], 0.08 * s, "rgba(176,100,40,0.6)"); break;
    case 5: el(g, x, y, 0.65 * s, 0.65 * s, "#fff2d6"); break;
    case 6: g.beginPath(); g.ellipse(x, y, 1.15 * s, 0.32 * s, -0.25, Math.PI, 2 * Math.PI); g.lineWidth = 0.14 * s; g.strokeStyle = "#e8d39a"; g.stroke();
      el(g, x, y, 0.62 * s, 0.62 * s, "#6f8fd6");
      g.beginPath(); g.ellipse(x, y, 1.15 * s, 0.32 * s, -0.25, 0, Math.PI); g.lineWidth = 0.14 * s; g.strokeStyle = "#e8d39a"; g.stroke(); break;
    case 7: for (let i = 0; i < 3; i++) line(g, [[x - 0.9 * s, y + (i - 1) * 0.3 * s], [x - 0.5 * s, y + (i - 1) * 0.2 * s - 0.1 * s], [x - 0.2 * s, y + (i - 1) * 0.15 * s]], 0.08 * s, "rgba(140,120,190,0.7)");
      el(g, x, y, 0.62 * s, 0.62 * s, "#4a3a6a"); break;
    case 8: poly(g, [[x - 0.3 * s, y - 0.45 * s], [x - 1.3 * s, y + 0.1 * s], [x - 0.3 * s, y + 0.45 * s]], "rgba(150,140,170,0.8)", 0);
      el(g, x, y, 0.55 * s, 0.55 * s, "#6a6470"); break;
  }
};
/** North-Indian Kundli: a square, its diagonals and the inner diamond make 12 houses; `lines` 0..1 draws them in */
const HOUSES = [[0, -0.5], [-0.5, -0.82], [-0.82, -0.5], [-0.5, 0], [-0.82, 0.5], [-0.5, 0.82], [0, 0.5], [0.5, 0.82], [0.82, 0.5], [0.5, 0], [0.82, -0.5], [0.5, -0.82]];
const kundli = (g: G, x: number, y: number, L: number, lines = 1, fillHouses = 0) => {
  const h = L / 2;
  g.beginPath(); g.rect(x - h - 24, y - h - 24, L + 48, L + 48); finish(g, shadeOf(g, x, y, L, "#f6e7c6"), 8);
  if (fillHouses > 0) for (let i = 0; i < 12; i++) if (fillHouses * 12 > i) fl(g, x + HOUSES[i][0] * h, y + HOUSES[i][1] * h, 0.17 * L, 0.11 * L, ["rgba(255,186,90,0.45)", "rgba(255,120,120,0.35)"][i % 2]);
  const segs = [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]], [[-1, -1], [1, 1]], [[1, -1], [-1, 1]],
    [[0, -1], [1, 0]], [[1, 0], [0, 1]], [[0, 1], [-1, 0]], [[-1, 0], [0, -1]]];
  segs.forEach(([a, b], i) => {
    const u = clamp01(lines * segs.length - i); if (u <= 0) return;
    line(g, [[x + a[0] * h, y + a[1] * h], [x + (a[0] + (b[0] - a[0]) * u) * h, y + (a[1] + (b[1] - a[1]) * u) * h]], 9, "#b3322c");
  });
};
/** a plain cartoon face (crowds, the personality/compatibility pictures) */
type Face = "O" | "smile" | "stern" | "grin";
const bean = (g: G, x: number, y: number, s: number, skin: string, hair: string, face: Face) => {
  el(g, x, y, 0.7 * s, 0.76 * s, skin);
  g.beginPath(); g.ellipse(x, y - 0.12 * s, 0.73 * s, 0.66 * s, 0, Math.PI, 2 * Math.PI); g.closePath(); finish(g, hair, 5);
  if (face === "O") { wideEyes(g, x, y + 0.05 * s, s, 0.24, 0); fl(g, x, y + 0.42 * s, 0.13 * s, 0.17 * s, "#5a1424"); }
  else {
    eyes(g, x, y + 0.08 * s, s, 0.24, 0);
    if (face === "smile") smile(g, x, y + 0.2 * s, 0.22 * s, 0.05 * s);
    else if (face === "grin") { g.beginPath(); g.arc(x, y + 0.25 * s, 0.26 * s, 0, Math.PI); g.closePath(); finish(g, "#5a1424", 4); }
    else { line(g, [[x - 0.17 * s, y + 0.42 * s], [x + 0.17 * s, y + 0.42 * s]], 0.05 * s); for (const sd of [-1, 1]) line(g, [[x + sd * 0.12 * s, y - 0.1 * s], [x + sd * 0.36 * s, y - 0.02 * s]], 0.05 * s); }
  }
};
const heart = (g: G, x: number, y: number, s: number, c = "#ff4f7a") => {
  g.beginPath(); g.moveTo(x, y + 0.85 * s); g.bezierCurveTo(x - 1.2 * s, y + 0.05 * s, x - 0.75 * s, y - 0.95 * s, x, y - 0.35 * s);
  g.bezierCurveTo(x + 0.75 * s, y - 0.95 * s, x + 1.2 * s, y + 0.05 * s, x, y + 0.85 * s); finish(g, shadeOf(g, x, y, s, c));
};
const lantern = (g: G, x: number, y: number, s: number, t: number) => {
  const sw = 0.06 * Math.sin(t * 2 + x);
  at(g, x, y - s, 1, sw, () => {
    line(g, [[x, y - 1.6 * s], [x, y - 0.7 * s]], 5);
    el(g, x, y, 0.75 * s, 0.62 * s, "#e0303a"); for (const dx of [-0.4, 0, 0.4]) line(g, [[x + dx * s, y - 0.58 * s], [x + dx * 1.2 * s, y], [x + dx * s, y + 0.58 * s]], 3, "rgba(120,10,20,0.5)");
    for (const dy of [-0.62, 0.62]) { g.beginPath(); g.rect(x - 0.3 * s, y + dy * s - 0.08 * s, 0.6 * s, 0.16 * s); finish(g, GOLD, 4); }
    line(g, [[x, y + 0.7 * s], [x, y + 1.15 * s]], 0.12 * s, GOLD);
  });
};
const diya = (g: G, x: number, y: number, s: number, t: number) => {
  const fk = 1 + 0.08 * Math.sin(t * 17 + x) + 0.05 * Math.sin(t * 29 + y);
  const gr = g.createRadialGradient(x, y - 0.5 * s, 0, x, y - 0.5 * s, 1.6 * s); gr.addColorStop(0, "rgba(255,200,90,0.55)"); gr.addColorStop(1, "rgba(255,200,90,0)");
  g.fillStyle = gr; g.fillRect(x - 1.7 * s, y - 2.1 * s, 3.4 * s, 3.4 * s);
  at(g, x, y - 0.1 * s, 1, 0, () => { g.beginPath(); g.moveTo(x, y - 1.05 * s * fk); g.bezierCurveTo(x + 0.32 * s, y - 0.55 * s, x + 0.22 * s, y - 0.22 * s, x, y - 0.2 * s);
    g.bezierCurveTo(x - 0.22 * s, y - 0.22 * s, x - 0.32 * s, y - 0.55 * s, x, y - 1.05 * s * fk); finish(g, "#ffb52e", 4); });
  g.beginPath(); g.ellipse(x, y, 0.8 * s, 0.42 * s, 0, 0, Math.PI); g.lineTo(x - 0.8 * s, y); g.closePath(); finish(g, shadeOf(g, x, y + 0.2 * s, s, "#c96a3a"));
  el(g, x, y, 0.8 * s, 0.14 * s, "#8a3f22", 0, 4);
};
const moonPhase = (g: G, x: number, y: number, r: number, k: number) => {
  // k = lit fraction 0 (new) .. 1 (full)
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip();
  g.fillStyle = "#e8eeff"; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.fillStyle = "#2a2d55"; g.beginPath(); g.arc(x - 2 * r * k, y, r * 1.02, 0, 7); g.fill(); g.restore();
  g.beginPath(); g.arc(x, y, r, 0, 7); g.lineWidth = 5; g.strokeStyle = INK; g.stroke();
};
const ringOf = (g: G, icons: Draw[], cx: number, cy: number, r: number, s: number, rot: number, half = 0) => {
  for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + ((i + half) * 2 * Math.PI) / 12 + rot; icons[i](g, cx + r * Math.cos(a), cy + r * Math.sin(a) + 0.08 * s, s); }
};
const ringBand = (g: G, cx: number, cy: number, r0: number, r1: number, c = NAVY) => {
  g.beginPath(); g.arc(cx, cy, r1, 0, 7); g.arc(cx, cy, r0, 7, 0, true); finish(g, c, 8);
  g.lineWidth = 8; g.strokeStyle = GOLD; for (const r of [r1 - 10, r0 + 10]) { g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke(); }
};
const plate = (g: G, x: number, y: number, r: number, glow = false) => {
  if (glow) { const gr = g.createRadialGradient(x, y, r * 0.8, x, y, r * 1.45); gr.addColorStop(0, "rgba(255,214,90,0.55)"); gr.addColorStop(1, "rgba(255,214,90,0)"); g.fillStyle = gr; g.fillRect(x - 1.5 * r, y - 1.5 * r, 3 * r, 3 * r); }
  el(g, x, y, r, r, NAVY, 0, 8); g.lineWidth = 8; g.strokeStyle = GOLD; g.beginPath(); g.arc(x, y, r - 11, 0, 7); g.stroke();
};
const stormBg = (g: G, t: number) => { sky(g, t, "#3b3f5c", "#6c6f8a"); for (let i = 0; i < 40; i++) { const x = (rnd(i) * W + t * 300) % W, y = ((rnd(i + 9) * H + t * 900) % H); line(g, [[x, y], [x - 12, y + 40]], 4, "rgba(200,210,240,0.5)"); } };
const silCache: Record<string, HTMLCanvasElement> = {};
const silhouette = (name: keyof typeof OUTFITS, col: string) => {
  const key = name + col;
  if (silCache[key]) return silCache[key];
  const c = document.createElement("canvas"); c.width = 600; c.height = 1000; const g = c.getContext("2d")!;
  bodyFront(new Pen(g), OUTFITS[name], { mode: "stand", expr: "neutral", facing: 0, seed: 3, light: -Math.PI / 2 });
  g.globalCompositeOperation = "source-in"; g.fillStyle = col; g.fillRect(0, 0, 600, 1000);
  return (silCache[key] = c);
};
/** a thought bubble with a three-dot tail toward (tx, ty); contents drawn clipped inside */
const bubble = (g: G, x: number, y: number, rx: number, ry: number, tx: number, ty: number, k: number, inside: () => void) => {
  if (k <= 0) return;
  at(g, x, y, k, 0, () => {
    for (let i = 0; i < 3; i++) { const u = 0.55 + i * 0.17; el(g, x + (tx - x) * u, y + (ty - y) * u, 26 - i * 7, 22 - i * 6, "#ffffff", 0, 5); }
    g.beginPath(); for (let i = 0; i <= 20; i++) { const a = (i * 2 * Math.PI) / 20, b = 1 + 0.07 * Math.cos(i * Math.PI); g.lineTo(x + rx * b * Math.cos(a), y + ry * b * Math.sin(a)); }
    g.closePath(); finish(g, "#ffffff", 7);
    g.save(); g.beginPath(); g.ellipse(x, y, rx * 0.97, ry * 0.97, 0, 0, 7); g.clip(); inside(); g.restore();
  });
};

/** a 3 x 4 board of plates; icon k pops on at T[k] and glows while it is the newest; all bounce after `end` */
const makeBoard = (icons: Draw[], T: number[], end: number) => (g: G, t: number) => {
  night(g, t);
  let cur = -1; for (let k = 0; k < 12; k++) if (t >= T[k] - 0.06) cur = k;
  for (let k = 0; k < 12; k++) {
    const cx = [200, 540, 880][k % 3], cy = [440, 805, 1170, 1535][Math.floor(k / 3)];
    plate(g, cx, cy, 152, k === cur && t < end);
    const p = pop((t - (T[k] - 0.06)) / 0.3);
    if (p <= 0) continue;
    const bob = k === cur && t < end ? -10 * Math.abs(Math.sin((t - T[k]) * 5)) : t > end ? -14 * Math.max(0, Math.sin((t - end) * 7 - k * 0.45)) : 0;
    at(g, cx, cy + 10, p, 0, () => icons[k](g, cx, cy + 12 + bob, 92));
  }
};
const board = makeBoard(ANIMAL, T2.animals, 16.0);

// ---------------- scene 3: the Vedic way ----------------
const ARCH = (i: number) => { const a = Math.PI + (Math.PI * i) / 11; return [540 + 440 * Math.cos(a), 960 + 440 * Math.sin(a)]; };
/** "your sign depends on the position of the Moon at your birth. That is your Chandra Rashi." */
const moonBirth = (g: G, t: number) => {
  night(g, t);
  for (let i = 0; i < 12; i++) { const [x, y] = ARCH(i), hi = i === 4 && t > 5.72; plate(g, x, y, 60, hi); at(g, x, y, hi ? 1 + 0.25 * pop((t - 5.72) / 0.3) : 1, 0, () => RASHI[i](g, x, y + 3, 40)); }
  const u = easeOut((t - 3.0) / 1.35), mi = -1.2 + 5.2 * u, [mx0, my0] = ARCH(Math.max(0, Math.min(11, Math.floor(mi)))), [mx1, my1] = ARCH(Math.max(0, Math.min(11, Math.ceil(mi))));
  const f = mi - Math.floor(mi), mx = mi < 0 ? 100 + mi * 80 : mx0 + (mx1 - mx0) * f, my = (mi < 0 ? 960 : my0 + (my1 - my0) * f) - 125;
  if (t > 4.55) { g.setLineDash([4, 26]); line(g, [[mx, my + 70], [340, 1150]], 14, `rgba(255,236,170,${(0.85 * ease((t - 4.55) / 0.3)).toFixed(2)})`); g.setLineDash([]); }
  planet(g, mx, my, 70, 1);
  cradle(g, t);
};
const rashiBoard = (() => { const T3r = [...T3.rashis]; for (let j = 0; j < 7; j++) T3r.push(12.38 + j * 0.07); return makeBoard(RASHI, T3r, 12.85); })();
/** "So twelve and twelve. Same thing?": the two sets of twelve, one above the other, a tipping balance between */
const twelveTwelve = (g: G, t: number) => {
  night(g, t);
  const rows = (icons: Draw[], y0: number, t0: number) => { for (let k = 0; k < 12; k++) { const x = 160 + (k % 4) * 253, y = y0 + Math.floor(k / 4) * 215; plate(g, x, y, 88);
    const p = pop((t - t0 - k * 0.03) / 0.3); if (p > 0) at(g, x, y, p, 0, () => icons[k](g, x, y + 6, 52)); } };
  rows(ANIMAL, 230, 13.38); rows(RASHI, 1250, 13.97);
  const tilt = t > 14.8 ? Math.sin((t - 14.8) * 6) * Math.exp(-(t - 14.8) * 1.2) : 0;
  at(g, 540, 960, 1, 0, () => { el(g, 540, 965, 140, 140, NAVY, 0, 6); at(g, 540, 990, 1, tilt * 0.5, () => scales(g, 540, 990, 110)); });
};
/** "twenty-seven Nakshatras, nine planets called the Navagraha": the Moon's ring of 27 star stations; the nine grahas
 *  in the 3 x 3 Navagraha square with the Sun in the middle */
const nakshatra = (g: G, t: number) => {
  night(g, t);
  const cx = 540, cy = 560, R = 330;
  g.lineWidth = 4; g.strokeStyle = "rgba(255,214,90,0.35)"; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  for (let i = 0; i < 27; i++) {
    const p = pop((t - 17.6 - i * 0.045) / 0.25); if (p <= 0) continue;
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 27, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    at(g, x, y, p * (1 + 0.15 * Math.sin(t * 5 + i)), (t + i) * 0.5, () => rays(g, x, y, 6, 30, 5, 0, "#ffe9a8"));
  }
  const ma = -Math.PI / 2 + (t - 17.6) * 0.9; planet(g, cx + R * Math.cos(ma), cy + R * Math.sin(ma), 34, 1);
  const glow = t > 20.6 ? 0.5 + 0.5 * Math.sin((t - 20.6) * 8) : 0;
  for (let k = 0; k < 9; k++) {
    const c = [4, 1, 7, 3, 5, 0, 2, 6, 8][k], x = 260 + (c % 3) * 280, y = 1170 + Math.floor(c / 3) * 255;
    plate(g, x, y, 112, glow > 0.5);
    const p = pop((t - 19.6 - k * 0.11) / 0.28); if (p > 0) at(g, x, y, p, 0, () => planet(g, x, y, 62, k));
  }
};
/** "a full birth chart, the Kundli": the chart draws itself and the grahas drop into their houses */
const kundliIns = (g: G, t: number) => {
  night(g, t);
  kundli(g, 540, 900, 760, ease((t - 22.3) / 1.0), clamp01((t - 23.7) / 0.4));
  const spots = [[0, 1], [3, 0], [5, 2], [6, 4], [8, 5], [9, 6], [10, 3], [1, 7], [7, 8]];
  spots.forEach(([h, k], i) => { const p = pop((t - 22.95 - i * 0.09) / 0.28); if (p <= 0) return; const x = 540 + HOUSES[h][0] * 380, y = 900 + HOUSES[h][1] * 380;
    at(g, x, y, p, 0, () => planet(g, x, y, 34, k)); });
  if (t > 23.72) rays(g, 540, 900, 420, 640, 24, t * 0.4, `rgba(255,214,90,${(0.3 * ease((t - 23.72) / 0.3)).toFixed(2)})`);
};
/** "the sidereal zodiac, based on the stars' actual positions": each sign sits on its real star pattern */
const CONST = [[[-0.3, 0.2], [0, -0.1], [0.3, 0.05]], [[-0.3, -0.2], [0, 0], [0.3, -0.15], [0.05, 0.3]], [[-0.25, -0.3], [-0.25, 0.3], [0.25, -0.3], [0.25, 0.3]],
  [[0, -0.3], [0, 0], [-0.3, 0.3], [0.3, 0.3]], [[0.3, -0.3], [0.1, -0.15], [0.15, 0.1], [-0.3, 0.05], [-0.35, 0.3]], [[-0.3, -0.25], [0, 0], [0.3, 0.2], [0.05, 0.35]],
  [[-0.3, 0.1], [0, -0.3], [0.3, 0.1]], [[-0.35, -0.2], [-0.1, 0], [0.15, 0.1], [0.3, 0.3], [0.35, 0.05]], [[-0.3, 0.3], [0, 0], [0.3, -0.3], [0.1, 0.2]],
  [[-0.3, -0.1], [0, 0.25], [0.3, -0.05]], [[-0.3, -0.2], [0, 0.1], [0.25, -0.2], [0.3, 0.3]], [[-0.35, 0], [-0.1, 0.2], [0.15, 0], [0.35, -0.25]]];
const sidereal = (g: G, t: number) => {
  night(g, t);
  const cx = 540, cy = 900, R = 360, lit = ease((t - 26.9) / 0.9), rot = (t - 24.6) * 0.05;
  ringBand(g, cx, cy, 250, 470);
  for (let i = 0; i < 12; i++) {
    const a = -Math.PI / 2 + ((i + 0.5) * 2 * Math.PI) / 12 + rot, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
    const pts = CONST[i].map(([dx, dy]) => [x + dx * 200, y + dy * 200]);
    if (lit > 0) line(g, pts.slice(0, Math.max(2, Math.ceil(pts.length * lit))), 4, `rgba(255,236,170,${(0.9 * lit).toFixed(2)})`);
    for (const [px, py] of pts) fl(g, px, py, 7 + 6 * lit, 7 + 6 * lit, `rgba(255,240,200,${(0.55 + 0.45 * lit).toFixed(2)})`);
    at(g, x, y, 1 - 0.25 * lit, 0, () => RASHI[i](g, x, y, 52));
  }
  for (let i = 0; i < 12; i++) { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 12 + rot; line(g, [[cx + 255 * Math.cos(a), cy + 255 * Math.sin(a)], [cx + 465 * Math.cos(a), cy + 465 * Math.sin(a)]], 5, GOLD); }
  planet(g, cx, cy, 120, 0);
};
/** "so many people's signs shift by one from the Western system": the Western ring stays, the sidereal ring under it
 *  slips back one sign, and the arrow over a Leo birth now points at Cancer */
const shift = (g: G, t: number) => {
  night(g, t);
  const cx = 540, cy = 900, sh = ease((t - 29.85) / 0.7) * (2 * Math.PI) / 12, west = t > 30.8 && t < 31.6;
  ringBand(g, cx, cy, 330, 470, west ? "#3a3f8a" : NAVY);
  ringOf(g, RASHI, cx, cy, 400, 46, -4 * (2 * Math.PI) / 12);
  ringBand(g, cx, cy, 150, 320);
  ringOf(g, RASHI, cx, cy, 236, 52, -4 * (2 * Math.PI) / 12 + sh);
  planet(g, cx, cy, 80, 0);
  poly(g, [[cx - 40, cy - 560], [cx + 40, cy - 560], [cx, cy - 480]], GOLD, 6);
  if (t > 30.4) { const p = pop((t - 30.4) / 0.3); at(g, cx, cy - 236, p, 0, () => { g.lineWidth = 10; g.strokeStyle = GOLD; g.beginPath(); g.arc(cx, cy - 236, 70, 0, 7); g.stroke(); }); }
};
/** "Possibly a Cancer.": the crab, waving */
const cancerPop = (g: G, t: number) => {
  night(g, t);
  rays(g, 540, 960, 300, 1300, 18, t * 0.4, "rgba(229,83,58,0.25)");
  at(g, 540, 960, pop((t - 34.65) / 0.3), 0, () => crab(g, 540, 1000, 300, Math.sin((t - 34.6) * 14)));
};

// ---------------- scene 4: time vs sky ----------------
const hourglass = (g: G, x: number, y: number, s: number, rot: number, sand: number) => at(g, x, y, 1, rot, () => {
  for (const dy of [-1, 1]) { g.beginPath(); g.rect(x - 0.75 * s, y + dy * s - 0.08 * s, 1.5 * s, 0.16 * s); finish(g, "#8a5a3b"); }
  poly(g, [[x - 0.55 * s, y - 0.92 * s], [x + 0.55 * s, y - 0.92 * s], [x + 0.06 * s, y], [x + 0.55 * s, y + 0.92 * s], [x - 0.55 * s, y + 0.92 * s], [x - 0.06 * s, y]], "rgba(220,240,255,0.55)");
  poly(g, [[x - 0.45 * s * (1 - sand), y - 0.85 * s + 0.8 * s * sand], [x + 0.45 * s * (1 - sand), y - 0.85 * s + 0.8 * s * sand], [x, y - 0.05 * s]], GOLD, 3);
  poly(g, [[x - 0.5 * s, y + 0.86 * s], [x + 0.5 * s, y + 0.86 * s], [x, y + 0.86 * s - 0.6 * s * sand]], GOLD, 3);
});
/** "Chinese astrology is about time, your birth year. Indian astrology is about sky position, your Moon and planets." */
const timeSky = (g: G, t: number) => {
  // top: a conveyor of year tiles under an hourglass; the Dragon year stops in the middle on "birth year"
  const gr = g.createLinearGradient(0, 0, 0, 960); gr.addColorStop(0, "#8e1f2c"); gr.addColorStop(1, "#5c1220"); g.fillStyle = gr; g.fillRect(0, 0, W, 960);
  const flip = ease((t - 1.8) / 0.45);
  hourglass(g, 540, 300, 150, flip * Math.PI, flip > 0.99 ? clamp01((t - 2.25) / 4) : clamp01((t - 0.4) / 1.4));
  const scroll = 520 * (1 - easeOut((t - 0.45) / 1.95));
  for (let i = -2; i < 12; i++) {
    const k = ((i % 12) + 12) % 12, x = 540 + (i - 4) * 190 + scroll, y = 700, hi = k === 4 && t > 2.45;
    if (x < -150 || x > W + 150) continue;
    at(g, x, y, hi ? 1 + 0.2 * pop((t - 2.45) / 0.3) : 1, 0, () => { g.beginPath(); g.roundRect(x - 80, y - 80, 160, 160, 24); finish(g, hi ? GOLD : "#f6e7c6", 7); ANIMAL[k](g, x, y + 6, 52); });
  }
  // bottom: the night sky, its belt of signs, then the Moon and planets
  const on = clamp01((t - 3.35) / 0.25);
  g.fillStyle = "#0d0f2a"; g.fillRect(0, 960, W, 960);
  g.save(); g.globalAlpha = 0.25 + 0.75 * on;
  const gb = g.createLinearGradient(0, 960, 0, H); gb.addColorStop(0, "#2b2f78"); gb.addColorStop(1, "#141842"); g.fillStyle = gb; g.fillRect(0, 960, W, 960);
  for (let i = 0; i < 60; i++) fl(g, rnd(i * 3 + 1) * W, 980 + rnd(i * 3 + 2) * 920, 3 + 2 * rnd(i), 3 + 2 * rnd(i), `rgba(255,240,200,${(0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))).toFixed(2)})`);
  g.restore();
  if (t > 4.65) for (let i = 0; i < 12; i++) { const p = pop((t - 4.65 - i * 0.04) / 0.25); const x = 90 + i * 82, y = 1180 - 120 * Math.sin((Math.PI * i) / 11); if (p > 0) at(g, x, y, p, 0, () => RASHI[i](g, x, y, 32)); }
  const mp = pop((t - 5.7) / 0.3); if (mp > 0) at(g, 360, 1520, mp, 0, () => planet(g, 360, 1520, 110, 1));
  [[2, 700, 1430, 60], [4, 860, 1640, 80], [6, 600, 1720, 55]].forEach(([k, x, y, s], i) => { const p = pop((t - 6.22 - i * 0.08) / 0.28); if (p > 0) at(g, x, y, p, 0, () => planet(g, x, y, s, k)); });
  if (t < 3.35) { g.fillStyle = "rgba(10,12,40,0.45)"; g.fillRect(0, 960, W, 960); } else { g.fillStyle = `rgba(10,12,40,${(0.4 * on).toFixed(2)})`; g.fillRect(0, 0, W, 960); }
  line(g, [[0, 960], [W, 960]], 14, GOLD);
};
/** "One animal, one year.": a single Dragon and a single year coin */
const oneOne = (g: G, t: number) => {
  night(g, t);
  const a = pop((t - 8.6) / 0.3), b = pop((t - 9.62) / 0.3);
  if (b > 0) line(g, [[540, 940], [540, 1220]], 12, GOLD);
  at(g, 540, 700, a, 0, () => { el(g, 540, 700, 250, 250, "#c8263a"); g.lineWidth = 14; g.strokeStyle = GOLD; g.beginPath(); g.arc(540, 700, 225, 0, 7); g.stroke(); dragon(g, 540, 730, 140); });
  at(g, 540, 1400, b, 0, () => coin(g, 540, 1400, 170));
};
/** "Moon, planets, houses, everything.": the Kundli fills in */
const detailed = (g: G, t: number) => {
  night(g, t);
  kundli(g, 540, 900, 760, 1, clamp01((t - 12.85) / 0.45));
  const spots = [[3, 1], [0, 0], [5, 2], [8, 4], [10, 6], [1, 5], [6, 3], [9, 7], [7, 8]];
  spots.forEach(([h, k], i) => { const t0 = i === 0 ? 11.78 : i < 5 ? 12.28 + (i - 1) * 0.08 : 13.36 + (i - 5) * 0.06; const p = pop((t - t0) / 0.28); if (p <= 0) return;
    const x = 540 + HOUSES[h][0] * 380, y = 900 + HOUSES[h][1] * 380; at(g, x, y, p, 0, () => planet(g, x, y, i === 0 ? 46 : 34, k)); });
  if (t > 13.36) rays(g, 540, 900, 420, 700, 24, t * 0.5, `rgba(255,214,90,${(0.35 * ease((t - 13.36) / 0.3)).toFixed(2)})`);
};
/** "both predict personality and compatibility": a face trying on moods; two faces with a heart */
const personality = (g: G, t: number) => {
  night(g, t);
  const moods: Face[] = ["smile", "stern", "O", "grin"], m = moods[Math.max(0, Math.floor((t - 15.0) / 0.22)) % 4];
  plate(g, 540, 560, 270);
  at(g, 540, 560, pop((t - 14.98) / 0.3), 0, () => bean(g, 540, 580, 190, "#e8b48a", "#2a1a1a", t < 15.0 ? "smile" : m));
  const p = pop((t - 15.9) / 0.3);
  if (p > 0) at(g, 540, 1430, p, 0, () => { bean(g, 300, 1450, 150, "#c99067", "#1e1a1c", "grin"); bean(g, 780, 1450, 150, "#f2cfa6", "#151417", "grin");
    heart(g, 540, 1420 - 20 * Math.abs(Math.sin(t * 5)), 95); });
};
const garland = (g: G, y: number, t: number) => { for (let i = 0; i < 24; i++) { const x = 20 + i * 45, yy = y + 60 * Math.sin((Math.PI * i) / 23); el(g, x, yy, 24, 24, i % 2 ? "#ff9f1c" : "#ffd23f", 0, 4); } void t; };
/** "India has Kundli Milan before weddings": two charts slide together; a heart and marigolds */
const milan = (g: G, t: number) => {
  sky(g, t, "#7a1d2a", "#3d0d18");
  const u = ease((t - 18.4) / 0.85);
  kundli(g, 270 + 140 * u, 1000, 330); kundli(g, 810 - 140 * u, 1000, 330);
  const p = pop((t - 19.2) / 0.3);
  if (p > 0) { at(g, 540, 560, p, 0, () => heart(g, 540, 560, 170)); garland(g, 130, t); }
};
/** "China checks animal compatibility, like Dragon with Rooster": the six harmony pairs as chords across the wheel,
 *  then the Dragon-Rooster pair with hearts */
const PAIRS = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const harmony = (g: G, t: number) => {
  night(g, t);
  const cx = 540, cy = 900, R = 360;
  if (t < 22.35) {
    const pos = (i: number) => { const a = -Math.PI / 2 + ((i - 0.5) * 2 * Math.PI) / 12; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
    PAIRS.forEach(([a, b], j) => { const u = clamp01((t - 20.4 - j * 0.22) / 0.3); if (u <= 0) return; const A = pos(a), B = pos(b);
      line(g, [A, [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u]], j === 3 ? 14 : 9, j === 3 && t > 21.9 ? "#ff4f7a" : "#5fbf4a"); });
    for (let i = 0; i < 12; i++) { const [x, y] = pos(i); plate(g, x, y, 78, (i === 4 || i === 9) && t > 21.9); ANIMAL[i](g, x, y + 6, 48); }
    return;
  }
  const a = pop((t - 22.42) / 0.3), b = pop((t - 23.03) / 0.3);
  at(g, 290, 960, a, 0, () => { plate(g, 290, 960, 200); dragon(g, 290, 985, 120); });
  at(g, 790, 960, b, 0, () => { plate(g, 790, 960, 200); rooster(g, 790, 985, 120); });
  if (b > 0) for (let i = 0; i < 6; i++) { const u = ((t - 23.05) * 0.6 + i / 6) % 1; heart(g, 540 + 60 * Math.sin(u * 9 + i), 1250 - 900 * u, 40 + 30 * (1 - u)); }
};
/** "some pairs are bad luck. Tiger and Monkey": opposite each other on the wheel; a storm between them */
const clash = (g: G, t: number) => {
  stormBg(g, t);
  const c = pop((t - 24.9) / 0.35); if (c > 0) at(g, 540, 380, c, 0, () => { cloud(g, 540, 380, 170, "#6b6f85"); cloud(g, 330, 450, 110, "#5b5f75"); cloud(g, 760, 440, 120, "#5b5f75"); });
  const a = pop((t - 25.95) / 0.3), b = pop((t - 26.63) / 0.3), sh = t > 26.9 ? 8 * Math.sin(t * 60) * Math.exp(-(t - 26.9) * 3) : 0;
  at(g, 280 + sh, 1150, a, 0, () => { tiger(g, 280 + sh, 1150, 150); for (const sd of [-1, 1]) line(g, [[280 + sh + sd * 15, 1100], [280 + sh + sd * 80, 1080 + (sd > 0 ? 15 : -5)]], 10); });
  at(g, 800 - sh, 1150, b, 0, () => { monkey(g, 800 - sh, 1150, 150); line(g, [[740 - sh, 1100], [790 - sh, 1110]], 10); line(g, [[810 - sh, 1110], [860 - sh, 1100]], 10); });
  if (t > 26.88 && Math.floor(t * 12) % 3 !== 0) poly(g, [[560, 600], [490, 900], [560, 900], [500, 1180], [620, 850], [550, 850], [620, 600]], "#ffe35a", 6);
};
/** "We have Manglik Dosha": Mars, glowing */
const mars = (g: G, t: number) => {
  night(g, t);
  if (t > 28.85) { const k = 0.5 + 0.5 * Math.sin((t - 28.85) * 10); const gr = g.createRadialGradient(540, 900, 250, 540, 900, 520); gr.addColorStop(0, `rgba(255,70,40,${(0.6 * k).toFixed(2)})`); gr.addColorStop(1, "rgba(255,70,40,0)"); g.fillStyle = gr; g.fillRect(0, 300, W, 1200); }
  at(g, 540, 900, pop((t - 28.5) / 0.35), 0, () => planet(g, 540, 900, 330, 2));
};
/** "Half of India panics over it.": a crowd of shocked faces; every other one gets a little Mars over its head
 *  (Mars in 6 of the 12 houses makes a chart Manglik, so roughly half of all charts are) */
const SKINS = ["#c99067", "#b97d55", "#e8b48a", "#a86d48", "#d9a477"], HAIRS = ["#1e1a1c", "#2a1a1a", "#3a2a22", "#151417"];
const panic = (g: G, t: number) => {
  sky(g, t, "#ffd9a0", "#ffb36b");
  for (let k = 0; k < 20; k++) {
    const c = k % 4, r = Math.floor(k / 4), x = 160 + c * 253 + (r % 2) * 40 - 20 + 6 * Math.sin(t * 40 + k), y = 330 + r * 330 + 5 * Math.cos(t * 37 + k * 2);
    bean(g, x, y, 95, SKINS[k % 5], HAIRS[k % 4], "O");
    el(g, x + 72, y - 40, 12, 18, "#9ad8ff", 0, 3);
    if ((k + r) % 2 === 0) { const p = pop((t - 29.65 - k * 0.04) / 0.25); if (p > 0) at(g, x, y - 115, p, 0, () => planet(g, x, y - 115, 28, 2)); }
  }
};

// ---------------- scene 5: who's right ----------------
/** "Both are ways of finding patterns in life.": scattered stars join up into Leo, and the lion appears in them */
const LEO = [[0.62, 0.68], [0.58, 0.55], [0.52, 0.43], [0.56, 0.32], [0.65, 0.27], [0.72, 0.33], [0.3, 0.42], [0.18, 0.55], [0.32, 0.57]];
const LEO_LINES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [6, 7], [7, 8], [8, 0]];
const patterns = (g: G, t: number) => {
  night(g, t);
  const P = LEO.map(([x, y]) => [x * W * 1.15 - 80, y * H * 1.2 - 140]);
  const lionA = ease((t - 6.25) / 0.6);
  if (lionA > 0) { g.save(); g.globalAlpha = 0.35 * lionA; lion(g, 540, 820, 330); g.restore(); }
  LEO_LINES.forEach(([a, b], i) => { const u = clamp01((t - 5.15 - i * 0.09) / 0.2); if (u <= 0) return; line(g, [P[a], [P[a][0] + (P[b][0] - P[a][0]) * u, P[a][1] + (P[b][1] - P[a][1]) * u]], 6, "rgba(255,236,170,0.9)"); });
  for (const [x, y] of P) at(g, x, y, 1 + 0.2 * Math.sin(t * 4 + x), 0, () => rays(g, x, y, 8, 34, 5, t * 0.3, "#fff1c4"));
};
/** "thousands of years of people watching time, the sky, and each other": days and nights rush past over two
 *  watchers on a hill (Pandit Rao's and Master Lin's shapes), then the night holds and the stars come out */
const watchers = (g: G, t: number) => {
  const spin = (t - 7.8) * 4.2 * (1 - 0.85 * ease((t - 9.2) / 0.8)), day = 0.5 + 0.5 * Math.cos(spin) * (1 - ease((t - 9.0) / 1.0)) - 0.5 * ease((t - 9.0) / 1.0);
  const d = clamp01(day);
  const top = `rgb(${Math.round(20 + 120 * d)},${Math.round(24 + 160 * d)},${Math.round(70 + 185 * d)})`, bot = `rgb(${Math.round(40 + 215 * d)},${Math.round(40 + 186 * d)},${Math.round(100 + 60 * d)})`;
  sky(g, t, top, bot);
  for (let i = 0; i < 90; i++) fl(g, rnd(i * 2 + 1) * W, rnd(i * 2 + 2) * 1300, 2.5 + 2 * rnd(i), 2.5 + 2 * rnd(i), `rgba(255,240,200,${((1 - d) * (t > 10.5 ? 1 : 0.6) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i)))).toFixed(2)})`);
  const a = spin % (2 * Math.PI);
  planet(g, 540 + 600 * Math.sin(a), 1300 - 900 * Math.cos(a), 80, 0);
  planet(g, 540 - 600 * Math.sin(a), 1300 + 900 * Math.cos(a), 60, 1);
  g.beginPath(); g.ellipse(540, 1950, 900, 520, 0, Math.PI, 2 * Math.PI); g.closePath(); finish(g, d > 0.5 ? "#4f8a3a" : "#1f3a2a", 8);
  const sp = silhouette("PANDIT", "#141020"), sl = silhouette("LIN", "#141020");
  g.drawImage(sp, 110, 800, 430, 717); g.drawImage(sl, 540, 800, 430, 717);
};
/** "Diwali follows the lunar calendar": the Moon wanes to the new moon of Kartika; a row of diyas lights up */
const diwali = (g: G, t: number) => {
  night(g, t);
  for (let i = 0; i < 7; i++) { const x = 130 + i * 137; moonPhase(g, x, 420, 52, 1 - i / 6); }
  if (t > 15.25) { const p = pop((t - 15.25) / 0.3); at(g, 952, 420, p, 0, () => { g.lineWidth = 10; g.strokeStyle = GOLD; g.beginPath(); g.arc(952, 420, 78, 0, 7); g.stroke(); }); }
  for (let i = 0; i < 5; i++) { const p = pop((t - 14.4 - i * 0.12) / 0.3); if (p > 0) at(g, 160 + i * 190, 1400, p, 0, () => diya(g, 160 + i * 190, 1400, 85, t)); }
  for (let i = 0; i < 3; i++) { const p = pop((t - 14.75 - i * 0.12) / 0.3); if (p > 0) at(g, 250 + i * 290, 1100, p, 0, () => diya(g, 250 + i * 290, 1100, 65, t)); }
};
/** "Chinese New Year follows the animal cycle": lanterns, fireworks, the same new moon, the wheel ticks to the next animal */
const newYear = (g: G, t: number) => {
  sky(g, t, "#8e1f2c", "#3d0d18");
  for (const [x, t0, c] of [[260, 16.6, GOLD], [800, 16.95, "#ff8a3d"], [540, 17.3, "#fff3b0"]] as const) {
    const u = (t - t0) / 0.8; if (u < 0 || u > 1) continue;
    rays(g, x, 560, 40 + 200 * u, 90 + 300 * u, 16, 0, c.startsWith("#fff") ? `rgba(255,243,176,${(1 - u).toFixed(2)})` : c === GOLD ? `rgba(243,196,78,${(1 - u).toFixed(2)})` : `rgba(255,138,61,${(1 - u).toFixed(2)})`);
  }
  for (const x of [170, 540, 910]) lantern(g, x, 330, 95, t);
  moonPhase(g, 900, 760, 50, 0); g.lineWidth = 10; g.strokeStyle = GOLD; g.beginPath(); g.arc(900, 760, 76, 0, 7); g.stroke();
  const cx = 540, cy = 1380, step = ease((t - 17.9) / 0.5) * (2 * Math.PI) / 12;
  ringBand(g, cx, cy, 130, 380);
  ringOf(g, ANIMAL, cx, cy, 255, 54, -4 * (2 * Math.PI) / 12 - step);
  poly(g, [[cx - 36, cy - 470], [cx + 36, cy - 470], [cx, cy - 400]], GOLD, 6);
  coin(g, cx, cy, 100);
};
/** "Chinese wins on cool animals.": the whole zoo, the Dragon in sunglasses */
const cool = (g: G, t: number) => {
  night(g, t);
  ringOf(g, ANIMAL.map((d, i) => (i === 4 ? () => {} : d)), 540, 900, 400, 58, (t - 22.0) * 0.25);
  at(g, 540, 900, pop((t - 22.0) / 0.3), 0, () => {
    dragon(g, 540, 920, 170);
    const gy = Math.max(0, 1 - ease((t - 22.6) / 0.3)) * -260;
    at(g, 540, 885 + gy, pop((t - 22.6) / 0.3) || (t > 22.6 ? 1 : 0), 0, () => {
      for (const sd of [-1, 1]) { g.beginPath(); g.roundRect(540 + sd * 52 - 50, 860 + gy, 100, 58, 18); finish(g, "#151417", 6); }
      line(g, [[530, 875 + gy], [550, 875 + gy]], 10);
    });
  });
};
/** "But the Rat-on-the-Ox story is great.": a replay of the finish, a little faster */
const replay = (g: G, t: number) => raceFinish(g, 26.6 + (t - 27.6) * 1.3);

// ---------------- scene 6: thought bubbles over whoever is talking ----------------
const BX = 790, BY = 300, BRX = 250, BRY = 205;
const thought = (tIn: number, tx: number, ty: number, inside: (g: G, t: number) => void) => (g: G, t: number) =>
  bubble(g, BX, BY, BRX, BRY, tx, ty, pop((t - tIn) / 0.28), () => inside(g, t));
const swap = (g: G, t: number, t1: number, a: () => void, b: () => void) => { if (t < t1) a(); else at(g, BX, BY, pop((t - t1) / 0.25), 0, b); };
const scribble = (g: G, t: number, t0: number) => {
  const n = Math.floor(clamp01((t - t0) / 1.0) * 60), pts: number[][] = [];
  for (let i = 0; i <= n; i++) pts.push([BX + 170 * Math.sin(i * 0.9 + rnd(i) * 2) * (0.4 + 0.6 * rnd(i + 3)), BY + 130 * Math.cos(i * 1.3 + rnd(i + 7)) * (0.4 + 0.6 * rnd(i + 11))]);
  if (pts.length > 1) line(g, pts, 7);
};
const roads = (g: G, t: number, join: number) => {
  sky(g, t, "#bfe0ff", "#e8f4ff");
  const top = BY - 150, bot = BY + 190;
  g.fillStyle = "#7cc35a"; g.fillRect(BX - 300, top + 30, 600, 400);
  for (const sd of [-1, 1]) { const ex = BX + sd * (1 - join) * 160; poly(g, [[BX - 60, bot], [BX + 60, bot], [ex + sd * 15, top + 30], [ex - sd * 15 + (sd > 0 ? -10 : 10), top + 30]], "#9aa0ab", 5); }
  for (const sd of [-1, 1]) { const ex = BX + sd * (1 - join) * 160; g.setLineDash([16, 18]); line(g, [[BX, bot], [ex, top + 34]], 5, "#ffffff"); g.setLineDash([]); }
  if (join > 0) at(g, BX, top + 20, pop(join), t * 0.5, () => rays(g, BX, top + 20, 18, 70, 5, 0, GOLD));
};
const S6Bubbles = {
  rohan: thought(1.7, 600, 640, (g, t) => swap(g, t, 2.5, () => dragon(g, BX, BY + 25, 125), () => lion(g, BX, BY + 15, 140))),
  wei: thought(3.3, 600, 640, (g, t) => swap(g, t, 4.03, () => rat(g, BX, BY + 15, 130), () => crab(g, BX, BY + 40, 120, Math.sin(t * 12)))),
  aarav: thought(5.1, 600, 640, (g, t) => scribble(g, t, 5.2)),
  kabir: thought(7.2, 560, 640, (g, t) => { el(g, BX, BY + 10, 110, 110, NAVY, 0, 0); confetti(g, BX, BY + 120, t - 7.65, 30); poly(g, [[BX - 30, BY + 150], [BX + 30, BY + 150], [BX, BY + 40]], RED, 5); }),
  lin: thought(8.6, 600, 640, (g, t) => roads(g, t, 0)),
  pandit: thought(10.05, 600, 640, (g, t) => roads(g, t, ease((t - 10.6) / 0.6))),
};

export const INSERTS: Record<number, Insert[]> = {
  2: [
    { a: 1.95, b: 4.25, draw: birth, frame: true },
    { a: 4.25, b: 16.35, draw: board, frame: true },
    { a: 19.1, b: 20.3, draw: jade },
    { a: 20.3, b: 25.2, draw: raceWide },
    { a: 25.2, b: 29.72, draw: raceFinish },
    { a: 31.85, b: 39.6, draw: cycle, frame: true },
  ],
  3: [
    { a: 3.0, b: 6.95, draw: moonBirth, frame: true },
    { a: 6.95, b: 12.95, draw: rashiBoard, frame: true },
    { a: 13.35, b: 15.95, draw: twelveTwelve, frame: true },
    { a: 17.5, b: 21.75, draw: nakshatra, frame: true },
    { a: 22.25, b: 24.6, draw: kundliIns, frame: true },
    { a: 24.6, b: 28.6, draw: sidereal, frame: true },
    { a: 28.6, b: 32.1, draw: shift, frame: true },
    { a: 34.6, b: 35.35, draw: cancerPop, frame: true },
  ],
  4: [
    { a: 0.45, b: 6.9, draw: timeSky },
    { a: 8.55, b: 10.55, draw: oneOne, frame: true },
    { a: 11.7, b: 14.05, draw: detailed, frame: true },
    { a: 14.95, b: 16.95, draw: personality, frame: true },
    { a: 17.6, b: 20.0, draw: milan },
    { a: 20.0, b: 23.75, draw: harmony, frame: true },
    { a: 24.8, b: 28.1, draw: clash },
    { a: 28.45, b: 29.6, draw: mars, frame: true },
    { a: 29.6, b: 31.3, draw: panic },
  ],
  5: [
    { a: 3.9, b: 6.95, draw: patterns, frame: true },
    { a: 7.8, b: 11.5, draw: watchers },
    { a: 14.3, b: 16.45, draw: diwali, frame: true },
    { a: 16.45, b: 18.75, draw: newYear },
    { a: 22.0, b: 23.9, draw: cool, frame: true },
    { a: 27.6, b: 30.3, draw: replay },
  ],
  6: [
    { a: 1.7, b: 3.1, draw: S6Bubbles.rohan, full: false },
    { a: 3.3, b: 4.85, draw: S6Bubbles.wei, full: false },
    { a: 5.1, b: 6.5, draw: S6Bubbles.aarav, full: false },
    { a: 7.2, b: 8.45, draw: S6Bubbles.kabir, full: false },
    { a: 8.6, b: 9.75, draw: S6Bubbles.lin, full: false },
    { a: 10.05, b: 12.95, draw: S6Bubbles.pandit, full: false },
  ],
};

/** paint the insert live at t (if any) onto a 1080 x 1920 design-space context. Full-frame cutaways get a 5-frame
 *  zoom settle on entry and a slow 3 % push so they never sit still; bubbles draw as they are over the stage */
export const paintInsert = (g: G, scene: number, t: number) => {
  const ins = (INSERTS[scene] ?? []).find((i) => t >= i.a && t < i.b);
  if (!ins) return false;
  if (ins.full === false) { ins.draw(g, t); return true; }
  const k = 1 + 0.06 * (1 - ease((t - ins.a) / (5 / 30))) + 0.03 * ((t - ins.a) / (ins.b - ins.a));
  g.save(); g.translate(540, 960); g.scale(k, k); g.translate(-540, -960);
  ins.draw(g, t);
  g.restore();
  if (ins.frame) frame(g);
  return true;
};
