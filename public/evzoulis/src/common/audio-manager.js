import { ASSET_KEYS } from './assets.js';

//#region Feedback

// "good move" pool (e.g. popping a bubble) — random pick each call.
const GOOD_MOVE_FEEDBACK_KEYS = [
  ASSET_KEYS.POS_FEEDBACK1,
  ASSET_KEYS.POS_FEEDBACK2,
  ASSET_KEYS.POS_FEEDBACK3,
  ASSET_KEYS.POS_FEEDBACK4,
];

// "bad move" pool — random pick each call. Only one clip today.
const BAD_MOVE_FEEDBACK_KEYS = [ASSET_KEYS.WRONGSOUND];

// Fixed clip per level per outcome — not pools.
const LEVEL_SUCCESS_FEEDBACK_KEYS = {
  1: ASSET_KEYS.LVL1_SUCCESS_FEEDBACK,
  2: ASSET_KEYS.LVL2_SUCCESS_FEEDBACK,
  3: ASSET_KEYS.LVL3_SUCCESS_FEEDBACK,
};
const LEVEL_GAMEOVER_FEEDBACK_KEYS = {
  1: ASSET_KEYS.LVL1_GAMEOVER_FEEDBACK,
  2: ASSET_KEYS.LVL2_GAMEOVER_FEEDBACK,
  3: ASSET_KEYS.LVL3_GAMEOVER_FEEDBACK,
};

// scene.sound is Phaser's single game-wide SoundManager, so it already
// survives scene changes on its own. All 4 categories share one "current"
// pointer/channel so starting any of them stops whatever was playing.
const feedbackSoundCache = {};
let currentFeedbackSound = null;

function getOrCreateFeedbackSound(scene, assetKey) {
  let sound = feedbackSoundCache[assetKey];
  if (!sound) {
    sound = scene.sound.add(assetKey);
    feedbackSoundCache[assetKey] = sound;
  }
  return sound;
}

function playFeedbackSound(scene, assetKey) {
  const sound = getOrCreateFeedbackSound(scene, assetKey);

  if (currentFeedbackSound && currentFeedbackSound.isPlaying) {
    currentFeedbackSound.stop();
  }
  currentFeedbackSound = sound;
  sound.play();

  return assetKey;
}

function playFeedbackFromPool(scene, pool) {
  const assetKey = pool[Math.floor(Math.random() * pool.length)];
  return playFeedbackSound(scene, assetKey);
}

/** Stops the current feedback clip without starting a new one. */
export function stopFeedback() {
  if (currentFeedbackSound && currentFeedbackSound.isPlaying) {
    currentFeedbackSound.stop();
  }
  currentFeedbackSound = null;
}

/**
 * @param {Phaser.Scene} scene
 * @returns {string} asset key picked
 */
export function playGoodMoveFeedback(scene) {
  return playFeedbackFromPool(scene, GOOD_MOVE_FEEDBACK_KEYS);
}

/**
 * @param {Phaser.Scene} scene
 * @returns {string} asset key picked
 */
export function playBadMoveFeedback(scene) {
  return playFeedbackFromPool(scene, BAD_MOVE_FEEDBACK_KEYS);
}

/**
 * @param {Phaser.Scene} scene
 * @param {1|2|3} levelNumber
 * @returns {string} asset key played
 */
export function playLevelSuccessFeedback(scene, levelNumber) {
  return playFeedbackSound(scene, LEVEL_SUCCESS_FEEDBACK_KEYS[levelNumber]);
}

/**
 * @param {Phaser.Scene} scene
 * @param {1|2|3} levelNumber
 * @returns {string} asset key played
 */
export function playLevelGameOverFeedback(scene, levelNumber) {
  return playFeedbackSound(scene, LEVEL_GAMEOVER_FEEDBACK_KEYS[levelNumber]);
}

//#endregion

//#region Jingles

// Short non-speech cues (a "ding"/"buzz", not a voice line) — independent
// of each other and of Feedback above, exactly like before this file
// existed: each just plays, none of them stop one another.
const jingleSoundCache = {};

function getOrCreateJingle(scene, assetKey) {
  let sound = jingleSoundCache[assetKey];
  if (!sound) {
    sound = scene.sound.add(assetKey);
    jingleSoundCache[assetKey] = sound;
  }
  return sound; 
}

/** @param {Phaser.Scene} scene */
export function playCorrectSound(scene) {
  getOrCreateJingle(scene, ASSET_KEYS.CORRECTSOUND).play();
}

/** @param {Phaser.Scene} scene */
export function playWrongSound(scene) {
  getOrCreateJingle(scene, ASSET_KEYS.WRONGSOUND).play();
}

/** @param {Phaser.Scene} scene */
export function playBubblePopSound(scene) {
  getOrCreateJingle(scene, ASSET_KEYS.BUBBLE_POP_SOUND).play();
}

/** @param {Phaser.Scene} scene */
export function playBreathInSound(scene) {
  getOrCreateJingle(scene, ASSET_KEYS.SFX_BREATH_IN).play();
}

/** @param {Phaser.Scene} scene */
export function playBreathOutSound(scene) {
  getOrCreateJingle(scene, ASSET_KEYS.SFX_BREATH_OUT).play();
}

//#endregion
