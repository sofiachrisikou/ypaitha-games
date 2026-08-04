import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation , setStateMachineInput} from '../common/rive-stage.js';
// const textStyleConfig = {
//   fontSize: '40px',
//   color: '#043D8C',
//   stroke: '#ffffff',
//   strokeThickness: 6,
// };
 
const LIMB_DONE_COLOR = 0x4caf50;
const TARGET_MARKER_COLOR = 0x0072FF;
const TARGET_MARKER_REACHED_COLOR = 0x19FA00;
const GRAB_INDICATOR_COLOR = 0xF200F2;
// One scale factor for the whole character — body, arms, and legs all use
// this exact same number, so whatever proportions the artist drew stay
// intact. Do not give limbs their own independent scale.
const CHARACTER_SCALE = 2;
// Must match the origin.y passed to .setOrigin() in #createLimb. Only the
// portion of the image BELOW this fraction actually swings out as the
// reachable limb — everything (limb length, grab indicator, targets) is
// computed relative to this, so change it here, not just in setOrigin().
const LIMB_ORIGIN_Y = 0.18;
 
export class GameScene3 extends Phaser.Scene {
  #bodyX;
  #bodyY;
  #bodyWidth;
  #bodyHeight;
  #limbs;
  #grabbedLimb;
  #grabRadius;
  #reachRadius;
  #gameDurationSeconds;
  #remainingSeconds;
  #countdownTimerEvent;
  #totalLimbsRequired;
  #limbsStretchedCount;
  #progressTextGO;
  #timerTextGO;
  #levelProgressBar;
  #isLevelComplete;
  #isGameOver;
  #debug;
  #riveInstance;
 
  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE3,
    });
  }
 
  /**
   * @public
   * Tied to the Phaser Scene lifecycle. Will run one time after the PRELOAD
   * logic is finished. Runs each time the Phaser Scene restarts.
   * @returns {void}
   */
  init() {
    this.#limbs = [];
    this.#grabbedLimb = null;
    this.#grabRadius = 90;
    this.#reachRadius = 90;
    this.#gameDurationSeconds = 60;
    this.#remainingSeconds = this.#gameDurationSeconds;
    this.#totalLimbsRequired = 4;
    this.#limbsStretchedCount = 0;
    this.#isLevelComplete = false;
    this.#isGameOver = false;
    // logs grabs/reaches to the console — flip to false once tuned
    this.#debug = true;
  }
 
  preload() {
    console.log('preload called');
  }
 
  create() {
    const { width, height } = this.scale;
 
    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg3);
 
    this.#createLevelProgressBar();
 
    // TODO: placeholder proportions — retune once the real bear art exists
    this.#bodyWidth = width * 0.32;
    this.#bodyHeight = height * 0.3;
    this.#bodyX = width * 0.5;
    this.#bodyY = height * 0.42;
 
    this.add.image(this.#bodyX, this.#bodyY, ASSET_KEYS.BEAR_BODY).setScale(CHARACTER_SCALE).setDepth(1);
 
    // Every target is an { x, y } point — the angle toward it is worked
    // out automatically in #pointToAngle. These starting coordinates land
    // in the same places your last working version did; move any single
    // point freely, they're fully independent of each other and of every
    // other limb.
    this.#limbs = [
      this.#createLimb({
        key: 'RIGHT_ARM',
        pivotX: this.#bodyX + this.#bodyWidth / 2 - 50,
        pivotY: this.#bodyY - this.#bodyHeight / 2 + 330,
        restAngleDeg: 60,
        texture: ASSET_KEYS.CHAR_ARM_R,
        targets: [
          { x: 938, y: 689 },
          { x: 670, y: 1007 },
          { x: 938, y: 689 },
        ],
      }),
      this.#createLimb({
        key: 'LEFT_ARM',
        pivotX: this.#bodyX - this.#bodyWidth / 2 + 50,
        pivotY: this.#bodyY - this.#bodyHeight / 2 + 330,
        restAngleDeg: 120,
        texture: ASSET_KEYS.CHAR_ARM_L,
        targets: [
          { x: 142, y: 689 },
          { x: 393, y: 1007 },
          { x: 142, y: 689 },
        ],
      }),
      this.#createLimb({
        key: 'RIGHT_LEG',
        pivotX: this.#bodyX + this.#bodyWidth / 4,
        pivotY: this.#bodyY + this.#bodyHeight / 2 - 20,
        restAngleDeg: 90,
        // top-left quarter (up and toward the body) — unreachable
        forbiddenZone: { startDeg: 180, endDeg: 270 },
        texture: ASSET_KEYS.CHAR_LEG_R,
        targets: [
          { x: 841, y: 1074 },
          { x: 400, y: 1400 },
          { x: 841, y: 1074 },
        ],
      }),
      this.#createLimb({
        key: 'LEFT_LEG',
        pivotX: this.#bodyX - this.#bodyWidth / 4,
        pivotY: this.#bodyY + this.#bodyHeight / 2 - 20,
        restAngleDeg: 90,
        // top-right quarter (up and toward the body) — unreachable
        forbiddenZone: { startDeg: 270, endDeg: 360 },
        texture: ASSET_KEYS.CHAR_LEG_L,
        targets: [
          { x: 239, y: 1074 },
          { x: 668, y: 1400 },
          { x: 239, y: 1074 },
        ],
      }),
    ];
 
    const progressTextLabel = this.add.text(10, 10, 'Διατάσεις:', TEXT_STYLES.DEFAULT);
    this.#progressTextGO = this.add.text(
      progressTextLabel.x + progressTextLabel.width,
      progressTextLabel.y,
      `0 / ${this.#totalLimbsRequired}`,
      TEXT_STYLES.DEFAULT,
    );
 
    const timerTextLabel = this.add.text(10, 50, 'Χρόνος:', TEXT_STYLES.DEFAULT);
    this.#timerTextGO = this.add.text(
      timerTextLabel.x + timerTextLabel.width,
      timerTextLabel.y,
      `${this.#remainingSeconds}`,
      TEXT_STYLES.DEFAULT,
    );
 
    this.#countdownTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.#tickCountdown,
      callbackScope: this,
      loop: true,
    });
 
    this.input.on(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.on(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);


    this.#createCharacterAnimation();
  }
 
  update(time, delta) {
    // No continuous per-frame movement — limbs only rotate in response to
    // pointermove while grabbed, and the countdown is a Timer Event. Left
    // here so the Scene lifecycle stays complete and consistent.
  }
 
  /**
   * Shared top-center level-progress bar (src/common/progress-bar.js), built
   * from ASSET_KEYS.PROGRESSBAR_BG (track) + ASSET_KEYS.PROGRESSBAR_FG (fill).
   * Displayed only for now — #levelProgressBar.setProgress() is not called
   * yet since level 3's completion/progress logic isn't defined.
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
   * Converts an { x, y } target point into the angle from this limb's
   * pivot toward it. Only the direction matters — the limb can only ever
   * be at exactly limb.length from its pivot, so the point doesn't need
   * to be exact, only pointing the right way.
   */
  #pointToAngle(pivotX, pivotY, point) {
    const angleRad = Phaser.Math.Angle.Between(pivotX, pivotY, point.x, point.y);
    return Phaser.Math.RadToDeg(angleRad);
  }
 
  /**
   * True if angleDeg falls strictly inside (startDeg, endDeg), handling
   * ranges that wrap past 360/0.
   */
  #isAngleInRange(angleDeg, startDeg, endDeg) {
    const normalized = Phaser.Math.Wrap(angleDeg, 0, 360);
    const start = Phaser.Math.Wrap(startDeg, 0, 360);
    const end = Phaser.Math.Wrap(endDeg, 0, 360);
    if (start <= end) {
      return normalized > start && normalized < end;
    }
    return normalized > start || normalized < end;
  }
 
  /**
   * Safety net: if a hand-authored target still lands inside a limb's
   * forbidden zone, pulls it to the nearest edge of that zone instead of
   * leaving an unreachable target that would softlock the level.
   */
  #clampTargetIntoAllowedRange(limb, targetDeg) {
    if (!limb.forbiddenZone) {
      return targetDeg;
    }
    if (!this.#isAngleInRange(targetDeg, limb.forbiddenZone.startDeg, limb.forbiddenZone.endDeg)) {
      return targetDeg;
    }
    const distanceToStart = Math.abs(Phaser.Math.Angle.ShortestBetween(targetDeg, limb.forbiddenZone.startDeg));
    const distanceToEnd = Math.abs(Phaser.Math.Angle.ShortestBetween(targetDeg, limb.forbiddenZone.endDeg));
    return distanceToStart <= distanceToEnd ? limb.forbiddenZone.startDeg : limb.forbiddenZone.endDeg;
  }
 
  /**
   * Live per-frame rotation limit while dragging. If the raw pointer angle
   * falls inside the limb's forbidden zone, pins it to whichever edge of
   * that zone is nearest to the limb's CURRENT angle (not the raw input) —
   * that gives it a hard mechanical-stop feel and avoids any flicker
   * between the two edges near the middle of the forbidden arc.
   */
  #applyAngleLimit(limb, rawAngleDeg) {
    if (!limb.forbiddenZone) {
      return rawAngleDeg;
    }
    if (!this.#isAngleInRange(rawAngleDeg, limb.forbiddenZone.startDeg, limb.forbiddenZone.endDeg)) {
      return rawAngleDeg;
    }
    const distanceToStart = Math.abs(Phaser.Math.Angle.ShortestBetween(limb.angleDeg, limb.forbiddenZone.startDeg));
    const distanceToEnd = Math.abs(Phaser.Math.Angle.ShortestBetween(limb.angleDeg, limb.forbiddenZone.endDeg));
    return distanceToStart <= distanceToEnd ? limb.forbiddenZone.startDeg : limb.forbiddenZone.endDeg;
  }
 
  /**
   * The limb art hangs straight down from its top pivot in its default,
   * unrotated state — that "down" default is 90° in our angle system
   * (0° = right), so the actual GameObject rotation needs a -90°
   * correction relative to the angle value everywhere else in this file.
   * All the angle math (targets, forbidden zones, limb.angleDeg itself)
   * stays in the plain 0°=right convention; only this conversion knows
   * about the art's orientation.
   */
  #toImageRotationRad(angleDeg) {
    return Phaser.Math.DegToRad(angleDeg - 90);
  }
 
  /**
   * Builds one limb: the image itself, its stretch targets rendered as
   * rings (only the current one visible — the next reveals once the
   * current one is reached), and its pulsing "grab here" indicator.
   * @returns {object} limb data tracked for the lifetime of the level
   */
  #createLimb(config) {
    const limbImage = this.add.image(config.pivotX, config.pivotY, config.texture).setOrigin(0.5, LIMB_ORIGIN_Y);
    limbImage.setScale(CHARACTER_SCALE);
    limbImage.setRotation(this.#toImageRotationRad(config.restAngleDeg));
 
    // Only the part of the image BELOW the origin actually swings out as
    // the limb — must stay in sync with LIMB_ORIGIN_Y above.
    const limbLength = limbImage.height * (1 - LIMB_ORIGIN_Y) * CHARACTER_SCALE;
 
    const limb = {
      key: config.key,
      pivotX: config.pivotX,
      pivotY: config.pivotY,
      length: limbLength,
      angleDeg: config.restAngleDeg,
      forbiddenZone: config.forbiddenZone ?? null,
      targetAnglesDeg: [],
      isDone: false,
      rectangleGO: limbImage,
      grabIndicatorGO: null,
      grabIndicatorTween: null,
      markerRevealTween: null,
      targetMarkerGOs: [],
    };
 
    limb.targetAnglesDeg = config.targets.map((point) =>
      this.#clampTargetIntoAllowedRange(limb, this.#pointToAngle(config.pivotX, config.pivotY, point)),
    );
 
    limb.targetAnglesDeg.forEach((targetDeg) => {
      const point = this.#limbTipPosition(limb, targetDeg);
      const marker = this.add.circle(point.x, point.y, 20, TARGET_MARKER_COLOR, 0).setDepth(2);
      marker.setStrokeStyle(4, TARGET_MARKER_COLOR, 1);
      // hidden until this limb is actually grabbed — see #showCurrentTargetMarker
      marker.setVisible(false);
      limb.targetMarkerGOs.push(marker);
    });
 
    this.#createGrabIndicator(limb);
 
    return limb;
  }
 
  /** Where this limb's free end currently is (or would be, at a given angle) */
  #limbTipPosition(limb, angleDeg) {
    const angleRad = Phaser.Math.DegToRad(angleDeg);
    return {
      x: limb.pivotX + Math.cos(angleRad) * limb.length,
      y: limb.pivotY + Math.sin(angleRad) * limb.length,
    };
  }
 
  #createGrabIndicator(limb) {
    const tip = this.#limbTipPosition(limb, limb.angleDeg);
    limb.grabIndicatorGO = this.add.circle(tip.x, tip.y, 14, 0xffffff, 0);
    limb.grabIndicatorGO.setStrokeStyle(3, GRAB_INDICATOR_COLOR, 1);
    this.#pulseGrabIndicator(limb);
  }
 
  #pulseGrabIndicator(limb) {
    limb.grabIndicatorGO.setVisible(true).setAlpha(0.5).setScale(0.9);
    limb.grabIndicatorTween = this.tweens.add({
      targets: limb.grabIndicatorGO,
      alpha: { from: 0.5, to: 1 },
      scale: { from: 0.9, to: 1.1 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
 
  #stopGrabIndicatorPulse(limb) {
    if (limb.grabIndicatorTween) {
      limb.grabIndicatorTween.stop();
      limb.grabIndicatorTween = null;
    }
    limb.grabIndicatorGO.setVisible(false);
  }
 
  /** Reveals the limb's current (next-to-reach) target — only while it's grabbed */
  #showCurrentTargetMarker(limb) {
    const marker = limb.targetMarkerGOs[0];
    if (!marker) {
      return;
    }
    if (limb.markerRevealTween) {
      limb.markerRevealTween.stop();
      limb.markerRevealTween = null;
    }
    marker.setVisible(true).setAlpha(1).setScale(1);
  }
 
  /** Hides the limb's current target again once it's released without reaching it */
  #hideCurrentTargetMarker(limb) {
    const marker = limb.targetMarkerGOs[0];
    if (!marker) {
      return;
    }
    if (limb.markerRevealTween) {
      limb.markerRevealTween.stop();
      limb.markerRevealTween = null;
    }
    marker.setVisible(false);
  }
 
  #handlePointerDown(pointer) {
    if (this.#isLevelComplete || this.#isGameOver || this.#grabbedLimb) {
      return;
    }
 
    let closestLimb = null;
    let closestDistance = this.#grabRadius;
 
    this.#limbs.forEach((limb) => {
      if (limb.isDone) {
        return;
      }
      const tip = this.#limbTipPosition(limb, limb.angleDeg);
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, tip.x, tip.y);
      if (distance <= closestDistance) {
        closestDistance = distance;
        closestLimb = limb;
      }
    });
 
    if (!closestLimb) {
      return;
    }
 
    this.#grabbedLimb = closestLimb;
    this.#stopGrabIndicatorPulse(closestLimb);
    this.#showCurrentTargetMarker(closestLimb);
 
    if (this.#debug) {
      console.log(`${closestLimb.key}: grabbed`);
    }
  }
 
  #handlePointerMove(pointer) {
    if (!this.#grabbedLimb) {
      return;
    }
 
    const limb = this.#grabbedLimb;
    const rawAngleRad = Phaser.Math.Angle.Between(limb.pivotX, limb.pivotY, pointer.x, pointer.y);
    const rawAngleDeg = Phaser.Math.RadToDeg(rawAngleRad);
    limb.angleDeg = this.#applyAngleLimit(limb, rawAngleDeg);
    limb.rectangleGO.setRotation(this.#toImageRotationRad(limb.angleDeg));
 
    this.#checkLimbTargetReached(limb);
  }
 
  #handlePointerUp(pointer) {
    if (!this.#grabbedLimb) {
      return;
    }
    const limb = this.#grabbedLimb;
    this.#grabbedLimb = null;
 
    if (limb.isDone) {
      return;
    }
 
    this.#hideCurrentTargetMarker(limb);
 
    const tip = this.#limbTipPosition(limb, limb.angleDeg);
    limb.grabIndicatorGO.setPosition(tip.x, tip.y);
    this.#pulseGrabIndicator(limb);
  }
 
  #checkLimbTargetReached(limb) {
    if (limb.targetAnglesDeg.length === 0) {
      return;
    }
 
    const nextTargetDeg = limb.targetAnglesDeg[0];
    const tip = this.#limbTipPosition(limb, limb.angleDeg);
    const targetPoint = this.#limbTipPosition(limb, nextTargetDeg);
    const distance = Phaser.Math.Distance.Between(tip.x, tip.y, targetPoint.x, targetPoint.y);
 
    if (distance > this.#reachRadius) {
      return;
    }
 
    limb.targetAnglesDeg.shift();
    const reachedMarker = limb.targetMarkerGOs.shift();
    if (reachedMarker) {
      reachedMarker.setStrokeStyle(4, TARGET_MARKER_REACHED_COLOR, 1);
      this.tweens.add({
        targets: reachedMarker,
        alpha: 0,
        duration: 400,
        delay: 200,
        onComplete: () => reachedMarker.destroy(),
      });
    }
 
    const nextMarker = limb.targetMarkerGOs[0];
    if (nextMarker) {
      nextMarker.setVisible(true).setAlpha(0).setScale(0.6);
      limb.markerRevealTween = this.tweens.add({
        targets: nextMarker,
        alpha: 1,
        scale: 1,
        duration: 250,
        ease: 'Back.easeOut',
      });
    }
 
    if (this.#debug) {
      console.log(`${limb.key}: target reached (${limb.targetAnglesDeg.length} left)`);
    }
 
    if (limb.targetAnglesDeg.length === 0) {
      this.#completeLimb(limb);
    }
  }
 
  #completeLimb(limb) {
    limb.isDone = true;
    // TODO: a flat green tint may look harsh on real art — worth revisiting
    // once you see it (a checkmark icon, a brief glow tween, etc. might
    // read better than recoloring the limb itself)
    limb.rectangleGO.setTint(LIMB_DONE_COLOR);
    this.#stopGrabIndicatorPulse(limb);
    this.#grabbedLimb = null;
 
    this.#limbsStretchedCount += 1;
    this.#progressTextGO.setText(`${this.#limbsStretchedCount} / ${this.#totalLimbsRequired}`);
 
    this.#levelProgressBar.setProgress(this.#limbsStretchedCount / this.#totalLimbsRequired);
 
    if (this.#limbsStretchedCount >= this.#totalLimbsRequired) {
      this.#handleLevelComplete();
    }

    this.#setSmiling(true);

     this.time.delayedCall(
      700,
      () => {
        this.#setSmiling(false);
      },
    );
  }
 
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
 
  #handleLevelComplete() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isLevelComplete = true;
    this.#stopAllTimersAndIndicators();
 
    this.events.emit('levelComplete', {
      limbsStretched: this.#limbsStretchedCount,
      secondsLeft: this.#remainingSeconds,
    });
 
    this.#showEndMessage('Μπράβο! Έκανες τέλεια διατάσεις! 🎉', '');
  }
 
  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;
    this.#stopAllTimersAndIndicators();
 
    this.events.emit('gameOver', {
      limbsStretched: this.#limbsStretchedCount,
    });
 
    this.#showEndMessage('Ο χρόνος τελείωσε', 'Ας ξαναδοκιμάσουμε');
  }
 
  #stopAllTimersAndIndicators() {
    if (this.#countdownTimerEvent) {
      this.#countdownTimerEvent.remove();
    }
    this.#grabbedLimb = null;
    this.#limbs.forEach((limb) => {
      if (!limb.isDone) {
        this.#stopGrabIndicatorPulse(limb);
      }
    });
  }
 
  #showEndMessage(title, subtitle) {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0).setDepth(4);
    this.add.text(width / 2, height / 2 - 60, title, TEXT_STYLES.DEFAULT).setOrigin(0.5).setDepth(4);
    this.add.text(width / 2, height / 2 + 40, subtitle, TEXT_STYLES.DEFAULT).setOrigin(0.5).setDepth(4);
 
    const helloButton = this.add.text(width / 2, height / 2 + 140, 'Επόμενο Επίπεδο', TEXT_STYLES.DEFAULT).setOrigin(0.5).setDepth(3);
    helloButton.setInteractive();
    helloButton.on('pointerdown', () => this.#goToNextLevel());
  }
 
  #handleShutdown() {
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#stopAllTimersAndIndicators();

    removeRiveAnimation(this.#riveInstance, 'rive-stage--level3'); // remove
    this.#riveInstance = null;
  }
 
  #goToNextLevel() {
    this.scene.start(SCENE_KEYS.EUZOYLIS_OUTRO_SCENE);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }

   //rive

  #createCharacterAnimation()
  {
    this.#riveInstance = spawnRiveAnimation(
      'assets/rive/Bear_StateMachine_Smile.riv',
      'StateMachine_Bear_Smile',
      'rive-stage--level3',
    );
  }

  #setSmiling(value)
  {
    setStateMachineInput(this.#riveInstance, 'StateMachine_Bear_Smile', 'IsSmiling', value);
  }
    
}
 
