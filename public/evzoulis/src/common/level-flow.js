import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';
import { TEXT_STYLES } from './sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation } from './rive-stage.js';
import { playLevelSuccessFeedback, playLevelGameOverFeedback } from './audio-manager.js';

const CELEBRATION_RIVE_CSS_CLASS = 'rive-stage--celebration';
const CELEBRATION_DURATION_MS = 4000;

//#region Level Intro

/**
 * Shared level-intro card: ASSET_KEYS.BACKGROUND_GENERIC full-screen, with
 * logoAssetKey centered horizontally and a bit above screen-middle. Stays up
 * for durationMs, then is torn down and onComplete runs — callers put the
 * level's normal create() work in there so it only starts once the card is
 * gone.
 */
export function showLevelIntro(scene, logoAssetKey,instructions, onComplete, durationMs = 6000) {
  const { width, height } = scene.scale;

  const introBg = scene.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
  const introLogo = scene.add.image(width / 2, height * 0.42, logoAssetKey).setDepth(1001);
  //const scale = Math.min((width * 0.6) / introLogo.width, (height * 0.45) / introLogo.height, 1);
  //introLogo.setScale(scale);
  introLogo.setScale(0.55);

  const levelInstructions = scene.add.text(width/2, height/2+ 600, instructions, TEXT_STYLES.INSTRUCTIONS).setOrigin(0.5).setDepth(1001);
  
  scene.time.delayedCall(durationMs, () => {
    introBg.destroy();
    introLogo.destroy();
    levelInstructions.destroy();
    onComplete();
  });
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
  const { width, height } = scene.scale;

  const riveInstance = spawnRiveAnimation(
    'assets/rive/Bear_Outro.riv',
    'Timeline_Bear_Outro',
    CELEBRATION_RIVE_CSS_CLASS,
    true,  // loop
    false, // isStateMachine — plain Animation, same as outro-scene.js
  );

  // TODO: VFX hook (confetti/particles) could go here.
  if (isSuccess) {
    playLevelSuccessFeedback(scene, levelNumber);
  } else {
    playLevelGameOverFeedback(scene, levelNumber);
  }

  // old bottom panel, disabled in favor of the bubble below
  // showEndMessage(scene, { title: message, onComplete: () => {} });

  const bubbleX = width * 0.65;
  const bubbleY = height / 2 + 80;
  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(0.35);
  const bubbleText = scene.add.text(0, -20, message, TEXT_STYLES.SPEECH_BUBBLE).setOrigin(0.5);
  const bubbleContainer = scene.add.container(bubbleX - 260, bubbleY, [bubbleImage, bubbleText]).setAlpha(0);
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
