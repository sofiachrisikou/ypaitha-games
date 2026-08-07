import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';
import { TEXT_STYLES } from './sharedGameSettings.js';

/**
 * Shared level-intro card: ASSET_KEYS.BACKGROUND_GENERIC full-screen, with
 * logoAssetKey centered horizontally and a bit above screen-middle. Stays up
 * for durationMs, then is torn down and onComplete runs — callers put the
 * level's normal create() work in there so it only starts once the card is
 * gone.
 */
export function showLevelIntro(scene, logoAssetKey, onComplete, durationMs = 3000) {
  const { width, height } = scene.scale;

  const introBg = scene.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
  const introLogo = scene.add.image(width / 2, height * 0.42, logoAssetKey).setDepth(1001);
  const scale = Math.min((width * 0.6) / introLogo.width, (height * 0.45) / introLogo.height, 1);
  introLogo.setScale(scale);

  scene.time.delayedCall(durationMs, () => {
    introBg.destroy();
    introLogo.destroy();
    onComplete();
  });
}

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
