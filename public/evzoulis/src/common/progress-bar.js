import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';

/**
 * Reusable horizontal progress bar built from the shared
 * ASSET_KEYS.PROGRESSBAR_BG (track) and ASSET_KEYS.PROGRESSBAR_FG (fill)
 * images. Encapsulated as its own object (not private Scene fields), so any
 * number of Scenes can create their own instance without colliding with a
 * Scene's own similarly-named fields/methods.
 *
 * Usage:
 *   this.#progressBar = new ProgressBar(this, { x: width / 2, y: 70, width: width * 0.86 });
 *   this.#progressBar.setProgress(0.5); // 0 to 1
 *   const bottomY = this.#progressBar.getBounds().bottom;
 */
export class ProgressBar {
  //RENDERING
  #bgImage;
  #fillImage;
  #fillFrameWidth;
  #fillFrameHeight;

  /**
   * @param {Phaser.Scene} scene
   * @param {object} config
   * @param {number} config.x
   * @param {number} config.y
   * @param {number} config.width target on-screen width of the bar
   * @param {number} [config.originX=0.5]
   * @param {number} [config.originY=0]
   */
  constructor(scene, { x, y, width, originX = 0.5, originY = 0 }) {
    this.#bgImage = scene.add.image(x, y, ASSET_KEYS.PROGRESSBAR_BG).setOrigin(originX, originY);
    this.#scaleImageToWidth(this.#bgImage, width);

    this.#fillImage = scene.add.image(x, y, ASSET_KEYS.PROGRESSBAR_FG).setOrigin(originX, originY);
    this.#scaleImageToWidth(this.#fillImage, width);

    // Native frame size (pre-scale) — setCrop operates in this space.
    this.#fillFrameWidth = this.#fillImage.width;
    this.#fillFrameHeight = this.#fillImage.height;

    this.setProgress(0);
  }

  //#region Progress Bar

  /** @param {number} ratio 0 (empty) to 1 (full) */
  setProgress(ratio) {
    const clampedRatio = Phaser.Math.Clamp(ratio, 0, 1);
    this.#fillImage.setCrop(0, 0, this.#fillFrameWidth * clampedRatio, this.#fillFrameHeight);
  }

  /** @returns {Phaser.Geom.Rectangle} bounds of the background/track image */
  getBounds() {
    return this.#bgImage.getBounds();
  }

  setPosition(x, y) {
    this.#bgImage.setPosition(x, y);
    this.#fillImage.setPosition(x, y);
    return this;
  }

  setVisible(visible) {
    this.#bgImage.setVisible(visible);
    this.#fillImage.setVisible(visible);
    return this;
  }

  destroy() {
    this.#bgImage.destroy();
    this.#fillImage.destroy();
  }

  //#endregion

  //#region Utils

  #scaleImageToWidth(image, targetWidth) {
    image.setScale(targetWidth / image.width);
  }

  //#endregion
}
