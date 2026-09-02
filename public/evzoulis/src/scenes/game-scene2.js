import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { THOUGHT_CLOUD_LIST } from '../common/thought-cloud-data.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';
import { createAnimatedCharacter } from '../common/level-flow.js';
import { playBadMoveFeedback, playBubblePopSound } from '../common/audio-manager.js';


// Stage 2's one persistent character — same rive file as Stage 1, for testing
const STAGE2_CHARACTER_CONFIG = {
  riveAssetKey: ASSET_KEYS.RIVE_BEAR_Stg2,
  stateMachineName: 'Euzoulis_StateMachine',
  animParamName: 'clipIndex',
  idleParam: 0,
};

// Three spots — intro, gameplay, outro — each independently adjustable.
// bubbleX/Y are plain absolute scene coordinates, not computed from anything.
const STAGE2_POSITION_INTRO = { cssClass: 'rive-stage--stg1-character-intro', bubbleScale: 0.35, bubbleX: 300, bubbleY: 800, textStyle: TEXT_STYLES.SPEECH_BUBBLE };
const STAGE2_POSITION_GAMEPLAY = { cssClass: 'rive-stage--stg2-character-gameplay', bubbleScale: 0.26, bubbleX: 650, bubbleY: 1650, textStyle: TEXT_STYLES.SPEECH_BUBBLE_SMALL };
const STAGE2_POSITION_OUTRO = { cssClass: 'rive-stage--stg2-character-gameplay', bubbleScale: 0.26, bubbleX: 650, bubbleY: 1650, textStyle: TEXT_STYLES.SPEECH_BUBBLE_SMALL };

// animationParam: 1=intro (same value both lines for now, adjust freely)
const STAGE2_INTRO_STEPS = [
  { animationParam: 19, audioKey: ASSET_KEYS.EZ_18, durationSeconds: 7, text: 'ΣΤΑΔΙΟ 2 — Οι δύσκολες σκέψεις' },
];
// Played once gameplay has started and the bubbles are already on screen, on the scaled-down gameplay character — not during the intro card.
const STAGE2_GAMEPLAY_HINT_STEP = { animationParam: 20, audioKey: ASSET_KEYS.EZ_19, durationSeconds: 4, text: 'Άγγιξε τα γκρίζα συννεφάκια με τις δύσκολες σκέψεις.' };
const STAGE2_OUTRO_STEPS = [
  { animationParam: 29, audioKey: ASSET_KEYS.EZ_28, durationSeconds: 8, text: 'Οι δύσκολες σκέψεις έγιναν πιο ελαφριές!' },
];
// Fixed clip played instead of a random good-move pick at STAGE2_MILESTONE_POP_COUNT pops (6/8)
const STAGE2_MILESTONE_POP_COUNT = 6;
const STAGE2_MILESTONE_STEP = { animationParam: 28, audioKey: ASSET_KEYS.EZ_27, durationSeconds: 4, text: 'Ποπς: 6 / 8' };
// Good-move feedback: same text/audio as before, animationParam borrowed from Stage 1's good-move clips (11/12/13)
const STAGE2_GOOD_MOVE_STEPS = [
  { animationParam: 21, audioKey: ASSET_KEYS.EZ_20, durationSeconds: 3 },
  { animationParam: 22, audioKey: ASSET_KEYS.EZ_21, durationSeconds: 5 },
  { animationParam: 23, audioKey: ASSET_KEYS.EZ_22, durationSeconds: 3 },
];

// Extra guide clip chained AFTER the normal good-move feedback, only for the
// 3 THOUGHT_CLOUD_LIST entries these clips were written for (by list index).
// Text is that same entry's own "good" line. Input stays locked through both.
const STAGE2_SPECIAL_THOUGHT_STEPS = {
  0: { animationParam: 1, audioKey: ASSET_KEYS.EZ_23, durationSeconds: 3, text: THOUGHT_CLOUD_LIST[0].good },
  1: { animationParam: 1, audioKey: ASSET_KEYS.EZ_24, durationSeconds: 3, text: THOUGHT_CLOUD_LIST[1].good },
  2: { animationParam: 1, audioKey: ASSET_KEYS.EZ_25, durationSeconds: 3, text: THOUGHT_CLOUD_LIST[2].good },
};

const BUBBLE_STATE = {
  BAD: 'BAD',
  POPPED: 'POPPED',
};

const BUBBLE_BURST_ANIM_KEY = 'bubbleBurst';

// TODO: add BUBBLE2/BUBBLE3/BUBBLE4 to assets.js — BUBBLE1 already exists.
// One of these is picked at random per bubble in #spawnAllBubbles.
// centerOffsetY moves where the TEXT is centered, relative to the image's
// own geometric center (negative = up, positive = down) — independent per
// texture, since each one's actual cloud mass sits differently within its
// mostly-transparent canvas. 0 = dead center of the whole image, which is
// probably too low given the mass is concentrated toward the top — start
// tuning from a negative number and adjust per texture from there.
const CLOUD_TEXTURE_CONFIG = {
  [ASSET_KEYS.BUBBLE1]: { centerOffsetY: 0 },
  [ASSET_KEYS.BUBBLE2]: { centerOffsetY: -20 },
  [ASSET_KEYS.BUBBLE3]: { centerOffsetY: -20 },
  [ASSET_KEYS.BUBBLE4]: { centerOffsetY: -20 },
};
const CLOUD_TEXTURE_KEYS = Object.keys(CLOUD_TEXTURE_CONFIG);

// Native pixel size of the biggest cloud image, used to keep bubbles from overlapping.
const BUBBLE_MAX_NATIVE_WIDTH = 820;
const BUBBLE_MAX_NATIVE_HEIGHT = 820;

export class GameScene2 extends Phaser.Scene {
  //CLOUDS
  #thoughtCloudList;
  #bubbles;
  #totalBubbles;
  #bubbleMargin;
  #bubbleDiameter;
  #bubbleSpacingPadding;
  #topSpawnExclusionY;
  #bottomSpawnExclusionHeight;
  #burstFrameRate;

  //CHARACTER
  #character;
  #introBg;
  #introLogo;

  //GAMEPLAY
  #gameDurationSeconds;
  #scorePerSecond;
  #poppedCount;
  #score;
  #inputLocked;
  #debug;

  //TIMER
  #remainingSeconds;
  #timerTextGO;
  #countdownTimerEvent;

  //PROGRESS BAR
  #levelProgressBar;

  //STATS
  #scoreTextGO;
  #progressTextGO;

  //LEVEL MANAGEMENT
  #isLevelComplete;
  #isGameOver;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE2,
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
    this.#thoughtCloudList = THOUGHT_CLOUD_LIST;
    this.#totalBubbles = THOUGHT_CLOUD_LIST.length;
    this.#bubbles = [];
    this.#bubbleMargin = 140;
    // extra gap beyond two bubbles' own footprint radii just touching.
    // Bubbles render ~280px wide (bubbleDiameter, computed in #startLevel),
    // so the +20 I tried before (30->50) was only ~7% of that — too subtle
    // to read as "more space". Bumped further; still just one number to tune.
    this.#bubbleSpacingPadding = 100;
    // real value is computed in create() from the actual bottom edge of
    // your top UI, once it exists — this is just a fallback before that
    this.#topSpawnExclusionY = 550;
    // real value is computed in #startLevel() from the screen height, so
    // clouds never spawn low enough to sit behind the guide character —
    // see --char-guide-scale in style.css if this ever needs retuning
    this.#bottomSpawnExclusionHeight = 0;
    // frames per second for the 2-frame burst — e.g. 8 = 125ms per frame
    this.#burstFrameRate = 14;
    this.#gameDurationSeconds = 60;
    this.#scorePerSecond = 10;
    this.#poppedCount = 0;
    this.#score = 0;
    this.#inputLocked = false;
    this.#remainingSeconds = this.#gameDurationSeconds;
    this.#isLevelComplete = false;
    this.#isGameOver = false;
    // logs pop events + overlap-placement fallbacks — flip to false once tuned
    this.#debug = true;
  }

  preload() {
    console.log('preload called');
  }

  create() {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.#handleShutdown, this);
    this.#showIntroBackground();
    // Rive loads asynchronously — wait for onReady before setting any animation param
    this.#character = createAnimatedCharacter(this, STAGE2_CHARACTER_CONFIG, STAGE2_POSITION_INTRO, () => {
      this.#character.setAnimationParam(0);
      this.time.delayedCall(100, () => {
        this.#character.playSequence(STAGE2_INTRO_STEPS, () => {
          this.#hideIntroBackground();
          this.#character.moveTo(STAGE2_POSITION_GAMEPLAY);
          this.#startLevel();
        });
      });
    });
  }

  #showIntroBackground() {
    const { width, height } = this.scale;
    this.#introBg = this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
    this.#introLogo = this.add.image(width / 2, height * 0.2, ASSET_KEYS.STAGE2_LOGO).setDepth(1001).setScale(0.55);
  }

  #hideIntroBackground() {
    this.#introBg?.destroy();
    this.#introLogo?.destroy();
    this.#introBg = null;
    this.#introLogo = null;
  }

  #handleShutdown() {
    this.#hideIntroBackground();
    this.#character?.destroy();
  }

  #startLevel() {
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg2);

    this.#bubbles = [];
    // TODO: retune once the real bubble art is in — this is the WIDTH
    // every bubble is scaled to; each texture's actual HEIGHT (and its
    // real collision footprint) is measured separately per-texture below,
    // since your cloud art isn't necessarily square.
    this.#bubbleDiameter = Math.min(width, height) * 0.26;

    //Progressbar
    this.#createLevelProgressBar();
    this.#levelProgressBar.setProgress(5.6 / 8);
    //Game stats
    const labelsTop = this.#levelProgressBar.getBounds().bottom + 60;

    // const scoreTextLabel = this.add.text(10, labelsTop, 'Σκορ:', TEXT_STYLES.DEFAULT);
    // this.#scoreTextGO = this.add.text(
    //   scoreTextLabel.x + scoreTextLabel.width,
    //   labelsTop,
    //   `${this.#score}`,
    //   TEXT_STYLES.DEFAULT,
    // );

    const progressTextLabel = this.add.text(10, labelsTop + 50, 'Pops:', TEXT_STYLES.DEFAULT);
    this.#progressTextGO = this.add.text(
      progressTextLabel.x + progressTextLabel.width,
      labelsTop + 50,
      `0 / ${this.#totalBubbles}`,
      TEXT_STYLES.DEFAULT,
    ).setDepth(1);

    const timerTextLabel = this.add.text(10, labelsTop , 'Χρόνος:', TEXT_STYLES.DEFAULT);
    this.#timerTextGO = this.add.text(
      timerTextLabel.x + timerTextLabel.width,
      labelsTop ,
      `${this.#remainingSeconds}`,
      TEXT_STYLES.DEFAULT,
    ).setDepth(1);

    //timer start
    this.#countdownTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.#tickCountdown,
      callbackScope: this,
      loop: true,
    });

    // Bubbles can't spawn above this Y — measured from the actual bottom
    // edge of your top UI (whichever is lower: the progress bar or the
    // text rows), so it stays correct automatically if you move/resize
    // either later. The + 30 is just a bit of extra breathing room.
    this.#topSpawnExclusionY = Math.max(this.#levelProgressBar.getBounds().bottom, this.#progressTextGO.getBounds().bottom) + 30;

    // Reserve room at the bottom for the guide character + speech bubble so
    // clouds never spawn behind it — rough fraction of screen height; tune
    // this fraction as you go.
    this.#bottomSpawnExclusionHeight = height * 0.15;

    this.#spawnAllBubbles();

    // playFeedback sets idle(0) when this clip ends; switching straight to 21 right after instead.
    this.#character.playFeedback(STAGE2_GAMEPLAY_HINT_STEP, () => {
      this.#character.setAnimationParam(21);
      // TEST: check if idle(0) is broken when reached from 21, 1s later, no audio/text.
      this.time.delayedCall(1000, () => this.#character.setAnimationParam(0));
    });
  }

  update(time, delta) {
    // No continuous per-frame movement in this game — the countdown is a
    // Timer Event and everything else is pointer-driven. Left here so the
    // Scene lifecycle stays complete and consistent with the rest of the
    // project.
  }

  //#endregion

  //#region Clouds

  /**
   * Spawns exactly one bubble per THOUGHT_CLOUD_LIST entry, all at once,
   * with no overlaps — guaranteed, not probabilistic. The spawn area is cut
   * into a grid of cells, each big enough to hold one bubble at its
   * worst-case size (BUBBLE_MAX_NATIVE_WIDTH/HEIGHT, scaled like every
   * bubble is). Cells are shuffled so bubbles don't land in list order, and
   * each bubble gets a random jittered spot inside its own cell — since
   * cells never touch, bubbles from different cells never can either.
   */
  #spawnAllBubbles() {
    const { width, height } = this.scale;

    const scale = this.#bubbleDiameter / BUBBLE_MAX_NATIVE_WIDTH;
    const bubbleMaxWidth = BUBBLE_MAX_NATIVE_WIDTH * scale;
    const bubbleMaxHeight = BUBBLE_MAX_NATIVE_HEIGHT * scale;
    const cellWidth = bubbleMaxWidth + this.#bubbleSpacingPadding;
    const cellHeight = bubbleMaxHeight + this.#bubbleSpacingPadding;

    const areaWidth = width - this.#bubbleMargin * 2;
    const areaHeight = height - this.#topSpawnExclusionY - this.#bubbleMargin - this.#bottomSpawnExclusionHeight;

    const cols = Math.max(1, Math.floor(areaWidth / cellWidth));
    const rows = Math.max(1, Math.ceil(this.#thoughtCloudList.length / cols));

    const actualCellWidth = areaWidth / cols;
    const actualCellHeight = areaHeight / rows;

    if (cols * rows < this.#thoughtCloudList.length || actualCellHeight < cellHeight) {
      console.warn(`Only room for ${cols * rows} non-overlapping bubbles, need ${this.#thoughtCloudList.length} — reduce #bubbleDiameter or trim THOUGHT_CLOUD_LIST.`);
    }

    const slots = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        slots.push({ col, row });
      }
    }
    Phaser.Utils.Array.Shuffle(slots);

    this.#thoughtCloudList.forEach((thoughtData, index) => {
      const textureKey = Phaser.Utils.Array.GetRandom(CLOUD_TEXTURE_KEYS);
      const slot = slots[index];

      const cellLeft = this.#bubbleMargin + slot.col * actualCellWidth;
      const cellTop = this.#topSpawnExclusionY + slot.row * actualCellHeight;
      const jitterX = Math.max(0, actualCellWidth - bubbleMaxWidth);
      const jitterY = Math.max(0, actualCellHeight - bubbleMaxHeight);

      const x = cellLeft + bubbleMaxWidth / 2 + Phaser.Math.FloatBetween(0, jitterX);
      const y = cellTop + bubbleMaxHeight / 2 + Phaser.Math.FloatBetween(0, jitterY);

      this.#createBubble(x, y, thoughtData, textureKey, index);
    });
  }

  #createBubble(x, y, thoughtData, textureKey, thoughtIndex) {
    // Sprite, not Image — needed so #playBurstAnimation can call .play()
    // on it later; Image doesn't have an animation controller.
    const bubbleImage = this.add.sprite(0, 0, textureKey).setOrigin(0.5);
    this.#scaleImageToWidth(bubbleImage, this.#bubbleDiameter);

    // Text is centered on this texture's own adjusted center point, not
    // anchored to the top — see CLOUD_TEXTURE_CONFIG at the top of the file.
    const centerOffsetY = CLOUD_TEXTURE_CONFIG[textureKey].centerOffsetY;
    const bubbleText = this.add.text(0, centerOffsetY, thoughtData.bad, TEXT_STYLES.BUBBLE).setOrigin(0.5);

    const bubbleContainer = this.add.container(x, y, [bubbleImage, bubbleText]).setScale(0);

    // Hit area matches this bubble's own real rendered size, not the
    // worst-case size used for spacing — otherwise a texture smaller than
    // the worst case would have a hit circle bigger than what's drawn.
    const hitRadius = Math.max(bubbleImage.displayWidth, bubbleImage.displayHeight) / 2;
    bubbleContainer.setSize(hitRadius * 2, hitRadius * 2);
    bubbleContainer.setInteractive(
      new Phaser.Geom.Circle(hitRadius, hitRadius, hitRadius),
      Phaser.Geom.Circle.Contains,
    );

    const bubbleData = {
      container: bubbleContainer,
      image: bubbleImage,
      text: bubbleText,
      thoughtData,
      thoughtIndex,
      state: BUBBLE_STATE.BAD,
    };

    bubbleContainer.on(Phaser.Input.Events.POINTER_DOWN, () => this.#popBubble(bubbleData));

    this.tweens.add({
      targets: bubbleContainer,
      scale: 1,
      duration: 180,
      ease: 'Back.easeOut',
    });

    this.#bubbles.push(bubbleData);
  }

  /**
   * Two-frame burst "flipbook": BUBBLE_POPPED then BUBBLE_POPPED1, then the
   * sprite is destroyed, leaving only the good-message text behind. Uses
   * Phaser's Animation system rather than manual setTexture +
   * delayedCall — same technique as the intro scene's wobbling cloud, just
   * with repeat: 0 so it plays once instead of looping.
   */
  #playBurstAnimation(sprite) {
    if (!this.anims.exists(BUBBLE_BURST_ANIM_KEY)) {
      this.anims.create({
        key: BUBBLE_BURST_ANIM_KEY,
        frames: [{ key: ASSET_KEYS.BUBBLE_POPPED }, { key: ASSET_KEYS.BUBBLE_POPPED1 }],
        frameRate: this.#burstFrameRate,
        repeat: 0,
      });
    }

    sprite.play(BUBBLE_BURST_ANIM_KEY);
    sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      sprite.destroy();
    });
  }

  #popBubble(bubbleData) {
    if (bubbleData.state !== BUBBLE_STATE.BAD) {
      return;
    }
    bubbleData.state = BUBBLE_STATE.POPPED;
    bubbleData.container.disableInteractive();

    bubbleData.text.setStyle(TEXT_STYLES.BUBBLE_POPPED);
    bubbleData.text.setText(bubbleData.thoughtData.good);

    playBubblePopSound(this);

    this.#playBurstAnimation(bubbleData.image);

    this.#poppedCount += 1;
    this.#progressTextGO.setText(`${this.#poppedCount} / ${this.#totalBubbles}`);
    //this.#levelProgressBar.setProgress(this.#poppedCount / this.#totalBubbles);

    if (this.#debug) {
      console.log(`bubble popped (${this.#poppedCount}/${this.#totalBubbles})`);
    }

    if (this.#poppedCount >= this.#totalBubbles) {
      this.#handleLevelComplete();
      return;
    }
    // No input lock — bubbles can be popped as fast as the player wants. Each
    // pop's playFeedback call naturally interrupts whatever the previous one
    // was doing (level-flow.js's own "most recent call wins" behavior), so
    // only one clip is ever audible at a time instead of queuing up.
    const specialThoughtStep = STAGE2_SPECIAL_THOUGHT_STEPS[bubbleData.thoughtIndex];
    if (specialThoughtStep) {
      // These 3 play ONLY their own audio+animation+bubble — no good-move/milestone feedback before them.
      this.#character.playFeedback(specialThoughtStep);
    } else if (this.#poppedCount === STAGE2_MILESTONE_POP_COUNT) {
      this.#character.playFeedback(STAGE2_MILESTONE_STEP);
    } else {
      this.#character.playFeedback(Phaser.Utils.Array.GetRandom(STAGE2_GOOD_MOVE_STEPS));
    }
  }

  /** Only called on game-over — level-complete means every bubble is already popped */
  #clearUnpoppedBubbles() {
    this.#bubbles.forEach((bubbleData) => {
      if (bubbleData.state === BUBBLE_STATE.BAD) {
        bubbleData.container.destroy();
      }
    });
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

  #stopTimers() {
    if (this.#countdownTimerEvent) {
      this.#countdownTimerEvent.remove();
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
      width: width * 0.5,
    });
  }

  //#endregion

  //#region Level Management

  #handleLevelComplete() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isLevelComplete = true;

    // this.#score = this.#remainingSeconds * this.#scorePerSecond;
    // this.#scoreTextGO.setText(`${this.#score}`);

    // this.events.emit('levelComplete', {
    //   score: this.#score,
    //   poppedCount: this.#poppedCount,
    //   secondsLeft: this.#remainingSeconds,
    // });
    this.#levelProgressBar.setProgress(3.3 / 8);
    this.#endLevel('Μπράβο! Τα κατάφερες! 🎉', true);
  }

  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;
    this.#clearUnpoppedBubbles();

    this.events.emit('gameOver', {
      poppedCount: this.#poppedCount,
    });

    this.#endLevel('Ο χρόνος τελείωσε\nΔοκίμασε ξανά!', false);
  }

  /**
   * Shared success/game-over sequence.
   * @param {string} message
   * @param {boolean} isSuccess
   */
  #endLevel(message, isSuccess) {
    this.#stopTimers();

    // message/isSuccess aren't used yet — STAGE2_OUTRO_STEPS is one fixed
    // sequence for now; a win/lose distinction can branch this later.
    this.#character.moveTo(STAGE2_POSITION_OUTRO);
    this.#character.playSequence(STAGE2_OUTRO_STEPS, () => this.#goToNextLevel());
  }

  #goToNextLevel() {
    this.#character.destroy();
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE3);
    //this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }

  //#endregion

  //#region Utils

  /** Uniformly scales an image so its displayed width matches targetWidth, regardless of native texture size */
  #scaleImageToWidth(image, targetWidth) {
    const scale = targetWidth / image.width;
    image.setScale(scale);
    return scale;
  }

  //#endregion
}
