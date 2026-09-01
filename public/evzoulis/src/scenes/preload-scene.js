import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { IMAGE_ASSETS, TEXTURE_ATLAS_ASSETS, AUDIO_ASSETS, RIVE_ASSETS } from '../common/assets.js';
import { loadFont } from '../common/sharedGameSettings.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({
      key: SCENE_KEYS.PRELOAD_SCENE,
    });
  }

  //#region Scene Lifecycle

  preload() {
    IMAGE_ASSETS.forEach((asset) => {
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
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE2);
  }

  //#endregion
}
