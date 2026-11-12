import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { BridgeShort, BRIDGE_FRAMES } from "./videos/bridge/Bridge";
import { ZodiacScene, sceneFrames } from "./videos/zodiac/Zodiac";
import { SCENES } from "./videos/zodiac/story";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      {Object.keys(SCENES).map((n) => (
        <Composition key={n} id={`ZodiacScene${n}`} component={ZodiacScene} defaultProps={{ scene: Number(n) }} durationInFrames={sceneFrames(Number(n))} fps={30} width={1080} height={1920} />
      ))}
      <Composition id="BridgeShort" component={BridgeShort} durationInFrames={BRIDGE_FRAMES} fps={30} width={1080} height={1920} />
    </>
  );
};
