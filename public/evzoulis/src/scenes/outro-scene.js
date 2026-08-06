import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { spawnRiveAnimation, removeRiveAnimation } from '../common/rive-stage.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';

// const speechBubbleTextStyleConfig = {
//   fontSize: '32px',
//   color: '#043D8C',
//   align: 'center',
//   wordWrap: { width: 260, useAdvancedWrap: true },
// };

export class OutroScene extends Phaser.Scene {
  #characterAppearDelayMs;
  #characterFadeInDurationMs;
   #riveInstance;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_OUTRO_SCENE,
    });
  }

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

  #showCharacterMessage() {
    const { width, height } = this.scale;

    const bubblex = width * 0.65;
    const bubbleY = height/2 + 80

    this.#createOutroCharacterAnimation();

    // TODO: swap ASSET_KEYS.SPEECH_BUBBLE for your real speech-bubble art
    const bubbleImage = this.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(0.35);
    // TODO: replace with your real "well done" copy
    const bubbleText = this.add
      .text(0, 0, 'ΜΠΡΑΒΟ! ΤΑ ΚΑΤΑΦΕΡΕΣ!', TEXT_STYLES.SPEECH_BUBBLE)
      .setOrigin(0.5);
    const bubbleContainer = this.add.container(bubblex - 260, bubbleY, [bubbleImage, bubbleText]).setAlpha(0);

    this.tweens.add({
      targets: [ bubbleContainer],
      alpha: 1,
      duration: this.#characterFadeInDurationMs,
      ease: 'Sine.easeOut',
    });
  }

  #handleShutdown() {  
      removeRiveAnimation(this.#riveInstance, 'rive-stage--outro'); // remove
      this.#riveInstance = null;
    }

   #createOutroCharacterAnimation()
    {
      this.#riveInstance = spawnRiveAnimation(
        'assets/rive/Bear_Outro.riv',
        'Timeline_Bear_Outro',
        'rive-stage--outro',
        true,   // loop
        false,  // isStateMachine — this file is a plain Animation
      );
    }
}
