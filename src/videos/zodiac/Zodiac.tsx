// "What's Your Sign?" scene compositions: the bridge short's post chain (ink -> lens blur -> bloom -> neutral tone
// map -> grade, MSAA 4) over the fest-ground world, one composition per scene (props: { scene }).
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../bridge/ink";
import { LensBlur } from "../bridge/lensblur";
import { GradeEffect, GRADES, GRADE_STRENGTH, gradeFor } from "../bridge/grade";
import { Kit } from "../bridge/build";
import { World, loadKit } from "./world";
import { SCENES, SceneDef, dofAt, FPS } from "./story";
import { paintInsert } from "./inserts";

export const sceneFrames = (n: number) => SCENES[n].total;

const makeBloom = () => {
  const b = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.5, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true, levels: 6, radius: 0.6 });
  const mip = b.mipmapBlurPass, setSize = mip.setSize.bind(mip);
  mip.setSize = (w: number, h: number) => setSize(Math.round((1920 * w) / Math.max(h, 1)), 1920);
  return b;
};
const fwd = new THREE.Vector3(), fpt = new THREE.Vector3();

const Inner: React.FC<{ kit: Kit; sc: SceneDef }> = ({ kit, sc }) => {
  const f = useCurrentFrame();
  const { camera, scene } = useThree();
  const world = useMemo(() => new World(kit, sc), [kit, sc]);
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 24, nearScale: 1.2 }),
    bloom: makeBloom(),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADES[sc.light], GRADE_STRENGTH[sc.light]),
  }), [camera, scene, sc]);
  useEffect(() => () => fx.ink.dispose(), [fx]);
  const post = useMemo(() => (
    <EffectComposer multisampling={4}>
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  const cam = camera as THREE.PerspectiveCamera;
  const target = world.update(f, cam, scene);
  noInkFallback(world.root);
  const d = dofAt(sc, f);
  cam.getWorldDirection(fwd);
  if (d.focus) fpt.set(...d.focus); else fpt.copy(target);
  fx.lens.focus = Math.max(0.3, fpt.sub(cam.position).dot(fwd));
  fx.lens.cInf = d.cInf;
  gradeFor(fx.grade, sc.light);
  return (
    <>
      <primitive object={world.root} dispose={null} />
      {post}
    </>
  );
};

/** storybook cutaways (inserts.ts) painted over the stage, at 2K-ready resolution */
const Overlay: React.FC<{ scene: number }> = ({ scene }) => {
  const f = useCurrentFrame(), ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!, g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
    g.setTransform(c.width / 1080, 0, 0, c.height / 1920, 0, 0);
    paintInsert(g, scene, f / FPS);
  }, [f, scene]);
  return <canvas ref={ref} width={1440} height={2560} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />;
};

const dprOverride = () => (getInputProps() as { post?: { dpr?: number } }).post?.dpr;

export const ZodiacScene: React.FC<{ scene: number }> = ({ scene }) => {
  const [kit, setKit] = useState<Kit | null>(null);
  const [handle] = useState(() => delayRender("zodiac kit"));
  useEffect(() => { loadKit().then((k) => { setKit(k); continueRender(handle); }); }, [handle]);
  if (!kit) return null;
  return (
    <AbsoluteFill style={{ background: "#cfe3f2" }}>
      <ThreeCanvas width={1080} height={1920} {...(dprOverride() ? { dpr: dprOverride() } : {})} shadows
        gl={{ antialias: false, stencil: false, powerPreference: "high-performance", toneMappingExposure: 1.0 }} camera={{ fov: 40, near: 0.1, far: 1500 }}>
        <Inner kit={kit} sc={SCENES[scene]} />
      </ThreeCanvas>
      <Overlay scene={scene} />
    </AbsoluteFill>
  );
};
