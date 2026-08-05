import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, setStateMachineInput } from '../common/rive-stage.js';
 
// const textStyleConfig = {
//   fontSize: '40px',
//   color: '#043D8C',
//   stroke: '#ffffff',
//   strokeThickness: 6,
// };
 
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
  #currentDirection;
  #lastPointerY;
  #holdTimerEvent;
  #isLevelComplete;
  #isGameOver;
  #debug;
  #riveInstance;
  #flowerGO;
  #cyclesCompleted;
  #flowerStage2Threshold;
  #flowerStage3Threshold;
 
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
    // "after 1 second the flame comes back"
    this.#relightDelayMs = 1000;
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
    // First breath is always an inhale; flips after each success in
    // #handleBreathSuccess, never on failure (a failed attempt retries the
    // same direction, it doesn't advance to the next one).
    this.#currentDirection = BREATH_DIRECTION.IN;
    this.#lastPointerY = 0;
    this.#holdTimerEvent = null;
    this.#indicatorTween = null;
    this.#isLevelComplete = false;
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
    this.#flowerStage3Threshold = 2;
  }
 
  preload() {
    console.log('preload called');
  }
 
  create() {
    const { width, height } = this.scale;
 
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg1);
 
    // TODO: position to match your actual character/candle art layout
    this.#candleX = width * 0.85;
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
 
    // TODO: swap ASSET_KEYS.SWIPE_ARROW for your real texture key. Reused
    // rotated 180° for the OUT direction instead of a second asset — see
    // #startIndicatorPulse.
    this.#swipeIndicatorGO = this.add
      .image(this.#candleX, this.#candleBottomY, ASSET_KEYS.ARROW_UP)
      .setOrigin(0.5, 0.5);
    this.#arrowBaseScale = this.#scaleImageToHeight(this.#swipeIndicatorGO, height * this.#arrowHeightRatio);
 
    this.#createSwipeGestureBar();
    this.#createLevelProgressBar();
    this.#createFlower();
 
    const breathsTextLabel = this.add.text(10, 10, 'Αναπνοές:', TEXT_STYLES.DEFAULT);
    this.#breathsTextGO = this.add.text(
      breathsTextLabel.x + breathsTextLabel.width,
      breathsTextLabel.y,
      `0 / ${this.#requiredBreaths}`,
      TEXT_STYLES.DEFAULT,
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
 
    this.#createCharacterAnimation();
    this.#levelProgressBar.setProgress(3 / 3);
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
    const fillY = this.#currentDirection === BREATH_DIRECTION.IN ? barTop + barHeight - fillHeight : barTop;
    this.#swipeGestureBarGraphics.fillRect(this.#swipeGestureBarX, fillY, this.#swipeGestureBarWidth, fillHeight);
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
      x: width / 2 + 50,
      y: 130,
      width: width * 0.50,
    });
  }
 
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
 
  /**
   * Which physical Y (candle bottom or top) is the START zone for the
   * CURRENT breath direction — bottom for IN, top for OUT.
   */
  #getStartZoneY() {
    return this.#currentDirection === BREATH_DIRECTION.IN ? this.#candleBottomY : this.#candleTopY;
  }
 
  /** The opposite physical Y from #getStartZoneY — where you hold to complete the breath. */
  #getEndZoneY() {
    return this.#currentDirection === BREATH_DIRECTION.IN ? this.#candleTopY : this.#candleBottomY;
  }
 
  /** How far through the CURRENT breath's path this pointer currently is, live — not the tolerance-adjusted value used for pass/fail. */
  #swipeProgressRatio(pointer) {
    const totalDistance = this.#candleBottomY - this.#candleTopY;
    const travelled =
      this.#currentDirection === BREATH_DIRECTION.IN
        ? this.#candleBottomY - pointer.y // IN: 0 at bottom, 1 at top
        : pointer.y - this.#candleTopY; // OUT: 0 at top, 1 at bottom
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
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#getStartZoneY()) <= this.#zoneRadius;
  }
 
  #isWithinEndZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.#candleX, this.#getEndZoneY()) <= this.#zoneRadius;
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
 
      if (this.#currentDirection === BREATH_DIRECTION.IN) {
        // forward = pointer.y decreasing (moving up toward the candle top)
        if (pointer.y > this.#lastPointerY + this.#downwardSlack) {
          this.#handleBreathFailed('slipped back down too much');
          return;
        }
        this.#lastPointerY = Math.min(this.#lastPointerY, pointer.y);
      } else {
        // forward = pointer.y increasing (moving down toward the candle bottom)
        if (pointer.y < this.#lastPointerY - this.#downwardSlack) {
          this.#handleBreathFailed('slipped back up too much');
          return;
        }
        this.#lastPointerY = Math.max(this.#lastPointerY, pointer.y);
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
      console.log(`Breath failed (${this.#currentDirection}): ${reason}`);
    }
    this.#stopHoldTimer();
    this.#swipeState = SWIPE_STATE.WAITING;
    this.#failedBreaths += 1;
    this.#hideSwipeGestureBar();
 
    // TODO: swap for your real SFX key once it's in ASSET_KEYS
    // this.sound.play(ASSET_KEYS.SOUND_BREATH_BAD);
 
    // direction does NOT change on failure — same breath is retried
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
 
    let sound = this.sound.add(ASSET_KEYS.CORRECTSOUND);
    sound.play();
 
    const wasBreathOut = this.#currentDirection === BREATH_DIRECTION.OUT;
 
    if (wasBreathOut) {
      this.#cyclesCompleted += 1;
      this.#updateFlowerStage();
    }
 
    if (this.#debug) {
      console.log(`Breath succeeded (${this.#currentDirection}) — cycles completed: ${this.#cyclesCompleted}`);
    }
 
    // flip direction for the NEXT breath before re-showing the prompt, so
    // the arrow/zones/bar all reflect where the player needs to go next
    this.#currentDirection = wasBreathOut ? BREATH_DIRECTION.IN : BREATH_DIRECTION.OUT;
 
    if (wasBreathOut) {
      // only a breath-OUT blows out the candle
      this.#blowOutCandle();
      this.time.delayedCall(this.#relightDelayMs, this.#relightCandle, [], this);
      this.#setBreathing(false,false);
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
    const arrowY = this.#getStartZoneY();
    // ARROW_UP art reused rotated 180° for OUT instead of a second asset
    const arrowAngle = this.#currentDirection === BREATH_DIRECTION.IN ? 0 : 180;
 
    this.#swipeIndicatorGO
      .setPosition(this.#candleX, arrowY)
      .setAngle(arrowAngle)
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
    this.#levelProgressBar.setProgress(2 / 3);
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
    this.add.text(width / 2, height / 2 - 60, title, TEXT_STYLES.DEFAULT).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, subtitle, TEXT_STYLES.DEFAULT).setOrigin(0.5);
 
    const helloButton = this.add.text(width / 2, height / 2 + 140, 'Επόμενο Επίπεδο', TEXT_STYLES.DEFAULT).setOrigin(0.5);
    helloButton.setInteractive();
    helloButton.on('pointerdown', () => this.#goToNextLevel());


    removeRiveAnimation(this.#riveInstance, 'rive-stage--level1'); // remove
    this.#riveInstance = null;
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
    
    
    removeRiveAnimation(this.#riveInstance, 'rive-stage--level1'); // remove
    this.#riveInstance = null;
  }
 
  #createCharacterAnimation()
  {
    this.#riveInstance = spawnRiveAnimation(
    'assets/rive/Bear_StateMachine_Breathing.riv',   // swap for this scene's real file
    'StateMachine_Bear_Breathing',           // swap for this scene's real state machine name
    'rive-stage--level1',
  );
  }
 
  
    #setBreathing(isBreathing,isIdle)
    {
      setStateMachineInput(this.#riveInstance, 'StateMachine_Bear_Breathing', 'IsIdle', isIdle);
      setStateMachineInput(this.#riveInstance, 'StateMachine_Bear_Breathing', 'IsBreathing', isBreathing);
    }
}
