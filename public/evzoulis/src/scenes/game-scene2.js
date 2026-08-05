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
  [ASSET_KEYS.BUBBLE2]: { centerOffsetY: 0 },
  [ASSET_KEYS.BUBBLE3]: { centerOffsetY: 0 },
  [ASSET_KEYS.BUBBLE4]: { centerOffsetY: 0 },
};
const CLOUD_TEXTURE_KEYS = Object.keys(CLOUD_TEXTURE_CONFIG);
 
export class GameScene2 extends Phaser.Scene {
  #thoughtCloudList;
  #bubbles;
  #totalBubbles;
  #bubbleMargin;
  #bubbleDiameter;
  #bubbleSpacingPadding;
  #topSpawnExclusionY;
  #scatterCandidatesPerPoint;
  #burstFrameRate;
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
    // extra gap beyond two bubbles' own footprint radii just touching
    this.#bubbleSpacingPadding = 30;
    // real value is computed in create() from the actual bottom edge of
    // your top UI, once it exists — this is just a fallback before that
    this.#topSpawnExclusionY = 260;
    // how many local candidates each scattered point tries before giving
    // up and being retired from the active list — bounds the algorithm,
    // it can never loop forever regardless of how tight the space is
    this.#scatterCandidatesPerPoint = 30;
    // frames per second for the 2-frame burst — e.g. 8 = 125ms per frame
    this.#burstFrameRate = 14;
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
    // TODO: retune once the real bubble art is in — this is the WIDTH
    // every bubble is scaled to; each texture's actual HEIGHT (and its
    // real collision footprint) is measured separately per-texture below,
    // since your cloud art isn't necessarily square.
    this.#bubbleDiameter = Math.min(width, height) * 0.26;
 
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
 
    // Bubbles can't spawn above this Y — measured from the actual bottom
    // edge of your top UI (whichever is lower: the progress bar or the
    // text rows), so it stays correct automatically if you move/resize
    // either later. The + 30 is just a bit of extra breathing room.
    this.#topSpawnExclusionY = Math.max(this.#levelProgressBar.getBounds().bottom, this.#progressTextGO.getBounds().bottom) + 30;
 
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
      x: width / 2 + 50,
      y: 130,
      width: width * 0.5,
    });
  }
 
  /** Uniformly scales an image so its displayed width matches targetWidth, regardless of native texture size */
  #scaleImageToWidth(image, targetWidth) {
    const scale = targetWidth / image.width;
    image.setScale(scale);
    return scale;
  }
 
  /**
   * What a texture's on-screen size WOULD be once scaled to targetWidth —
   * read directly from the loaded texture's native dimensions, without
   * creating a GameObject just to measure one.
   */
  #getScaledTextureSize(textureKey, targetWidth) {
    const source = this.textures.get(textureKey).getSourceImage();
    const scale = targetWidth / source.width;
    return { width: targetWidth, height: source.height * scale };
  }
 
  /**
   * Poisson-disc scatter (Bridson's algorithm): organically distributes
   * points so no two are closer than minDist, without looking like a grid
   * and without the infinite-loop risk of "guess a random point across the
   * whole screen, reject if too close, repeat forever." Instead, new
   * candidates are only ever generated in a ring just outside an existing
   * point — so every candidate has a real shot at working — and each point
   * is retired after a bounded number of failed local attempts. The loop
   * below can only shrink the active list or grow the accepted list, both
   * of which are finite, so it always terminates.
   *
   * Uses a spatial grid internally purely to make "is anything already too
   * close to this candidate" fast to check — that's an implementation
   * detail for performance, not the uniform placement you didn't want;
   * the actual point positions it produces are organic, not grid-locked.
   */
  #generateScatterPoints(minDist, maxPointsNeeded) {
    const { width, height } = this.scale;
    const minX = this.#bubbleMargin;
    const maxX = width - this.#bubbleMargin;
    const minY = this.#topSpawnExclusionY;
    const maxY = height - this.#bubbleMargin;
 
    const cellSize = minDist;
    const gridCols = Math.max(1, Math.ceil((maxX - minX) / cellSize));
    const gridRows = Math.max(1, Math.ceil((maxY - minY) / cellSize));
    const grid = Array.from({ length: gridCols * gridRows }, () => []);
 
    const cellFor = (x, y) => ({
      col: Phaser.Math.Clamp(Math.floor((x - minX) / cellSize), 0, gridCols - 1),
      row: Phaser.Math.Clamp(Math.floor((y - minY) / cellSize), 0, gridRows - 1),
    });
 
    const isFarEnoughFromExisting = (x, y) => {
      const { col, row } = cellFor(x, y);
      for (let r = Math.max(0, row - 2); r <= Math.min(gridRows - 1, row + 2); r++) {
        for (let c = Math.max(0, col - 2); c <= Math.min(gridCols - 1, col + 2); c++) {
          const bucket = grid[r * gridCols + c];
          for (const point of bucket) {
            if (Phaser.Math.Distance.Between(point.x, point.y, x, y) < minDist) {
              return false;
            }
          }
        }
      }
      return true;
    };
 
    const points = [];
    const activeList = [];
 
    const acceptPoint = (point) => {
      const { col, row } = cellFor(point.x, point.y);
      grid[row * gridCols + col].push(point);
      points.push(point);
      activeList.push(point);
    };
 
    acceptPoint({
      x: Phaser.Math.Between(minX, maxX),
      y: Phaser.Math.Between(minY, maxY),
    });
 
    while (activeList.length > 0 && points.length < maxPointsNeeded) {
      const activeIndex = Phaser.Math.Between(0, activeList.length - 1);
      const origin = activeList[activeIndex];
      let placedCandidate = false;
 
      for (let attempt = 0; attempt < this.#scatterCandidatesPerPoint; attempt++) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
        const radius = Phaser.Math.FloatBetween(minDist, minDist * 2);
        const candidateX = origin.x + Math.cos(angle) * radius;
        const candidateY = origin.y + Math.sin(angle) * radius;
 
        if (candidateX < minX || candidateX > maxX || candidateY < minY || candidateY > maxY) {
          continue;
        }
        if (!isFarEnoughFromExisting(candidateX, candidateY)) {
          continue;
        }
 
        acceptPoint({ x: candidateX, y: candidateY });
        placedCandidate = true;
        break;
      }
 
      if (!placedCandidate) {
        activeList.splice(activeIndex, 1);
      }
    }
 
    return points;
  }
 
  /** Only used if there are literally more bubbles than scattered spots — see the warning in #spawnAllBubbles */
  #randomFallbackPosition(footprintRadius) {
    const { width, height } = this.scale;
    return {
      x: Phaser.Math.Between(this.#bubbleMargin + footprintRadius, width - this.#bubbleMargin - footprintRadius),
      y: Phaser.Math.Between(this.#topSpawnExclusionY + footprintRadius, height - this.#bubbleMargin - footprintRadius),
    };
  }
 
  /**
   * Spawns exactly one bubble per THOUGHT_CLOUD_LIST entry, all at once,
   * with no overlaps. Texture is picked here (not inside #createBubble)
   * because minDist for the scatter needs the worst-case footprint across
   * all 4 textures before any placement happens.
   */
  #spawnAllBubbles() {
    const maxFootprintRadius = Math.max(
      ...CLOUD_TEXTURE_KEYS.map((key) => {
        const size = this.#getScaledTextureSize(key, this.#bubbleDiameter);
        return Math.max(size.width, size.height) / 2;
      }),
    );
    const minDist = maxFootprintRadius * 2 + this.#bubbleSpacingPadding;
 
    const scatterPoints = Phaser.Utils.Array.Shuffle(
      this.#generateScatterPoints(minDist, this.#thoughtCloudList.length),
    );
 
    if (scatterPoints.length < this.#thoughtCloudList.length) {
      console.warn(
        `Only found ${scatterPoints.length} non-overlapping scattered spots for ${this.#thoughtCloudList.length} bubbles at the current bubbleDiameter (${Math.round(this.#bubbleDiameter)}px). The remaining ${this.#thoughtCloudList.length - scatterPoints.length} WILL overlap — reduce #bubbleDiameter, shrink #bubbleSpacingPadding, or trim THOUGHT_CLOUD_LIST.`,
      );
    }
 
    this.#thoughtCloudList.forEach((thoughtData, index) => {
      const textureKey = Phaser.Utils.Array.GetRandom(CLOUD_TEXTURE_KEYS);
      const displaySize = this.#getScaledTextureSize(textureKey, this.#bubbleDiameter);
      const footprintRadius = Math.max(displaySize.width, displaySize.height) / 2;
 
      const position = scatterPoints[index] ?? this.#randomFallbackPosition(footprintRadius);
      this.#createBubble(position.x, position.y, thoughtData, textureKey, footprintRadius);
    });
  }
 
  #createBubble(x, y, thoughtData, textureKey, footprintRadius) {
    // Sprite, not Image — needed so #playBurstAnimation can call .play()
    // on it later; Image doesn't have an animation controller.
    const bubbleImage = this.add.sprite(0, 0, textureKey).setOrigin(0.5);
    this.#scaleImageToWidth(bubbleImage, this.#bubbleDiameter);
 
    // Text is centered on this texture's own adjusted center point, not
    // anchored to the top — see CLOUD_TEXTURE_CONFIG at the top of the file.
    const centerOffsetY = CLOUD_TEXTURE_CONFIG[textureKey].centerOffsetY;
    const bubbleText = this.add.text(0, centerOffsetY, thoughtData.bad, TEXT_STYLES.BUBBLE).setOrigin(0.5);
 
    const bubbleContainer = this.add.container(x, y, [bubbleImage, bubbleText]).setScale(0);
 
    // Hit area uses the same real footprint as the collision check above —
    // otherwise a texture taller than it is wide would have a visually
    // present but unclickable dead zone past the old width-only circle.
    bubbleContainer.setSize(footprintRadius * 2, footprintRadius * 2);
    bubbleContainer.setInteractive(
      new Phaser.Geom.Circle(footprintRadius, footprintRadius, footprintRadius),
      Phaser.Geom.Circle.Contains,
    );
 
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
 
    bubbleData.text.setStyle(TEXT_STYLES.SPEECH_BUBBLE_POPPED);
    bubbleData.text.setText(bubbleData.thoughtData.good);
 
    // ADD BUBBLE POP AUDIO
 
    this.#playBurstAnimation(bubbleData.image);
 
    this.#poppedCount += 1;
    this.#progressTextGO.setText(`${this.#poppedCount} / ${this.#totalBubbles}`);
    //this.#levelProgressBar.setProgress(this.#poppedCount / this.#totalBubbles);
 
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

    this.#levelProgressBar.setProgress(1 / 3);
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
