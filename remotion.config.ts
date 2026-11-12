/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// cartoon-3d-short skill: world build per tab is slow (> default 30 s), GPU via ANGLE, same Chrome as scripts/bridge-stills.mjs
Config.setDelayRenderTimeoutInMilliseconds(180000);
Config.setChromiumOpenGlRenderer("angle");
Config.setBrowserExecutable("C:/Program Files/Google/Chrome/Application/chrome.exe");
// 8+ parallel WebGL tabs break the EffectMaterial shader (all-white frames); 4 is tested clean
Config.setConcurrency(4);
