export const FONT_FAMILY = 'GameFont';
//export const FONT_FAMILY = 'Arial, sans-serif';
 
export const TEXT_STYLES = {
  // Score/timer/progress labels — game-scene.js, game-scene2.js, game-scene3.js
  DEFAULT: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#56BCE3',
    stroke: '#3C86A3',
    strokeThickness: 6,
  },
  INSTRUCTIONS: {
    fontFamily: FONT_FAMILY,
    fontSize: '50px',
    color: '#56BCE3',
    stroke: '#3C86A3',
    strokeThickness: 6,
    wordWrap: { width: 760, useAdvancedWrap: true },
  },
  // Text inside the character's speech bubbles — intro-scene.js, outro-scene.js
  SPEECH_BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '42px',
    color: '#A36155',
    align: 'center',
    wordWrap: { width: 320, useAdvancedWrap: true },
  },
  // Smaller variant of SPEECH_BUBBLE — the Stage 2 persistent guide
  // character's speech bubble (level-flow.js showPersistentGuideCharacter).
  SPEECH_BUBBLE_SMALL: {
    fontFamily: FONT_FAMILY,
    fontSize: '32px',
    color: '#A36155',
    align: 'center',
    wordWrap: { width: 240, useAdvancedWrap: true },
  },
  // Text inside a bubble — thought-cloud-scene.js - scene 2
  BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '28px',
    color: '#000000',
    align: 'center',
    wordWrap: { width: 220, useAdvancedWrap: true },
  },
  BUBBLE_POPPED: {
    fontFamily: FONT_FAMILY,
    fontSize: '28px',
    color: '#2EB000',
    align: 'center',
    wordWrap: { width: 270, useAdvancedWrap: true },
  },
  // Wobbling breath prompt (inhale/hold/exhale) — game-scene3.js's limb prompt also uses this one
  BREATH_PROMPT: {
    fontFamily: FONT_FAMILY,
    fontSize: '48px',
    color: '#A36155',
    align: 'center',
  },
  // Right-aligned variant of BREATH_PROMPT — game-scene.js only, so Stage 3 stays untouched
  BREATH_PROMPT_RIGHT: {
    fontFamily: FONT_FAMILY,
    fontSize: '48px',
    color: '#A36155',
    align: 'right',
  },

};

//#region Debug
// Single switch — flip to false before a kiosk build ships. Silences every
// scene's tuning chatter and the loading start/finished logs. Does NOT
// affect console.warn calls elsewhere (font failures, missing Rive inputs,
// failed asset loads) — those are real problems and always show.
export const DEBUG = false;

/**
 * No-op when DEBUG is false. Pass a function instead of a plain value to
 * skip building the message entirely when debugging is off.
 * @param {...(*|(() => *))} args
 */
export function debugLog(...args) {
  if (!DEBUG) {
    return;
  }
  console.log(...args.map((arg) => (typeof arg === 'function' ? arg() : arg)));
}

//#endregion

//#region Fonts

export async function loadFont(fontFamilyName, fontFilePath) {
  try {
    const fontFace = new FontFace(fontFamilyName, `url(${fontFilePath})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (error) {
    console.warn(`Could not load font "${fontFamilyName}" from ${fontFilePath} — falling back to default font.`, error);
  }
}

//#endregion
