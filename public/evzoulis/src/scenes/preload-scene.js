import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, SHARED_ASSETS, INTRO_ASSETS, queueAssetBucket } from '../common/assets.js';
import { loadFont, debugLog } from '../common/sharedGameSettings.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  //#region Scene Lifecycle

  preload() {
    // Always-on, not gated by DEBUG — a failed file download is a real
    // problem worth knowing about even in a shipped kiosk build.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
      console.warn(`[Loading] FAILED: ${file.key} (${file.src})`);
    });

    // PHASE 1 — only the background image is queued here. Nothing else is in
    // flight, so it doesn't share bandwidth with everything else (Phaser
    // fires up to 32 downloads concurrently by default) — it gets the whole
    // connection to itself, so it actually finishes fast instead of racing
    // everything else. create() below only runs once this 1-file queue is done.
    const introBackgroundAsset = INTRO_ASSETS.images.find((asset) => asset.assetKey === ASSET_KEYS.BACKGROUND_INTRO);
    this.load.image(introBackgroundAsset.assetKey, introBackgroundAsset.path);
  }

  create() {
    // Phase 1 done — show it immediately.
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_INTRO);

    // PHASE 2 — only what Intro itself needs: SHARED + the rest of INTRO
    // (skipping BACKGROUND_INTRO, already loaded above). Stage 1/2/3/Outro
    // assets are NOT loaded here — BackgroundLoaderScene streams those in
    // behind the scenes once Intro starts, so the game boots much faster.
    debugLog('[Loading] INTRO: started');
    queueAssetBucket(this, SHARED_ASSETS);
    INTRO_ASSETS.images.forEach((asset) => {
      if (asset.assetKey === ASSET_KEYS.BACKGROUND_INTRO) {
        return;
      }
      this.load.image(asset.assetKey, asset.path);
    });
    INTRO_ASSETS.audio.forEach((asset) => this.load.audio(asset.assetKey, asset.path));
    INTRO_ASSETS.rive.forEach((asset) => this.load.binary(asset.assetKey, asset.path));

    // preload()'s own queue already finished, so Phase 2 needs an explicit
    // start() — and its own completion listener, since create() itself
    // already ran and won't fire again.
    this.load.once(Phaser.Loader.Events.COMPLETE, async () => {
      await loadFont('GameFont', 'assets/fonts/ComicSansMSBold.ttf');
      debugLog('[Loading] INTRO: finished');
      this.scene.launch(SCENE_KEYS.BACKGROUND_LOADER_SCENE);
      this.scene.start(SCENE_KEYS.EUZOYLIS_INTRO_SCENE);
    });
    this.load.start();
  }

  //#endregion
}
