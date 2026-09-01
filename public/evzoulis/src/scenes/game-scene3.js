import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { createAnimatedCharacter } from '../common/level-flow.js';
import { playCorrectSound, playWrongSound } from '../common/audio-manager.js';


// Gameplay-only head character — talks through the arm/leg prompts while the
// body/limbs are the separately-dragged sprites below, not a Rive animation.
const STAGE3_HEAD_CONFIG = {
  riveAssetKey: ASSET_KEYS.RIVE_BEAR_Stg3_HEAD,
  stateMachineName: 'Euzoulis_StateMachine',
  animParamName: 'clipIndex',
  idleParam: 0,
};
const STAGE3_HEAD_POSITION_GAMEPLAY = { cssClass: 'rive-stage--stg3-head-gameplay', bubbleScale: 0.35, bubbleX: 250, bubbleY: 600, textStyle: TEXT_STYLES.SPEECH_BUBBLE };

// Full-body character — same one used for BOTH the intro and the post-gameplay
// celebration (spawned fresh each time, never held alive during gameplay,
// since gameplay swaps to STAGE3_HEAD_CONFIG instead). Own CSS class since
// RIVE_BEAR_Stg3 is a different asset with different proportions than the
// gameplay head (never reuse a box tuned for a different .riv file).
// ASSET_KEYS.RIVE_BEAR_Stg3 needs to be declared+loaded in assets.js.
const STAGE3_BODY_CHARACTER_CONFIG = {
  riveAssetKey: ASSET_KEYS.RIVE_BEAR_Stg3,
  stateMachineName: 'Euzoulis_StateMachine',
  animParamName: 'clipIndex',
  idleParam: 0,
};
const STAGE3_BODY_POSITION = { cssClass: 'rive-stage--stg3-celebration', bubbleScale: 0.35, bubbleX: 300, bubbleY: 800, textStyle: TEXT_STYLES.SPEECH_BUBBLE };

// animationParam 1 = talking, same as the other stages' intro/talk clip.
// Bubble now enabled — behaves like the rest of the game.
const STAGE3_RAISE_HANDS_STEP = { animationParam: 1, audioKey: ASSET_KEYS.EZ_31, durationSeconds: 3.5, text: 'Χέρια ψηλά — άγγιξε τον κύκλο' };
const STAGE3_STRETCH_LEGS_STEP = { animationParam: 1, audioKey: ASSET_KEYS.EZ_32, durationSeconds: 3, text: 'Πόδια ανοιχτά— άγγιξε τον κύκλο' };
const STAGE3_STRETCH_RIGHT_STEP = { animationParam: 1, audioKey: ASSET_KEYS.EZ_33, durationSeconds: 3, text: 'Τέντωμα δεξιά— άγγιξε τον κύκλο' };
const STAGE3_STRETCH_LEFT_STEP = { animationParam: 1, audioKey: ASSET_KEYS.EZ_34, durationSeconds: 2.5, text: 'Τέντωμα αριστερά— άγγιξε τον κύκλο' };

// Played once by STAGE3_BODY_CHARACTER_CONFIG before moving on to outro-scene.js
const STAGE3_CELEBRATION_STEP = { animationParam: 34, text: 'Το σώμα σου χαλάρωσε!', audioKey: ASSET_KEYS.EZ_38, durationSeconds: 6 };

// Intro card lines (moved out of the now-deleted character-lines.js) — played
// on STAGE3_BODY_CHARACTER_CONFIG, same character as the celebration.
const STAGE3_INTRO_STEPS = [
  { animationParam: 31, text: 'ΣΤΑΔΙΟ 3 — Τεντώνομαι', audioKey: ASSET_KEYS.EZ_29, durationSeconds: 5 },
  { animationParam: 32, text: 'Άγγιξε τους κύκλους και τέντωσε μαζί μου!', audioKey: ASSET_KEYS.EZ_30, durationSeconds: 8 },
];

// Head animation indices: 0 idle, 1 talking, 2 wink, 3 laugh, 4 calm.
// One picked at random on every correct limb completion, played BEFORE the
// next stretch prompt (see #completeLimb) — no text on these, reaction only.
const STAGE3_LIMB_REACTION_STEPS = [
  { animationParam: 28, audioKey: ASSET_KEYS.EZ_35, durationSeconds: 3 }, // wink — dummy sound for now
  { animationParam: 29, audioKey: ASSET_KEYS.SFX_LAUGH, durationSeconds: 2 },
  { animationParam: 30, audioKey: ASSET_KEYS.EZ_36, durationSeconds: 4.5}, // calm — correct sound
];

// Bottom-of-screen prompt showing how many targets are left on the grabbed
// limb — idle text while nothing's grabbed, "Τέντωμα .../X" while holding one.
const LIMB_PROMPT_TEXT = {
  ARM_IDLE: 'Πιάσε ένα χέρι από το κυκλάκι',
  LEG_IDLE: 'Πιάσε ένα πόδι από το κυκλάκι',
};

const LIMB_DONE_COLOR = 0x4caf50;
const TARGET_MARKER_COLOR = 0x0072FF;
const TARGET_MARKER_REACHED_COLOR = 0x19FA00;
const TARGET_MARKER_RADIUS = 28;
const TARGET_MARKER_STROKE_WIDTH = 8;
const GRAB_INDICATOR_ARM_COLOR = 0x742CD1;
//const GRAB_INDICATOR_ARM_COLOR = 0xD19F21;
const GRAB_INDICATOR_LEG_COLOR = 0x742CD1;
//const GRAB_INDICATOR_LEG_COLOR = 0x21C8D1;
const GRAB_INDICATOR_RADIUS = 28;
const GRAB_INDICATOR_STROKE_WIDTH = 8;
// One scale factor for the whole character — body, arms, and legs all use
// this exact same number, so whatever proportions the artist drew stay
// intact. Do not give limbs their own independent scale.
const CHARACTER_SCALE = 2;
// Must match the origin.y passed to .setOrigin() in #createLimb. Only the
// portion of the image BELOW this fraction actually swings out as the
// reachable limb — everything (limb length, grab indicator, targets) is
// computed relative to this, so change it here, not just in setOrigin().
const LIMB_ORIGIN_Y = 0.18;

// Uniform downward shift for the whole body/limb rig — body position, every
// limb pivot (derived from #bodyY, so they follow automatically), AND every
// hardcoded target point's y below (added by hand since those are absolute
// canvas coordinates, not derived from #bodyY). One number moves everything
// together, like a box-select-drag. Does NOT move the head/rive character —
// that's separate, left alone on purpose.
const STAGE3_VERTICAL_SHIFT_PX = 280;

export class GameScene3 extends Phaser.Scene {
  //CHARACTER
  #character;
  #introBg;
  #introLogo;

  //LIMBS
  #bodyGO;
  #bodyX;
  #bodyY;
  #bodyWidth;
  #bodyHeight;
  #limbs;
  #grabbedLimb;
  #grabRadius;
  #reachRadius;
  #forbiddenZoneDropBufferDeg;
  #forbiddenZoneBounceBackDeg;
  #forbiddenZoneBounceDurationMs;
  #forbiddenZoneRecoilDeg;
  #forbiddenZoneRecoilDurationMs;
  #limbDoneTintDurationMs;
  #limbPromptGO;

  //GAMEPLAY
  #gameDurationSeconds;
  #totalLimbsRequired;
  #inputLocked;
  #debug;

  //TIMER
  #remainingSeconds;
  #timerTextGO;
  #countdownTimerEvent;

  //PROGRESS BAR
  #levelProgressBar;

  //STATS
  #limbsStretchedCount;
  #progressTextGO;

  //LEVEL MANAGEMENT
  #isLevelComplete;
  #isGameOver;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE3,
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
    this.#limbs = [];
    this.#grabbedLimb = null;
    this.#inputLocked = false;
    this.#grabRadius = 90;
    this.#reachRadius = 90;
    // how many degrees before the actual forbidden-zone edge the limb gets
    // dropped — e.g. 2 means it releases at 88°/272° for a boundary at 90°/270°
    this.#forbiddenZoneDropBufferDeg = 2;
    // after dropping, the limb animates back this many degrees AWAY from
    // whichever forbidden-zone edge it was closer to, so it settles clear
    // of the zone instead of resting right at the edge
    this.#forbiddenZoneBounceBackDeg = 15;
    this.#forbiddenZoneBounceDurationMs = 180;
    // how long a completed limb stays tinted green before reverting to its
    // normal colors — matches the smile duration below for now
    this.#limbDoneTintDurationMs = 700;
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
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);
    this.#showIntroBackground();
    // Rive loads asynchronously — wait for onReady before setting any animation param
    this.#character = createAnimatedCharacter(this, STAGE3_BODY_CHARACTER_CONFIG, STAGE3_BODY_POSITION, () => {
      this.#character.setAnimationParam(0);
      this.time.delayedCall(100, () => {
        this.#character.playSequence(STAGE3_INTRO_STEPS, () => {
          this.#hideIntroBackground();
          this.#character.destroy();
          this.#character = null;
          this.#startLevel();
        });
      });
    });
  }

  #showIntroBackground() {
    const { width, height } = this.scale;
    this.#introBg = this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
    this.#introLogo = this.add.image(width / 2, height * 0.2, ASSET_KEYS.STAGE3_LOGO).setDepth(1001).setScale(0.55);
  }

  #hideIntroBackground() {
    this.#introBg?.destroy();
    this.#introLogo?.destroy();
    this.#introBg = null;
    this.#introLogo = null;
  }

  #startLevel() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg3);

    // TODO: placeholder proportions — retune once the real bear art exists
    this.#bodyWidth = width * 0.32;
    this.#bodyHeight = height * 0.3;
    this.#bodyX = width * 0.5;
    this.#bodyY = height * 0.42 + STAGE3_VERTICAL_SHIFT_PX;

    this.#bodyGO = this.add.image(this.#bodyX, this.#bodyY, ASSET_KEYS.BEAR_BODY).setScale(CHARACTER_SCALE).setDepth(1);

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
        forbiddenZone: { startDeg: 80, endDeg: 290 },
        texture: ASSET_KEYS.CHAR_ARM_R,
        targets: [
          { x: 938, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 938, y: 1050 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 938, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 938, y: 1050 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 938, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
        ],
      }),
      this.#createLimb({
        key: 'LEFT_ARM',
        pivotX: this.#bodyX - this.#bodyWidth / 2 + 50,
        pivotY: this.#bodyY - this.#bodyHeight / 2 + 330,
        restAngleDeg: 120,
        forbiddenZone: { startDeg: 250, endDeg: 100 },
        texture: ASSET_KEYS.CHAR_ARM_L,
        targets: [
          { x: 142, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 142, y: 1050 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 142, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 142, y: 1050 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 142, y: 689 + STAGE3_VERTICAL_SHIFT_PX },
        ],
      }),
      this.#createLimb({
        key: 'RIGHT_LEG',
        enabled: false,
        pivotX: this.#bodyX + this.#bodyWidth / 4,
        pivotY: this.#bodyY + this.#bodyHeight / 2 - 20,
        restAngleDeg: 90,
        forbiddenZone: { startDeg: 120, endDeg: 340 },
        texture: ASSET_KEYS.CHAR_LEG_R,
        targets: [
          { x: 841, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 600, y: 1400 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 841, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 600, y: 1400 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 841, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
        ],
      }),
      this.#createLimb({
        key: 'LEFT_LEG',
        enabled: false,
        pivotX: this.#bodyX - this.#bodyWidth / 4 -15,
        pivotY: this.#bodyY + this.#bodyHeight / 2 - 20,
        restAngleDeg: 90,
        // top-right quarter (up and toward the body) — unreachable
        forbiddenZone: { startDeg: 210, endDeg: 60 },
        texture: ASSET_KEYS.CHAR_LEG_L,
        targets: [
          { x: 239, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 400, y: 1400 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 239, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 400, y: 1400 + STAGE3_VERTICAL_SHIFT_PX },
          { x: 239, y: 1074 + STAGE3_VERTICAL_SHIFT_PX },
        ],
      }),
    ];

    this.#createLimbPromptText();

    //Progressbar
    this.#createLevelProgressBar();
    this.#levelProgressBar.setProgress(3.3/8);
    //Game Stats
    const labelsTop = this.#levelProgressBar.getBounds().bottom + 60;
    const progressTextLabel = this.add.text(50, labelsTop, 'Διατάσεις:', TEXT_STYLES.DEFAULT);
    this.#progressTextGO = this.add.text(
      progressTextLabel.x + progressTextLabel.width,
      progressTextLabel.y,
      `0 / ${this.#totalLimbsRequired}`,
      TEXT_STYLES.DEFAULT,
    );
    //timer text
    const timerTextLabel = this.add.text(50, labelsTop + 40, 'Χρόνος:', TEXT_STYLES.DEFAULT);
    this.#timerTextGO = this.add.text(
      timerTextLabel.x + timerTextLabel.width,
      timerTextLabel.y,
      `${this.#remainingSeconds}`,
      TEXT_STYLES.DEFAULT,
    );
    //timer start
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

    // Rive loads asynchronously — wait for onReady before setting any animation param
    this.#character = createAnimatedCharacter(this, STAGE3_HEAD_CONFIG, STAGE3_HEAD_POSITION_GAMEPLAY, () => {
      this.#character.setAnimationParam(0);
      this.time.delayedCall(100, () => {
        this.#character.playFeedback(STAGE3_RAISE_HANDS_STEP);
      });
    });
  }

  update(time, delta) {
    // No continuous per-frame movement — limbs only rotate in response to
    // pointermove while grabbed, and the countdown is a Timer Event. Left
    // here so the Scene lifecycle stays complete and consistent.
  }

  //#endregion

  //#region Gesture Input

  #handlePointerDown(pointer) {
    if (this.#isLevelComplete || this.#isGameOver || this.#grabbedLimb || this.#inputLocked) {
      return;
    }

    let closestLimb = null;
    let closestDistance = this.#grabRadius;

    this.#limbs.forEach((limb) => {
      if (limb.isDone || !limb.enabled) {
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
    this.#setOtherGrabIndicatorsVisible(closestLimb, false);
    this.#showCurrentTargetMarker(closestLimb);
    this.#updateLimbPromptForGrab(closestLimb);

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

    if (this.#isNearForbiddenZone(limb, rawAngleDeg)) {
      if (this.#debug) {
        console.log(`${limb.key}: dropped — approaching forbidden zone`);
      }
      const bounceTargetAngle = this.#computeBounceTargetAngle(limb);
      this.#releaseLimb(limb, bounceTargetAngle);
      this.#bounceLimbToAngle(limb, bounceTargetAngle);

      playWrongSound(this);

      return;
    }

    limb.angleDeg = rawAngleDeg;
    limb.rectangleGO.setRotation(this.#toImageRotationRad(limb.angleDeg));

    this.#checkLimbTargetReached(limb);
  }

  #handlePointerUp(pointer) {
    if (!this.#grabbedLimb) {
      return;
    }
    this.#releaseLimb(this.#grabbedLimb);
  }

  //#endregion

  //#region Limbs

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
   * True if angleDeg is within #forbiddenZoneDropBufferDeg of EITHER edge
   * of the limb's forbidden zone, or already inside it. ShortestBetween is
   * used for the edge-distance check, which is direction-agnostic by
   * construction — approaching an edge clockwise or counter-clockwise
   * produces the same distance, so this triggers symmetrically either way.
   * Used to drop the limb before it ever reaches the actual boundary,
   * rather than letting it slide along the boundary once there.
   */
  #isNearForbiddenZone(limb, angleDeg) {
    if (!limb.forbiddenZone) {
      return false;
    }
    const distanceToStart = Math.abs(Phaser.Math.Angle.ShortestBetween(angleDeg, limb.forbiddenZone.startDeg));
    const distanceToEnd = Math.abs(Phaser.Math.Angle.ShortestBetween(angleDeg, limb.forbiddenZone.endDeg));
    const nearAnEdge = distanceToStart <= this.#forbiddenZoneDropBufferDeg || distanceToEnd <= this.#forbiddenZoneDropBufferDeg;
    const insideZone = this.#isAngleInRange(angleDeg, limb.forbiddenZone.startDeg, limb.forbiddenZone.endDeg);
    return nearAnEdge || insideZone;
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
      enabled: config.enabled ?? true,
      pivotX: config.pivotX,
      pivotY: config.pivotY,
      length: limbLength,
      angleDeg: config.restAngleDeg,
      forbiddenZone: config.forbiddenZone ?? null,
      targetAnglesDeg: [],
      totalTargets: config.targets.length,
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
      const marker = this.add.circle(point.x, point.y, TARGET_MARKER_RADIUS, TARGET_MARKER_COLOR, 0).setDepth(2);
      marker.setStrokeStyle(TARGET_MARKER_STROKE_WIDTH, TARGET_MARKER_COLOR, 1);
      // hidden until this limb is actually grabbed — see #showCurrentTargetMarker
      marker.setVisible(false);
      limb.targetMarkerGOs.push(marker);
    });

    this.#createGrabIndicator(limb,config.key);

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

  #createGrabIndicator(limb,limbKey) {
    const tip = this.#limbTipPosition(limb, limb.angleDeg);
    limb.grabIndicatorGO = this.add.circle(tip.x, tip.y, GRAB_INDICATOR_RADIUS, 0xffffff, 0);
    if(limbKey == 'RIGHT_ARM' || limbKey == 'LEFT_ARM')
    {
      limb.grabIndicatorGO.setStrokeStyle(GRAB_INDICATOR_STROKE_WIDTH, GRAB_INDICATOR_ARM_COLOR, 1).setDepth(2);

    }
    else
    {
      limb.grabIndicatorGO.setStrokeStyle(GRAB_INDICATOR_STROKE_WIDTH, GRAB_INDICATOR_LEG_COLOR, 1).setDepth(2);
    }
    // Legs start disabled — the ring shape is visible by default the instant
    // it's created (Phaser shapes default to visible), so it must be hidden
    // explicitly here, not just left un-pulsed, or it shows as a static
    // (non-pulsing but still fully visible) ring from the very start.
    if (limb.enabled) {
      this.#pulseGrabIndicator(limb);
    } else {
      limb.grabIndicatorGO.setVisible(false);
    }
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

  /**
   * Hides (or restores) every OTHER not-yet-done limb's grab indicator.
   * Used so that while one limb is held, its siblings' pulsing "grab here"
   * rings don't clutter the screen — multi-touch isn't supported anyway,
   * so there's nothing to do with them until this limb is released.
   * Done limbs are skipped in both directions: they never show an
   * indicator again once completed.
   */
  #setOtherGrabIndicatorsVisible(exceptLimb, visible) {
    this.#limbs.forEach((limb) => {
      if (limb === exceptLimb || limb.isDone || !limb.enabled) {
        return;
      }
      if (visible) {
        this.#pulseGrabIndicator(limb);
      } else {
        this.#stopGrabIndicatorPulse(limb);
      }
    });
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

  /**
   * Shared release logic — used for both a normal pointer-up and a forced
   * forbidden-zone drop. landingAngleDeg defaults to wherever the limb
   * currently is; the forbidden-zone drop passes the post-bounce angle
   * instead, so the grab indicator appears where the limb will actually
   * end up rather than where it was at the moment of the drop.
   */
  #releaseLimb(limb, landingAngleDeg = limb.angleDeg) {
    this.#grabbedLimb = null;
    this.#setOtherGrabIndicatorsVisible(limb, true);

    if (limb.isDone) {
      return;
    }

    this.#hideCurrentTargetMarker(limb);
    this.#resetLimbPromptText();

    const tip = this.#limbTipPosition(limb, landingAngleDeg);
    limb.grabIndicatorGO.setPosition(tip.x, tip.y);
    this.#pulseGrabIndicator(limb);
  }

  /**
   * Which direction (in our 0°=right angle system) points AWAY from the
   * forbidden zone, given the limb's current angle — away from startDeg
   * means decreasing angle, away from endDeg means increasing angle.
   * Picks whichever edge is currently closer via ShortestBetween, which is
   * direction-agnostic, so this works the same whether the limb was
   * rotating clockwise or counter-clockwise when it got dropped.
   */
  #computeBounceTargetAngle(limb) {
    const distanceToStart = Math.abs(Phaser.Math.Angle.ShortestBetween(limb.angleDeg, limb.forbiddenZone.startDeg));
    const distanceToEnd = Math.abs(Phaser.Math.Angle.ShortestBetween(limb.angleDeg, limb.forbiddenZone.endDeg));
    const nearerEdgeIsStart = distanceToStart <= distanceToEnd;
    const bounceSign = nearerEdgeIsStart ? -1 : 1;
    return limb.angleDeg + bounceSign * this.#forbiddenZoneBounceBackDeg;
  }

  /** Animates limb.angleDeg (and its visual rotation) from where it is now to toAngleDeg */
  #bounceLimbToAngle(limb, toAngleDeg) {
    const fromAngleDeg = limb.angleDeg;
    this.tweens.addCounter({
      from: fromAngleDeg,
      to: toAngleDeg,
      duration: this.#forbiddenZoneBounceDurationMs,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        limb.angleDeg = tween.getValue();
        limb.rectangleGO.setRotation(this.#toImageRotationRad(limb.angleDeg));
      },
    });
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
      reachedMarker.setStrokeStyle(TARGET_MARKER_STROKE_WIDTH, TARGET_MARKER_REACHED_COLOR, 1);
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

    this.#updateLimbPromptForGrab(limb);
    playCorrectSound(this);

    if (limb.targetAnglesDeg.length === 0) {
      this.#completeLimb(limb);
    }
  }

  /** True once the given limb key has finished stretching. */
  #isLimbDone(key) {
    return this.#limbs.find((limb) => limb.key === key)?.isDone === true;
  }

  /** Reveals the leg grab indicators — called once both arms are done. */
  #enableLegs() {
    this.#limbs.forEach((limb) => {
      if (limb.key === 'RIGHT_LEG' || limb.key === 'LEFT_LEG') {
        limb.enabled = true;
        this.#pulseGrabIndicator(limb);
      }
    });
  }

  /**
   * Plays the right prompt for what to stretch next, after an arm or leg
   * finishes. Always calls onComplete, even when there's nothing to play.
   * The bottom prompt text is set here FIRST — before enabling the legs or
   * starting the guide clip's own speech bubble — so it updates immediately
   * instead of sitting on "Μπράβο!" for the whole reaction+guide-clip length.
   */
  #playNextStretchPrompt(limb, onComplete) {
    const isArm = limb.key === 'RIGHT_ARM' || limb.key === 'LEFT_ARM';
    if (isArm) {
      if (this.#isLimbDone('RIGHT_ARM') && this.#isLimbDone('LEFT_ARM')) {
        this.#setLimbPromptText(LIMB_PROMPT_TEXT.LEG_IDLE);
        this.#enableLegs();
        this.#character.playFeedback(STAGE3_STRETCH_LEGS_STEP, onComplete);
      } else {
        this.#setLimbPromptText(LIMB_PROMPT_TEXT.ARM_IDLE);
        this.#character.playFeedback(limb.key === 'RIGHT_ARM' ? STAGE3_STRETCH_LEFT_STEP : STAGE3_STRETCH_RIGHT_STEP, onComplete);
      }
      return;
    }
    // leg — nothing to prompt once both are done, #handleLevelComplete already fires below
    if (this.#isLimbDone('RIGHT_LEG') && this.#isLimbDone('LEFT_LEG')) {
      onComplete?.();
    } else {
      this.#setLimbPromptText(LIMB_PROMPT_TEXT.LEG_IDLE);
      this.#character.playFeedback(limb.key === 'RIGHT_LEG' ? STAGE3_STRETCH_LEFT_STEP : STAGE3_STRETCH_RIGHT_STEP, onComplete);
    }
  }

  #completeLimb(limb) {
    limb.isDone = true;
    limb.rectangleGO.setTint(LIMB_DONE_COLOR);
    this.time.delayedCall(this.#limbDoneTintDurationMs, () => {
      limb.rectangleGO.clearTint();
    });
    this.#stopGrabIndicatorPulse(limb);
    this.#grabbedLimb = null;
    this.#setOtherGrabIndicatorsVisible(limb, true);

    this.#limbsStretchedCount += 1;
    this.#progressTextGO.setText(`${this.#limbsStretchedCount} / ${this.#totalLimbsRequired}`);
    this.#setLimbPromptText('ΜΠΡΑΒΟ! Έρχεται η επόμενη διάταση…!');

    //this.#levelProgressBar.setProgress(this.#limbsStretchedCount / this.#totalLimbsRequired);

    if (this.#limbsStretchedCount >= this.#totalLimbsRequired) {
      this.#handleLevelComplete();
    } else {
      // Lock input for the reaction + next-stretch-prompt pair so a second
      // limb can't be grabbed mid-sequence; unlocked once both have played.
      this.#inputLocked = true;
      this.#character.playFeedback(Phaser.Utils.Array.GetRandom(STAGE3_LIMB_REACTION_STEPS), () => {
        this.#playNextStretchPrompt(limb, () => {
          this.#inputLocked = false;
        });
      });
    }
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

  //#endregion

  //#region Level Management

  #handleLevelComplete() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isLevelComplete = true;
    this.#stopAllTimersAndIndicators();

    // Frees the shared #rive-stage canvas — only one Rive instance can be on
    // it at a time, and #showCelebration needs it next.
    this.#character?.destroy();
    this.#character = null;
    this.#hideBodyAndLimbs();
    this.#limbPromptGO?.destroy();
    this.#limbPromptGO = null;

    this.events.emit('levelComplete', {
      limbsStretched: this.#limbsStretchedCount,
      secondsLeft: this.#remainingSeconds,
    });
    this.#levelProgressBar.setProgress(1/8);
    this.#showEndMessage('Μπράβο! Έκανες τέλεια διατάσεις! 🎉', '');
  }

  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;
    this.#stopAllTimersAndIndicators();

    this.#goToNextLevel();
    return;
    //not needed we go to next level
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

  //#endregion

  //#region Limb Prompt

  #createLimbPromptText() {
    const { width, height } = this.scale;
    this.#limbPromptGO = this.add
      .text(width / 2, height - 180, '', TEXT_STYLES.BREATH_PROMPT)
      .setOrigin(0.5);
    this.#resetLimbPromptText();
  }

  /** @param {string} text */
  #setLimbPromptText(text) {
    if (!this.#limbPromptGO) {
      return;
    }
    this.#limbPromptGO.setText(text);
  }

  /** Arms are grabbable until both are done, legs only after — matches #enableLegs. */
  #currentPhaseIdleText() {
    const legsEnabled = this.#limbs.find((limb) => limb.key === 'RIGHT_LEG')?.enabled;
    return legsEnabled ? LIMB_PROMPT_TEXT.LEG_IDLE : LIMB_PROMPT_TEXT.ARM_IDLE;
  }

  #resetLimbPromptText() {
    this.#setLimbPromptText(this.#currentPhaseIdleText());
  }

  /** @param {object} limb */
  #updateLimbPromptForGrab(limb) {
    const isArm = limb.key === 'RIGHT_ARM' || limb.key === 'LEFT_ARM';
    const word = isArm ? 'χεριού' : 'ποδιού';
    const completed = limb.totalTargets - limb.targetAnglesDeg.length;
    this.#setLimbPromptText(`Τέντωμα ${word} ${completed}/${limb.totalTargets}`);
  }

  //#endregion

  /** Hides the body + all 4 limb sprites so only the celebration character shows, not a headless body underneath it. */
  #hideBodyAndLimbs() {
    this.#bodyGO?.setVisible(false);
    this.#limbs.forEach((limb) => {
      limb.rectangleGO.setVisible(false);
    });
  }

  #showEndMessage(title, subtitle) {
    this.#showCelebration(() => this.#goToNextLevel());
  }

  /**
   * Post-gameplay celebration — same createAnimatedCharacter/clipIndex
   * pattern as the gameplay head, own character (RIVE_BEAR_Stg3) and own
   * CSS class/bubble spot. Body/limbs are already hidden by #hideBodyAndLimbs
   * (called from #handleLevelComplete) before this runs.
   */
  #showCelebration(onComplete) {
    this.#character = createAnimatedCharacter(this, STAGE3_BODY_CHARACTER_CONFIG, STAGE3_BODY_POSITION, () => {
      this.#character.setAnimationParam(0);
      this.time.delayedCall(100, () => {
        this.#character.playFeedback(STAGE3_CELEBRATION_STEP, () => {
          this.#character.destroy();
          onComplete();
        });
      });
    });
  }

  #handleShutdown() {
    this.input.off(Phaser.Input.Events.POINTER_DOWN, this.#handlePointerDown, this);
    this.input.off(Phaser.Input.Events.POINTER_MOVE, this.#handlePointerMove, this);
    this.input.off(Phaser.Input.Events.POINTER_UP, this.#handlePointerUp, this);
    this.input.off(Phaser.Input.Events.POINTER_UP_OUTSIDE, this.#handlePointerUp, this);
    this.#stopAllTimersAndIndicators();
    this.#hideIntroBackground();

    this.#character?.destroy();
  }

  #goToNextLevel() {
    // Already destroyed in #handleLevelComplete (freed the canvas for the celebration) on the win path — this covers the game-over path, which skips that.
    this.#character?.destroy();
    this.scene.start(SCENE_KEYS.EUZOYLIS_OUTRO_SCENE);
    //this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }

  //#endregion
}
