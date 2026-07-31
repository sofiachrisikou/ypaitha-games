import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';

const speechBubbleTextStyleConfig = {
  fontSize: '32px',
  color: '#043D8C',
  align: 'center',
  wordWrap: { width: 260, useAdvancedWrap: true },
};

const CLOUD_ANIM_KEY = 'introCloudGrow';

export class IntroScene extends Phaser.Scene {
  #decorAnimationsActive;
  #decorObjects;
  #upvoteGrowDurationMs;
  #upvoteRiseDurationMs;
  #upvoteRiseDistance;
  #cloudFrameRate;
  #wobbleAngleDeg;
  #wobbleDurationMs;
  #shakeAngleDeg;
  #shakeDurationMs;
  #fadeDurationMs;
  #shakeMinAlpha;
  #logoGO;
  #startButtonGO;
  #characterGO;
  #levelButtonGO;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_INTRO_SCENE,
    });
  }

  /**
   * @public
   * Tied to the Phaser Scene lifecycle. Will run one time after the PRELOAD
   * logic is finished. Runs each time the Phaser Scene restarts.
   * @returns {void}
   */
  init() {
    this.#decorAnimationsActive = true;
    this.#decorObjects = [];

    // Type 1: pop in, grow, rise + fade, loop back to start
    this.#upvoteGrowDurationMs = 300;
    this.#upvoteRiseDurationMs = 900;
    this.#upvoteRiseDistance = 120;

    // Type 2: 3-stage frame swap + constant rotation wobble
    this.#cloudFrameRate = 2;
    this.#wobbleAngleDeg = 8;
    this.#wobbleDurationMs = 800;

    // Type 3: fast shake + slow independent fade
    this.#shakeAngleDeg = 6;
    this.#shakeDurationMs = 150;
    this.#fadeDurationMs = 1200;
    this.#shakeMinAlpha = 0.3;
  }

  preload() {
    console.log('preload called');
  }

  create() {
    const { width, height } = this.scale;

    // TODO: swap ASSET_KEYS.INTRO_BACKGROUND for your real background
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_INTRO);

    this.#decorObjects = [];
    this.#spawnDecorTestColumns();

    // TODO: swap ASSET_KEYS.LOGO for your real logo
    this.#logoGO = this.add.image(width * 0.5, height * 0.78, ASSET_KEYS.LOGO).setScale(0.55);

    // TODO: swap ASSET_KEYS.BUTTON for your real start-button art
    this.#startButtonGO = this.add
      .image(width * 0.5, height * 0.93, ASSET_KEYS.BTN1)
      .setScale(0.45)
      .setInteractive({ useHandCursor: true });
    this.#startButtonGO.on(Phaser.Input.Events.POINTER_DOWN, this.#handleStartButtonPressed, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);
  }

  update(time, delta) {
    // No continuous per-frame movement — every decorative animation here
    // runs on Tweens (and one Phaser Animation for the cloud), not manual
    // per-frame math. Left here so the Scene lifecycle stays complete.
  }

  /**
   * Three stacked-column test spawns, one column per animation type, purely
   * so all three can be eyeballed at once. TODO: replace with wherever
   * these actually belong once the real intro layout is finalized.
   */
  #spawnDecorTestColumns() {
    const { width, height } = this.scale;

    //const upvoteX = width * 0.18;
    const cloudX = width * 0.5;
    //const shakeX = width * 0.82;
    const rowYs = [height * 0.08, height * 0.16, height * 0.24];

    //rowYs.forEach((y) => {
    this.#createUpvoteEmoji(width * 0.85, height * 0.4, 0);
    this.#createUpvoteEmoji(width * 0.75, height * 0.3, 1);
    this.#createUpvoteEmoji(width * 0.8, height / 2, 2);

    this.#createWobblingCloud(cloudX, height / 2 - 140);
    // TODO: swap ASSET_KEYS.DECOR_SHAKE for your real texture key
    this.#createShakingFadingImage(width * 0.5 - 400, height / 2 + 100, ASSET_KEYS.BELL);
    this.#createShakingFadingImage(width * 0.5 - 340, height / 2 - 410, ASSET_KEYS.TESTS);
    this.#createShakingFadingImage(width * 0.5, height / 2 - 530, ASSET_KEYS.BOOK);
    //});
  }

  /** Type 1: small → grow → rise + fade → reset to start, looping forever */
  #createUpvoteEmoji(x, startY, emojiIndex) {
    // TODO: swap ASSET_KEYS.UPVOTE_EMOJI for your real texture key
    let emojiImage;
    switch (emojiIndex) {
      case 0:
        emojiImage = this.add.image(x, startY, ASSET_KEYS.EMOJI1).setScale(0.55);
        break;
      case 1:
        emojiImage = this.add.image(x, startY, ASSET_KEYS.EMOJI2).setScale(0.55);
        break;
      case 2:
        emojiImage = this.add.image(x, startY, ASSET_KEYS.EMOJI3).setScale(0.55);
        break;
    }
    this.#decorObjects.push(emojiImage);
    const randomDelay = Phaser.Math.Between(0, 800);

    this.time.delayedCall(randomDelay, () => {
      this.#playUpvoteCycle(emojiImage, startY);
    });
    return this.emojiImage;
  }

  #playUpvoteCycle(image, startY) {
    if (!this.#decorAnimationsActive) {
      return;
    }

    image.setScale(0).setAlpha(1).setY(startY);

    this.tweens.add({
      targets: image,
      scale: 0.55,
      duration: this.#upvoteGrowDurationMs,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!this.#decorAnimationsActive) {
          return;
        }
        this.tweens.add({
          targets: image,
          y: startY - this.#upvoteRiseDistance,
          alpha: 0,
          duration: this.#upvoteRiseDurationMs,
          ease: 'Sine.easeIn',
          onComplete: () => this.#playUpvoteCycle(image, startY),
        });
      },
    });
  }

  /** Type 2: cycles through 3 frames (Phaser Animation) while continuously rotating back and forth */
  #createWobblingCloud(x, y) {
    // TODO: swap these 3 keys for your real 3-stage cloud art
    const frameKeys = [ASSET_KEYS.CLOUD, ASSET_KEYS.CLOUD1, ASSET_KEYS.CLOUD2];

    // this.anims is the game-wide AnimationManager, shared across scenes —
    // guard against redefining the same key if this scene restarts
    if (!this.anims.exists(CLOUD_ANIM_KEY)) {
      this.anims.create({
        key: CLOUD_ANIM_KEY,
        frames: frameKeys.map((key) => ({ key })),
        frameRate: this.#cloudFrameRate,
        repeat: -1,
      });
    }

    const cloudSprite = this.add.sprite(x, y, frameKeys[0]).play(CLOUD_ANIM_KEY).setScale(0.55);

    this.tweens.add({
      targets: cloudSprite,
      angle: { from: -this.#wobbleAngleDeg, to: this.#wobbleAngleDeg },
      duration: this.#wobbleDurationMs,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.#decorObjects.push(cloudSprite);
    return cloudSprite;
  }

  /** Type 3: fast rotation shake, independent slower alpha fade */
  #createShakingFadingImage(x, y, textureKey) {
    const image = this.add.image(x, y, textureKey).setScale(0.55);
    const randomDelay = Phaser.Math.Between(0, 1500);

    this.tweens.add({
      targets: image,
      angle: { from: -this.#shakeAngleDeg, to: this.#shakeAngleDeg },
      duration: this.#shakeDurationMs,
      delay: randomDelay,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.tweens.add({
      targets: image,
      alpha: { from: this.#shakeMinAlpha, to: 1 },
      duration: this.#fadeDurationMs,
      delay: randomDelay,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.#decorObjects.push(image);
    return image;
  }

  #handleStartButtonPressed() {
    this.#logoGO.destroy();
    this.#startButtonGO.destroy();
    this.#showCharacterPrompt();
  }

  #showCharacterPrompt() {
    const { width, height } = this.scale;

    const characterX = width - 300;
    const characterY = height + 100;
    //const characterY = height * 0.92;
    // TODO: swap ASSET_KEYS.CHARACTER for your real Ευζούλης art
    this.#characterGO = this.add
      .image(characterX, characterY, ASSET_KEYS.CHARACTER_INTRO)
      .setOrigin(0.5, 1)
      .setScale(0.5);

    const bubbleY = characterY - this.#characterGO.displayHeight - 140;

    // TODO: swap ASSET_KEYS.SPEECH_BUBBLE for your real speech-bubble art
    const bubbleImage = this.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(0.35);
    const bubbleText = this.add.text(0, 0, 'ΘΑ ΜΕ ΒΟΗΘΗΣΕΙΣ ;', speechBubbleTextStyleConfig).setOrigin(0.5);
    this.add.container(characterX - 330, bubbleY, [bubbleImage, bubbleText]);

    const levelButtonX = characterX - this.#characterGO.displayWidth / 2 - 240;
    const levelButtonY = characterY - this.#characterGO.displayHeight / 2;

    // TODO: swap ASSET_KEYS.BUTTON for your real "go to level 1" button art
    this.#levelButtonGO = this.add
      .image(levelButtonX, levelButtonY, ASSET_KEYS.BTN1)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.#levelButtonGO.on(Phaser.Input.Events.POINTER_DOWN, this.#handleLevelButtonPressed, this);
  }

  #handleLevelButtonPressed() {
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE1);
  }

  #handleShutdown() {
    this.#decorAnimationsActive = false;
    this.#decorObjects.forEach((gameObject) => this.tweens.killTweensOf(gameObject));
    if (this.#startButtonGO) {
      this.#startButtonGO.off(Phaser.Input.Events.POINTER_DOWN, this.#handleStartButtonPressed, this);
    }
    if (this.#levelButtonGO) {
      this.#levelButtonGO.off(Phaser.Input.Events.POINTER_DOWN, this.#handleLevelButtonPressed, this);
    }
  }
}
