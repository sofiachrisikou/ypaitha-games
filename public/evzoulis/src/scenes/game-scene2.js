import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import { ASSET_KEYS } from '../common/assets.js';
import { THOUGHT_CLOUD_LIST } from '../common/thought-cloud-data.js';
import { ProgressBar } from '../common/progress-bar.js';
import { TEXT_STYLES } from '../common/sharedGameSettings.js';

// const textStyleConfig = {
//   fontSize: '40px',
//   color: '#043D8C',
//   stroke: '#ffffff',
//   strokeThickness: 6,
// };

// const bubbleTextStyleConfig = {
//   fontSize: '30px',
//   color: '#000000',
//   align: 'center',
//   wordWrap: { width: 220, useAdvancedWrap: true },
// };

// const bubblePoppedTextStyleConfig = {
//   fontSize: '30px',
//   color: '#2EB000',
//   align: 'center',
//   wordWrap: { width: 220, useAdvancedWrap: true },
// };

const BUBBLE_STATE = {
  BAD: 'BAD',
  POPPED: 'POPPED',
};

export class GameScene2 extends Phaser.Scene {
  #thoughtCloudList;
  #bubbles;
  #totalBubbles;
  #bubbleMargin;
  #bubbleDiameter;
  #minBubbleSpacing;
  #maxPlacementAttempts;
  #gameDurationSeconds;
  #scorePerSecond;
  #poppedCount;
  #score;
  #remainingSeconds;
  #isLevelComplete;
  #isGameOver;
  #countdownTimerEvent;
  #scoreTextGO;
  #timerTextGO;
  #progressTextGO;
  #levelProgressBar;
  #nextlevelBtnGO;
  #debug;

  constructor() {
    super({
      key: SCENE_KEYS.EUZOYLIS_GAME_SCENE2,
    });
  }

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
    this.#maxPlacementAttempts = 200;
    this.#gameDurationSeconds = 60;
    this.#scorePerSecond = 10;
    this.#poppedCount = 0;
    this.#score = 0;
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
    const { width, height } = this.scale;

    this.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_Stg2);

    this.#bubbles = [];
    // TODO: retune once the real bubble art is in — this drives both the
    // on-screen size and the overlap-avoidance spacing below
    this.#bubbleDiameter = Math.min(width, height) * 0.16;
    this.#minBubbleSpacing = this.#bubbleDiameter + 40;

    this.#createLevelProgressBar();

    const labelsTop = this.#levelProgressBar.getBounds().bottom + 20;

    const scoreTextLabel = this.add.text(10, labelsTop, 'Σκορ:', TEXT_STYLES.DEFAULT);
    this.#scoreTextGO = this.add.text(
      scoreTextLabel.x + scoreTextLabel.width,
      labelsTop,
      `${this.#score}`,
      TEXT_STYLES.DEFAULT,
    );

    const timerTextLabel = this.add.text(10, labelsTop + 40, 'Χρόνος:', TEXT_STYLES.DEFAULT);
    this.#timerTextGO = this.add.text(
      timerTextLabel.x + timerTextLabel.width,
      labelsTop + 40,
      `${this.#remainingSeconds}`,
      TEXT_STYLES.DEFAULT,
    );

    const progressTextLabel = this.add.text(10, labelsTop + 80, 'Pops:', TEXT_STYLES.DEFAULT);
    this.#progressTextGO = this.add.text(
      progressTextLabel.x + progressTextLabel.width,
      labelsTop + 80,
      `0 / ${this.#totalBubbles}`,
      TEXT_STYLES.DEFAULT,
    );

    this.#countdownTimerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.#tickCountdown,
      callbackScope: this,
      loop: true,
    });

    this.#spawnAllBubbles();
  }

  update(time, delta) {
    // No continuous per-frame movement in this game — the countdown is a
    // Timer Event and everything else is pointer-driven. Left here so the
    // Scene lifecycle stays complete and consistent with the rest of the
    // project.
  }

  /**
   * Shared top-center level-progress bar (src/common/progress-bar.js), built
   * from ASSET_KEYS.PROGRESSBAR_BG (track) + ASSET_KEYS.PROGRESSBAR_FG (fill).
   */
  #createLevelProgressBar() {
    const { width } = this.scale;
    this.#levelProgressBar = new ProgressBar(this, {
      x: width / 2,
      y: 70,
      width: width * 0.86,
    });
  }

  /** Uniformly scales an image so its displayed width matches targetWidth, regardless of native texture size */
  #scaleImageToWidth(image, targetWidth) {
    const scale = targetWidth / image.width;
    image.setScale(scale);
    return scale;
  }

  /** Spawns exactly one bubble per THOUGHT_CLOUD_LIST entry, all at once, with no overlaps */
  #spawnAllBubbles() {
    const placedPositions = [];

    this.#thoughtCloudList.forEach((thoughtData) => {
      const position = this.#findNonOverlappingPosition(placedPositions);
      placedPositions.push(position);
      this.#createBubble(position.x, position.y, thoughtData);
    });
  }

  #findNonOverlappingPosition(placedPositions) {
    const { width, height } = this.scale;

    let fallbackPosition = null;

    for (let attempt = 0; attempt < this.#maxPlacementAttempts; attempt++) {
      const x = Phaser.Math.Between(this.#bubbleMargin, width - this.#bubbleMargin);
      const y = Phaser.Math.Between(this.#bubbleMargin + 120, height - this.#bubbleMargin);

      const overlaps = placedPositions.some(
        (position) => Phaser.Math.Distance.Between(position.x, position.y, x, y) < this.#minBubbleSpacing,
      );

      if (!overlaps) {
        return { x, y };
      }
      fallbackPosition = { x, y };
    }

    // Couldn't find a fully clear spot in time (likely too many bubbles for
    // the screen at this size) — place it anyway rather than silently
    // spawning fewer bubbles than the list has, which would make the level
    // uncompletable.
    if (this.#debug) {
      console.warn('Could not find a non-overlapping bubble spot after max attempts — placing anyway.');
    }
    return fallbackPosition;
  }

  #createBubble(x, y, thoughtData) {
    // TODO: swap ASSET_KEYS.BUBBLE for your real texture key
    const bubbleImage = this.add.image(0, 0, ASSET_KEYS.BUBBLE).setOrigin(0.5);
    this.#scaleImageToWidth(bubbleImage, this.#bubbleDiameter);

    const bubbleText = this.add.text(0, 0, thoughtData.bad, TEXT_STYLES.BUBBLE).setOrigin(0.5);
    const bubbleContainer = this.add.container(x, y, [bubbleImage, bubbleText]).setScale(0);

    const radius = this.#bubbleDiameter / 2;
    bubbleContainer.setSize(radius * 2, radius * 2);
    bubbleContainer.setInteractive(new Phaser.Geom.Circle(radius, radius, radius), Phaser.Geom.Circle.Contains);

    const bubbleData = {
      container: bubbleContainer,
      image: bubbleImage,
      text: bubbleText,
      thoughtData,
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

  #popBubble(bubbleData) {
    if (bubbleData.state !== BUBBLE_STATE.BAD) {
      return;
    }
    bubbleData.state = BUBBLE_STATE.POPPED;
    bubbleData.container.disableInteractive();

    bubbleData.text.setStyle(TEXT_STYLES.SPEECH_BUBBLE_POPPED);

    bubbleData.text.setText(bubbleData.thoughtData.good);

    // ADD BUBBLE POP AUDIO

    bubbleData.image.setTexture(ASSET_KEYS.BUBBLE_POPPED);

    this.tweens.add({
      targets: bubbleData.image,
      scale: 0,
      alpha: 0,
      duration: 180,
      ease: 'Back.easeIn',
      onComplete: () => {
        bubbleData.image.destroy();
      },
    });

    this.#poppedCount += 1;
    this.#progressTextGO.setText(`${this.#poppedCount} / ${this.#totalBubbles}`);
    this.#levelProgressBar.setProgress(this.#poppedCount / this.#totalBubbles);

    if (this.#debug) {
      console.log(`bubble popped (${this.#poppedCount}/${this.#totalBubbles})`);
    }

    if (this.#poppedCount >= this.#totalBubbles) {
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
    this.#stopTimers();

    this.#score = this.#remainingSeconds * this.#scorePerSecond;
    this.#scoreTextGO.setText(`${this.#score}`);

    this.events.emit('levelComplete', {
      score: this.#score,
      poppedCount: this.#poppedCount,
      secondsLeft: this.#remainingSeconds,
    });

    this.#showEndMessage('Μπράβο! Τα κατάφερες! 🎉', `Σκορ: ${this.#score}`);
  }

  #handleGameOver() {
    if (this.#isLevelComplete || this.#isGameOver) {
      return;
    }
    this.#isGameOver = true;
    this.#stopTimers();
    this.#clearUnpoppedBubbles();

    this.events.emit('gameOver', {
      poppedCount: this.#poppedCount,
    });

    this.#showEndMessage('Ο χρόνος τελείωσε', 'Δοκίμασε ξανά!');
  }

  #stopTimers() {
    if (this.#countdownTimerEvent) {
      this.#countdownTimerEvent.remove();
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

  #showEndMessage(title, subtitle) {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);
    this.add.text(width / 2, height / 2 - 60, title, TEXT_STYLES.DEFAULT).setOrigin(0.5);
    this.add.text(width / 2, height / 2 + 40, subtitle, TEXT_STYLES.DEFAULT).setOrigin(0.5);

    const helloButton = this.add.text(width / 2, height / 2 + 140, 'Επόμενο Επίπεδο', TEXT_STYLES.DEFAULT).setOrigin(0.5);
    helloButton.setInteractive();
    helloButton.on('pointerdown', () => this.#goToNextLevel());
    return;
    this.#nextlevelBtnGO = this.add
      .image(500, 500, ASSET_KEYS.BTN1)
      .setScale(0.5)
      .setInteractive({ useHandCursor: true });
    this.#nextlevelBtnGO.on(Phaser.Input.Events.POINTER_DOWN, this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE3), this);
  }

  #goToNextLevel() {
    this.scene.start(SCENE_KEYS.EUZOYLIS_GAME_SCENE3);
    this.input.once(Phaser.Input.Events.POINTER_DOWN, () => {});
  }
}
