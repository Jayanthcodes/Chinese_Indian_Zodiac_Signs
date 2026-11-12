// The fest ground as one three.js scene: sky, lawn and paved plaza, the "What's Your Sign?" stall (counter, painted
// back panel with an Indian rashi wheel and a Chinese animal wheel, striped canopy, banner, string lights, marigold
// garlands on the Indian side, red paper lanterns on the Chinese side), other stalls, bunting, trees and the college
// block behind. update(f, camera) poses camera, light and cast for one frame (pure function of the frame).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { Batch, Strand, boxGeo, V, lam, Kit, prop, quad } from "../bridge/build";
import { ctex, rep, cobbleHD, grassHD, beam, cloudHD, facadeHD, roofHD } from "../bridge/paint";
import { LIGHTS, LOOK } from "../bridge/lights";
import { TONE, CHAR, untone } from "../bridge/shade";
import { NOINK } from "../bridge/ink";
import { Pool, Actor, Fx } from "../bridge/cast";
import { FPS, SceneDef, camAt } from "./story";
import { stage } from "./cast";

const KENNEY = ["stall-red", "stall-green", "stall-bench", "banner-red", "banner-green", "lantern", "cart", "flower_redA", "flower_yellowA", "flower_purpleA"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

// ---------------- painted textures ----------------
const GOLD = "#f3c44e", INDIGO = "#2a2a6e", NIGHT = "#1f2257";
const stars = (g: CanvasRenderingContext2D, r: () => number, w: number, h: number, n: number, s = 1) => {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, k = (2 + r() * 5) * s;
    g.fillStyle = r() < 0.7 ? "#fff3c4" : GOLD;
    g.beginPath();
    for (let j = 0; j < 8; j++) { const a = (j * Math.PI) / 4, rr = j % 2 ? k * 0.35 : k; g.lineTo(x + rr * Math.cos(a), y + rr * Math.sin(a)); }
    g.fill();
  }
};
/** back panel 4.2 x 2.5 m: night blue with stars; left the 12-petal rashi wheel (saffron/maroon, sun centre), right
 *  the 12-segment animal wheel (red/gold, a little round animal face in each segment); no lettering */
const panelTex = () => ctex("zPanel", 2100, 1250, (g, r) => {
  const gr = g.createLinearGradient(0, 0, 0, 1250); gr.addColorStop(0, "#2b2f78"); gr.addColorStop(1, NIGHT);
  g.fillStyle = gr; g.fillRect(0, 0, 2100, 1250);
  stars(g, r, 2100, 1250, 120, 1.6);
  const wheel = (cx: number, cy: number, R: number, a: string, b: string, rim: string, face: (i: number, x: number, y: number) => void) => {
    for (let i = 0; i < 12; i++) {
      g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, (i * Math.PI) / 6, ((i + 1) * Math.PI) / 6); g.closePath();
      g.fillStyle = i % 2 ? a : b; g.fill(); g.lineWidth = 6; g.strokeStyle = "#241726"; g.stroke();
    }
    g.lineWidth = 16; g.strokeStyle = rim; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 6; g.strokeStyle = "#241726"; g.beginPath(); g.arc(cx, cy, R + 9, 0, Math.PI * 2); g.stroke();
    for (let i = 0; i < 12; i++) { const m = ((i + 0.5) * Math.PI) / 6; face(i, cx + 0.68 * R * Math.cos(m), cy + 0.68 * R * Math.sin(m)); }
  };
  // rashi wheel: each segment a gold petal-dot; the centre a sun
  wheel(540, 640, 430, "#e8762c", "#8c2f3a", GOLD, (_i, x, y) => {
    g.fillStyle = GOLD; g.beginPath(); g.ellipse(x, y, 34, 34, 0, 0, Math.PI * 2); g.fill();
    g.lineWidth = 5; g.strokeStyle = "#241726"; g.stroke();
  });
  g.fillStyle = "#ffd34d"; g.beginPath(); g.arc(540, 640, 120, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = "#241726"; g.stroke();
  for (let k = 0; k < 16; k++) { const a = (k * Math.PI) / 8; g.beginPath(); g.moveTo(540 + 130 * Math.cos(a), 640 + 130 * Math.sin(a)); g.lineTo(540 + 175 * Math.cos(a), 640 + 175 * Math.sin(a)); g.lineWidth = 12; g.strokeStyle = "#ffd34d"; g.stroke(); }
  // animal wheel: a round face with two ears per segment; the centre a gold coin with a square hole
  wheel(1560, 640, 430, "#c8263a", "#9b1c2c", GOLD, (i, x, y) => {
    g.fillStyle = "#fff1d6"; g.lineWidth = 5; g.strokeStyle = "#241726";
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(x + s * 22, y - 26 - (i % 3) * 4, 12, 16 + (i % 4) * 4, s * 0.3, 0, Math.PI * 2); g.fill(); g.stroke(); }
    g.beginPath(); g.ellipse(x, y, 34, 30, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    g.fillStyle = "#241726"; for (const s of [-1, 1]) { g.beginPath(); g.arc(x + s * 12, y - 4, 5, 0, Math.PI * 2); g.fill(); }
  });
  g.fillStyle = GOLD; g.beginPath(); g.arc(1560, 640, 140, 0, Math.PI * 2); g.fill(); g.lineWidth = 8; g.strokeStyle = "#241726"; g.stroke();
  g.fillStyle = "#9b1c2c"; g.fillRect(1560 - 42, 640 - 42, 84, 84); g.strokeRect(1560 - 42, 640 - 42, 84, 84);
});
/** banner across the canopy front: the stall's name in big cartoon letters */
const bannerTex = () => ctex("zBanner", 2048, 352, (g, r) => {
  g.fillStyle = INDIGO; g.fillRect(0, 0, 2048, 352);
  g.fillStyle = GOLD; g.fillRect(0, 0, 2048, 22); g.fillRect(0, 330, 2048, 22);
  stars(g, r, 2048, 352, 40, 1.4);
  g.font = "900 190px 'Arial Black', Impact, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  g.lineJoin = "round"; g.lineWidth = 26; g.strokeStyle = "#241726"; g.strokeText("WHAT'S YOUR SIGN?", 1024, 186);
  g.fillStyle = "#ffd34d"; g.fillText("WHAT'S YOUR SIGN?", 1024, 186);
});
const clothTex = () => ctex("zCloth", 1024, 256, (g, r) => {
  g.fillStyle = "#4b2d83"; g.fillRect(0, 0, 1024, 256);
  stars(g, r, 1024, 200, 40, 1.2);
  g.fillStyle = GOLD; g.fillRect(0, 0, 1024, 14);
  for (let x = 0; x < 1024; x += 32) { g.beginPath(); g.moveTo(x, 214); g.lineTo(x + 16, 250); g.lineTo(x + 32, 214); g.fill(); }
  g.fillRect(0, 200, 1024, 16);
});
const stripeTex = (a: string, b: string, scallop = false) => ctex(`zStripe${a}${b}${scallop}`, 512, 256, (g) => {
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 64, 0, 64, 256); }
  if (scallop) { g.globalCompositeOperation = "destination-out"; for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(i * 64 + 32, 256, 30, Math.PI, 0); g.fill(); } }
});
const lanternTex = () => ctex("zLantern", 128, 128, (g) => {
  g.fillStyle = "#e0303a"; g.fillRect(0, 0, 128, 128);
  g.fillStyle = "#b51f2b"; for (let x = 8; x < 128; x += 24) g.fillRect(x, 0, 6, 128);
});

// ---------------- sky ----------------
const SKY_VS = "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const SKY_FS = `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
  void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
    vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el)); c = mix(c, c2, smoothstep(e.x, e.y, el));
    c = mix(c, c3, smoothstep(e.y, e.z, el)); c = mix(c, c4, smoothstep(e.z, e.w, el)); gl_FragColor = vec4(c, 1.0); }`;

const M = (x: number, y: number, z: number, yaw = 0) => new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(1, 1, 1));
const sag = (a: THREE.Vector3, b: THREE.Vector3, n: number, dip: number) =>
  Array.from({ length: n }, (_, i) => { const u = i / (n - 1); return a.clone().lerp(b, u).add(V(0, -dip * 4 * u * (1 - u), 0)); });

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
  private sun = new THREE.DirectionalLight("#fff0d6", 2.6);
  private skyMat: THREE.ShaderMaterial; private sky: THREE.Mesh;
  private fog = new THREE.Fog("#bccbec", 25, 300);
  private clouds: THREE.Mesh[] = [];
  private sunDir: THREE.Vector3;
  private frustum = new THREE.Frustum(); private m4 = new THREE.Matrix4(); private sph = new THREE.Sphere(); private v = new THREE.Vector3();

  constructor(kit: Kit, private sc: SceneDef) {
    const R = this.root, L = LIGHTS[sc.light], K = LOOK[sc.light];
    // ---- sky, light, clouds ----
    const u = { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() }, c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } };
    this.skyMat = new THREE.ShaderMaterial({ uniforms: u, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false });
    [u.c0, u.c1, u.c2, u.c3, u.c4].forEach((c, i) => untone(K.sky.c[i], c.value));
    const e = K.sky.e.map((d) => THREE.MathUtils.degToRad(d)); u.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    // sun: the shots look down -z; az from that axis toward screen right (+x), el up (lights.ts)
    const az = THREE.MathUtils.degToRad(sc.light === "day" ? 55 : L.az), el = THREE.MathUtils.degToRad(sc.light === "day" ? 46 : L.el);
    this.sunDir = V(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI / 2 + (i - 3.5) * 0.32, d = 640 + (i % 3) * 50, w = 130 + (i % 4) * 30;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: cloudHD(i % 4, K.cloud), color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 40, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // ---- ground ----
    const b = new Batch();
    const grass = lam("zGrass", () => ({ map: rep(grassHD(), 1, 1) })), paving = lam("zPave", () => ({ map: cobbleHD() }));
    b.add(quad(V(-600, 0, 600), V(600, 0, 600), V(600, 0, -600), V(-600, 0, -600), 300, 300), grass);
    b.add(quad(V(-14, 0.012, 12), V(14, 0.012, 12), V(14, 0.012, -16), V(-14, 0.012, -16), 7, 7), paving);
    // ---- the hero stall ----
    const wood = lam("zWood", () => ({ map: beam() })), white = lam("zWhite", () => ({ color: "#f3ead8" }));
    const goldM = lam("zGold", () => ({ color: GOLD }));
    b.add(boxGeo(V(-1.85, 0, -2.25), V(1.85, 0.95, -1.6)), lam("zCloth", () => ({ map: clothTex() })));
    b.add(boxGeo(V(-1.92, 0.95, -2.3), V(1.92, 1.0, -1.55)), wood);                                   // counter top
    b.add(boxGeo(V(-2.15, 0, -3.15), V(2.15, 2.75, -3.05)), wood);                                     // panel frame
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.5), lam("zPanel", () => ({ map: panelTex() })));
    panel.position.set(0, 1.5, -3.04); panel.receiveShadow = true; R.add(panel);
    for (const [x, z, h] of [[-2.1, -1.35, 2.72], [2.1, -1.35, 2.72], [-2.1, -3.1, 2.98], [2.1, -3.1, 2.98]])
      b.add(boxGeo(V(x - 0.06, 0, z - 0.06), V(x + 0.06, h, z + 0.06)), wood);
    // canopy: striped saffron/cream roof falling to the front, scalloped valance, gold trim
    const roofM = lam("zRoof", () => ({ map: rep(stripeTex("#e8762c", "#fbf1dd"), 2, 1), side: THREE.DoubleSide }));
    b.add(quad(V(-2.35, 2.72, -1.2), V(2.35, 2.72, -1.2), V(2.35, 3.02, -3.25), V(-2.35, 3.02, -3.25), 1, 1), roofM);
    const valM = lam("zVal", () => ({ map: rep(stripeTex("#e8762c", "#fbf1dd", true), 2, 1), side: THREE.DoubleSide, alphaTest: 0.5 }));
    b.add(quad(V(-2.35, 2.42, -1.2), V(2.35, 2.42, -1.2), V(2.35, 2.72, -1.2), V(-2.35, 2.72, -1.2)), valM);
    for (const x of [-2.35, 2.35]) b.add(quad(V(x, 2.42, x < 0 ? -3.25 : -1.2), V(x, 2.42, x < 0 ? -1.2 : -3.25), V(x, 2.72, x < 0 ? -1.2 : -3.25), V(x, 2.72, x < 0 ? -3.25 : -1.2)), valM);
    b.add(boxGeo(V(-2.38, 2.7, -1.23), V(2.38, 2.76, -1.17)), goldM);
    // banner on two poles above the canopy front (unlit face so the lettering never greys out in shade)
    for (const x of [-1.85, 1.85]) b.add(boxGeo(V(x - 0.04, 2.7, -1.25), V(x + 0.04, 3.6, -1.17)), wood);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 0.64), new THREE.MeshBasicMaterial({ map: bannerTex(), color: 0xe8e8e8 }));
    banner.position.set(0, 3.22, -1.15); R.add(banner);
    b.add(boxGeo(V(-1.87, 2.88, -1.2), V(1.87, 3.56, -1.17)), white);
    // counter props: a brass bowl, a stack of cards, a small lantern
    b.add(new THREE.SphereGeometry(0.16, 16, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2).rotateX(Math.PI), goldM, M(-1.25, 1.16, -1.9));
    b.add(boxGeo(V(0.95, 1.0, -2.0), V(1.25, 1.06, -1.8)), white);
    prop(b, kit, "lantern", 1.5, 1.0, -2.0, 0.42);
    // marigold garlands (Indian side) and red paper lanterns (Chinese side) hanging from the valance
    const mari = [lam("zMari1", () => ({ color: "#ff9a1f" })), lam("zMari2", () => ({ color: "#ffc43a" }))];
    const ball = new THREE.SphereGeometry(0.045, 8, 6);
    for (const x of [-2.05, -1.55, -1.05, -0.55]) for (let k = 0; k < 9 + (Math.round(x * 4) % 2); k++) b.add(ball, mari[k % 2], M(x, 2.4 - k * 0.075, -1.17));
    const lanM = lam("zLan", () => ({ map: lanternTex() })), capM = lam("zCap", () => ({ color: "#2b2d33" }));
    for (const [x, h] of [[0.75, 0.32], [1.3, 0.48], [1.85, 0.3]] as const) {
      const g = new THREE.SphereGeometry(0.17, 18, 12); g.scale(1, 0.82, 1);
      b.add(boxGeo(V(x - 0.006, 2.42 - h + 0.15, -1.18), V(x + 0.006, 2.42, -1.16)), capM, undefined);
      b.add(g, lanM, M(x, 2.42 - h, -1.17));
      b.add(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), goldM, M(x, 2.42 - h + 0.15, -1.17));
      b.add(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), goldM, M(x, 2.42 - h - 0.15, -1.17));
      b.add(boxGeo(V(x - 0.01, 2.42 - h - 0.32, -1.18), V(x + 0.01, 2.42 - h - 0.17, -1.16)), lam("zTassel", () => ({ color: "#f3c44e" })));
    }
    // ---- the fest around: more stalls, benches, banners, trees, the college block ----
    const STALLS: [string, number, number, number, number][] = [
      ["stall-green", -5.6, -4.2, 0.5, 2.9], ["stall-red", 5.8, -4.6, -0.5, 2.9], ["stall-red", -9.5, -1.0, 1.1, 2.9],
      ["stall-green", 9.8, -1.6, -1.1, 2.9], ["stall-red", -3.2, -10.5, 0.15, 2.9], ["stall-green", 3.6, -11.2, -0.2, 2.9],
      ["stall-green", -11.5, -9.5, 0.6, 2.9], ["stall-red", 11.8, -9.0, -0.6, 2.9],
    ];
    for (const [n, x, z, yaw, h] of STALLS) prop(b, kit, n, x, 0, z, h, yaw);
    for (const [x, z, yaw] of [[-4.2, 3.6, 0.3], [4.6, 3.2, -0.4], [-7.5, -6.8, 0.9]]) prop(b, kit, "stall-bench", x, 0, z, 0.5, yaw);
    for (const [n, x, z] of [["banner-red", -7.8, -3.2], ["banner-green", 7.6, -3.6], ["banner-red", 13.5, -5.5], ["banner-green", -13.2, -5.0]] as const) prop(b, kit, n, x, 0, z, 3.2);
    for (const [n, x, z, h] of [["tree_oak", -15, -14, 7], ["tree_fat", 15.5, -15, 6.5], ["tree_default", -19, -4, 7.5], ["tree_oak", 19.5, -3, 7],
      ["tree_detailed", -8, -19, 8], ["tree_oak", 9, -20, 7.5], ["tree_fat", -24, -16, 7], ["tree_default", 24, -14, 8], ["tree_cone", 0.5, -22, 8.5]] as const)
      prop(b, kit, n, x, 0, z, h);
    for (const [x, z] of [[-3.4, 1.8], [3.3, 2.2], [-6.2, 0.6], [6.4, 0.2]]) prop(b, kit, "plant_bush", x, 0, z, 0.7);
    for (const [n, x, z] of [["flower_redA", -2.9, 0.9], ["flower_yellowA", -3.1, 1.3], ["flower_purpleA", 2.9, 0.6], ["flower_redA", 3.2, 1.0]] as const) prop(b, kit, n, x, 0, z, 0.35);
    const fac = lam("zCollege", () => ({ map: facadeHD("zCollege", 60, 13, { wall: "#e7c99a", shutter: "#8c3b4a", door: true }) }));
    b.add(boxGeo(V(-30, 0, -46), V(30, 13, -38)), fac);
    b.add(boxGeo(V(-30.4, 13, -46.4), V(30.4, 13.7, -37.6)), lam("zCornice", () => ({ color: "#d8b07a" })));
    b.add(boxGeo(V(-4, 13.7, -44), V(4, 19, -38.5)), fac);
    const roofG = new THREE.ConeGeometry(5.8, 3.2, 4); roofG.rotateY(Math.PI / 4);
    b.add(roofG, lam("zRoofTop", () => ({ map: roofHD("#b8644f") })), M(0, 20.6, -41.25));
    b.build(R);
    // ---- string lights along the canopy front and across the plaza (warm HDR bulbs: they bloom) ----
    const wire = lam("zWire", () => ({ color: "#2b2d33" })), bulbM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.9, 1.0), toneMapped: false });
    const bulb = new THREE.SphereGeometry(0.04, 8, 6);
    const runs: [THREE.Vector3, THREE.Vector3, number][] = [
      [V(-2.35, 2.4, -1.18), V(2.35, 2.4, -1.18), 0.12], [V(-7.8, 3.9, -3.2), V(-2.1, 2.9, -1.35), 0.35], [V(2.1, 2.9, -1.35), V(7.6, 3.9, -3.6), 0.35],
      [V(-7.8, 3.9, -3.2), V(-13.2, 3.9, -5.0), 0.4], [V(7.6, 3.9, -3.6), V(13.5, 3.9, -5.5), 0.4],
    ];
    const bb = new Batch();
    for (const [a, c, dip] of runs) {
      const pts = sag(a, c, 24, dip), s = new Strand(pts.length, 0.012, 0.012, wire, 1); s.set(pts); R.add(s.mesh);
      const n = Math.round(a.distanceTo(c) / 0.32);
      for (let i = 1; i < n; i++) { const p = sag(a, c, n + 1, dip)[i]; bb.add(bulb, bulbM, new THREE.Matrix4().makeTranslation(p.x, p.y - 0.05, p.z)); }
    }
    bb.build(R, false);
    R.traverse((o) => { if ((o as THREE.Mesh).isMesh && (o as THREE.Mesh).material === bulbM) o.layers.set(NOINK); });
    // bunting between the tall banners behind the stall
    const pen = new THREE.BufferGeometry();
    pen.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, -0.14, 0, 0, 0.14, 0, -0.34, 0], 3)); pen.computeVertexNormals();
    const cols = ["#d23b3b", "#f3d35a", "#3f6fb5", "#f7f1e1", "#2f8a4f", "#e8762c"].map((c) => lam("zPen" + c, () => ({ color: c, side: THREE.DoubleSide })));
    const pb = new Batch();
    for (const [a, c] of [[V(-7.8, 3.15, -3.2), V(-5.0, 2.6, -11)], [V(7.6, 3.15, -3.6), V(5.2, 2.6, -11.5)], [V(-13.2, 3.15, -5.0), V(-7.8, 3.15, -3.2)], [V(7.6, 3.15, -3.6), V(13.5, 3.15, -5.5)]] as const) {
      const n = Math.round(a.distanceTo(c) / 0.45), pts = sag(a, c, n, 0.45), dir = c.clone().sub(a);
      const s = new Strand(pts.length, 0.012, 0.012, wire, 1); s.set(pts); R.add(s.mesh);
      const yaw = Math.atan2(dir.x, dir.z);
      pts.forEach((p, i) => { if (i && i < n - 1) pb.add(pen, cols[i % cols.length], M(p.x, p.y, p.z, yaw)); });
    }
    pb.build(R);
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, sc = this.sc, L = LIGHTS[sc.light], K = LOOK[sc.light];
    const c = camAt(sc, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.1; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    cam.layers.enable(NOINK);
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 60);
    this.sun.position.copy(focus).addScaledVector(this.sunDir, 220); this.sun.target.position.copy(focus);
    const sc2 = this.sun.shadow.camera;
    sc2.left = -Rr; sc2.right = Rr; sc2.top = Rr; sc2.bottom = -Rr; sc2.near = 20; sc2.far = 480; sc2.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    for (const m of this.clouds) m.lookAt(cam.position.x, m.position.y, cam.position.z);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(sc, t, { pos: cam.position, right, sun: this.sunDir });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1, p.z), 3.5))) continue;
      const a = this.actor(ai++), [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true; a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, Math.atan2(cam.position.x - p.x, cam.position.z - p.z), 0);
      a.mesh.scale.set(1, 1, 1); a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw); e.use(!!p.soft); e.mesh.visible = true; e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0); else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}
