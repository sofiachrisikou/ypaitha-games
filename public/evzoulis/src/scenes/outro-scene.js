import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { createAnimatedCharacter } from '../common/level-flow.js';

// Same createAnimatedCharacter/clipIndex pattern as every other stage's
// guide character — bubbleX/Y are the exact same spot the old formula-based
// position (width*0.65-260, height/2+80) worked out to, just as plain numbers now.
// NOTE: RIVE_BEAR_OUTRO needs an actual state machine with a clipIndex-style
// input for animationParam below to do anything — if it's still a plain
// Animation, setAnimationParam will just warn in the console, not crash.
const OUTRO_CHARACTER_CONFIG = {
  riveAssetKey: ASSET_KEYS.RIVE_BEAR_OUTRO,
  stateMachineName: 'Euzoulis_StateMachine',
  animParamName: 'clipIndex',
  idleParam: 0,
};
const OUTRO_POSITION = { cssClass: 'rive-stage--outro', bubbleScale: 0.35, bubbleX: 520, bubbleY: 1200, textStyle: TEXT_STYLES.SPEECH_BUBBLE };

// Final "whole game is done" message — two spoken lines, one bubble, each its own animationParam.
const OUTRO_LINES = [
  { animationParam: 35, audioKey: ASSET_KEYS.EZ_39, durationSeconds: 6, text: 'Η τάξη ηρέμησε!' },
  { animationParam: 36, audioKey: ASSET_KEYS.EZ_40, durationSeconds: 8, text: 'Ανάσα • Καλή σκέψη • Τέντωμα' },
];

// Extra breathing room after the last line so the goodbye audio isn't cropped before the voting page loads.
const VOTING_PAGE_TRANSITION_BUFFER_MS = 3000;

export class OutroScene extends Phaser.Scene {
  //CHARACTER
  #character;

  //TIMING
  #characterAppearDelayMs;

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
  }

  preload() {
    console.log('preload called');
  }

  create() {
    const { width, height } = this.scale;

    // TODO: swap ASSET_KEYS.OUTRO_BACKGROUND for your real background
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_OUTRO).setScale(0.55);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);

    this.time.delayedCall(this.#characterAppearDelayMs, () => {
      // Rive loads asynchronously — wait for onReady before setting any animation param
      this.#character = createAnimatedCharacter(this, OUTRO_CHARACTER_CONFIG, OUTRO_POSITION, () => {
        this.#character.setAnimationParam(0);
        this.time.delayedCall(100, () => {
          this.#character.playSequence(OUTRO_LINES, () => {
            this.time.delayedCall(VOTING_PAGE_TRANSITION_BUFFER_MS, () => this.#goToVotingPage());
          });
        });
      });
    });
  }

  update(time, delta) {
    // No continuous per-frame movement — everything here is delayed calls and the shared character's own sequencing.
  }

  #handleShutdown() {
    this.#character?.destroy();
  }

  //#endregion

  //#region Level Management

  #goToVotingPage() {
    this.#character?.destroy();
    // αλεξ εκανα το redirect για την σελιδα αξιολογησης εγω - σοφια
    window.parent.postMessage({ type: 'evzoulis:done' }, '*');
    this.scene.start(SCENE_KEYS.EUZOYLIS_INTRO_SCENE);
  }

  //#endregion
}
