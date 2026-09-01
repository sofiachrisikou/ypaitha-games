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
    // Phaser keeps rendering during preload() — it only defers create() until
    // loading finishes. Loading the intro background FIRST and displaying it
    // the moment IT is ready (not waiting on the other ~40 audio clips + rive
    // files) turns the 2-4s black screen on slower devices into an instant
    // background instead. IntroScene.create() adds its own copy after — no
    // conflict, Phaser destroys this scene's display list when it starts.
    const introBackgroundAsset = IMAGE_ASSETS.find((asset) => asset.assetKey === ASSET_KEYS.BACKGROUND_INTRO);
    this.load.image(introBackgroundAsset.assetKey, introBackgroundAsset.path);
    this.load.once(`filecomplete-image-${ASSET_KEYS.BACKGROUND_INTRO}`, () => {
      const { width, height } = this.scale;
      this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_INTRO);
    });

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
  }

  async create() {
    await loadFont('GameFont', 'assets/fonts/ComicSansMSBold.ttf');
    this.scene.start(SCENE_KEYS.EUZOYLIS_INTRO_SCENE);
  }

  //#endregion
}
