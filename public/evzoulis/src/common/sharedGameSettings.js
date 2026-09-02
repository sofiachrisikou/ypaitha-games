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
  // Wobbling breath prompt (inhale/hold/exhale) — game-scene.js
  BREATH_PROMPT: {
    fontFamily: FONT_FAMILY,
    fontSize: '48px',
    color: '#A36155',
    align: 'center',
  },

};

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
