import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';
import { TEXT_STYLES } from './sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, BEAR_RIVE_MAX_DPR, getRiveAnchorScenePosition } from './rive-stage.js';
import { playLevelSuccessFeedback, playLevelGameOverFeedback } from './audio-manager.js';
import { CHARACTER_LINES } from './character-lines.js';

/* ============================================================
   SPEECH BUBBLE CONTROLS (level intro + stage outro) — the only numbers
   you should need to touch to move/resize the bubble relative to the
   character. Both showLevelIntroWithVoiceover and showCelebrationSequence
   read these same 3 numbers, so they stay in sync automatically — the
   bubble's position is computed FROM the character's real on-screen
   position (getRiveAnchorScenePosition in rive-stage.js), not a separate
   guess, so if you change the character's SCALE/TOP/LEFT in style.css the
   bubble follows it without needing to be retuned.
   ============================================================ */
// Bubble image size (0.35 = 35% of its source image's native size).
const BUBBLE_SCALE = 0.35;
// Horizontal distance from the character's center, in PIXELS.
// Negative = bubble sits to the LEFT of the character, positive = RIGHT.
const BUBBLE_OFFSET_X = -280;
// Vertical distance from the character's center, in PIXELS.
// Negative = bubble sits ABOVE the character, positive = BELOW.
// TO MOVE THE BUBBLE DOWN: make this number bigger (e.g. -400 -> -200 -> 0 -> 200).
const BUBBLE_OFFSET_Y = -500;

const CELEBRATION_RIVE_CSS_CLASS = 'rive-stage--celebration';
const CELEBRATION_DURATION_MS = 4000;
// Level-intro character reuses the outro/celebration bear + spot — template
// until per-level intro art/rive exists. Own CSS class (same geometry as
// celebration) so it can be tuned independently.
const LEVEL_INTRO_RIVE_CSS_CLASS = 'rive-stage--level-intro';

//#region Level Intro (Character Voiceover)

/**
 * Per-level intro: logo card plus the bear (template:
 * Bear_Outro.riv, same spot as the outro/celebration) speaking through
 * CHARACTER_LINES[levelNumber].intro in order — any number of lines (1, 2,
 * however many) — each showing its own text + audio for its own durationMs,
 * before everything is torn down and gameplay starts. Edit the lines
 * themselves in character-lines.js.
 * @param {Phaser.Scene} scene
 * @param {{ levelNumber: 1|2|3, logoAssetKey: string, onComplete: () => void }} options
 */
export function showLevelIntroWithVoiceover(scene, { levelNumber, logoAssetKey, onComplete }) {
  const { width, height } = scene.scale;
  const lines = CHARACTER_LINES[levelNumber].intro;

  const introBg = scene.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
  // Header position — near the top of the 1080x1920 canvas, not mid-screen.
  const introLogo = scene.add.image(width / 2, height * 0.12, logoAssetKey).setDepth(1001).setScale(0.55);

  const riveInstance = spawnRiveAnimation(
    scene.cache.binary.get(ASSET_KEYS.RIVE_BEAR_OUTRO),
    'Timeline_Bear_Outro',
    LEVEL_INTRO_RIVE_CSS_CLASS,
    true,  // loop
    false, // isStateMachine — plain Animation, same as outro-scene.js
    BEAR_RIVE_MAX_DPR,
  );

  const anchor = getRiveAnchorScenePosition(scene);
  const bubbleX = anchor.x + BUBBLE_OFFSET_X;
  const bubbleY = anchor.y + BUBBLE_OFFSET_Y;
  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(BUBBLE_SCALE);
  const bubbleText = scene.add.text(0, -20, lines[0].text, TEXT_STYLES.SPEECH_BUBBLE).setOrigin(0.5);
  const bubbleContainer = scene.add
    .container(bubbleX, bubbleY, [bubbleImage, bubbleText])
    .setDepth(1002)
    .setAlpha(0);
  scene.tweens.add({
    targets: [bubbleContainer],
    alpha: 1,
    duration: 400,
    ease: 'Sine.easeOut',
  });

  /** @type {Phaser.Sound.BaseSound | null} */
  let currentVoiceover = null;
  /** @param {{ text: string, audioKey: string, durationMs: number }} line */
  const playLine = (line) => {
    currentVoiceover?.stop();
    bubbleText.setText(line.text);
    currentVoiceover = scene.sound.add(line.audioKey);
    currentVoiceover.play();
  };

  playLine(lines[0]);

  let elapsedMs = 0;
  lines.forEach((line, index) => {
    elapsedMs += line.durationMs;
    const nextLine = lines[index + 1];
    scene.time.delayedCall(elapsedMs, () => {
      if (nextLine) {
        playLine(nextLine);
        return;
      }
      currentVoiceover?.stop();
      introBg.destroy();
      introLogo.destroy();
      bubbleContainer.destroy();
      removeRiveAnimation(riveInstance, LEVEL_INTRO_RIVE_CSS_CLASS);
      onComplete();
    });
  });
}

//#endregion

//#region Persistent Guide Character

/* ============================================================
   STAGE 2 GAMEPLAY GUIDE CONTROLS — completely independent from the level
   intro / stage outro controls above. Nothing here is shared with them —
   changing a number in this block has zero effect on the intro/outro
   bubble or character, and vice versa.
   - CHARACTER scale/position: style.css, --char-guide-scale/top/left
   - BUBBLE scale/position: the 3 numbers right below
   ============================================================ */
const GUIDE_BUBBLE_SCALE = 0.26;      // bubble image size
const GUIDE_BUBBLE_OFFSET_X = -405;   // pixels, negative = left of character, positive = right
const GUIDE_BUBBLE_OFFSET_Y = -200;   // pixels, negative = above character, positive = below
const GUIDE_RIVE_CSS_CLASS = 'rive-stage--level-guide';
// How long a spoken line stays visible before the bubble auto-hides.
const GUIDE_SPEAK_DURATION_MS = 2000;

/**
 * Persistent bear shown throughout gameplay (not torn down after a fixed
 * delay like showLevelIntroWithVoiceover/showCelebrationSequence — caller
 * destroys it explicitly, e.g. right before showCelebrationSequence spawns
 * its own bear on the same shared #rive-stage canvas). Same position as the
 * intro/outro bear, scaled down by GUIDE_SCALE. The speech bubble stays
 * hidden until speak()/speakRandomFrom() is called — it shows for
 * GUIDE_SPEAK_DURATION_MS then hides itself. Calling either again while a
 * line is showing interrupts the current audio/timer and starts fresh —
 * never two voice clips at once.
 * @param {Phaser.Scene} scene
 * @returns {{ destroy: () => void, speak: (line: { text: string, audioKey: string }) => void, speakRandomFrom: (lines: { text: string, audioKey: string }[]) => void }}
 */
export function showPersistentGuideCharacter(scene) {
  const riveInstance = spawnRiveAnimation(
    scene.cache.binary.get(ASSET_KEYS.RIVE_BEAR_OUTRO),
    'Timeline_Bear_Outro',
    GUIDE_RIVE_CSS_CLASS,
    true,  // loop
    false, // isStateMachine — plain Animation, same as outro-scene.js
    BEAR_RIVE_MAX_DPR,
  );

  const anchor = getRiveAnchorScenePosition(scene);
  const bubbleX = anchor.x + GUIDE_BUBBLE_OFFSET_X;
  const bubbleY = anchor.y + GUIDE_BUBBLE_OFFSET_Y;
  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(GUIDE_BUBBLE_SCALE);
  const bubbleText = scene.add.text(0, -15, '', TEXT_STYLES.SPEECH_BUBBLE_SMALL).setOrigin(0.5);
  const bubbleContainer = scene.add
    .container(bubbleX, bubbleY, [bubbleImage, bubbleText])
    .setDepth(1002)
    .setVisible(false);

  /** @type {Phaser.Sound.BaseSound | null} */
  let currentVoiceover = null;
  /** @type {Phaser.Time.TimerEvent | null} */
  let hideTimer = null;

  /** @param {{ text: string, audioKey: string }} line */
  function speak(line) {
    currentVoiceover?.stop();
    hideTimer?.remove();

    bubbleText.setText(line.text);
    bubbleContainer.setVisible(true);
    currentVoiceover = scene.sound.add(line.audioKey);
    currentVoiceover.play();

    hideTimer = scene.time.delayedCall(GUIDE_SPEAK_DURATION_MS, () => {
      bubbleContainer.setVisible(false);
    });
  }

  return {
    speak,
    speakRandomFrom(lines) {
      speak(Phaser.Utils.Array.GetRandom(lines));
    },
    destroy() {
      currentVoiceover?.stop();
      hideTimer?.remove();
      bubbleContainer.destroy();
      removeRiveAnimation(riveInstance, GUIDE_RIVE_CSS_CLASS);
    },
  };
}

//#endregion

//#region End Message

/**
 * Shared level-complete/game-over message: title (+ optional subtitle) near
 * the bottom of the screen, backed by one placeholder panel sized to wrap
 * just that text (swap for real art) — no full-screen darkening, no button,
 * nothing clickable. onComplete fires on its own after delayMs.
 * @param {Phaser.Scene} scene
 * @param {{ title: string, subtitle?: string, onComplete: () => void, delayMs?: number, depth?: number }} options
 */
export function showEndMessage(scene, { title, subtitle = '', onComplete, delayMs = 3000, depth = 10 }) {
  const { width, height } = scene.scale;

  const lineHeight = 50;
  const lineCount = subtitle ? 2 : 1;
  const panelWidth = Math.min(width * 0.6, 720);
  const panelHeight = lineHeight * lineCount + 60;
  const panelCenterY = height - panelHeight / 2 - 40;

  // Placeholder panel behind the message text — swap for real art.
  scene.add
    .rectangle(width / 2, panelCenterY, panelWidth, panelHeight, 0xffffff, 0.25)
    .setStrokeStyle(2, 0xffffff, 0.6)
    .setDepth(depth);

  let lineY = panelCenterY - panelHeight / 2 + 20 + lineHeight / 2;
  scene.add.text(width / 2, lineY, title, TEXT_STYLES.DEFAULT).setOrigin(0.5).setDepth(depth + 1);

  if (subtitle) {
    lineY += lineHeight;
    scene.add.text(width / 2, lineY, subtitle, TEXT_STYLES.DEFAULT).setOrigin(0.5).setDepth(depth + 1);
  }

  scene.time.delayedCall(delayMs, onComplete);
}

//#endregion

//#region Celebration

/**
 * Shared level-end celebration (success or game-over) — bear + speech
 * bubble + matching feedback clip. Call after the scene's own visuals are
 * already cleared (only one Rive animation on #rive-stage at a time).
 * @param {Phaser.Scene} scene
 * @param {{ message: string, levelNumber: 1|2|3, isSuccess: boolean, durationMs?: number, onComplete: () => void }} options
 */
export function showCelebrationSequence(scene, { message, levelNumber, isSuccess, durationMs = CELEBRATION_DURATION_MS, onComplete }) {
  const riveInstance = spawnRiveAnimation(
    scene.cache.binary.get(ASSET_KEYS.RIVE_BEAR_OUTRO),
    'Timeline_Bear_Outro',
    CELEBRATION_RIVE_CSS_CLASS,
    true,  // loop
    false, // isStateMachine — plain Animation, same as outro-scene.js
    BEAR_RIVE_MAX_DPR,
  );

  // TODO: VFX hook (confetti/particles) could go here.
  if (isSuccess) {
    playLevelSuccessFeedback(scene, levelNumber);
  } else {
    playLevelGameOverFeedback(scene, levelNumber);
  }

  // old bottom panel, disabled in favor of the bubble below
  // showEndMessage(scene, { title: message, onComplete: () => {} });

  const anchor = getRiveAnchorScenePosition(scene);
  const bubbleX = anchor.x + BUBBLE_OFFSET_X;
  const bubbleY = anchor.y + BUBBLE_OFFSET_Y;
  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(BUBBLE_SCALE);
  const bubbleText = scene.add.text(0, -20, message, TEXT_STYLES.SPEECH_BUBBLE).setOrigin(0.5);
  const bubbleContainer = scene.add.container(bubbleX, bubbleY, [bubbleImage, bubbleText]).setAlpha(0);
  scene.tweens.add({
    targets: [bubbleContainer],
    alpha: 1,
    duration: 400,
    ease: 'Sine.easeOut',
  });

  scene.time.delayedCall(durationMs, () => {
    bubbleContainer.destroy();
    removeRiveAnimation(riveInstance, CELEBRATION_RIVE_CSS_CLASS);
    onComplete();
  });
}

//#endregion
