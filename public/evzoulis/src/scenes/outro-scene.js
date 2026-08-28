import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, BEAR_RIVE_MAX_DPR } from '../common/rive-stage.js';
import { playLevelSuccessFeedback } from '../common/audio-manager.js';

// const speechBubbleTextStyleConfig = {
//   fontSize: '32px',
//   color: '#043D8C',
//   align: 'center',
//   wordWrap: { width: 260, useAdvancedWrap: true },
// };

export class OutroScene extends Phaser.Scene {
  //TIMING
  #characterAppearDelayMs;
  #characterFadeInDurationMs;

  //CHARACTER
  #riveInstance;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_OUTRO_SCENE,
    });
  }

  //#region Scene Lifecycle

  /**
   * @public
   * Tied to the Phaser Scene lifecycle. Will run one time after the PRELOAD
   * logic is finished. Runs each time the Phaser Scene restarts.
   * @returns {void}
   */
  init() {
    this.#characterAppearDelayMs = 1800;
    this.#characterFadeInDurationMs = 400;
  }

  preload() {
    console.log('preload called');
  }

  create() {
    const { width, height } = this.scale;

    // TODO: swap ASSET_KEYS.OUTRO_BACKGROUND for your real background
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_OUTRO).setScale(0.55);

    this.time.delayedCall(this.#characterAppearDelayMs, this.#showCharacterMessage, [], this);

    this.time.delayedCall(
      this.#characterAppearDelayMs + 8000,
      () => {
        // αλεξ εκανα το redirect για την σελιδα αξιολογησης εγω - σοφια
        window.parent.postMessage({ type: 'evzoulis:done' }, '*');
        this.scene.start(SCENE_KEYS.EUZOYLIS_INTRO_SCENE);
      },
      [],
      this,
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);
  }

  update(time, delta) {
    // No continuous per-frame movement — the character reveal is a single
    // delayed call. Left here so the Scene lifecycle stays complete.
  }

  #handleShutdown() {
    removeRiveAnimation(this.#riveInstance, 'rive-stage--outro'); // remove
    this.#riveInstance = null;
  }

  //#endregion

  //#region Character

  #createOutroCharacterAnimation()
  {
    this.#riveInstance = spawnRiveAnimation(
      this.cache.binary.get(ASSET_KEYS.RIVE_BEAR_OUTRO),
      'Timeline_Bear_Outro',
      'rive-stage--outro',
      true,   // loop
      false,  // isStateMachine — this file is a plain Animation
      BEAR_RIVE_MAX_DPR,
    );
  }

  #showCharacterMessage() {
    const { width, height } = this.scale;

    const bubblex = width * 0.65;
    const bubbleY = height/2 + 80

    this.#createOutroCharacterAnimation();
    // level 3's completion moment — game-scene3.js no longer celebrates on its own
    playLevelSuccessFeedback(this, 3);

    // TODO: replace with your real "well done" copy
    const bubbleImage = this.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(0.35);
    const bubbleText = this.add
      .text(0, -20, 'ΜΠΡΑΒΟ! ΤΑ ΚΑΤΑΦΕΡΕΣ!', TEXT_STYLES.SPEECH_BUBBLE)
      .setOrigin(0.5);
    const bubbleContainer = this.add.container(bubblex - 260, bubbleY, [bubbleImage, bubbleText]).setAlpha(0);

    this.tweens.add({
      targets: [ bubbleContainer],
      alpha: 1,
      duration: this.#characterFadeInDurationMs,
      ease: 'Sine.easeOut',
    });
  }

  //#endregion
}
