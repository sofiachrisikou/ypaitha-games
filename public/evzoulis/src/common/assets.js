export const ASSET_KEYS = Object.freeze({
  //SHARED
  BACKGROUND_GENERIC: 'BACKGROUND_GENERIC',
  PROGRESSBAR_FG: 'PROGRESSBAR_FG',
  PROGRESSBAR_BG: 'PROGRESSBAR_BG',
  //FONT1:'FONT1', // unused — never loaded, main font is loadFont('GameFont', .../ComicSansMSBold.ttf) in preload-scene.js
  BTN1: 'BTN1',
  SPEECH_BUBBLE: 'SPEECH_BUBBLE',
  CORRECTSOUND: 'CORRECTSOUND',
  WRONGSOUND: 'WRONGSOUND',
  POS_FEEDBACK1 :'POS_FEEDBACK1',
  POS_FEEDBACK2 :'POS_FEEDBACK2',
  POS_FEEDBACK3 :'POS_FEEDBACK3',
  POS_FEEDBACK4 :'POS_FEEDBACK4',
  // one fixed clip per level/outcome, not a pool
  LVL1_SUCCESS_FEEDBACK: 'LVL1_SUCCESS_FEEDBACK',
  LVL1_GAMEOVER_FEEDBACK: 'LVL1_GAMEOVER_FEEDBACK',
  LVL2_SUCCESS_FEEDBACK: 'LVL2_SUCCESS_FEEDBACK',
  LVL2_GAMEOVER_FEEDBACK: 'LVL2_GAMEOVER_FEEDBACK',
  LVL3_SUCCESS_FEEDBACK: 'LVL3_SUCCESS_FEEDBACK',
  LVL3_GAMEOVER_FEEDBACK: 'LVL3_GAMEOVER_FEEDBACK',
  //INTRO
  BACKGROUND_INTRO: 'BACKGROUND_INTRO',
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
  //INTRO VOICEOVER (assets/audio/Intro/EZ-01.mp3 — global clip 1, unused so far)
  EZ_01: 'EZ_01',
  //LEVEL 1
  BACKGROUND_Stg1: 'BACKGROUND_Stg1',
  STAGE1_LOGO:'STAGE1_LOGO',
  CANDLE: 'CANDLE',
  CANDLE_FLAME: 'CANDLE_FLAME',
  ARROW_UP: 'ARROW_UP',
  FLOWER1: 'FLOWER1',
  FLOWER2: 'FLOWER2',
  FLOWER3: 'FLOWER3',
  //LEVEL 1 VOICEOVER (assets/audio/Stage1/EZ-XX.mp3 — global clip numbering, clips 2-17)
  EZ_02: 'EZ_02',
  EZ_03: 'EZ_03',
  EZ_04: 'EZ_04',
  EZ_05: 'EZ_05',
  EZ_06: 'EZ_06',
  EZ_07: 'EZ_07',
  EZ_08: 'EZ_08',
  EZ_09: 'EZ_09',
  EZ_10: 'EZ_10',
  EZ_11: 'EZ_11',
  EZ_12: 'EZ_12',
  EZ_13: 'EZ_13',
  EZ_14: 'EZ_14',
  EZ_15: 'EZ_15',
  EZ_16: 'EZ_16',
  EZ_17: 'EZ_17',

  //LEVEL 2
  BACKGROUND_Stg2: 'BACKGROUND_Stg2',
  STAGE2_LOGO:'STAGE2_LOGO',
  BUBBLE1: 'BUBBLE1',
  BUBBLE2: 'BUBBLE2',
  BUBBLE3: 'BUBBLE3',
  BUBBLE4: 'BUBBLE4',
  BUBBLE_POPPED: 'BUBBLE_POPPED',
  BUBBLE_POPPED1: 'BUBBLE_POPPED1',
  BUBBLE_POP_SOUND:'BUBBLE_POP_SOUND',
  //LEVEL 2 VOICEOVER (assets/audio/Stage2/EZ-XX.mp3 — global clip numbering, clips 18-28)
  EZ_18: 'EZ_18',
  EZ_19: 'EZ_19',
  EZ_20: 'EZ_20',
  EZ_21: 'EZ_21',
  EZ_22: 'EZ_22',
  EZ_23: 'EZ_23',
  EZ_24: 'EZ_24',
  EZ_25: 'EZ_25',
  EZ_26: 'EZ_26',
  EZ_27: 'EZ_27',
  EZ_28: 'EZ_28',
  //LEVEL 3
  BACKGROUND_Stg3: 'BACKGROUND_Stg3',
  STAGE3_LOGO:'STAGE3_LOGO',
  BEAR_BODY: 'BEAR_BODY',
  CHAR_ARM_R: 'CHAR_ARM_R',
  CHAR_ARM_L: 'CHAR_ARM_L',
  CHAR_LEG_R: 'CHAR_LEG_R',
  CHAR_LEG_L: 'CHAR_LEG_L',
  //LEVEL 3 VOICEOVER (assets/audio/Stage3/EZ-XX.mp3 — global clip numbering; clips 35-38 exist on disk but unused so far)
  EZ_29: 'EZ_29',
  EZ_30: 'EZ_30',
  EZ_31: 'EZ_31',
  EZ_32: 'EZ_32',
  EZ_33: 'EZ_33',
  EZ_34: 'EZ_34',
  EZ_35: 'EZ_35',
  EZ_36: 'EZ_36',
  EZ_38: 'EZ_38',
  //OUTRO
  BACKGROUND_OUTRO: 'BACKGROUND_OUTRO',
  //OUTRO VOICEOVER (assets/audio/Outro/EZ-XX.mp3 — global clip numbering; only clips 39/40 wired up so far, 41/42 exist on disk but unused)
  EZ_39: 'EZ_39',
  EZ_40: 'EZ_40',
  //SOUND EFFECTS (assets/audio/VO_Sfx/EZ-SX.mp3)
  SFX_BREATH_IN: 'SFX_BREATH_IN',
  SFX_BREATH_OUT: 'SFX_BREATH_OUT',
  SFX_RELIEF: 'SFX_RELIEF',
  SFX_HAPPY_REALIZATION: 'SFX_HAPPY_REALIZATION',
  SFX_LAUGH: 'SFX_LAUGH',
  //RIVE
  RIVE_BEAR_INTRO: 'RIVE_BEAR_INTRO',
  RIVE_BEAR_Stg1: 'RIVE_BEAR_Stg1',
  RIVE_BEAR_Stg2: 'RIVE_BEAR_Stg2',
  RIVE_BEAR_Stg3: 'RIVE_BEAR_Stg3',
  RIVE_BEAR_Stg3_HEAD: 'RIVE_BEAR_Stg3_HEAD',
  RIVE_BEAR_OUTRO: 'RIVE_BEAR_OUTRO',
});

// Unused — never imported/loaded by preload-scene.js. Main font is GameFont
// (assets/fonts/ComicSansMSBold.ttf), loaded via loadFont() instead.
// export const FONT_ASSETS =
// [
//    {
//     assetKey: ASSET_KEYS.FONT1,
//     path: 'assets/fonts/Comic Sans MS Bold.ttf',
//   },
// ];

export const IMAGE_ASSETS = [
  //SHARED
   {
    assetKey: ASSET_KEYS.BACKGROUND_GENERIC,
    path: 'assets/images/Generic_BG.png',
  },
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
    assetKey: ASSET_KEYS.BACKGROUND_INTRO,
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
    assetKey: ASSET_KEYS.STAGE1_LOGO,
    path: 'assets/images/Stage01.png',
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
  {
    assetKey: ASSET_KEYS.FLOWER1,
    path: 'assets/images/flower01.png',
  },
  {
    assetKey: ASSET_KEYS.FLOWER2,
    path: 'assets/images/flower02.png',
  },
  {
    assetKey: ASSET_KEYS.FLOWER3,
    path: 'assets/images/flower03.png',
  },
  //LEVEL 2
  {
    assetKey: ASSET_KEYS.BACKGROUND_Stg2,
    path: 'assets/images/Stage02_BG.png',
  },
  {
    assetKey: ASSET_KEYS.STAGE2_LOGO,
    path: 'assets/images/Stage02.png',
  },
  {
    assetKey: ASSET_KEYS.BUBBLE1,
    path: 'assets/images/cloud1.png',
  },
    {
    assetKey: ASSET_KEYS.BUBBLE2,
    path: 'assets/images/cloud2.png',
  },
    {
    assetKey: ASSET_KEYS.BUBBLE3,
    path: 'assets/images/cloud3.png',
  },
    {
    assetKey: ASSET_KEYS.BUBBLE4,
    path: 'assets/images/cloud4.png',
  },
  {
    assetKey: ASSET_KEYS.BUBBLE_POPPED,
    path: 'assets/images/cloudBurst1.png',
  },
  {
    assetKey: ASSET_KEYS.BUBBLE_POPPED1,
    path: 'assets/images/cloudBurst2.png',
  },
  //LEVEL 3
  {
    assetKey: ASSET_KEYS.BACKGROUND_Stg3,
    path: 'assets/images/Stage03_BG.png',
  },
  {
    assetKey: ASSET_KEYS.STAGE3_LOGO,
    path: 'assets/images/Stage03.png',
  },
  {
    assetKey: ASSET_KEYS.BEAR_BODY,
    path: 'assets/images/Body.png',
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
    assetKey: ASSET_KEYS.BACKGROUND_OUTRO,
    path: 'assets/images/outroBG.png',
  },
];

export const AUDIO_ASSETS = [
  //SHARED
  {
    assetKey: ASSET_KEYS.CORRECTSOUND,
    path: 'assets/audio/correct.wav',
  },
   {
    assetKey: ASSET_KEYS.WRONGSOUND,
    path: 'assets/audio/wrong.mp3',
  },
    {
    assetKey: ASSET_KEYS.POS_FEEDBACK1,
    path: 'assets/audio/PossitiveFeedback1.mp3',
  },
  {
    assetKey: ASSET_KEYS.POS_FEEDBACK2,
    path: 'assets/audio/PossitiveFeedback2.mp3',
  },
  {
    assetKey: ASSET_KEYS.POS_FEEDBACK3,
    path: 'assets/audio/PossitiveFeedback3.mp3',
  },
  {
    assetKey: ASSET_KEYS.POS_FEEDBACK4,
    path: 'assets/audio/PossitiveFeedback4.mp3',
  },

  // TODO: placeholder clips, swap in real per-level audio
  {
    assetKey: ASSET_KEYS.LVL1_SUCCESS_FEEDBACK,
    path: 'assets/audio/PossitiveFeedback1.mp3',
  },
  {
    assetKey: ASSET_KEYS.LVL1_GAMEOVER_FEEDBACK,
    path: 'assets/audio/wrong.mp3',
  },
  {
    assetKey: ASSET_KEYS.LVL2_SUCCESS_FEEDBACK,
    path: 'assets/audio/PossitiveFeedback1.mp3',
  },
  {
    assetKey: ASSET_KEYS.LVL2_GAMEOVER_FEEDBACK,
    path: 'assets/audio/wrong.mp3',
  },
  {
    assetKey: ASSET_KEYS.LVL3_SUCCESS_FEEDBACK,
    path: 'assets/audio/PossitiveFeedback1.mp3',
  },
  {
    assetKey: ASSET_KEYS.LVL3_GAMEOVER_FEEDBACK,
    path: 'assets/audio/wrong.mp3',
  },

  //STAGE 2
  {
    assetKey: ASSET_KEYS.BUBBLE_POP_SOUND,
    path: 'assets/audio/bubble_pop.wav',
  },

  //INTRO VOICEOVER
  { assetKey: ASSET_KEYS.EZ_01, path: 'assets/audio/Intro/EZ-01.mp3' },

  //LEVEL 1 VOICEOVER
  { assetKey: ASSET_KEYS.EZ_02, path: 'assets/audio/Stage1/EZ-02.mp3' },
  { assetKey: ASSET_KEYS.EZ_03, path: 'assets/audio/Stage1/EZ-03.mp3' },
  { assetKey: ASSET_KEYS.EZ_04, path: 'assets/audio/Stage1/EZ-04.mp3' },
  { assetKey: ASSET_KEYS.EZ_05, path: 'assets/audio/Stage1/EZ-05.mp3' },
  { assetKey: ASSET_KEYS.EZ_06, path: 'assets/audio/Stage1/EZ-06.mp3' },
  { assetKey: ASSET_KEYS.EZ_07, path: 'assets/audio/Stage1/EZ-07.mp3' },
  { assetKey: ASSET_KEYS.EZ_08, path: 'assets/audio/Stage1/EZ-08.mp3' },
  { assetKey: ASSET_KEYS.EZ_09, path: 'assets/audio/Stage1/EZ-09.mp3' },
  { assetKey: ASSET_KEYS.EZ_10, path: 'assets/audio/Stage1/EZ-10.mp3' },
  { assetKey: ASSET_KEYS.EZ_11, path: 'assets/audio/Stage1/EZ-11.mp3' },
  { assetKey: ASSET_KEYS.EZ_12, path: 'assets/audio/Stage1/EZ-12.mp3' },
  { assetKey: ASSET_KEYS.EZ_13, path: 'assets/audio/Stage1/EZ-13.mp3' },
  { assetKey: ASSET_KEYS.EZ_14, path: 'assets/audio/Stage1/EZ-14.mp3' },
  { assetKey: ASSET_KEYS.EZ_15, path: 'assets/audio/Stage1/EZ-15.mp3' },
  { assetKey: ASSET_KEYS.EZ_16, path: 'assets/audio/Stage1/EZ-16.wav' },
  { assetKey: ASSET_KEYS.EZ_17, path: 'assets/audio/Stage1/EZ-17.mp3' },

  //LEVEL 2 VOICEOVER
  { assetKey: ASSET_KEYS.EZ_18, path: 'assets/audio/Stage2/EZ-18.mp3' },
  { assetKey: ASSET_KEYS.EZ_19, path: 'assets/audio/Stage2/EZ-19.mp3' },
  { assetKey: ASSET_KEYS.EZ_20, path: 'assets/audio/Stage2/EZ-20.mp3' },
  { assetKey: ASSET_KEYS.EZ_21, path: 'assets/audio/Stage2/EZ-21.mp3' },
  { assetKey: ASSET_KEYS.EZ_22, path: 'assets/audio/Stage2/EZ-22.mp3' },
  { assetKey: ASSET_KEYS.EZ_23, path: 'assets/audio/Stage2/EZ-23.mp3' },
  { assetKey: ASSET_KEYS.EZ_24, path: 'assets/audio/Stage2/EZ-24.mp3' },
  { assetKey: ASSET_KEYS.EZ_25, path: 'assets/audio/Stage2/EZ-25.mp3' },
  { assetKey: ASSET_KEYS.EZ_26, path: 'assets/audio/Stage2/EZ-26.mp3' },
  { assetKey: ASSET_KEYS.EZ_27, path: 'assets/audio/Stage2/EZ-27.mp3' },
  { assetKey: ASSET_KEYS.EZ_28, path: 'assets/audio/Stage2/EZ-28.mp3' },

  //LEVEL 3 VOICEOVER (35-38 exist on disk but unused so far)
  { assetKey: ASSET_KEYS.EZ_29, path: 'assets/audio/Stage3/EZ-29.mp3' },
  { assetKey: ASSET_KEYS.EZ_30, path: 'assets/audio/Stage3/EZ-30.mp3' },
  { assetKey: ASSET_KEYS.EZ_31, path: 'assets/audio/Stage3/EZ-31.mp3' },
  { assetKey: ASSET_KEYS.EZ_32, path: 'assets/audio/Stage3/EZ-32.mp3' },
  { assetKey: ASSET_KEYS.EZ_33, path: 'assets/audio/Stage3/EZ-33.mp3' },
  { assetKey: ASSET_KEYS.EZ_34, path: 'assets/audio/Stage3/EZ-34.mp3' },
  { assetKey: ASSET_KEYS.EZ_35, path: 'assets/audio/Stage3/EZ-35.mp3' },
  { assetKey: ASSET_KEYS.EZ_36, path: 'assets/audio/Stage3/EZ-36.mp3' },
  { assetKey: ASSET_KEYS.EZ_38, path: 'assets/audio/Stage3/EZ-38.mp3' },

  //OUTRO VOICEOVER (only clips 39/40 wired up so far — 41/42 exist on disk but unused)
  { assetKey: ASSET_KEYS.EZ_39, path: 'assets/audio/Outro/EZ-39.mp3' },
  { assetKey: ASSET_KEYS.EZ_40, path: 'assets/audio/Outro/EZ-40.mp3' },

  //SOUND EFFECTS
  { assetKey: ASSET_KEYS.SFX_BREATH_IN, path: 'assets/audio/VO_Sfx/EZ-S1.mp3' },
  { assetKey: ASSET_KEYS.SFX_BREATH_OUT, path: 'assets/audio/VO_Sfx/EZ-S2.mp3' },
  { assetKey: ASSET_KEYS.SFX_RELIEF, path: 'assets/audio/VO_Sfx/EZ-S3.mp3' },
  { assetKey: ASSET_KEYS.SFX_HAPPY_REALIZATION, path: 'assets/audio/VO_Sfx/EZ-S4.mp3' },
  { assetKey: ASSET_KEYS.SFX_LAUGH, path: 'assets/audio/VO_Sfx/EZ-S5.mp3' },
];

// Rive files, preloaded as raw binary and handed to Rive as a buffer at
// spawn time — same load screen as everything else above, no per-scene fetch.
export const RIVE_ASSETS = [
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_INTRO,
    path: 'assets/rive/Bear_Intro.riv',
  },
   {
    assetKey: ASSET_KEYS.RIVE_BEAR_Stg1,
    path: 'assets/rive/Euzoulis_Mascot_Stage01 1.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_Stg2,
    path: 'assets/rive/Euzoulis_Mascot_Stage02.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_Stg3,
    path: 'assets/rive/Euzoulis_Mascot_Stage02.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_Stg3_HEAD,
    path: 'assets/rive/Euzoulis_Mascot_Head 2.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_OUTRO,
    path: 'assets/rive/Bear_Outro.riv',
  },
];

export const TEXTURE_ATLAS_ASSETS = [
  {
    assetKey: ASSET_KEYS.OBJECTS,
    textureURL: 'assets/images/spritesheet.png',
    atlasURL: 'assets/images/spritesheet.json',
  },
];
