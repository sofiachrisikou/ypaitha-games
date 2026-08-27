import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, setStateMachineInput } from '../common/rive-stage.js';
import { showLevelIntro, showCelebrationSequence } from '../common/level-flow.js';
import { playCorrectSound, playWrongSound } from '../common/audio-manager.js';

// const textStyleConfig = {
//   fontSize: '40px',
//   color: '#043D8C',
//   stroke: '#ffffff',
//   strokeThickness: 6,
// };

const BEAR_STATE_MACHINE = 'StateMachine_Bear_Breathing';

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

  //CHARACTER
  #riveInstance;

  //INHALE EXHALE
  #breathImageGO;
  #breathImageBaseScale;
  #breathImageStartY;
  #breathImageEndY;
  #breathImageWobbleTween;
  #breathImageTransitionTween;

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
    // "after 1 second the flame comes back"
    this.#candleRelightDelayMs = 1000;
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
    showLevelIntro(this, ASSET_KEYS.STAGE1_LOGO,'Σβήσε το κερί', () => this.#startLevel());
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

    if (this.#debug) {
      const debugGraphics = this.add.graphics();
      debugGraphics.lineStyle(2, 0x00ff00, 0.8);
      debugGraphics.strokeCircle(this.#candleX, this.#candleBottomY, this.#swipeZoneRadius);
      debugGraphics.strokeCircle(this.#candleX, this.#candleTopY, this.#swipeZoneRadius);
    }

    //Swipe
    // #startIndicatorPulse.
    this.#swipeIndicatorGO = this.add
    .image(this.#candleX, this.#candleBottomY, ASSET_KEYS.ARROW_UP)
    .setOrigin(0.5, 0.5);
    this.#swipeArrowBaseScale = this.#scaleImageToHeight(this.#swipeIndicatorGO, height * this.#swipeArrowHeightRatio);

    this.#createSwipeGestureBar();
    this.#startIndicatorPulse();


    //Progressbar
    this.#createLevelProgressBar();
    this.#levelProgressBar.setProgress(8/8);
    //Inhale/Exhale image
    this.#createBreathImage();
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

    //Events
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);

    //timer start
       this.#countdownTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.#tickCountdown,
      callbackScope: this,
      loop: true,
    });

    //rive
    this.#createCharacterAnimation();
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
    // TODO: this is a placeholder — swap for whatever your real
    // flame animation/particle looks like once that's designed
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
    this.#startIndicatorPulse();
  }

  //#endregion

  //#region Flower

  /**
   * 3-stage flower (FLOWER1/FLOWER2/FLOWER3) that advances as full
   * IN+OUT breathing cycles complete — see #updateFlowerStage.
   */
  #createFlower() {
    const { width, height } = this.scale;
    // TODO: placeholder position — move wherever it actually belongs
    const flowerX = width * 0.15;
    const flowerY = height * 0.6;
    // TODO: swap ASSET_KEYS.FLOWER1 for your real texture key
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

  //#region Character

  #createCharacterAnimation()
  {
    this.#riveInstance = spawnRiveAnimation(
    this.cache.binary.get(ASSET_KEYS.RIVE_BEAR_BREATHING),
    BEAR_STATE_MACHINE,
    'rive-stage--level1',
  );
  }

  #setBreathing(isBreathing,isIdle)
  {
    setStateMachineInput(this.#riveInstance, BEAR_STATE_MACHINE, 'IsIdle', isIdle);
    setStateMachineInput(this.#riveInstance, BEAR_STATE_MACHINE, 'IsBreathing', isBreathing);
  }

  //#endregion

  //#region Inhale Exhale

  /**
   * INHALE/EXHALE swap image shown above the character/Rive animation and
   * below the progress bar. Idles wobbling at full size/position; each
   * successful breath (#handleBreathSuccess) plays #playBreathImageSwap to
   * shrink+fade it down, swap texture, then grow+fade it back up to rest.
   */
  #createBreathImage() {
    const { width } = this.scale;
    const progressBarBottom = this.#levelProgressBar.getBounds().bottom;

    const x = width / 2;
    this.#breathImageStartY = progressBarBottom + 200;
    this.#breathImageEndY = this.#breathImageStartY + 200;

    this.#breathImageBaseScale = 0.55;
    this.#breathImageGO = this.add
      .image(x, this.#breathImageStartY, ASSET_KEYS.INHALE)
      .setOrigin(0.5, 0.5)
      .setScale(this.#breathImageBaseScale);

    this.#startBreathImageWobble();
  }

  #startBreathImageWobble() {
    this.#breathImageWobbleTween = this.tweens.add({
      targets: this.#breathImageGO,
      angle: { from: -4, to: 4 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  #stopBreathImageWobble() {
    if (this.#breathImageWobbleTween) {
      this.#breathImageWobbleTween.stop();
      this.#breathImageWobbleTween = null;
    }
    this.#breathImageGO.setAngle(0);
  }

  /** Shrinks+fades the current breath image down, swaps INHALE<->EXHALE mid-flight, then grows+fades it back up to rest and resumes wobbling. */
  #playBreathImageSwap() {
    this.#stopBreathImageWobble();

    const shrinkScale = this.#breathImageBaseScale * 0.6;

    this.#breathImageTransitionTween = this.tweens.add({
      targets: this.#breathImageGO,
      y: this.#breathImageEndY,
      scale: shrinkScale,
      alpha: 0,
      duration: 450,
      ease: 'Sine.easeIn',
      onComplete: () => {
        const nextKey =
          this.#breathImageGO.texture.key === ASSET_KEYS.INHALE ? ASSET_KEYS.EXHALE : ASSET_KEYS.INHALE;
        this.#breathImageGO.setTexture(nextKey);

        this.#breathImageTransitionTween = this.tweens.add({
          targets: this.#breathImageGO,
          y: this.#breathImageStartY,
          scale: this.#breathImageBaseScale,
          alpha: 1,
          duration: 450,
          ease: 'Sine.easeOut',
          onComplete: () => {
            this.#breathImageTransitionTween = null;
            this.#startBreathImageWobble();
          },
        });
      },
    });
  }

  //#endregion

  //#region Gesture Input

  #handlePointerDown(pointer) {
    if (this.#isLevelComplete || this.#isGameOver) {
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
        this.#startHold();
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
    this.#stopHoldTimer();
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#failedBreaths += 1;
    this.#hideSwipeGestureBar();

    playWrongSound(this);

    // direction does NOT change on failure — same breath is retried
    this.#startIndicatorPulse();

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
    this.#playBreathImageSwap();

    const wasBreathOut = this.#currentBreathDirection === BREATH_DIRECTION.OUT;

    if (wasBreathOut) {
      this.#cyclesCompleted += 1;
      this.#updateFlowerStage();

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
      this.time.delayedCall(this.#candleRelightDelayMs, this.#relightCandle, [], this);
      this.#setBreathing(false,false);
      this.time.delayedCall(2000, ()=>{
        if(this.#riveInstance!=null)
          {
            this.#setBreathing(false,true);
          }
      });
    } else {
      // breath-IN doesn't touch the flame — just get the next prompt ready
      this.#startIndicatorPulse();
      this.#setBreathing(true,false);
    }

    //this.#levelProgressBar.setProgress(this.#breathsCompleted / this.#requiredBreaths);

    if (this.#breathsCompleted >= this.#requiredBreaths) {
      this.#handleLevelComplete();
      return;
    }
  }

  #startIndicatorPulse() {
    const arrowY = this.#getStartZoneY();
    // ARROW_UP art reused rotated 180° for OUT instead of a second asset
    const arrowAngle = this.#currentBreathDirection === BREATH_DIRECTION.IN ? 0 : 180;

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
    this.#swipeIndicatorGO.setVisible(false);
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

    showCelebrationSequence(this, {
      message,
      levelNumber: 1,
      isSuccess,
      onComplete: () => this.#goToNextLevel(),
    });
  }

  /** Clears level-1 visuals before the celebration shows. Flower/candle left alone. Safe to call more than once. */
  #disableLevelVisuals() {
    if (this.#breathImageGO) {
      this.#stopBreathImageWobble();
      if (this.#breathImageTransitionTween) {
        this.#breathImageTransitionTween.stop();
        this.#breathImageTransitionTween = null;
      }
      this.#breathImageGO.destroy();
      this.#breathImageGO = null;
    }

    if (this.#riveInstance) {
      removeRiveAnimation(this.#riveInstance, 'rive-stage--level1');
      this.#riveInstance = null;
    }
  }

  #goToNextLevel() {
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
