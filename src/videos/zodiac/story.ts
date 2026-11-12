// "What's Your Sign?" — one stall at a college fest, six scenes, each its own composition.
// Everything is timed to the generated dialogue (zodiac/voice/sceneN/words.json, copied next to this file).
// Camera grammar is the bridge short's: smootherstep glides 18-40 f, cuts on big reframes, every hold creeps in,
// flip-sign impact kicks. One location per scene, so a scene is one light and a list of camera keys.
import w1 from "./voice/scene1.json";
import w2 from "./voice/scene2.json";
import w3 from "./voice/scene3.json";
import w4 from "./voice/scene4.json";
import w5 from "./voice/scene5.json";
import w6 from "./voice/scene6.json";

export const FPS = 30;
export type V3 = [number, number, number];
export type Light = "day" | "golden";
export type Word = { w: string; start: number; end: number };
export type Line = { who: string; text: string; start: number; end: number; words: Word[] };
export type Words = { duration: number; lines: Line[] };

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
export type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
/** push-in factor since f0 (subject grows ~rate per frame); `punch` raises it for n frames with 8 f soft edges */
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** a framing that dollies toward its look point from frame f0 */
const D = (pos: V3, look: V3, fov: number, f0: number, rate = 0.0022, roll = 0, punch = 0, n = 35) => (f: number): Shot => {
  const k = pushK(f, f0, rate, punch, n);
  return { pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, fov, roll };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: V3 };

// ---------------- scenes ----------------
export type SceneDef = { n: number; total: number; light: Light; words: Words; keys: Key[]; dof: Dof[]; kicks: [number, number][] };
const at = (t: number) => Math.round(t * FPS);

// Scene 1 "The Argument". Stage (metres, ground y = 0, the stall faces +z): Rohan (0, .1), Aarav (-.85, .75),
// Wei (.85, .75), Kabir leaning by the right post (2.35, -.6); Pandit Rao walks in from the left to (-1.45, 1.8),
// Master Lin from the right to (1.45, 1.8).
/** medium shot: knees-up on the character at (x, z), lens 2.55 m out; neighbours' edges stay in frame */
const MS = (x: number, z: number, f0: number, side = 0, punch = 0, roll = 0) =>
  D([x + side, 1.3, z + 2.55], [x, 1.15, z], 40, f0, 0.0012, roll, punch, 24);
const S1: SceneDef = {
  n: 1, total: at(w1.duration) + 6, light: "day", words: w1 as Words,
  keys: [
    { f: 0, s: D([0, 1.9, 12.0], [0, 2.15, -1.2], 46, 0, 0.0018) },                                 // establishing wide
    { f: at(1.75), cut: true, s: MS(0, 0.1, at(1.75)) },                                            // "Today's question"
    { f: at(4.45), dur: 14, s: D([0, 1.5, 5.4], [0, 1.15, 0.45], 40, at(4.45), 0.0012) },           // "Indian or Chinese?"
    { f: at(6.0), cut: true, s: MS(-0.85, 0.75, at(6.0), 0.3) },                                    // Aarav
    { f: at(7.55), dur: 12, s: MS(-0.85, 0.75, at(6.0), 0.3, 0.004, -0.04) },                       // "Simha"
    { f: at(10.2), cut: true, s: MS(0.85, 0.75, at(10.2), -0.3) },                                  // Wei
    { f: at(12.2), cut: true, s: D([0.72, 0.8, 3.0], [0.85, 1.3, 0.75], 42, at(12.2), 0.0012, -0.04, 0.005, 24) }, // "Dragon": low hero
    { f: at(13.15), dur: 12, s: D([0.72, 0.8, 3.0], [0.85, 1.3, 0.75], 42, at(12.2), 0.0012, 0.04) },
    { f: at(14.05), dur: 12, s: D([0.72, 0.8, 3.0], [0.85, 1.3, 0.75], 42, at(12.2), 0.0012, -0.03) },
    { f: at(14.8), cut: true, s: MS(-0.85, 0.75, at(14.8), 0.45) },                                 // Aarav, unimpressed
    { f: at(15.9), cut: true, s: D([1.6, 1.3, 1.95], [2.35, 1.15, -0.6], 40, at(15.9), 0.0012) },   // Kabir
    { f: at(18.45), cut: true, s: D([0, 1.45, 5.0], [0, 1.15, 0.75], 40, at(18.45), 0.002) },       // the glare
    { f: at(19.15), cut: true, s: MS(0, 0.1, at(19.15), -0.4) },                                    // "Kabir, not helping"
    { f: at(20.7), dur: 12, s: MS(0, 0.1, at(20.7), 0, 0.004) },                                    // "Let's call the experts"
    { f: at(22.3), cut: true, s: D([0, 1.7, 11.6], [0, 1.75, 0.6], 46, at(22.3), 0.0007) },          // entrances + bow
  ],
  dof: [
    { f: 0, cInf: 0 },
    { f: at(1.75), cInf: 9 },
    { f: at(4.45), dur: 14, cInf: 6 },
    { f: at(6.0), cInf: 9 },
    { f: at(15.9), cInf: 10 },
    { f: at(18.45), cInf: 6 },
    { f: at(19.15), cInf: 9 },
    { f: at(22.3), cInf: 0 },
  ],
  kicks: [[12.27, 0.7], [21.97, 0.3], [22.25, 0.3]],
};

// ---------------- shared framings for scenes 2-6 ----------------
// Everyone keeps their scene-1 end marks: Rohan (0, .1), Aarav (-.85, .75), Wei (.85, .75), Kabir (2.35, -.6),
// Pandit Rao (-1.3, 1.7), Master Lin (1.3, 1.7).
export const POS = { ROHAN: [0, 0.1], AARAV: [-0.85, 0.75], WEI: [0.85, 0.75], KABIR: [2.35, -0.6], PANDIT: [-1.3, 1.7], LIN: [1.3, 1.7] } as const;
type Who = keyof typeof POS;
const ms = (w: Who, f0: number, punch = 0, roll = 0) => {
  const [x, z] = POS[w];
  return w === "KABIR" ? D([1.6, 1.3, 1.95], [2.35, 1.15, -0.6], 40, f0, 0.0012, roll, punch, 24) : MS(x, z, f0, (Math.abs(x) > 1 ? -0.35 : -0.7) * Math.sign(x), punch, roll);
};
const TWO = (f0: number, punch = 0) => D([0, 1.45, 6.0], [0, 1.15, 0.75], 40, f0, 0.0015, 0, punch, 24);   // Aarav + Rohan + Wei
const WIDE = (f0: number) => D([0, 1.7, 11.0], [0, 1.7, 0.6], 46, f0, 0.0008);                          // all six
const cut = (t: number, s: (f0: number) => (f: number) => Shot): Key => ({ f: at(t), cut: true, s: s(at(t)) });
const glideTo = (t: number, dur: number, s: (f0: number) => (f: number) => Shot): Key => ({ f: at(t), dur, s: s(at(t)) });

/** the painted wheels on the back panel (4.2 x 2.5 m at z -3.04, texture 2100 x 1250): world point of segment i */
export const wheelFace = (wheel: "rashi" | "animal", i: number): V3 => {
  const cx = wheel === "rashi" ? 540 : 1560, m = ((i + 0.5) * Math.PI) / 6;
  return [(cx + 0.68 * 430 * Math.cos(m) - 1050) / 500, 1.5 - (640 + 0.68 * 430 * Math.sin(m) - 625) / 500, -3.0];
};
export const WHEEL_I0 = 8; // the first name lands on the segment just left of the top, then clockwise
/** insert on a wheel: the lens glides from segment to segment, arriving as each name is said */
const wheelShot = (wheel: "rashi" | "animal", times: number[], f0: number) => (f: number): Shot => {
  // continuous pan from name to name (never a held frame) while the lens creeps in
  const t = f / FPS;
  let k = 0; while (k + 1 < times.length && t >= times[k + 1]) k++;
  const sg = k + 1 < times.length ? k + smooth(clamp01((t - times[k]) / (times[k + 1] - times[k]))) : k + Math.min(1, Math.max(0, t - times[k]) * 0.4);
  const a = wheelFace(wheel, WHEEL_I0 + Math.max(-0.6, sg + Math.min(0, t - times[0]) * 0.4)), cx = wheel === "rashi" ? -1.02 : 1.02;
  const look: V3 = [cx + 0.4 * (a[0] - cx), 1.47 + 0.4 * (a[1] - 1.47), -3.0], d = 2.95 * pushK(f, f0, 0.0008);
  return { pos: [look[0], look[1] + 0.05, look[2] + d], look, fov: 40, roll: 0 };
};
const wt = (w: Words, who: string, word: string, n = 0) => {
  const hits = w.lines.filter((l) => l.who === who).flatMap((l) => l.words).filter((x) => x.w.replace(/[^\w-]/g, "") === word);
  if (!hits[n]) throw new Error(`no word ${who}:${word}#${n}`);
  return hits[n].start;
};

// Scene 2 "The Chinese Zodiac" (Master Lin)
const W2 = w2 as Words, ANIMALS = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
export const T2 = { animals: ANIMALS.map((a) => wt(W2, "LIN", a)), elements: ["Wood", "Fire", "Earth", "Metal", "Water"].map((a) => wt(W2, "LIN", a)) };
const S2: SceneDef = {
  n: 2, total: at(W2.duration) + 6, light: "day", words: W2,
  keys: [
    { f: 0, s: WIDE(0) },
    cut(1.85, (f0) => ms("LIN", f0)),
    glideTo(4.25, 14, (f0) => ms("LIN", f0, 0.004)),                              // "twelve animals"
    cut(5.8, (f0) => wheelShot("animal", T2.animals, f0)),                             // Rat, Ox, Tiger ...
    cut(16.4, (f0) => ms("KABIR", f0)),                                          // "Why those animals?"
    cut(18.0, (f0) => ms("LIN", f0)),                                            // "A legend"
    cut(21.35, (f0) => TWO(f0)),                                                 // the race, on the listeners
    cut(25.15, (f0) => ms("WEI", f0)),                                           // "The Rat won..."
    glideTo(27.5, 12, (f0) => ms("WEI", f0, 0.005, 0.04)),                       // "...jumping off"
    cut(29.7, (f0) => ms("AARAV", f0, 0.007, -0.04)),                            // "That's cheating!"
    cut(30.6, (f0) => ms("LIN", f0)),                                            // "That's clever."
    glideTo(31.8, 30, (f0) => MS(1.3, 1.7, f0, -0.75)),
    cut(34.6, (f0) => D([1.3, 1.45, 5.3], [1.3, 1.45, 1.7], 40, f0, 0.0012)),     // the five elements
    cut(38.2, (f0) => WIDE(f0)),
  ],
  dof: [{ f: 0, cInf: 0 }, { f: at(1.85), cInf: 9 }, { f: at(5.8), cInf: 0 }, { f: at(16.4), cInf: 10 }, { f: at(18.0), cInf: 9 },
    { f: at(21.35), cInf: 6 }, { f: at(25.15), cInf: 9 }, { f: at(34.6), cInf: 7 }, { f: at(38.2), cInf: 0 }],
  kicks: [[wt(W2, "AARAV", "cheating"), 0.5]],
};

// Scene 3 "The Vedic Way" (Pandit Rao)
const W3 = w3 as Words, RASHIS = ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha"];
export const T3 = { rashis: RASHIS.map((a) => wt(W3, "AARAV", a)), gasp: W3.lines[W3.lines.length - 1].end + 0.15 };
const S3: SceneDef = {
  n: 3, total: at(W3.duration) + 6, light: "day", words: W3,
  keys: [
    { f: 0, s: WIDE(0) },
    cut(1.75, (f0) => ms("PANDIT", f0)),
    glideTo(3.7, 14, (f0) => ms("PANDIT", f0, 0.005)),                           // "the Moon"
    cut(6.95, (f0) => wheelShot("rashi", T3.rashis, f0)),                              // "We have twelve Rashis too: Mesha..."
    cut(12.2, (f0) => ms("AARAV", f0)),                                          // "...and more"
    cut(12.95, (f0) => ms("KABIR", f0)),                                         // "So twelve and twelve"
    cut(15.95, (f0) => ms("PANDIT", f0, 0.006)),                                 // "Not quite."
    glideTo(17.4, 18, (f0) => D([-1.3, 1.5, 5.4], [-1.3, 1.5, 1.7], 40, f0, 0.0012)), // 27 nakshatras, 9 planets
    cut(21.75, (f0) => TWO(f0)),                                                 // listeners drowning in detail
    cut(23.55, (f0) => ms("PANDIT", f0)),                                        // "the Kundli"
    cut(26.75, (f0) => D([-1.15, 0.8, 4.1], [-1.3, 1.4, 1.7], 42, f0, 0.0012, 0.03)), // "the stars' actual positions"
    cut(28.55, (f0) => ms("AARAV", f0)),                                         // "signs shift by one": Aarav worries
    glideTo(32.1, 10, (f0) => ms("AARAV", f0, 0.006, -0.03)),                    // "Wait. I might not be a Leo?"
    cut(34.1, (f0) => ms("PANDIT", f0)),                                         // "Possibly a Cancer."
    cut(35.35, (f0) => ms("AARAV", f0, 0.009, 0.05)),                            // gasp
  ],
  dof: [{ f: 0, cInf: 0 }, { f: at(1.75), cInf: 9 }, { f: at(6.95), cInf: 0 }, { f: at(12.2), cInf: 9 }, { f: at(12.95), cInf: 10 },
    { f: at(15.95), cInf: 9 }, { f: at(17.4), dur: 18, cInf: 7 }, { f: at(21.75), cInf: 6 }, { f: at(23.55), cInf: 9 }],
  kicks: [[T3.gasp, 0.7]],
};

// Scene 4 "Time vs Sky"
const W4 = w4 as Words;
export const T4 = { laugh: W4.lines[W4.lines.length - 1].end + 0.05 };
const S4: SceneDef = {
  n: 4, total: at(W4.duration) + 6, light: "day", words: W4,
  keys: [
    { f: 0, s: TWO(0) },                                                          // Rohan between the two fans
    cut(3.25, (f0) => ms("ROHAN", f0)),                                           // "Indian astrology is about sky position"
    cut(7.05, (f0) => ms("WEI", f0)),                                             // "Mine is simple"
    glideTo(8.5, 12, (f0) => ms("WEI", f0, 0.004)),                               // "One animal, one year."
    cut(10.55, (f0) => ms("AARAV", f0)),                                          // "Mine is detailed"
    glideTo(13.25, 12, (f0) => ms("AARAV", f0, 0.005, -0.03)),                    // "everything"
    cut(14.05, (f0) => ms("KABIR", f0)),                                          // "But both predict..."
    cut(16.95, (f0) => ms("ROHAN", f0, 0.005)),                                   // "Right!"
    glideTo(19.95, 26, (f0) => MS(0, 0.1, f0, 0.5)),                              // "China checks..."
    cut(22.3, (f0) => ms("WEI", f0, 0.004)),                                      // "Dragon with Rooster": Wei, proud
    glideTo(25.85, 12, (f0) => ms("WEI", f0, 0.005, 0.03)),                       // "Tiger and Monkey"
    cut(28.15, (f0) => ms("AARAV", f0, 0.005)),                                   // "Manglik Dosha"
    glideTo(29.55, 14, (f0) => ms("AARAV", f0, 0.004, -0.04)),                    // "Half of India panics"
    cut(31.3, (f0) => D([0, 1.6, 8.6], [0, 1.6, 0.8], 46, f0, 0.0015)),            // everyone laughs
  ],
  dof: [{ f: 0, cInf: 6 }, { f: at(3.25), cInf: 9 }, { f: at(14.05), cInf: 10 }, { f: at(16.95), cInf: 9 }, { f: at(31.3), cInf: 0 }],
  kicks: [[wt(W4, "AARAV", "Dosha"), 0.4], [T4.laugh, 0.3]],
};

// Scene 5 "Who's Right?"
const W5 = w5 as Words;
const S5: SceneDef = {
  n: 5, total: at(W5.duration) + 6, light: "day", words: W5,
  keys: [
    { f: 0, s: ms("KABIR", 0) },                                                  // "So who's right?"
    cut(1.65, (f0) => ms("LIN", f0)),
    glideTo(3.85, 22, (f0) => MS(1.3, 1.7, f0, -0.75)),                           // "Both are ways..."
    cut(7.05, (f0) => ms("PANDIT", f0)),
    glideTo(9.3, 24, (f0) => ms("PANDIT", f0, 0.003)),                            // "watching time, the sky"
    cut(11.5, (f0) => WIDE(f0)),                                                  // "...and each other"
    cut(12.55, (f0) => ms("ROHAN", f0)),
    glideTo(14.3, 14, (f0) => MS(0, 0.1, f0, -0.45)),                             // "Diwali"
    glideTo(16.45, 14, (f0) => MS(0, 0.1, f0, 0.45)),                             // "Chinese New Year"
    cut(18.85, (f0) => TWO(f0)),                                                  // "So we're more alike..."
    cut(21.0, (f0) => ms("AARAV", f0)),                                           // "Fine. Chinese wins on cool animals."
    glideTo(23.9, 10, (f0) => ms("AARAV", f0, 0.007, -0.05)),                     // "Indian wins on drama."
    cut(25.55, (f0) => ms("KABIR", f0)),                                          // "I'm still not convinced."
    glideTo(27.35, 20, (f0) => ms("KABIR", f0, 0.004)),                           // "But the Rat-on-the-Ox story is great."
  ],
  dof: [{ f: 0, cInf: 10 }, { f: at(1.65), cInf: 9 }, { f: at(11.5), cInf: 0 }, { f: at(12.55), cInf: 9 }, { f: at(18.85), cInf: 6 },
    { f: at(21.0), cInf: 9 }, { f: at(25.55), cInf: 10 }],
  kicks: [[wt(W5, "AARAV", "drama"), 0.5]],
};

// Scene 6 "Your Turn": everyone talks to the lens
const W6 = w6 as Words;
export const T6 = { yours: wt(W6, "ALL", "yours") };
const S6: SceneDef = {
  n: 6, total: at(W6.duration) + 6, light: "day", words: W6,
  keys: [
    { f: 0, s: D([0, 1.35, 2.75], [0, 1.2, 0.1], 40, 0, 0.0014) },               // Rohan, straight to the lens
    cut(3.1, (f0) => ms("WEI", f0)),
    cut(4.85, (f0) => ms("AARAV", f0)),
    cut(6.5, (f0) => ms("KABIR", f0)),
    cut(8.45, (f0) => ms("LIN", f0)),
    cut(9.75, (f0) => ms("PANDIT", f0)),
    cut(12.95, (f0) => WIDE(f0)),                                                 // all together
    glideTo(15.4, 45, (f0) => D([0, 3.4, 13.5], [0, 2.4, 0], 48, f0, 0.0004)),    // crane up and away
  ],
  dof: [{ f: 0, cInf: 9 }, { f: at(12.95), cInf: 0 }],
  kicks: [[T6.yours, 0.5]],
};

export const SCENES: Record<number, SceneDef> = { 1: S1, 2: S2, 3: S3, 4: S4, 5: S5, 6: S6 };

export const camAt = (sc: SceneDef, f: number): Cam => {
  const c = run(sc.keys, f), t = f / FPS;
  let a = 0;
  for (const [t0, g] of sc.kicks) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const dofAt = (sc: SceneDef, f: number) => {
  const L = sc.dof;
  let i = 0; while (i + 1 < L.length && f >= L[i + 1].f) i++;
  const d = L[i], p = L[Math.max(0, i - 1)], k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
