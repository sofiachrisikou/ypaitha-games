import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { createAnimatedCharacter } from '../common/level-flow.js';
import { playCorrectSound, playWrongSound, playBreathInSound, playBreathOutSound } from '../common/audio-manager.js';



// Stage 1's one persistent character, alive for intro/tutorial/gameplay/outro
const STAGE1_CHARACTER_CONFIG = {
  riveAssetKey: ASSET_KEYS.RIVE_BEAR_Stg1,
  stateMachineName: 'Euzoulis_StateMachine',
  animParamName: 'clipIndex',
  idleParam: 0,
};
const STAGE1_IDLE_PARAM = 0;
const STAGE1_BREATHE_IN_PARAM = 8;
const STAGE1_HOLD_PARAM = 9;
const STAGE1_BREATHE_OUT_PARAM = 10;

// Three spots for the character + bubble — intro, main (tutorial+gameplay),
// outro — each independently adjustable. bubbleX/Y are plain absolute
// scene coordinates, not computed from anything.
const STAGE1_POSITION_INTRO = { cssClass: 'rive-stage--stg1-character-intro', bubbleScale: 0.35, bubbleX: 300, bubbleY: 800, textStyle: TEXT_STYLES.SPEECH_BUBBLE };
const STAGE1_POSITION_MAIN = { cssClass: 'rive-stage--stg1-character', bubbleScale: 0.35, bubbleX: 400, bubbleY: 560, textStyle: TEXT_STYLES.SPEECH_BUBBLE };
const STAGE1_POSITION_OUTRO = { cssClass: 'rive-stage--stg1-character', bubbleScale: 0.35, bubbleX: 400, bubbleY: 560, textStyle: TEXT_STYLES.SPEECH_BUBBLE };

// animationParam: 1=intro, 4/5/6=tutorial steps, 7=ready-check (waits for the start button), 8/9/10=breathe in/hold/out
const STAGE1_INTRO_STEPS = [
  { animationParam: 1, audioKey: ASSET_KEYS.EZ_02, durationSeconds: 4, text: 'ΣΤΑΔΙΟ 1 — Η ανάσα μου' },
];
const STAGE1_TUTORIAL_STEPS = [
  { animationParam: 4, audioKey: ASSET_KEYS.EZ_03, durationSeconds: 6, text: '1. Σύρε προς τα ΠΑΝΩ και πάρε ανάσα' },
  { animationParam: 5, audioKey: ASSET_KEYS.EZ_04, durationSeconds: 6, text: '2. ΚΡΑΤΑ 2 δευτερόλεπτα, μέχρι να πρασινίσει' },
  { animationParam: 6, audioKey: ASSET_KEYS.EZ_05, durationSeconds: 7, text: '3. Σύρε προς τα ΚΑΤΩ και φύσα αργά' },
  // waitForButton: no durationSeconds — spawns a Start button instead, advances on click. x/y here are also plain, adjustable numbers.
  { animationParam: 7, audioKey: ASSET_KEYS.EZ_06, text: 'ΠΑΜΕ!', waitForButton: { assetKey: ASSET_KEYS.BTN1, x: 540, y: 1632, scale: 0.45 } },
];
// TODO: real animationParam — placeholder (2 is unused so far)
const STAGE1_OUTRO_STEPS = [
  { animationParam: 2, audioKey: ASSET_KEYS.EZ_17, durationSeconds: 7, text: 'Τα κατάφερες!' },
];

// Good-move feedback: one picked at random after every successful breath
const STAGE1_GOOD_MOVE_STEPS = [
  { animationParam: 11, audioKey: ASSET_KEYS.EZ_10, durationSeconds: 3 },
  { animationParam: 12, audioKey: ASSET_KEYS.EZ_11, durationSeconds: 3 },
  { animationParam: 13, audioKey: ASSET_KEYS.EZ_12, durationSeconds: 3 },
];
// Fixed clip played instead of a random good-move pick at breathsCompleted === 4 (2/3 of 6)
const STAGE1_MILESTONE_STEP = { animationParam: 18, audioKey: ASSET_KEYS.EZ_16, durationSeconds: 5, text: 'Αναπνοές: 4 / 6' };
// Bad-move feedback: released/drifted out of the hold vs wrong swipe direction
const STAGE1_BAD_MOVE_HOLD_STEP = { animationParam: 15, audioKey: ASSET_KEYS.EZ_14, durationSeconds: 4, text: 'Κράτα λίγο ακόμη' };
const STAGE1_BAD_MOVE_DIRECTION_STEP = { animationParam: 16, audioKey: ASSET_KEYS.EZ_15, durationSeconds: 4, text: 'Ξανά, μαζί!' };

// Wobbling breath prompt at the bottom of the screen (replaces the old INHALE/EXHALE image)
const BREATH_TEXT = {
  INHALE: 'ΕΙΣΠΝΟΗ — σύρε πάνω',
  HOLD: 'ΚΡΑΤΑ — μέχρι να πρασινίσει',
  EXHALE: 'ΕΚΠΝΟΗ — σύρε κάτω',
};

const SWIPE_STATE = {
  WAITING: 'WAITING',
  SWIPING: 'SWIPING',
  HOLDING: 'HOLDING',
};

// IN = breathe in = swipe bottom→top, hold at top.
// OUT = breathe out = swipe top→bottom, hold at bottom.
// Alternates after every successful breath: IN, OUT, IN, OUT, ...
const BREATH_DIRECTION = {
  IN: 'IN',
  OUT: 'OUT',
};

export class GameScene extends Phaser.Scene {
  //CANDLE & FLAME
  #candleX;
  #candleBottomY;
  #candleTopY;
  #candleFlame;
  #candleFlameHeightRatio;
  #candleRelightDelayMs;

  //FLOWER
  #flowerGO;
  #cyclesCompleted;
  #flowerStage2Threshold;
  #flowerStage3Threshold;

  //STAGE 1 CHARACTER
  #character;
  #introBg;
  #introLogo;

  //GAMEPLAY UI (arrow + target circles — created on Start button, hidden at level complete)
  #targetCirclesGO;

  //BREATH PROMPT
  #breathPromptGO;
  #breathPromptWobbleTween;

  //GAMEPLAY
  #swipeState;
  #currentBreathDirection;
  #lastSwipePointerY;
  #holdTimerEvent;
  #swipeZoneRadius;
  #maxSwipeHorizontalDrift;
  #swipeBackslideTolerance;
  #swipeHoldDurationMs;
  #swipeIndicatorGO;
  #swipeIndicatorTween;
  #swipeArrowBaseScale;
  #swipeArrowHeightRatio;
  #swipeGestureBarGraphics;
  #swipeGestureBarX;
  #swipeGestureBarWidth;
  #requiredBreaths;
  #maxFailedBreaths;
  #inputLocked;
  #debug;

  //TIMER
  #remainingSeconds;
  #timerTextGO;
  #countdownTimerEvent;

  //PROGRESS BAR
  #levelProgressBar;

  //STATS
  #breathsCompleted;
  #failedBreaths;
  #breathsTextGO;

  //LEVEL MANAGEMENT
  #isLevelComplete;
  #isGameOver;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE1,
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
    this.#swipeZoneRadius = 90;
    this.#maxSwipeHorizontalDrift = 110;
    this.#swipeBackslideTolerance = 40;
    this.#swipeHoldDurationMs = 2000;
    // "after 2 seconds the flame comes back" (bumped from 1s — stay out at least a second longer)
    this.#candleRelightDelayMs = 2000;
    // Sizes are ratios, not pixels, so this stays correct regardless of the
    // real dimensions of whatever PNGs get loaded into these texture keys.
    this.#swipeArrowHeightRatio = 0.09; // fraction of screen height
    this.#candleFlameHeightRatio = 0.35; // fraction of the candle's own display height
    this.#requiredBreaths = 6;
    // TODO: confirm — placeholder fail condition so #handleGameOver has a
    // real trigger. Level 1 spec doesn't define a game-over rule yet.
    this.#maxFailedBreaths = 5;
    this.#breathsCompleted = 0;
    this.#failedBreaths = 0;
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#inputLocked = false;
    // First breath is always an inhale; flips after each success in
    // #handleBreathSuccess, never on failure (a failed attempt retries the
    // same direction, it doesn't advance to the next one).
    this.#currentBreathDirection = BREATH_DIRECTION.IN;
    this.#lastSwipePointerY = 0;
    this.#holdTimerEvent = null;
    this.#swipeIndicatorTween = null;
    this.#isLevelComplete = false;

    //timer
    this.#remainingSeconds = 60;

    this.#isGameOver = false;
    // on while you're tuning the gesture feel — draws the start/end zones
    // and logs why each failed attempt failed. Flip to false for the build.
    this.#debug = true;

    // TODO: add FLOWER1/FLOWER2/FLOWER3 to assets.js. A "cycle" = one IN +
    // one OUT breath, so it only advances on breath-OUT success (that's
    // what closes a cycle that started with an IN). These thresholds are a
    // starting guess for requiredBreaths=5 (max 2 complete cycles) — retune
    // if you change #requiredBreaths.
    this.#cyclesCompleted = 0;
    this.#flowerStage2Threshold = 1;
    this.#flowerStage3Threshold = 3;
  }

  preload() {
    console.log('preload called');
  }

  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);
    this.#showIntroBackground();
    // Rive loads asynchronously — wait for onReady before setting any animation param
    this.#character = createAnimatedCharacter(this, STAGE1_CHARACTER_CONFIG, STAGE1_POSITION_INTRO, () => {
      // Force idle first and give Rive a beat to actually settle there
      // before the first real clip — jumping straight to clip 1 from frame
      // zero skips the state machine's own Entry->Idle transition, which
      // may be the only path with a working way back out.
      this.#character.setAnimationParam(STAGE1_IDLE_PARAM);
      this.time.delayedCall(100, () => {
        this.#character.playSequence(STAGE1_INTRO_STEPS, () => {
          this.#hideIntroBackground();
          this.#character.moveTo(STAGE1_POSITION_MAIN);
          this.#startLevel();
        });
      });
    });
  }

  #showIntroBackground() {
    const { width, height } = this.scale;
    this.#introBg = this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
    this.#introLogo = this.add.image(width / 2, height * 0.16, ASSET_KEYS.STAGE1_LOGO).setDepth(1001).setScale(0.55);
  }

  #hideIntroBackground() {
    this.#introBg?.destroy();
    this.#introLogo?.destroy();
    this.#introBg = null;
    this.#introLogo = null;
  }

  #startLevel() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg1);

    //Flower
    this.#createFlower();
    //Candle
    this.#candleX = width * 0.85;
    this.#candleBottomY = height * 0.7;
    this.#candleTopY = height * 0.35;
    // Candle is scaled to exactly span the start/end touch zones, so the
    // art always lines up with the interactive area no matter what
    // resolution the source PNG actually is.
    const candleDisplayHeight = this.#candleBottomY - this.#candleTopY;

    const candleImage = this.add.image(this.#candleX, this.#candleBottomY, ASSET_KEYS.CANDLE).setOrigin(0.5, 1);
    this.#scaleImageToHeight(candleImage, candleDisplayHeight);

    this.#candleFlame = this.add.image(this.#candleX, this.#candleTopY, ASSET_KEYS.CANDLE_FLAME).setOrigin(0.5, 1);
    this.#scaleImageToHeight(this.#candleFlame, candleDisplayHeight * this.#candleFlameHeightRatio);

    // Arrow + target circles + breath prompt are created later, when the
    // Start button is pressed (#showGameplayUI, called from #beginGameplay) — not here.
    this.#createSwipeGestureBar();

    //Progressbar
    this.#createLevelProgressBar();
    this.#levelProgressBar.setProgress(8/8);
    //Game Stats
    const labelsTop = this.#levelProgressBar.getBounds().bottom + 60;
    const breathsTextLabel = this.add.text(50, labelsTop, 'Αναπνοές:', TEXT_STYLES.DEFAULT);
    this.#breathsTextGO = this.add.text(
      breathsTextLabel.x + breathsTextLabel.width,
      breathsTextLabel.y,
      `0 / ${this.#requiredBreaths}`,
      TEXT_STYLES.DEFAULT,
    );

    //timer text
     const timerTextLabel = this.add.text(50, labelsTop + 50, 'Χρόνος:', TEXT_STYLES.DEFAULT);
      this.#timerTextGO = this.add.text(
      timerTextLabel.x + timerTextLabel.width,
      labelsTop + 50,
      `${this.#remainingSeconds}`,
      TEXT_STYLES.DEFAULT,
    );

    // Timer/input wait for the tutorial to finish. The character is already
    // alive (spawned in create()) — the sequence just moves it.
    this.#character.playSequence(STAGE1_TUTORIAL_STEPS, () => this.#beginGameplay());
  }

  /** Runs once the tutorial finishes — this is what used to be the tail of #startLevel(). */
  #beginGameplay() {
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);

    this.#countdownTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.#tickCountdown,
      callbackScope: this,
      loop: true,
    });

    this.#showGameplayUI();
  }

  /** Arrow + target circles — created only once the player presses Start, not before. */
  #showGameplayUI() {
    const { height } = this.scale;

    if (this.#debug) {
      this.#targetCirclesGO = this.add.graphics();
      this.#targetCirclesGO.lineStyle(2, 0x00ff00, 0.8);
      this.#targetCirclesGO.strokeCircle(this.#candleX, this.#candleBottomY, this.#swipeZoneRadius);
      this.#targetCirclesGO.strokeCircle(this.#candleX, this.#candleTopY, this.#swipeZoneRadius);
    }

    this.#swipeIndicatorGO = this.add.image(this.#candleX, this.#candleBottomY, ASSET_KEYS.ARROW_UP).setOrigin(0.5, 0.5);
    this.#swipeArrowBaseScale = this.#scaleImageToHeight(this.#swipeIndicatorGO, height * this.#swipeArrowHeightRatio);
    this.#createBreathPromptText();
    this.#startIndicatorPulse();
  }

  /** Hides the arrow + target circles once the final breath-out completes, so they don't show during the outro. */
  #hideGameplayUI() {
    this.#stopIndicatorPulse();
    this.#swipeIndicatorGO?.destroy();
    this.#swipeIndicatorGO = null;
    this.#targetCirclesGO?.destroy();
    this.#targetCirclesGO = null;
  }

  update(time, delta) {
    // No continuous per-frame movement in this game — the swipe/hold state
    // machine is entirely event-driven from pointerdown/move/up below, and
    // the hold duration is a Timer Event. Left here so the Scene lifecycle
    // stays complete and consistent with the rest of the project.
  }

  //#endregion

  //#region Candle & Flame

  #blowOutCandle() {

    this.tweens.add({
      targets: this.#candleFlame,
      alpha: 0,
      duration: 200,
    });
  }

  #relightCandle() {
    this.tweens.add({
      targets: this.#candleFlame,
      alpha: 1,
      duration: 200,
    });
    // Next prompt/arrow comes from the good-move feedback's own completion
    // callback (#handleBreathSuccess), not from here — this timer is purely
    // for the flame visual and isn't tied to how long the feedback plays.
  }

  //#endregion

  //#region Flower

  /**
   * 3-stage flower (FLOWER1/FLOWER2/FLOWER3) that advances as full
   * IN+OUT breathing cycles complete — see #updateFlowerStage.
   */
  #createFlower() {
    const { width, height } = this.scale;

    const flowerX = width * 0.15;
    const flowerY = height * 0.6;
  
    this.#flowerGO = this.add.image(flowerX, flowerY, ASSET_KEYS.FLOWER1).setOrigin(0.5, 1).setScale(0.55);
  }

  #updateFlowerStage() {
    let textureKey = ASSET_KEYS.FLOWER1;
    if (this.#cyclesCompleted >= this.#flowerStage3Threshold) {
      textureKey = ASSET_KEYS.FLOWER3;
    } else if (this.#cyclesCompleted >= this.#flowerStage2Threshold) {
      textureKey = ASSET_KEYS.FLOWER2;
    }
    this.#flowerGO.setTexture(textureKey);
  }

  //#endregion

  //#region Breath Prompt

  /**
   * Light-brown wobbling text at the bottom of the screen — replaces the
   * old INHALE/EXHALE image swap. Text content is updated from
   * #startIndicatorPulse (INHALE/EXHALE) and #startHold (HOLD); the wobble
   * itself never stops.
   */
  #createBreathPromptText() {
    const { width, height } = this.scale;
    this.#breathPromptGO = this.add
      .text(width / 2, height - 150, BREATH_TEXT.INHALE, TEXT_STYLES.BREATH_PROMPT)
      .setOrigin(0.5);
    this.#startBreathPromptWobble();
  }

  #startBreathPromptWobble() {
    if (!this.#breathPromptGO) {
      return;
    }
    this.#breathPromptWobbleTween = this.tweens.add({
      targets: this.#breathPromptGO,
      angle: { from: -4, to: 4 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /** @param {string} text */
  #setBreathPromptText(text) {
    if (!this.#breathPromptGO) {
      return;
    }
    this.#breathPromptGO.setText(text);
  }

  //#endregion

  //#region Gesture Input

  #handlePointerDown(pointer) {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    if (this.#inputLocked) {
      return;
    }
    if (this.#swipeState !== SWIPE_STATE.WAITING) {
      return;
    }
    if (!this.#isWithinStartZone(pointer)) {
      return;
    }

    this.#swipeState = SWIPE_STATE.SWIPING;
    this.#lastSwipePointerY = pointer.y;
    this.#stopIndicatorPulse();
    this.#swipeGestureBarGraphics.setVisible(true);
    this.#updateSwipeGestureBar(0, false);
    if (this.#currentBreathDirection === BREATH_DIRECTION.IN) {
      this.#character.setAnimationParam(STAGE1_BREATHE_IN_PARAM);
      playBreathInSound(this);
    } else {
      this.#character.setAnimationParam(STAGE1_BREATHE_OUT_PARAM);
      playBreathOutSound(this);
    }
  }

  #handlePointerMove(pointer) {
    if (this.#swipeState === SWIPE_STATE.WAITING || !pointer.isDown) {
      return;
    }

    if (!this.#isWithinHorizontalTolerance(pointer)) {
      this.#handleBreathFailed('drifted too far from the candle horizontally');
      return;
    }

    if (this.#swipeState === SWIPE_STATE.SWIPING) {
      this.#updateSwipeGestureBar(this.#swipeProgressRatio(pointer), false);

      if (this.#currentBreathDirection === BREATH_DIRECTION.IN) {
        // forward = pointer.y decreasing (moving up toward the candle top)
        if (pointer.y > this.#lastSwipePointerY + this.#swipeBackslideTolerance) {
          this.#handleBreathFailed('slipped back down too much');
          return;
        }
        this.#lastSwipePointerY = Math.min(this.#lastSwipePointerY, pointer.y);
      } else {
        // forward = pointer.y increasing (moving down toward the candle bottom)
        if (pointer.y < this.#lastSwipePointerY - this.#swipeBackslideTolerance) {
          this.#handleBreathFailed('slipped back up too much');
          return;
        }
        this.#lastSwipePointerY = Math.max(this.#lastSwipePointerY, pointer.y);
      }

      if (this.#isWithinEndZone(pointer)) {
        // OUT counts the instant it reaches the target — no hold. IN still holds.
        if (this.#currentBreathDirection === BREATH_DIRECTION.OUT) {
          this.#handleBreathSuccess();
        } else {
          this.#startHold();
        }
      }
      return;
    }

    if (this.#swipeState === SWIPE_STATE.HOLDING) {
      this.#updateSwipeGestureBar(this.#swipeProgressRatio(pointer), true);
      if (!this.#isWithinEndZone(pointer)) {
        this.#handleBreathFailed('moved out of the hold zone while holding');
      }
    }
  }

  #handlePointerUp(pointer) {
    if (this.#swipeState === SWIPE_STATE.WAITING) {
      return;
    }
    // Any release while still SWIPING or HOLDING means the hold timer
    // never completed, so this breath doesn't count.
    this.#handleBreathFailed('released before completing the hold');
  }

  //#endregion

  //#region Gameplay

  /**
   * Which physical Y (candle bottom or top) is the START zone for the
   * CURRENT breath direction — bottom for IN, top for OUT.
   */
  #getStartZoneY() {
    return this.#currentBreathDirection === BREATH_DIRECTION.IN ? this.#candleBottomY : this.#candleTopY;
  }

  /** The opposite physical Y from #getStartZoneY — where you hold to complete the breath. */
  #getEndZoneY() {
    return this.#currentBreathDirection === BREATH_DIRECTION.IN ? this.#candleTopY : this.#candleBottomY;
  }

  /** How far through the CURRENT breath's path this pointer currently is, live — not the tolerance-adjusted value used for pass/fail. */
  #swipeProgressRatio(pointer) {
    const totalDistance = this.#candleBottomY - this.#candleTopY;
    const travelled =
      this.#currentBreathDirection === BREATH_DIRECTION.IN
        ? this.#candleBottomY - pointer.y // IN: 0 at bottom, 1 at top
        : pointer.y - this.#candleTopY; // OUT: 0 at top, 1 at bottom
    return Phaser.Math.Clamp(travelled / totalDistance, 0, 1);
  }

  #isWithinStartZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#getStartZoneY()) <= this.#swipeZoneRadius;
  }

  #isWithinEndZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#getEndZoneY()) <= this.#swipeZoneRadius;
  }

  #isWithinHorizontalTolerance(pointer) {
    return Math.abs(pointer.x - this.#candleX) <= this.#maxSwipeHorizontalDrift;
  }

  #startHold() {
    this.#swipeState = SWIPE_STATE.HOLDING;
    this.#setBreathPromptText(BREATH_TEXT.HOLD);
    this.#character.setAnimationParam(STAGE1_HOLD_PARAM);
    this.#holdTimerEvent = this.time.delayedCall(this.#swipeHoldDurationMs, this.#handleBreathSuccess, [], this);
  }

  #stopHoldTimer() {
    if (this.#holdTimerEvent) {
      this.#holdTimerEvent.remove();
      this.#holdTimerEvent = null;
    }
  }

  #handleBreathFailed(reason) {
    if (this.#swipeState === SWIPE_STATE.WAITING) {
      return;
    }
    if (this.#debug) {
      console.log(`Breath failed (${this.#currentBreathDirection}): ${reason}`);
    }
    // capture before resetting below — was the failure during the hold, or during the swipe itself?
    const wasHolding = this.#swipeState === SWIPE_STATE.HOLDING;
    this.#stopHoldTimer();
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#failedBreaths += 1;
    this.#hideSwipeGestureBar();

    playWrongSound(this);
    // direction does NOT change on failure — same breath is retried. Input
    // stays locked until this feedback finishes, so a fast retry can't cancel it early.
    this.#inputLocked = true;
    this.#character.playFeedback(wasHolding ? STAGE1_BAD_MOVE_HOLD_STEP : STAGE1_BAD_MOVE_DIRECTION_STEP, () => {
      this.#inputLocked = false;
      this.#startIndicatorPulse();
    });

    if (this.#failedBreaths >= this.#maxFailedBreaths) {
      //this.#handleGameOver();
    }
  }

  #handleBreathSuccess() {
    this.#holdTimerEvent = null;
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#hideSwipeGestureBar();
    this.#breathsCompleted += 1;
    this.#breathsTextGO.setText(`${this.#breathsCompleted} / ${this.#requiredBreaths}`);

    playCorrectSound(this);

    const wasBreathOut = this.#currentBreathDirection === BREATH_DIRECTION.OUT;

    if (wasBreathOut) {
      this.#cyclesCompleted += 1;
      this.#updateFlowerStage();

      // Lock input until the feedback clip actually finishes, so a fast next
      // swipe can't cancel it early — the arrow/prompt only comes back once
      // this callback fires, not immediately like before.
      this.#inputLocked = true;
      const onGoodMoveFeedbackDone = () => {
        this.#inputLocked = false;
        this.#startIndicatorPulse();
      };
      // praise only after a breath OUT — mid breath-IN he's holding his breath, he can't be talking
      if (this.#breathsCompleted === 4) {
        this.#character.playFeedback(STAGE1_MILESTONE_STEP, onGoodMoveFeedbackDone);
      } else {
        this.#character.playFeedback(Phaser.Utils.Array.GetRandom(STAGE1_GOOD_MOVE_STEPS), onGoodMoveFeedbackDone);
      }
    }

    if (this.#debug) {
      console.log(`Breath succeeded (${this.#currentBreathDirection}) — cycles completed: ${this.#cyclesCompleted}`);
    }

    // flip direction for the NEXT breath before re-showing the prompt, so
    // the arrow/zones/bar all reflect where the player needs to go next
    this.#currentBreathDirection = wasBreathOut ? BREATH_DIRECTION.IN : BREATH_DIRECTION.OUT;

    if (wasBreathOut) {
      // only a breath-OUT blows out the candle
      this.#blowOutCandle();
      // Skip the relight entirely on the breath that completes the level —
      // stays off through the outro instead of flickering back on right before it.
      if (this.#breathsCompleted < this.#requiredBreaths) {
        this.time.delayedCall(this.#candleRelightDelayMs, this.#relightCandle, [], this);
      }
      // no explicit reset to idle here — the good-move feedback just above
      // already takes the animation over, and returns to idle itself once
      // its own duration ends. The next prompt/arrow is shown by
      // onGoodMoveFeedbackDone above, not by #relightCandle.
    } else {
      // breath-IN doesn't touch the flame — just get the next prompt ready
      this.#startIndicatorPulse();
    }

    //this.#levelProgressBar.setProgress(this.#breathsCompleted / this.#requiredBreaths);

    if (this.#breathsCompleted >= this.#requiredBreaths) {
      this.#hideGameplayUI();
      this.#handleLevelComplete();
      return;
    }
  }

  #startIndicatorPulse() {
    // no-op once #hideGameplayUI has run (e.g. a delayed #relightCandle call
    // firing after the level's already complete)
    if (!this.#swipeIndicatorGO) {
      return;
    }
    const arrowY = this.#getStartZoneY();
    // ARROW_UP art reused rotated 180° for OUT instead of a second asset
    const arrowAngle = this.#currentBreathDirection === BREATH_DIRECTION.IN ? 0 : 180;
    this.#setBreathPromptText(this.#currentBreathDirection === BREATH_DIRECTION.IN ? BREATH_TEXT.INHALE : BREATH_TEXT.EXHALE);

    this.#swipeIndicatorGO
      .setPosition(this.#candleX, arrowY)
      .setAngle(arrowAngle)
      .setVisible(true)
      .setAlpha(0.4)
      .setScale(this.#swipeArrowBaseScale * 0.9);
    this.#swipeIndicatorTween = this.tweens.add({
      targets: this.#swipeIndicatorGO,
      alpha: { from: 0.4, to: 1 },
      scale: { from: this.#swipeArrowBaseScale * 0.9, to: this.#swipeArrowBaseScale * 1.05 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  #stopIndicatorPulse() {
    if (this.#swipeIndicatorTween) {
      this.#swipeIndicatorTween.stop();
      this.#swipeIndicatorTween = null;
    }
    this.#swipeIndicatorGO?.setVisible(false);
  }

  /** Vertical bar next to the candle that fills as the player swipes/holds through one breath gesture. */
  #createSwipeGestureBar() {
    this.#swipeGestureBarWidth = 30;
    this.#swipeGestureBarX = this.#candleX - 80 - this.#swipeGestureBarWidth / 2;
    this.#swipeGestureBarGraphics = this.add.graphics();
    this.#updateSwipeGestureBar(0, false);
    this.#swipeGestureBarGraphics.setVisible(false);
  }

  /**
   * @param {number} ratio 0 (start of this breath) to 1 (end of this breath)
   * @param {boolean} isHolding tints the fill to show you're in the hold zone
   */
  #updateSwipeGestureBar(ratio, isHolding) {
    const clampedRatio = Phaser.Math.Clamp(ratio, 0, 1);
    const barTop = this.#candleTopY;
    const barHeight = this.#candleBottomY - this.#candleTopY;
    const fillHeight = barHeight * clampedRatio;

    this.#swipeGestureBarGraphics.clear();
    this.#swipeGestureBarGraphics.fillStyle(0x222222, 0.6);
    this.#swipeGestureBarGraphics.fillRect(this.#swipeGestureBarX, barTop, this.#swipeGestureBarWidth, barHeight);
    this.#swipeGestureBarGraphics.fillStyle(isHolding ? 0x4caf50 : 0x2196f3, 0.95);

    // IN grows upward from the bar's bottom (matches hand moving up).
    // OUT grows downward from the bar's top (matches hand moving down) —
    // fixed top edge, fillHeight just extends further down as ratio grows.
    const fillY = this.#currentBreathDirection === BREATH_DIRECTION.IN ? barTop + barHeight - fillHeight : barTop;
    this.#swipeGestureBarGraphics.fillRect(this.#swipeGestureBarX, fillY, this.#swipeGestureBarWidth, fillHeight);
  }

  #hideSwipeGestureBar() {
    this.#swipeGestureBarGraphics.setVisible(false);
    this.#updateSwipeGestureBar(0, false);
  }

  //#endregion

  //#region Timer

  #tickCountdown() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#remainingSeconds -= 1;
    this.#timerTextGO.setText(`${this.#remainingSeconds}`);

    if (this.#remainingSeconds <= 0) {
      this.#handleGameOver();
    }
  }

  //#endregion

  //#region Progress Bar

  /**
   * Shared top-center level-progress bar (src/common/progress-bar.js), built
   * from ASSET_KEYS.PROGRESSBAR_BG (track) + ASSET_KEYS.PROGRESSBAR_FG (fill).
   */
  #createLevelProgressBar() {
      const { width } = this.scale;
    this.#levelProgressBar = new ProgressBar(this, {
      x: width / 2 + 50,
      y: 130,
      width: width * 0.50,
    });
  }

  //#endregion

  //#region Level Management

  #handleLevelComplete() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isLevelComplete = true;

    this.events.emit('levelComplete', {
      breathsCompleted: this.#breathsCompleted,
    });

    this.#levelProgressBar.setProgress(5.6/8);
    this.#endLevel('Μπράβο! Ανάπνευσες τέλεια! 🎉', true);
  }

  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;

    this.events.emit('gameOver', {
      breathsCompleted: this.#breathsCompleted,
      failedBreaths: this.#failedBreaths,
    });

    this.#endLevel('Ας ξαναδοκιμάσουμε\nΠάρε μια βαθιά ανάσα και ξανά', false);
  }

  /**
   * Shared success/game-over sequence.
   * @param {string} message
   * @param {boolean} isSuccess
   */
  #endLevel(message, isSuccess) {
    this.#stopHoldTimer();
    this.#stopIndicatorPulse();
    this.#disableLevelVisuals();

    // message/isSuccess aren't used yet — STAGE1_OUTRO_STEPS is one fixed
    // sequence for now; a win/lose distinction can branch this later.
    this.#character.moveTo(STAGE1_POSITION_OUTRO);
    this.#character.playSequence(STAGE1_OUTRO_STEPS, () => this.#goToNextLevel());
  }

  /** Clears level-1 visuals before the outro shows. Flower/candle/Stage 1 character left alone (character survives through the outro). Safe to call more than once. */
  #disableLevelVisuals() {
    if (this.#breathPromptGO) {
      if (this.#breathPromptWobbleTween) {
        this.#breathPromptWobbleTween.stop();
        this.#breathPromptWobbleTween = null;
      }
      this.#breathPromptGO.destroy();
      this.#breathPromptGO = null;
    }
  }

  #goToNextLevel() {
    this.#character.destroy();
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE2);
  }

  #handleShutdown() {
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#stopHoldTimer();
    this.#stopIndicatorPulse();
    this.#disableLevelVisuals();
    this.#hideIntroBackground();
    // covers leaving early, before #goToNextLevel runs
    this.#character?.destroy();
  }

  //#endregion

  //#region Utils

  /**
   * Uniformly scales an image so its displayed height matches targetHeight,
   * regardless of the texture's actual native pixel dimensions. Returns the
   * scale factor used, since callers like the arrow indicator need to
   * animate relative to it rather than to an absolute scale value.
   * @param {Phaser.GameObjects.Image} image
   * @param {number} targetHeight
   * @returns {number}
   */
  #scaleImageToHeight(image, targetHeight) {
    const scale = targetHeight / image.height;
    image.setScale(scale);
    return scale;
  }

  //#endregion
}
