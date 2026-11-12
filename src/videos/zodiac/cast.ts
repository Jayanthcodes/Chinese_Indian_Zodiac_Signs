// The six characters of "What's Your Sign?" as lit flat cards (the bridge short's Pool / Actor / Fx machinery).
// Each scene is a table of beats per character (expression, arms, who they look at) plus walk paths; mouths flap
// on the words they speak (words.json), blinks are seeded per character.
import * as THREE from "three";
import { Pen, bodyFront, fxBurst, fxShadow, fxContact, Outfit, Expr, FrontOpts, Gesture } from "../bridge/toon";
import type { Place, FxPlace } from "../bridge/cast";
import { FPS, SceneDef, smooth, clamp01, POS, wheelFace, WHEEL_I0, T2, T3, T4, T6 } from "./story";

export type Name = "ROHAN" | "AARAV" | "WEI" | "KABIR" | "PANDIT" | "LIN";
export const OUTFITS: Record<Name, Outfit> = {
  ROHAN: { jacket: "#1f9e9a", pants: "#2c3a5e", boots: "#f4f1ea", hat: "hair", hair: "#1e1a1c", skin: "#c99067", lanyard: "#d23b3b" },
  AARAV: { jacket: "#f08a2c", pants: "#efe9dc", boots: "#7a4f33", hat: "hair", hair: "#241c1c", skin: "#b97d55", buttons: "#f6d36b" },
  WEI: { jacket: "#d23b3b", pants: "#2b2d33", boots: "#f4f1ea", hat: "hair", hair: "#151417", skin: "#f2cfa6", zip: "#f3c44e", hairStyle: "spiky" },
  KABIR: { jacket: "#7d8592", pants: "#3b5b9a", boots: "#3a3d47", hat: "hair", hair: "#3a2a22", skin: "#d9a477", glasses: "#241726", zip: "#5d6470" },
  PANDIT: { jacket: "#f6f1e4", pants: "#f6f1e4", boots: "#7a4f33", hat: "bald", hair: "#f2f2f2", skin: "#a86d48", dress: "#f6f1e4",
    shawl: "#e8892c", tilak: true, moustache: "#e9e9e9" },
  LIN: { jacket: "#25406e", pants: "#25406e", boots: "#1d1b22", hat: "hair", hair: "#d9d9d9", skin: "#ecc49a", dress: "#25406e",
    buttons: "#e8c45a", beard: "#efefef", moustache: "#efefef" },
};
const SEED: Record<Name, number> = { ROHAN: 3, AARAV: 6, WEI: 2, KABIR: 5, PANDIT: 7, LIN: 1 };
const NAMES = Object.keys(OUTFITS) as Name[];

type St = { expr: Expr; gesture?: Gesture; facing?: -1 | 0 | 1 };
type Beat = [number, Partial<St>];
type Path = [number, number, number][]; // [t, x, z]
type Act = { path: Path; beats: Beat[]; claps?: number[]; bow?: [number, number] };

/** beats land 2 frames before the word they react to */
const L = 2 / FPS;

// ---------------- scene 1 ----------------
const ACT1: Record<Name, Act> = {
  ROHAN: {
    path: [[0, 0, 0.1]],
    beats: [[0, { expr: "grin", gesture: "mic", facing: 0 }], [6.0, { expr: "smile", facing: -1 }], [10.2, { facing: 1 }],
      [15.9, { expr: "neutral", facing: 1 }], [19.27 - L, { expr: "stern", gesture: "point", facing: 1 }],
      [20.78 - L, { expr: "grin", gesture: "mic", facing: 0 }], [21.75, { gesture: "clap" }],
      [22.73 - L, { expr: "grin", gesture: "palms", facing: -1 }], [23.89 - L, { facing: 1 }], [24.9, { gesture: "mic", facing: 0, expr: "smile_closed" }]],
    claps: [21.97, 22.25],
  },
  AARAV: {
    path: [[0, -0.85, 0.75]],
    beats: [[0, { expr: "smile", facing: 1 }], [4.6 - L, { expr: "grin", facing: 0 }], [6.12 - L, { expr: "grin", gesture: "chest", facing: 0 }],
      [10.34 - L, { expr: "stern", gesture: "hips", facing: 1 }], [12.27 - L, { expr: "nervous" }], [13.2, { expr: "stern" }],
      [16.01 - L, { expr: "stern", facing: 1 }], [20.78 - L, { expr: "smile", gesture: undefined, facing: 0 }],
      [22.6, { facing: -1, expr: "smile" }], [24.9, { expr: "grin" }]],
  },
  WEI: {
    path: [[0, 0.85, 0.75]],
    beats: [[0, { expr: "smile", facing: -1 }], [5.15 - L, { expr: "grin", facing: 0 }], [6.12 - L, { expr: "smile", facing: -1 }],
      [10.34 - L, { expr: "smile", gesture: "palms", facing: -1 }], [12.27 - L, { expr: "grin", gesture: "claws", facing: 0 }],
      [13.18 - L, { gesture: "chest" }], [16.01 - L, { expr: "stern", gesture: undefined, facing: 1 }],
      [20.78 - L, { expr: "smile", facing: 0 }], [23.6, { facing: 1 }], [24.9, { expr: "grin" }]],
  },
  KABIR: {
    path: [[0, 2.35, -0.6]],
    beats: [[0, { expr: "neutral", gesture: "crossed", facing: -1 }], [16.01 - L, { expr: "smile" }], [19.27 - L, { expr: "neutral", gesture: "palms" }],
      [20.5, { gesture: "crossed" }], [24.9, { expr: "smile" }]],
  },
  PANDIT: {
    path: [[0, -3.6, 1.6], [22.3, -3.6, 1.6], [23.8, -1.3, 1.7]],
    beats: [[0, { expr: "smile_closed", facing: 1 }], [23.8, { gesture: "clap", facing: 0 }]],
    bow: [24.05, 25.15],
  },
  LIN: {
    path: [[0, 3.6, 1.6], [23.2, 3.6, 1.6], [24.7, 1.3, 1.7]],
    beats: [[0, { expr: "smile", facing: -1 }], [24.7, { gesture: "clap", facing: 0 }]],
    bow: [24.95, 26.05],
  },
};
const BURSTS1: { t: number; at: [number, number, number]; s: number; col: string }[] = [
  { t: 7.6, at: [-0.85, 1.75, 0.55], s: 1.3, col: "#ffd34d" },   // "Simha"
  { t: 12.24, at: [0.85, 1.6, 0.5], s: 1.9, col: "#ff8a3d" },    // "Dragon"
  { t: 21.97, at: [0, 1.28, 0.3], s: 0.45, col: "#fff3b0" },     // claps
  { t: 22.25, at: [0, 1.28, 0.3], s: 0.45, col: "#fff3b0" },
];
// ---------------- scenes 2-6: everyone on their scene-1 end marks; no `facing` = look at whoever is talking ----------------
type Burst = { t: number; at: [number, number, number]; s: number; col: string };
const still = (name: Name): Path => [[0, POS[name][0], POS[name][1]]];
const cast = (beats: Record<Name, Beat[]>): Record<Name, Act> =>
  Object.fromEntries(NAMES.map((n) => [n, { path: still(n), beats: beats[n] }])) as Record<Name, Act>;
const sparkle = (wheel: "rashi" | "animal", times: number[]): Burst[] =>
  times.map((t, k) => { const [x, y, z] = wheelFace(wheel, WHEEL_I0 + k); return { t: t - 0.03, at: [x, y, z + 0.05], s: 0.55, col: "#ffd34d" }; });

const ACT2 = cast({
  ROHAN: [[0, { expr: "smile", gesture: "mic" }], [29.8, { expr: "grin" }], [31.0, { expr: "smile" }]],
  AARAV: [[0, { expr: "smile" }], [21.4, { expr: "neutral" }], [26.69 - L, { expr: "stern" }], [29.82 - L, { expr: "shock", gesture: "point", facing: 1 }],
    [30.74 - L, { expr: "stern", gesture: "crossed", facing: undefined }], [34.0, { expr: "neutral" }]],
  WEI: [[0, { expr: "smile" }], [9.57 - L, { expr: "grin", gesture: "chest" }], [10.6, { expr: "smile", gesture: undefined }],
    [25.29 - L, { expr: "grin", gesture: "palms" }], [27.78 - L, { gesture: "up" }], [29.82 - L, { expr: "smile", gesture: "hips" }],
    [30.74 - L, { expr: "grin" }], [33.0, { gesture: undefined }]],
  KABIR: [[0, { expr: "neutral", gesture: "crossed" }], [16.55 - L, { gesture: "palms" }], [17.95, { gesture: "crossed" }], [25.6, { expr: "smile" }], [30.0, { expr: "neutral" }]],
  PANDIT: [[0, { expr: "smile_closed" }], [30.74, { expr: "smile" }]],
  LIN: [[0, { expr: "smile", gesture: "palms" }], [4.48 - L, { gesture: "up" }], [5.9, { gesture: "palms" }], [16.3, { gesture: undefined }],
    [18.14 - L, { gesture: "up" }], [20.0, { gesture: "palms" }], [25.0, { gesture: undefined }], [30.74 - L, { expr: "grin", gesture: "up" }],
    [31.9, { expr: "smile", gesture: "palms" }], [34.79 - L, { gesture: "up" }], [38.3, { expr: "smile_closed", gesture: undefined }]],
});
const ELEM = ["#5fbf4a", "#ff5a36", "#d9a441", "#e6edf5", "#4aa3ff"]; // wood fire earth metal water
const BURSTS2: Burst[] = [
  ...sparkle("animal", T2.animals),
  { t: 27.75, at: [0.85, 1.7, 0.55], s: 1.0, col: "#ff8a3d" },                                   // the Rat jumps
  ...T2.elements.map((t, k): Burst => { const a = Math.PI * (0.85 - 0.175 * k);
    return { t: t - 0.03, at: [1.3 + 0.62 * Math.cos(a), 1.78 + 0.42 * Math.sin(a), 1.55], s: 0.62, col: ELEM[k] }; }),
];

const ACT3 = cast({
  PANDIT: [[0, { expr: "smile_closed", gesture: "palms" }], [3.85 - L, { expr: "smile", gesture: "up" }], [5.0, { gesture: "palms" }],
    [6.8, { gesture: undefined, expr: "smile_closed" }], [16.08 - L, { expr: "smile", gesture: "up" }], [17.0, { gesture: "palms" }],
    [19.66 - L, { gesture: "up" }], [21.0, { gesture: "palms" }], [24.0, { gesture: undefined }], [26.95 - L, { gesture: "up" }],
    [28.6, { gesture: "palms" }], [31.9, { gesture: undefined, expr: "smile_closed" }], [34.26 - L, { expr: "smile" }]],
  AARAV: [[0, { expr: "smile" }], [7.09 - L, { expr: "grin", gesture: "chest" }], [8.6, { gesture: "palms" }], [11.62 - L, { gesture: "chest" }],
    [12.8, { gesture: undefined, expr: "smile" }], [13.06, { expr: "stern" }], [16.1, { expr: "smile" }], [21.7, { expr: "dazed" }],
    [23.7, { expr: "neutral" }], [29.85 - L, { expr: "nervous" }], [32.21 - L, { expr: "shock", gesture: "palms" }],
    [33.7, { expr: "nervous", gesture: undefined }], [T3.gasp - L, { expr: "shock", gesture: "cheeks", facing: 0 }]],
  WEI: [[0, { expr: "smile" }], [21.7, { expr: "dazed" }], [23.7, { expr: "smile" }], [33.3, { expr: "grin" }], [T3.gasp, { expr: "laugh" }]],
  KABIR: [[0, { expr: "neutral", gesture: "crossed" }], [13.06 - L, { gesture: "palms" }], [15.8, { gesture: "crossed" }], [34.6, { expr: "smile" }]],
  ROHAN: [[0, { expr: "smile", gesture: "mic" }], [21.7, { expr: "nervous" }], [23.7, { expr: "smile" }], [T3.gasp, { expr: "shock" }]],
  LIN: [[0, { expr: "smile" }], [16.1, { expr: "smile_closed" }]],
});
const BURSTS3: Burst[] = [
  { t: 3.82, at: [-1.0, 2.05, 1.55], s: 0.8, col: "#e8eeff" },                                    // the Moon
  ...sparkle("rashi", T3.rashis),
  { t: 17.62, at: [-1.3, 2.2, 1.55], s: 1.2, col: "#ffe9a8" },                                    // 27 nakshatras
  { t: 19.63, at: [-1.3, 2.2, 1.55], s: 1.4, col: "#ffb04d" },                                    // 9 planets
  { t: 23.73, at: [-1.0, 2.0, 1.55], s: 0.7, col: "#ffd34d" },                                    // the Kundli
  { t: T3.gasp, at: [-0.85, 1.7, 0.55], s: 1.4, col: "#8fb8ff" },                                 // gasp
];

const ACT4 = cast({
  ROHAN: [[0, { expr: "grin", gesture: "mic" }], [0.5 - L, { facing: 1, gesture: "palms" }], [3.39 - L, { facing: -1 }],
    [6.9, { facing: undefined, gesture: "mic", expr: "smile" }], [17.07 - L, { expr: "grin", gesture: "up", facing: 0 }],
    [18.0, { gesture: "palms", facing: -1 }], [20.07 - L, { facing: 1 }], [23.6, { gesture: "mic", facing: undefined, expr: "smile" }],
    [T4.laugh, { expr: "laugh" }]],
  WEI: [[0, { expr: "smile" }], [1.88 - L, { expr: "grin" }], [3.4, { expr: "smile" }], [7.19 - L, { gesture: "hips" }], [8.64 - L, { gesture: "up" }],
    [10.4, { gesture: undefined }], [12.9, { expr: "neutral" }], [22.47 - L, { expr: "grin", gesture: "chest" }], [23.89 - L, { gesture: "palms" }],
    [24.95 - L, { expr: "nervous" }], [25.98 - L, { expr: "grin", gesture: "up" }], [28.0, { gesture: undefined, expr: "smile" }], [T4.laugh, { expr: "laugh" }]],
  AARAV: [[0, { expr: "smile" }], [4.7 - L, { expr: "grin" }], [6.9, { expr: "smile" }], [8.0, { expr: "neutral" }],
    [10.71 - L, { expr: "grin", gesture: "chest" }], [11.81 - L, { gesture: "up" }], [12.9 - L, { gesture: "palms" }],
    [13.38 - L, { gesture: "claws", expr: "laugh" }], [14.1, { gesture: undefined, expr: "smile" }], [18.16 - L, { expr: "grin" }],
    [28.31 - L, { expr: "nervous", gesture: "palms" }], [29.67 - L, { expr: "shock", gesture: "cheeks" }], [T4.laugh, { expr: "laugh", gesture: "hips" }]],
  KABIR: [[0, { expr: "neutral", gesture: "crossed" }], [14.21 - L, { gesture: "palms" }], [16.9, { gesture: "crossed" }], [T4.laugh, { expr: "laugh", gesture: undefined }]],
  PANDIT: [[0, { expr: "smile_closed" }], [18.16, { expr: "smile" }], [T4.laugh, { expr: "laugh" }]],
  LIN: [[0, { expr: "smile" }], [20.07, { expr: "smile_closed" }], [T4.laugh, { expr: "laugh" }]],
});
const BURSTS4: Burst[] = [
  { t: 19.22, at: [0, 1.95, 0.0], s: 0.9, col: "#ff7aa8" },                                       // weddings
  { t: 22.44, at: [0.85, 1.75, 0.55], s: 1.0, col: "#ff8a3d" },                                   // Dragon
  { t: 28.87, at: [-0.85, 1.75, 0.55], s: 1.1, col: "#ff5a36" },                                  // Dosha
];

const ACT5 = cast({
  KABIR: [[0, { expr: "neutral", gesture: "palms", facing: -1 }], [1.6, { gesture: "crossed", facing: undefined }],
    [25.69 - L, { expr: "stern", gesture: "crossed" }], [27.45 - L, { expr: "smile", gesture: "up" }], [29.5, { gesture: undefined }]],
  LIN: [[0, { expr: "smile" }], [1.8 - L, { gesture: "palms" }], [3.97 - L, { gesture: "up" }], [5.2, { gesture: "palms" }],
    [6.9, { gesture: undefined, expr: "smile_closed" }], [28.9, { expr: "grin" }]],
  PANDIT: [[0, { expr: "smile_closed" }], [7.2 - L, { expr: "smile", gesture: "palms" }], [9.83 - L, { gesture: "up" }], [11.0, { gesture: "palms" }],
    [12.4, { gesture: undefined, expr: "smile_closed" }]],
  ROHAN: [[0, { expr: "smile", gesture: "mic" }], [12.67 - L, { expr: "grin", gesture: "palms" }], [14.42 - L, { facing: -1 }], [16.58 - L, { facing: 1 }],
    [18.0, { facing: undefined, gesture: "mic", expr: "smile" }]],
  WEI: [[0, { expr: "smile" }], [19.0 - L, { gesture: "palms", facing: -1 }], [20.8, { gesture: undefined, facing: undefined }],
    [21.75 - L, { expr: "grin", gesture: "chest" }], [23.4, { gesture: undefined }], [24.8, { expr: "laugh" }], [25.6, { expr: "smile" }]],
  AARAV: [[0, { expr: "smile" }], [19.0, { facing: 1 }], [20.8, { facing: undefined }], [21.12 - L, { gesture: "palms" }], [22.5, { expr: "grin" }],
    [24.07 - L, { expr: "grin", gesture: "chest" }], [24.8 - L, { gesture: "claws" }], [25.6, { gesture: undefined, expr: "smile" }]],
});
const BURSTS5: Burst[] = [
  { t: 14.39, at: [-0.5, 1.9, 0.0], s: 1.1, col: "#ffb52e" },                                     // Diwali
  { t: 16.55, at: [0.5, 1.9, 0.0], s: 1.1, col: "#ff3b3b" },                                      // Chinese New Year
  { t: 24.77, at: [-0.85, 1.75, 0.55], s: 1.5, col: "#ffd34d" },                                  // drama
];

const fin = (): Beat[] => [[13.17 - L, { expr: "grin", gesture: "palms", facing: 0 }], [15.01 - L, { gesture: "claws" }]];
const ACT6 = cast({
  ROHAN: [[0, { expr: "grin", gesture: "palms", facing: 0 }], [1.81 - L, { gesture: "up" }], [3.0, { gesture: "mic", facing: undefined }], ...fin()],
  WEI: [[0, { expr: "smile" }], [3.23 - L, { expr: "grin", gesture: "palms" }], [4.08 - L, { expr: "nervous" }], [4.8, { expr: "smile", gesture: undefined }], ...fin()],
  AARAV: [[0, { expr: "smile" }], [5.0 - L, { expr: "dazed", gesture: "palms" }], [6.4, { expr: "smile", gesture: undefined }], ...fin()],
  KABIR: [[0, { expr: "neutral", gesture: "crossed" }], [6.63 - L, { expr: "smile", gesture: "palms" }], [8.3, { gesture: undefined }], ...fin()],
  LIN: [[0, { expr: "smile" }], [8.57 - L, { gesture: "palms" }], [9.6, { gesture: undefined }], ...fin()],
  PANDIT: [[0, { expr: "smile_closed" }], [9.87 - L, { expr: "smile", gesture: "up" }], [11.29 - L, { gesture: "palms" }], [12.9, { gesture: undefined }], ...fin()],
});
const BURSTS6: Burst[] = [
  { t: T6.yours, at: [-1.2, 2.4, 1.0], s: 1.6, col: "#ffd34d" }, { t: T6.yours, at: [0, 2.6, 0.4], s: 1.8, col: "#ff5a36" },
  { t: T6.yours, at: [1.2, 2.4, 1.0], s: 1.6, col: "#ff8a3d" },
  { t: T6.yours + 0.25, at: [-0.6, 2.95, 0.6], s: 1.3, col: "#fff3b0" }, { t: T6.yours + 0.25, at: [0.6, 2.95, 0.6], s: 1.3, col: "#ffd34d" },
];

const ACTS: Record<number, { act: Record<Name, Act>; bursts: typeof BURSTS1 }> = {
  1: { act: ACT1, bursts: BURSTS1 }, 2: { act: ACT2, bursts: BURSTS2 }, 3: { act: ACT3, bursts: BURSTS3 },
  4: { act: ACT4, bursts: BURSTS4 }, 5: { act: ACT5, bursts: BURSTS5 }, 6: { act: ACT6, bursts: BURSTS6 },
};

// ---------------- helpers ----------------
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number) => {
  const f = Math.round(t * FPS);
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13));
  }
  return 0;
};
const stateAt = (beats: Beat[], t: number): St => {
  const st: St = { expr: "neutral" };
  for (const [t0, b] of beats) if (t >= t0) Object.assign(st, b);
  return st;
};
const posAt = (path: Path, t: number) => {
  if (t <= path[0][0] || path.length === 1) return { x: path[0][1], z: path[0][2], walk: false };
  for (let i = 1; i < path.length; i++) {
    const [t0, x0, z0] = path[i - 1], [t1, x1, z1] = path[i];
    if (t < t1) { const u = (t - t0) / (t1 - t0), moving = x0 !== x1 || z0 !== z1; return { x: x0 + (x1 - x0) * u, z: z0 + (z1 - z0) * u, walk: moving }; }
  }
  const e = path[path.length - 1];
  return { x: e[1], z: e[2], walk: false };
};
/** mouth: closed between words, flapping ~7 Hz inside them */
export const talkAt = (sc: SceneDef, who: Name, t: number) => {
  for (const l of sc.words.lines) {
    if (l.who !== who && l.who !== "ALL") continue;
    if (t < l.start - 0.05 || t > l.end + 0.05) continue;
    for (const w of l.words) if (t >= w.start - 0.03 && t <= w.end) {
      const s = Math.abs(Math.sin(Math.PI * 7 * (t - w.start + 0.03)));
      return s > 0.6 ? 2 : s > 0.2 ? 1 : 0;
    }
  }
  return 0;
};

// ---------------- stage ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun: THREE.Vector3 };

const contact = (out: Stage, sun: THREE.Vector3, x: number, z: number) => {
  const hl = Math.hypot(sun.x, sun.z) || 1, ox = -sun.x / hl, oz = -sun.z / hl, rot = Math.atan2(-ox, -oz);
  const el = Math.asin(Math.min(0.99, Math.max(0.1, sun.y))), len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))), h = len + 0.55, c = 0.3 * h;
  out.fx.push({ key: "blob|shadow|#b2b4cf", cw: 128, ch: 256, draw: (p: Pen) => fxShadow(p, "#b2b4cf"), x: x + ox * c, y: 0.018, z: z + oz * c, w: 0.72, h, flat: true, rot });
  out.fx.push({ key: "blob|contact|#7c7e9b", cw: 128, ch: 128, draw: (p: Pen) => fxContact(p, "#7c7e9b"), x, y: 0.022, z, w: 0.52, h: 0.4, flat: true, rot });
};

export const stage = (sc: SceneDef, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] }, A = ACTS[sc.n];
  // canvas angle the sun comes FROM on a camera-facing card, in 45-degree steps (small texture cache)
  const light = Math.round(Math.atan2(-cam.sun.y, cam.sun.dot(cam.right)) / (Math.PI / 4)) * (Math.PI / 4);
  let spk: string | null = null;
  for (const l of sc.words.lines) if (t >= l.start - 0.3) spk = l.who;
  NAMES.forEach((name, i) => {
    const a = A.act[name], st = stateAt(a.beats, t), { x, z, walk } = posAt(a.path, t);
    // no explicit facing: look at whoever is talking (or the lens while talking yourself)
    const sx = spk && spk !== name && spk !== "ALL" ? posAt(A.act[spk as Name].path, t).x : x;
    const facing = st.facing ?? (Math.abs(sx - x) < 0.2 ? 0 : sx > x ? 1 : -1);
    const clap = Math.max(0, ...(a.claps ?? []).map((tc) => 1 - Math.abs(t - tc) / 0.1));
    const bow = a.bow ? smooth((t - a.bow[0]) / 0.35) * (1 - smooth((t - a.bow[1]) / 0.4)) : 0;
    const fo: FrontOpts = {
      mode: walk ? "stroll" : "stand", phase: walk ? q((t * 1.7) % 1) : 0, expr: bow > 0.5 ? "smile_closed" : st.expr,
      gesture: st.gesture, facing, talk: talkAt(sc, name, t), blink: lidAt(t, i), clap: q(clap, 10), bow: q(bow, 20),
      light, seed: SEED[name],
    };
    const d = cam.pos.distanceTo(new THREE.Vector3(x, 1.2, z)), [w, h, k] = tier(d), o = OUTFITS[name];
    out.places.push({ key: `F|${name}|${JSON.stringify(fo, (_k, v) => (typeof v === "number" ? q(v) : v))}`, x, y: 0, z,
      draw: (p) => bodyFront(p, o, fo), size: [w, h, k] });
    contact(out, cam.sun, x, z);
  });
  for (const b of A.bursts) {
    const u = (t - b.t) / 0.35;
    if (u < 0 || u >= 1) continue;
    out.fx.push({ key: `burst${b.col}${q(u, 30)}`, cw: 500, ch: 500, draw: (p: Pen) => fxBurst(p, q(u, 30), b.col, 12, 95, 245), x: b.at[0], y: b.at[1], z: b.at[2] - 0.25, w: b.s, h: b.s });
  }
  return out;
};
export { clamp01 };
