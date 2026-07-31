export const FONT_FAMILY = 'Arial, sans-serif';
 
export const TEXT_STYLES = {
  // Score/timer/progress labels — game-scene.js, game-scene2.js, game-scene3.js
  DEFAULT: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#043D8C',
    stroke: '#ff2B00',
    strokeThickness: 6,
  },
  // Text inside a bubble — thought-cloud-scene.js
  BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#000000',
    align: 'center',
    wordWrap: { width: 220, useAdvancedWrap: true },
  },
  // Text inside the character's speech bubbles — intro-scene.js, outro-scene.js
  SPEECH_BUBBLE: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#A36155',
    align: 'center',
    wordWrap: { width: 260, useAdvancedWrap: true },
  },
  SPEECH_BUBBLE_POPPED: {
    fontFamily: FONT_FAMILY,
    fontSize: '40px',
    color: '#2EB000',
    align: 'center',
    wordWrap: { width: 260, useAdvancedWrap: true },
  },


};
