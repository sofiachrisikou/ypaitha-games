import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS, IMAGE_ASSETS, TEXTURE_ATLAS_ASSETS, AUDIO_ASSETS, RIVE_ASSETS } from '../common/assets.js';
import { loadFont } from '../common/sharedGameSettings.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  //#region Scene Lifecycle

  preload() {
    // PHASE 1 — only the background image is queued here. Nothing else is in
    // flight, so it doesn't share bandwidth with the ~89 other files (Phaser
    // fires up to 32 downloads concurrently by default) — it gets the whole
    // connection to itself, so it actually finishes fast instead of racing
    // everything else. create() below only runs once this 1-file queue is done.
    const introBackgroundAsset = IMAGE_ASSETS.find((asset) => asset.assetKey === ASSET_KEYS.BACKGROUND_INTRO);
    this.load.image(introBackgroundAsset.assetKey, introBackgroundAsset.path);
  }

  create() {
    // Phase 1 done — show it immediately.
    const { width, height } = this.scale;
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_INTRO);

    // PHASE 2 — only NOW do the other ~89 files get queued. Runs once Phase 1
    // is already on screen, instead of all ~90 files competing from the start.
    IMAGE_ASSETS.forEach((asset) => {
      if (asset.assetKey === ASSET_KEYS.BACKGROUND_INTRO) {
        return;
      }
      this.load.image(asset.assetKey, asset.path);
    });
    // Unused — ASSET_KEYS.OBJECTS spritesheet isn't referenced by any scene right now.
    // TEXTURE_ATLAS_ASSETS.forEach((asset) => {
    //   this.load.atlas(asset.assetKey, asset.textureURL, asset.atlasURL);
    // });

    AUDIO_ASSETS.forEach((asset) => {
      this.load.audio(asset.assetKey, asset.path);
    });

    RIVE_ASSETS.forEach((asset) => {
      this.load.binary(asset.assetKey, asset.path);
    });

    // preload()'s own queue already finished, so Phase 2 needs an explicit
    // start() — and its own completion listener, since create() itself
    // already ran and won't fire again.
    this.load.once(Phaser.Loader.Events.COMPLETE, async () => {
      await loadFont('GameFont', 'assets/fonts/ComicSansMSBold.ttf');
      this.scene.start(SCENE_KEYS.EUZOYLIS_INTRO_SCENE);
    });
    this.load.start();
  }

  //#endregion
}
