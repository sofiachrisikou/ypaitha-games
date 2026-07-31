import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
// const textStyleConfig = {
//   fontSize: '40px',
//   color: '#043D8C',
//   stroke: '#ffffff',
//   strokeThickness: 6,
// };

const LIMB_COLOR = 0xf4c98a;
const LIMB_DONE_COLOR = 0x4caf50;
const TARGET_MARKER_COLOR = 0x00ff0e;
const TARGET_MARKER_REACHED_COLOR = 0xff8b00;
const GRAB_INDICATOR_COLOR = 0xffe082;

export class GameScene3 extends Phaser.Scene {
  #bodyX;
  #bodyY;
  #bodyWidth;
  #bodyHeight;
  #limbThickness;
  #armLength;
  #legLength;
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
    this.#limbThickness = width * 0.06;
    this.#armLength = height * 0.12;
    this.#legLength = height * 0.13;

    // TODO: swap this Rectangle for the real bear-body art once it's ready
    //this.add.rectangle(this.#bodyX, this.#bodyY, this.#bodyWidth, this.#bodyHeight, LIMB_COLOR);
    this.add.image(this.#bodyX, this.#bodyY, ASSET_KEYS.BEAR_BODY).setScale(2);

    this.#limbs = [
      this.#createLimb({
        key: 'RIGHT_ARM',
        side: 'RIGHT',
        pivotX: this.#bodyX + this.#bodyWidth / 2,
        pivotY: this.#bodyY - this.#bodyHeight / 2 + this.#limbThickness / 2 + 290,
        length: this.#armLength,
        restAngleDeg: 60,
      }),
      this.#createLimb({
        key: 'LEFT_ARM',
        side: 'LEFT',
        pivotX: this.#bodyX - this.#bodyWidth / 2,
        pivotY: this.#bodyY - this.#bodyHeight / 2 + this.#limbThickness / 2 + 290,
        length: this.#armLength,
        restAngleDeg: 120,
      }),
      this.#createLimb({
        key: 'RIGHT_LEG',
        side: 'RIGHT',
        pivotX: this.#bodyX + this.#bodyWidth / 4 + 40,
        pivotY: this.#bodyY + this.#bodyHeight / 2,
        length: this.#legLength,
        restAngleDeg: 100,
        // top-left quarter (up and toward the body) — unreachable
        forbiddenZone: { startDeg: 180, endDeg: 270 },
      }),
      this.#createLimb({
        key: 'LEFT_LEG',
        side: 'LEFT',
        pivotX: this.#bodyX - this.#bodyWidth / 4 - 40,
        pivotY: this.#bodyY + this.#bodyHeight / 2,
        length: this.#legLength,
        restAngleDeg: 80,
        // top-right quarter (up and toward the body) — unreachable
        forbiddenZone: { startDeg: 270, endDeg: 360 },
      }),
    ];

    const progressTextLabel = this.add.text(10, 10, 'Διατάσεις:',TEXT_STYLES.DEFAULT);
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
      x: width / 2,
      y: 70,
      width: width * 0.86,
    });
  }

  /**
   * Given a limb's rest angle and which side of the body it's on, returns
   * away → near → away, so the limb finishes back in its open, stretched
   * pose. "Near"/"away" are resolved from the limb's side so left and right
   * mirror correctly regardless of restAngleDeg's raw value.
   */
  #computeTargetAngleSequence(restAngleDeg, side) {
    const candidateA = Phaser.Math.Wrap(restAngleDeg - 90, 0, 360);
    const candidateB = Phaser.Math.Wrap(restAngleDeg + 90, 0, 360);
    const outwardSign = side === 'RIGHT' ? 1 : -1;

    const outwardScoreA = Math.cos(Phaser.Math.DegToRad(candidateA)) * outwardSign;
    const outwardScoreB = Math.cos(Phaser.Math.DegToRad(candidateB)) * outwardSign;

    const outwardAngle = outwardScoreA >= outwardScoreB ? candidateA : candidateB;
    const inwardAngle = outwardAngle === candidateA ? candidateB : candidateA;

    return [outwardAngle, inwardAngle, outwardAngle];
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
   * One-time setup adjustment: if a computed target angle would land
   * inside a limb's forbidden zone, pulls it to the nearest edge of that
   * zone instead, so every target stays physically reachable given the
   * live rotation limit applied in #applyAngleLimit.
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
   * Builds one limb: the rectangle itself, its two (x,y) stretch targets
   * rendered as rings (only the current one visible — the next reveals
   * once the current one is reached), and its pulsing "grab here" indicator.
   * @returns {object} limb data tracked for the lifetime of the level
   */
  #createLimb(config) {
    const restAngleRad = Phaser.Math.DegToRad(config.restAngleDeg);

    const rectangleGO = this.add
      .rectangle(config.pivotX, config.pivotY, config.length, this.#limbThickness, LIMB_COLOR)
      .setOrigin(0, 0.5)
      .setRotation(restAngleRad);

    const limb = {
      key: config.key,
      pivotX: config.pivotX,
      pivotY: config.pivotY,
      length: config.length,
      angleDeg: config.restAngleDeg,
      forbiddenZone: config.forbiddenZone ?? null,
      targetAnglesDeg: [],
      isDone: false,
      rectangleGO,
      grabIndicatorGO: null,
      grabIndicatorTween: null,
      markerRevealTween: null,
      targetMarkerGOs: [],
    };

    // TODO: replace with the designer's real target poses once defined
    limb.targetAnglesDeg = this.#computeTargetAngleSequence(config.restAngleDeg, config.side).map((angleDeg) =>
      this.#clampTargetIntoAllowedRange(limb, angleDeg),
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
    limb.grabIndicatorGO = this.add.circle(tip.x, tip.y, 20, 0xffffff, 0);
    limb.grabIndicatorGO.setStrokeStyle(4, GRAB_INDICATOR_COLOR, 1);
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
    limb.rectangleGO.setRotation(Phaser.Math.DegToRad(limb.angleDeg));

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
    limb.rectangleGO.setFillStyle(LIMB_DONE_COLOR);
    this.#stopGrabIndicatorPulse(limb);
    this.#grabbedLimb = null;

    this.#limbsStretchedCount += 1;
    this.#progressTextGO.setText(`${this.#limbsStretchedCount} / ${this.#totalLimbsRequired}`);

    this.#levelProgressBar.setProgress(this.#limbsStretchedCount / this.#totalLimbsRequired);

    if (this.#limbsStretchedCount >= this.#totalLimbsRequired) {
      this.#handleLevelComplete();
    }
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
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);
    this.add.text(width / 2, height / 2 - 60, title, TEXT_STYLES.DEFAULT).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, subtitle, TEXT_STYLES.DEFAULT).setOrigin(0.5);

    const helloButton = this.add.text(width / 2, height / 2 + 140, 'Επόμενο Επίπεδο', TEXT_STYLES.DEFAULT).setOrigin(0.5);
    helloButton.setInteractive();
    helloButton.on('pointerdown', () => this.#goToNextLevel());
  }

  #handleShutdown() {
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#stopAllTimersAndIndicators();
  }

  #goToNextLevel() {
    this.scene.start(SCENE_KEYS.EUZOYLIS_OUTRO_SCENE);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }
}
