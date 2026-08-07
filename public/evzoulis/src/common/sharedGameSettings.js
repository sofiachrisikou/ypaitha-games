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
  // Text inside a bubble — thought-cloud-scene.js
  BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '36px',
    color: '#000000',
    align: 'center',
    wordWrap: { width: 220, useAdvancedWrap: true },
  },
  // Text inside the character's speech bubbles — intro-scene.js, outro-scene.js
  SPEECH_BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '38px',
    color: '#A36155',
    align: 'center',
    wordWrap: { width: 300, useAdvancedWrap: true },
  },
  BUBBLE_POPPED: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#2EB000',
    align: 'center',
    wordWrap: { width: 260, useAdvancedWrap: true },
  },

};
export async function loadFont(fontFamilyName, fontFilePath) {
  try {
    const fontFace = new FontFace(fontFamilyName, `url(${fontFilePath})`);
    await fontFace.load();
    document.fonts.add(fontFace);
  } catch (error) {
    console.warn(`Could not load font "${fontFamilyName}" from ${fontFilePath} — falling back to default font.`, error);
  }
}
