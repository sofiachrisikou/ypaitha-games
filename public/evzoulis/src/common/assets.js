export const ASSET_KEYS = Object.freeze({
  //SHARED
  PROGRESSBAR_FG: 'PROGRESSBAR_FG',
  PROGRESSBAR_BG: 'PROGRESSBAR_BG',
  BACKGROUND_Stg1: 'BACKGROUND_Stg1',
  FONT1:'FONT1',
  BTN1: 'BTN1',
  SPEECH_BUBBLE: 'SPEECH_BUBBLE',
  //INTRO
  BACKGROUND_INTRO: 'BACKGROUND_INTRO',
  CHARACTER_INTRO: 'CHARACTER_INTRO',
  LOGO: 'LOGO',
  EMOJI1: 'EMOJI1',
  EMOJI2: 'EMOJI2',
  EMOJI3: 'EMOJI3',
  CLOUD: 'CLOUD',
  CLOUD1: 'CLOUD1',
  CLOUD2: 'CLOUD2',
  BOOK: 'BOOK',
  BELL: 'BELL',
  TESTS: 'TESTS',
  OBJECTS: 'OBJECTS',
  //LEVEL 1
  CANDLE: 'CANDLE',
  CANDLE_FLAME: 'CANDLE_FLAME',
  ARROW_UP: 'ARROW_UP',

  //LEVEL 2
  BACKGROUND_Stg2: 'BACKGROUND_Stg2',
  BUBBLE: 'BUBBLE',
  BUBBLE_POPPED: 'BUBBLE_POPPED',
  CORRECTSOUND: 'CORRECTSOUND',
  //LEVEL 3
  BACKGROUND_Stg3: 'BACKGROUND_Stg3',
  BEAR_BODY: 'BEAR_BODY',
  CHAR_ARM_R: 'CHAR_ARM_R',
  CHAR_ARM_L: 'CHAR_ARM_L',
  CHAR_LEG_R: 'CHAR_LEG_R',
  CHAR_LEG_L: 'CHAR_LEG_L',
  //OUTRO
  CHARACTER_OUTRO: 'CHARACTER_OUTRO',
  BACKGROUND_OUTRO: 'BACKGROUND_OUTRO',
});

export const FONT_ASSETS = 
[
   {
    assetKey: ASSET_KEYS.FONT1,
    path: 'assets/fonts/Comic Sans MS Bold.ttf',
  },
];

export const IMAGE_ASSETS = [
  //SHARED
  {
    assetKey: ASSET_KEYS.PROGRESSBAR_FG,
    path: 'assets/images/progBarFG.png',
  },
  {
    assetKey: ASSET_KEYS.PROGRESSBAR_BG,
    path: 'assets/images/progBarBG.png',
  },
  {
    assetKey: ASSET_KEYS.BTN1,
    path: 'assets/images/btn1.png',
  },
  {
    assetKey: ASSET_KEYS.SPEECH_BUBBLE,
    path: 'assets/images/speechBubble.png',
  },
  //INTRO
  {
    assetKey: ASSET_KEYS.CHARACTER_INTRO,
    path: 'assets/images/euzoulisIntro.png',
  },
  {
    assetKey: ASSET_KEYS.BACKGROUND_INTRO,
    //path: 'assets/images/01.png',
    path: 'assets/images/Classroom_Unhappy.png',
  },
  {
    assetKey: ASSET_KEYS.LOGO,
    path: 'assets/images/logo.png',
  },
  {
    assetKey: ASSET_KEYS.EMOJI1,
    path: 'assets/images/Emoji01.png',
  },
  {
    assetKey: ASSET_KEYS.EMOJI2,
    path: 'assets/images/Emoji02.png',
  },
  {
    assetKey: ASSET_KEYS.EMOJI3,
    path: 'assets/images/Emoji03.png',
  },
  {
    assetKey: ASSET_KEYS.CLOUD,
    path: 'assets/images/thoughtCloud1.png',
  },
  {
    assetKey: ASSET_KEYS.CLOUD1,
    path: 'assets/images/thoughtCloud2.png',
  },
  {
    assetKey: ASSET_KEYS.CLOUD2,
    path: 'assets/images/thoughtCloud3.png',
  },
  {
    assetKey: ASSET_KEYS.BOOK,
    path: 'assets/images/Book.png',
  },
  {
    assetKey: ASSET_KEYS.BELL,
    path: 'assets/images/Bell.png',
  },
  {
    assetKey: ASSET_KEYS.TESTS,
    path: 'assets/images/Tests.png',
  },

  //LEVEL 1
  {
    assetKey: ASSET_KEYS.BACKGROUND_Stg1,
    path: 'assets/images/Stage01_BG.png',
  },
  {
    assetKey: ASSET_KEYS.CANDLE,
    path: 'assets/images/Candle.png',
  },
  {
    assetKey: ASSET_KEYS.CANDLE_FLAME,
    path: 'assets/images/Flame.png',
  },
  {
    assetKey: ASSET_KEYS.ARROW_UP,
    path: 'assets/images/UpArrow.png',
  },
  //LEVEL 2
  {
    assetKey: ASSET_KEYS.BACKGROUND_Stg2,
    path: 'assets/images/Stage02_BG.png',
  },
  {
    assetKey: ASSET_KEYS.BUBBLE,
    path: 'assets/images/thoughtCloud4.png',
  },
  {
    assetKey: ASSET_KEYS.BUBBLE_POPPED,
    path: 'assets/images/thoughtCloud5.png',
  },
  //LEVEL 3
  {
    assetKey: ASSET_KEYS.BACKGROUND_Stg3,
    path: 'assets/images/Stage03_BG.png',
  },
  {
    assetKey: ASSET_KEYS.BEAR_BODY,
    path: 'assets/images/Body_Head.png',
  },
  {
    assetKey: ASSET_KEYS.CHAR_ARM_R,
    path: 'assets/images/Arm_R.png',
  },
  {
    assetKey: ASSET_KEYS.CHAR_ARM_L,
    path: 'assets/images/Arm_L.png',
  },
   {
    assetKey: ASSET_KEYS.CHAR_LEG_R,
    path: 'assets/images/Leg_R.png',
  },
  {
    assetKey: ASSET_KEYS.CHAR_LEG_L,
    path: 'assets/images/Leg_L.png',
  },
  //OUTRO
  {
    assetKey: ASSET_KEYS.CHARACTER_OUTRO,
    path: 'assets/images/euzoulisOutro.png',
  },
  {
    assetKey: ASSET_KEYS.BACKGROUND_OUTRO,
    path: 'assets/images/outroBG.png',
  },
];

export const AUDIO_ASSETS = [
  {
    assetKey: ASSET_KEYS.CORRECTSOUND,
    path: 'assets/audio/correct.wav',
  },
];

export const TEXTURE_ATLAS_ASSETS = [
  {
    assetKey: ASSET_KEYS.OBJECTS,
    textureURL: 'assets/images/spritesheet.png',
    atlasURL: 'assets/images/spritesheet.json',
  },
];
