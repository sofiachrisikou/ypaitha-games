import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';

const textStyleConfig = {
  fontSize: '40px',
  color: '#043D8C',
  stroke: '#ffffff',
  strokeThickness: 6,
};

const SWIPE_STATE = {
  WAITING: 'WAITING',
  SWIPING: 'SWIPING',
  HOLDING: 'HOLDING',
};

export class GameScene extends Phaser.Scene {
  #candleX;
  #candleBottomY;
  #candleTopY;
  #candleFlame;
  #swipeIndicatorGO;
  #breathsTextGO;
  #indicatorTween;
  #arrowBaseScale;
  #swipeGestureBarGraphics;
  #swipeGestureBarX;
  #swipeGestureBarWidth;
  #levelProgressBar;
  #zoneRadius;
  #maxHorizontalDrift;
  #downwardSlack;
  #holdDurationMs;
  #relightDelayMs;
  #arrowHeightRatio;
  #flameHeightRatio;
  #requiredBreaths;
  #maxFailedBreaths;
  #breathsCompleted;
  #failedBreaths;
  #swipeState;
  #lastPointerY;
  #holdTimerEvent;
  #isLevelComplete;
  #isGameOver;
  #debug;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE1,
    });
  }

  /**
   * @public
   * Tied to the Phaser Scene lifecycle. Will run one time after the PRELOAD
   * logic is finished. Runs each time the Phaser Scene restarts.
   * @returns {void}
   */
  init() {
    this.#zoneRadius = 90;
    this.#maxHorizontalDrift = 110;
    this.#downwardSlack = 40;
    this.#holdDurationMs = 2000;
    this.#relightDelayMs = 600;
    // Sizes are ratios, not pixels, so this stays correct regardless of the
    // real dimensions of whatever PNGs get loaded into these texture keys.
    this.#arrowHeightRatio = 0.09; // fraction of screen height
    this.#flameHeightRatio = 0.35; // fraction of the candle's own display height
    this.#requiredBreaths = 5;
    // TODO: confirm — placeholder fail condition so #handleGameOver has a
    // real trigger. Level 1 spec doesn't define a game-over rule yet.
    this.#maxFailedBreaths = 5;
    this.#breathsCompleted = 0;
    this.#failedBreaths = 0;
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#lastPointerY = 0;
    this.#holdTimerEvent = null;
    this.#indicatorTween = null;
    this.#isLevelComplete = false;
    this.#isGameOver = false;
    // on while you're tuning the gesture feel — draws the start/end zones
    // and logs why each failed attempt failed. Flip to false for the build.
    this.#debug = true;
  }

  preload() {
    console.log('preload called');
  }

  create() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg1);

    // TODO: position to match your actual character/candle art layout
    this.#candleX = width * 0.65;
    this.#candleBottomY = height * 0.7;
    this.#candleTopY = height * 0.35;

    // this.add.image(width * 0.35, height * 0.55, ASSET_KEYS.CHARACTER);

    // Candle is scaled to exactly span the start/end touch zones, so the
    // art always lines up with the interactive area no matter what
    // resolution the source PNG actually is.
    const candleDisplayHeight = this.#candleBottomY - this.#candleTopY;

    // TODO: swap ASSET_KEYS.CANDLE_BODY for your real texture key
    const candleImage = this.add.image(this.#candleX, this.#candleBottomY, ASSET_KEYS.CANDLE).setOrigin(0.5, 1);
    this.#scaleImageToHeight(candleImage, candleDisplayHeight);

    // TODO: swap ASSET_KEYS.CANDLE_FLAME for your real texture key
    this.#candleFlame = this.add.image(this.#candleX, this.#candleTopY, ASSET_KEYS.CANDLE_FLAME).setOrigin(0.5, 1);
    this.#scaleImageToHeight(this.#candleFlame, candleDisplayHeight * this.#flameHeightRatio);

    // TODO: swap ASSET_KEYS.SWIPE_ARROW for your real texture key
    this.#swipeIndicatorGO = this.add
      .image(this.#candleX, this.#candleBottomY, ASSET_KEYS.ARROW_UP)
      .setOrigin(0.5, 0.5);
    this.#arrowBaseScale = this.#scaleImageToHeight(this.#swipeIndicatorGO, height * this.#arrowHeightRatio);

    this.#createSwipeGestureBar();
    this.#createLevelProgressBar();

    const breathsTextLabel = this.add.text(10, 10, 'Αναπνοές:', TEXT_STYLES.DEFAULT);
    this.#breathsTextGO = this.add.text(
      breathsTextLabel.x + breathsTextLabel.width,
      breathsTextLabel.y,
      `0 / ${this.#requiredBreaths}`,
      textStyleConfig,
    );

    if (this.#debug) {
      const debugGraphics = this.add.graphics();
      debugGraphics.lineStyle(2, 0x00ff00, 0.8);
      debugGraphics.strokeCircle(this.#candleX, this.#candleBottomY, this.#zoneRadius);
      debugGraphics.strokeCircle(this.#candleX, this.#candleTopY, this.#zoneRadius);
    }

    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);

    this.#startIndicatorPulse();
  }

  update(time, delta) {
    // No continuous per-frame movement in this game — the swipe/hold state
    // machine is entirely event-driven from pointerdown/move/up below, and
    // the hold duration is a Timer Event. Left here so the Scene lifecycle
    // stays complete and consistent with the rest of the project.
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
   * @param {number} ratio 0 (bottom/start) to 1 (top/end)
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
    this.#swipeGestureBarGraphics.fillRect(
      this.#swipeGestureBarX,
      barTop + barHeight - fillHeight,
      this.#swipeGestureBarWidth,
      fillHeight,
    );
  }

  /**
   * Shared top-center level-progress bar (src/common/progress-bar.js), built
   * from ASSET_KEYS.PROGRESSBAR_BG (track) + ASSET_KEYS.PROGRESSBAR_FG (fill).
   * Displayed only for now — #levelProgressBar.setProgress() is not called
   * yet since level 1's completion/progress logic isn't defined.
   */
  #createLevelProgressBar() {
    const { width } = this.scale;
    this.#levelProgressBar = new ProgressBar(this, {
      x: width / 2,
      y: 70,
      width: width * 0.86,
    });
  }

  /** How far up the candle's path this pointer currently is, live — not the tolerance-adjusted value used for pass/fail. */
  #swipeProgressRatio(pointer) {
    const totalDistance = this.#candleBottomY - this.#candleTopY;
    const travelled = this.#candleBottomY - pointer.y;
    return Phaser.Math.Clamp(travelled / totalDistance, 0, 1);
  }

  #hideSwipeGestureBar() {
    this.#swipeGestureBarGraphics.setVisible(false);
    this.#updateSwipeGestureBar(0, false);
  }

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

  #isWithinStartZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#candleBottomY) <= this.#zoneRadius;
  }

  #isWithinEndZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#candleTopY) <= this.#zoneRadius;
  }

  #isWithinHorizontalTolerance(pointer) {
    return Math.abs(pointer.x - this.#candleX) <= this.#maxHorizontalDrift;
  }

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
    this.#lastPointerY = pointer.y;
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

      // pointer.y going up means smaller values — allow a little jitter,
      // but drifting back down past that slack means the swipe broke
      if (pointer.y > this.#lastPointerY + this.#downwardSlack) {
        this.#handleBreathFailed('slipped back down too much');
        return;
      }
      this.#lastPointerY = Math.min(this.#lastPointerY, pointer.y);

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

  #startHold() {
    this.#swipeState = SWIPE_STATE.HOLDING;
    this.#holdTimerEvent = this.time.delayedCall(this.#holdDurationMs, this.#handleBreathSuccess, [], this);
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
      console.log(`Breath failed: ${reason}`);
    }
    this.#stopHoldTimer();
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#failedBreaths += 1;
    this.#hideSwipeGestureBar();

    // TODO: swap for your real SFX key once it's in ASSET_KEYS
    // this.sound.play(ASSET_KEYS.SOUND_BREATH_BAD);

    this.#startIndicatorPulse();

    if (this.#failedBreaths >= this.#maxFailedBreaths) {
      this.#handleGameOver();
    }
  }

  #handleBreathSuccess() {
    this.#holdTimerEvent = null;
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#hideSwipeGestureBar();
    this.#breathsCompleted += 1;
    this.#breathsTextGO.setText(`${this.#breathsCompleted} / ${this.#requiredBreaths}`);

    // TODO: swap for your real SFX key once it's in ASSET_KEYS
    // this.sound.play(ASSET_KEYS.SOUND_BREATH_GOOD);

    this.#blowOutCandle();

    this.time.delayedCall(this.#relightDelayMs, this.#relightCandle, [], this);

    let sound = this.sound.add(ASSET_KEYS.CORRECTSOUND);
    sound.play();

    this.#levelProgressBar.setProgress(this.#breathsCompleted / this.#requiredBreaths);

    if (this.#breathsCompleted >= this.#requiredBreaths) {
      this.#handleLevelComplete();
      return;
    }
  }

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

  #startIndicatorPulse() {
    this.#swipeIndicatorGO
      .setVisible(true)
      .setAlpha(0.4)
      .setScale(this.#arrowBaseScale * 0.9);
    this.#indicatorTween = this.tweens.add({
      targets: this.#swipeIndicatorGO,
      alpha: { from: 0.4, to: 1 },
      scale: { from: this.#arrowBaseScale * 0.9, to: this.#arrowBaseScale * 1.05 },
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  #stopIndicatorPulse() {
    if (this.#indicatorTween) {
      this.#indicatorTween.stop();
      this.#indicatorTween = null;
    }
    this.#swipeIndicatorGO.setVisible(false);
  }

  #handleLevelComplete() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isLevelComplete = true;
    this.#stopHoldTimer();
    this.#stopIndicatorPulse();

    this.events.emit('levelComplete', {
      breathsCompleted: this.#breathsCompleted,
    });

    this.#showEndMessage('Μπράβο! Ανάπνευσες τέλεια! 🎉', '');
  }

  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;
    this.#stopHoldTimer();
    this.#stopIndicatorPulse();

    this.events.emit('gameOver', {
      breathsCompleted: this.#breathsCompleted,
      failedBreaths: this.#failedBreaths,
    });

    this.#showEndMessage('Ας ξαναδοκιμάσουμε', 'Πάρε μια βαθιά ανάσα και ξανά');
  }

  #showEndMessage(title, subtitle) {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);
    this.add.text(width / 2, height / 2 - 60, title, textStyleConfig).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, subtitle, textStyleConfig).setOrigin(0.5);

    const helloButton = this.add.text(width / 2, height / 2 + 140, 'Επόμενο Επίπεδο', textStyleConfig).setOrigin(0.5);
    helloButton.setInteractive();
    helloButton.on('pointerdown', () => this.#goToNextLevel());
  }

  #goToNextLevel() {
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE2);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }

  #handleShutdown() {
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#stopHoldTimer();
    this.#stopIndicatorPulse();
  }
}
