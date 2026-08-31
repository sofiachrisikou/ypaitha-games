import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, BEAR_RIVE_MAX_DPR } from '../common/rive-stage.js';

// const speechBubbleTextStyleConfig = {
//   fontSize: '32px',
//   color: '#043D8C',
//   align: 'center',
//   wordWrap: { width: 260, useAdvancedWrap: true },
// };

// Final "whole game is done" message — two spoken lines, one bubble.
const OUTRO_LINES = [
  { text: 'Η τάξη ηρέμησε!', audioKey: ASSET_KEYS.EZ_39, durationSeconds: 6 },
  { text: 'Ανάσα • Καλή σκέψη • Τέντωμα', audioKey: ASSET_KEYS.EZ_40, durationSeconds: 8 },
];

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

    const outroLinesTotalMs = OUTRO_LINES.reduce((sum, line) => sum + line.durationSeconds * 1000, 0);
    // Extra breathing room so the goodbye audio isn't cropped before the voting page loads.
    const votingPageTransitionBufferMs = 3000;
    this.time.delayedCall(
      this.#characterAppearDelayMs + outroLinesTotalMs + votingPageTransitionBufferMs,
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

    const bubbleImage = this.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(0.35);
    const bubbleText = this.add.text(0, -20, '', TEXT_STYLES.SPEECH_BUBBLE).setOrigin(0.5);
    const bubbleContainer = this.add.container(bubblex - 260, bubbleY, [bubbleImage, bubbleText]).setAlpha(0);

    this.tweens.add({
      targets: [ bubbleContainer],
      alpha: 1,
      duration: this.#characterFadeInDurationMs,
      ease: 'Sine.easeOut',
    });

    this.#playOutroLines(bubbleText);
  }

  /** Plays OUTRO_LINES in order, each its own audio + bubble text for its own durationSeconds. */
  #playOutroLines(bubbleText) {
    let currentVoiceover = null;
    let elapsedMs = 0;
    OUTRO_LINES.forEach((line) => {
      this.time.delayedCall(elapsedMs, () => {
        currentVoiceover?.stop();
        bubbleText.setText(line.text);
        currentVoiceover = this.sound.add(line.audioKey);
        currentVoiceover.play();
      });
      elapsedMs += line.durationSeconds * 1000;
    });
  }

  //#endregion
}
