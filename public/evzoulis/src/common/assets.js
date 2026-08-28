export const ASSET_KEYS = Object.freeze({
  //SHARED
  BACKGROUND_GENERIC: 'BACKGROUND_GENERIC',
  PROGRESSBAR_FG: 'PROGRESSBAR_FG',
  PROGRESSBAR_BG: 'PROGRESSBAR_BG',
  FONT1:'FONT1',
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
  //LEVEL 1
  BACKGROUND_Stg1: 'BACKGROUND_Stg1',
  STAGE1_LOGO:'STAGE1_LOGO',
  CANDLE: 'CANDLE',
  CANDLE_FLAME: 'CANDLE_FLAME',
  ARROW_UP: 'ARROW_UP',
  FLOWER1: 'FLOWER1',
  FLOWER2: 'FLOWER2',
  FLOWER3: 'FLOWER3',
  INHALE:'INHALE',
  EXHALE:'EXHALE',
  //LEVEL 1 VOICEOVER (assets/audio/Stage1/EV_Stg1_XX.mp3 — VO_01/VO_02 are the intro lines)
  LVL1_VO_01: 'LVL1_VO_01',
  LVL1_VO_02: 'LVL1_VO_02',
  LVL1_VO_03: 'LVL1_VO_03',
  LVL1_VO_04: 'LVL1_VO_04',
  LVL1_VO_05: 'LVL1_VO_05',
  LVL1_VO_06: 'LVL1_VO_06',
  LVL1_VO_07: 'LVL1_VO_07',
  LVL1_VO_08: 'LVL1_VO_08',
  LVL1_VO_09: 'LVL1_VO_09',
  LVL1_VO_10: 'LVL1_VO_10',
  LVL1_VO_11: 'LVL1_VO_11',
  LVL1_VO_12: 'LVL1_VO_12',
  LVL1_VO_13: 'LVL1_VO_13',
  LVL1_VO_14: 'LVL1_VO_14',
  LVL1_VO_15: 'LVL1_VO_15',

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
  //LEVEL 2 VOICEOVER (assets/audio/Stage2/EV_Stg2_XX.mp3 — VO_01/VO_02 are the intro lines)
  LVL2_VO_01: 'LVL2_VO_01',
  LVL2_VO_02: 'LVL2_VO_02',
  LVL2_VO_03: 'LVL2_VO_03',
  LVL2_VO_04: 'LVL2_VO_04',
  LVL2_VO_05: 'LVL2_VO_05',
  LVL2_VO_06: 'LVL2_VO_06',
  LVL2_VO_07: 'LVL2_VO_07',
  LVL2_VO_08: 'LVL2_VO_08',
  LVL2_VO_09: 'LVL2_VO_09',
  LVL2_VO_10: 'LVL2_VO_10',
  LVL2_VO_11: 'LVL2_VO_11',
  //LEVEL 3
  BACKGROUND_Stg3: 'BACKGROUND_Stg3',
  STAGE3_LOGO:'STAGE3_LOGO',
  BEAR_BODY: 'BEAR_BODY',
  CHAR_ARM_R: 'CHAR_ARM_R',
  CHAR_ARM_L: 'CHAR_ARM_L',
  CHAR_LEG_R: 'CHAR_LEG_R',
  CHAR_LEG_L: 'CHAR_LEG_L',
  //LEVEL 3 VOICEOVER (assets/audio/Stage3/EV_Stg3_XX.mp3 — both are intro lines; rest of stage 3 VO not ready yet)
  LVL3_VO_01: 'LVL3_VO_01',
  LVL3_VO_02: 'LVL3_VO_02',
  //OUTRO
  BACKGROUND_OUTRO: 'BACKGROUND_OUTRO',
  OUTRO_VO_01:'OUTRO_VO_01',
  OUTRO_VO_02:'OUTRO_VO_02',
  //RIVE
  RIVE_BEAR_INTRO: 'RIVE_BEAR_INTRO',
  RIVE_BEAR_BREATHING: 'RIVE_BEAR_BREATHING',
  RIVE_BEAR_SMILE: 'RIVE_BEAR_SMILE',
  RIVE_BEAR_OUTRO: 'RIVE_BEAR_OUTRO',
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
  {
    assetKey: ASSET_KEYS.INHALE,
    path: 'assets/images/Inhale.png',
  },
  {
    assetKey: ASSET_KEYS.EXHALE,
    path: 'assets/images/Exhale.png',
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

  //LEVEL 1 VOICEOVER
  { assetKey: ASSET_KEYS.LVL1_VO_01, path: 'assets/audio/Stage1/EV_Stg1_01.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_02, path: 'assets/audio/Stage1/EV_Stg1_02.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_03, path: 'assets/audio/Stage1/EV_Stg1_03.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_04, path: 'assets/audio/Stage1/EV_Stg1_04.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_05, path: 'assets/audio/Stage1/EV_Stg1_05.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_06, path: 'assets/audio/Stage1/EV_Stg1_06.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_07, path: 'assets/audio/Stage1/EV_Stg1_07.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_08, path: 'assets/audio/Stage1/EV_Stg1_08.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_09, path: 'assets/audio/Stage1/EV_Stg1_09.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_10, path: 'assets/audio/Stage1/EV_Stg1_10.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_11, path: 'assets/audio/Stage1/EV_Stg1_11.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_12, path: 'assets/audio/Stage1/EV_Stg1_12.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_13, path: 'assets/audio/Stage1/EV_Stg1_13.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_14, path: 'assets/audio/Stage1/EV_Stg1_14.mp3' },
  { assetKey: ASSET_KEYS.LVL1_VO_15, path: 'assets/audio/Stage1/EV_Stg1_15.mp3' },

  //LEVEL 2 VOICEOVER
  { assetKey: ASSET_KEYS.LVL2_VO_01, path: 'assets/audio/Stage2/EV_Stg2_01.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_02, path: 'assets/audio/Stage2/EV_Stg2_02.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_03, path: 'assets/audio/Stage2/EV_Stg2_03.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_04, path: 'assets/audio/Stage2/EV_Stg2_04.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_05, path: 'assets/audio/Stage2/EV_Stg2_05.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_06, path: 'assets/audio/Stage2/EV_Stg2_06.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_07, path: 'assets/audio/Stage2/EV_Stg2_07.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_08, path: 'assets/audio/Stage2/EV_Stg2_08.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_09, path: 'assets/audio/Stage2/EV_Stg2_09.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_10, path: 'assets/audio/Stage2/EV_Stg2_10.mp3' },
  { assetKey: ASSET_KEYS.LVL2_VO_11, path: 'assets/audio/Stage2/EV_Stg2_11.mp3' },

  //LEVEL 3 VOICEOVER (only intro clips exist so far — rest of stage 3 VO not ready)
  { assetKey: ASSET_KEYS.LVL3_VO_01, path: 'assets/audio/Stage3/EV_Stg3_01.mp3' },
  { assetKey: ASSET_KEYS.LVL3_VO_02, path: 'assets/audio/Stage3/EV_Stg3_02.mp3' },

  //LEVEL 3 VOICEOVER (only intro clips exist so far — rest of stage 3 VO not ready)
  { assetKey: ASSET_KEYS.OUTRO_VO_01, path: 'assets/audio/Outro/EV_Outro_01.mp3' },
  { assetKey: ASSET_KEYS.OUTRO_VO_02, path: 'assets/audio/Outro/EV_Outro_02.mp3' },
];

// Rive files, preloaded as raw binary and handed to Rive as a buffer at
// spawn time — same load screen as everything else above, no per-scene fetch.
export const RIVE_ASSETS = [
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_INTRO,
    path: 'assets/rive/Bear_Intro.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_BREATHING,
    path: 'assets/rive/Bear_StateMachine_Breathing.riv',
  },
  {
    assetKey: ASSET_KEYS.RIVE_BEAR_SMILE,
    path: 'assets/rive/Bear_StateMachine_Smile.riv',
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
