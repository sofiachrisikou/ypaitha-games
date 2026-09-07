import Phaser from '../lib/phaser.js';

export const ASSET_KEYS = Object.freeze({
  //SHARED — must be loaded before Intro starts
  BTN1: 'BTN1',
  SPEECH_BUBBLE: 'SPEECH_BUBBLE',

  //GAMEPLAY SHARED — must be loaded before Stage 1, NOT required before Intro
  BACKGROUND_GENERIC: 'BACKGROUND_GENERIC',
  PROGRESSBAR_FG: 'PROGRESSBAR_FG',
  PROGRESSBAR_BG: 'PROGRESSBAR_BG',
  CORRECTSOUND: 'CORRECTSOUND',
  WRONGSOUND: 'WRONGSOUND',
  // Not wired into any scene yet. Uncomment + add to GAMEPLAY_SHARED_ASSETS.audio when used.
  // SFX_RELIEF: 'SFX_RELIEF',
  // SFX_HAPPY_REALIZATION: 'SFX_HAPPY_REALIZATION',

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
  OBJECTS: 'OBJECTS', // spritesheet — unused, kept declared, intentionally never loaded (see TEXTURE_ATLAS_ASSETS)
  EZ_01: 'EZ_01', // unused so far
  // Also used by Stage 1 — same .riv file, must finish loading here; Stage 1 reuses the cached instance.
  RIVE_BEAR_Stg1: 'RIVE_BEAR_Stg1',

  //STAGE 1
  BACKGROUND_Stg1: 'BACKGROUND_Stg1',
  STAGE1_LOGO: 'STAGE1_LOGO',
  CANDLE: 'CANDLE',
  CANDLE_FLAME: 'CANDLE_FLAME',
  ARROW_UP: 'ARROW_UP',
  FLOWER1: 'FLOWER1',
  FLOWER2: 'FLOWER2',
  FLOWER3: 'FLOWER3',
  SFX_BREATH_IN: 'SFX_BREATH_IN',
  SFX_BREATH_OUT: 'SFX_BREATH_OUT',
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

  //STAGE 2
  BACKGROUND_Stg2: 'BACKGROUND_Stg2',
  STAGE2_LOGO: 'STAGE2_LOGO',
  BUBBLE1: 'BUBBLE1',
  BUBBLE2: 'BUBBLE2',
  BUBBLE3: 'BUBBLE3',
  BUBBLE4: 'BUBBLE4',
  BUBBLE_POPPED: 'BUBBLE_POPPED',
  BUBBLE_POPPED1: 'BUBBLE_POPPED1',
  BUBBLE_POP_SOUND: 'BUBBLE_POP_SOUND',
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
  RIVE_BEAR_Stg2: 'RIVE_BEAR_Stg2',

  //STAGE 3
  BACKGROUND_Stg3: 'BACKGROUND_Stg3',
  STAGE3_LOGO: 'STAGE3_LOGO',
  BEAR_BODY: 'BEAR_BODY',
  CHAR_ARM_R: 'CHAR_ARM_R',
  CHAR_ARM_L: 'CHAR_ARM_L',
  CHAR_LEG_R: 'CHAR_LEG_R',
  CHAR_LEG_L: 'CHAR_LEG_L',
  SFX_LAUGH: 'SFX_LAUGH',
  EZ_29: 'EZ_29',
  EZ_30: 'EZ_30',
  EZ_31: 'EZ_31',
  EZ_32: 'EZ_32',
  EZ_33: 'EZ_33',
  EZ_34: 'EZ_34',
  EZ_35: 'EZ_35', // exists on disk, unused so far
  EZ_36: 'EZ_36', // exists on disk, unused so far
  EZ_38: 'EZ_38',
  RIVE_BEAR_Stg3: 'RIVE_BEAR_Stg3',
  RIVE_BEAR_Stg3_HEAD: 'RIVE_BEAR_Stg3_HEAD',

  //OUTRO
  BACKGROUND_OUTRO: 'BACKGROUND_OUTRO',
  EZ_39: 'EZ_39',
  EZ_40: 'EZ_40',
  RIVE_BEAR_OUTRO: 'RIVE_BEAR_OUTRO',
});

// Unused — never imported/loaded by preload-scene.js. Main font is GameFont
// (assets/fonts/ComicSansMSBold.ttf), loaded via loadFont() instead.
// export const FONT_ASSETS = [ ... ];

// Unused — kept declared but never loaded (see TEXTURE_ATLAS_ASSETS / preload-scene.js).
// Every asset bucket below has an empty `atlases` array on purpose — the loading
// helper supports atlases generically, this project just doesn't use any right now.
export const TEXTURE_ATLAS_ASSETS = [
  {
    assetKey: ASSET_KEYS.OBJECTS,
    textureURL: 'assets/images/spritesheet.png',
    atlasURL: 'assets/images/spritesheet.json',
  },
];

//#region Asset Buckets — one per load stage, consumed by queueAssetBucket()

export const SHARED_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BTN1, path: 'assets/images/btn1.png' },
    { assetKey: ASSET_KEYS.SPEECH_BUBBLE, path: 'assets/images/speechBubble.png' },
  ],
  audio: [],
  atlases: [],
  rive: [],
};

export const GAMEPLAY_SHARED_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BACKGROUND_GENERIC, path: 'assets/images/Generic_BG.png' },
    { assetKey: ASSET_KEYS.PROGRESSBAR_FG, path: 'assets/images/progBarFG.png' },
    { assetKey: ASSET_KEYS.PROGRESSBAR_BG, path: 'assets/images/progBarBG.png' },
  ],
  audio: [
    { assetKey: ASSET_KEYS.CORRECTSOUND, path: 'assets/audio/correct.wav' },
    { assetKey: ASSET_KEYS.WRONGSOUND, path: 'assets/audio/wrong.mp3' },
    // { assetKey: ASSET_KEYS.SFX_RELIEF, path: 'assets/audio/VO_Sfx/EZ-S3.mp3' },
    // { assetKey: ASSET_KEYS.SFX_HAPPY_REALIZATION, path: 'assets/audio/VO_Sfx/EZ-S4.mp3' },
  ],
  atlases: [],
  rive: [],
};

export const INTRO_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BACKGROUND_INTRO, path: 'assets/images/Classroom_Unhappy.png' },
    { assetKey: ASSET_KEYS.LOGO, path: 'assets/images/logo.png' },
    { assetKey: ASSET_KEYS.EMOJI1, path: 'assets/images/Emoji01.png' },
    { assetKey: ASSET_KEYS.EMOJI2, path: 'assets/images/Emoji02.png' },
    { assetKey: ASSET_KEYS.EMOJI3, path: 'assets/images/Emoji03.png' },
    { assetKey: ASSET_KEYS.CLOUD, path: 'assets/images/thoughtCloud1.png' },
    { assetKey: ASSET_KEYS.CLOUD1, path: 'assets/images/thoughtCloud2.png' },
    { assetKey: ASSET_KEYS.CLOUD2, path: 'assets/images/thoughtCloud3.png' },
    { assetKey: ASSET_KEYS.BOOK, path: 'assets/images/Book1.png' },
    { assetKey: ASSET_KEYS.BELL, path: 'assets/images/Bell.png' },
    { assetKey: ASSET_KEYS.TESTS, path: 'assets/images/Tests.png' },
  ],
  audio: [{ assetKey: ASSET_KEYS.EZ_01, path: 'assets/audio/Intro/EZ-01.mp3' }],
  atlases: [],
  // The character rive file is its own bucket (INTRO_CHARACTER_ASSETS below) —
  // it's the single biggest file Intro needs (~110KB, bigger than everything
  // else here combined), so it loads in the background instead of blocking
  // the logo/Start button from appearing at all.
  rive: [],
};

// Loads in the background the moment IntroScene starts (first bucket in
// BackgroundLoaderScene's sequence) — the logo/background/Start button are
// already visible by then (INTRO_ASSETS above), so the player has something
// to look at while this streams in. IntroScene gates the Start button on
// ensureBucketLoaded('INTRO_CHARACTER') rather than blocking here.
export const INTRO_CHARACTER_ASSETS = {
  images: [],
  audio: [],
  atlases: [],
  // Also reused by Stage 1 (same file) — Stage 1 does not reload it.
  rive: [{ assetKey: ASSET_KEYS.RIVE_BEAR_Stg1, path: 'assets/rive/Euzoulis_Mascot_Stage01.riv' }],
};

export const STAGE1_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BACKGROUND_Stg1, path: 'assets/images/Stage01_BG.png' },
    { assetKey: ASSET_KEYS.STAGE1_LOGO, path: 'assets/images/Stage01.png' },
    { assetKey: ASSET_KEYS.CANDLE, path: 'assets/images/Candle.png' },
    { assetKey: ASSET_KEYS.CANDLE_FLAME, path: 'assets/images/Flame.png' },
    { assetKey: ASSET_KEYS.ARROW_UP, path: 'assets/images/UpArrow.png' },
    { assetKey: ASSET_KEYS.FLOWER1, path: 'assets/images/flower01.png' },
    { assetKey: ASSET_KEYS.FLOWER2, path: 'assets/images/flower02.png' },
    { assetKey: ASSET_KEYS.FLOWER3, path: 'assets/images/flower03.png' },
  ],
  audio: [
    { assetKey: ASSET_KEYS.SFX_BREATH_IN, path: 'assets/audio/VO_Sfx/EZ-S1.mp3' },
    { assetKey: ASSET_KEYS.SFX_BREATH_OUT, path: 'assets/audio/VO_Sfx/EZ-S2.mp3' },
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
  ],
  atlases: [],
  rive: [], // RIVE_BEAR_Stg1 loaded via INTRO_CHARACTER_ASSETS — reused here, not reloaded
};

export const STAGE2_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BACKGROUND_Stg2, path: 'assets/images/Stage02_BG.png' },
    { assetKey: ASSET_KEYS.STAGE2_LOGO, path: 'assets/images/Stage02.png' },
    { assetKey: ASSET_KEYS.BUBBLE1, path: 'assets/images/cloud1.png' },
    { assetKey: ASSET_KEYS.BUBBLE2, path: 'assets/images/cloud2.png' },
    { assetKey: ASSET_KEYS.BUBBLE3, path: 'assets/images/cloud3.png' },
    { assetKey: ASSET_KEYS.BUBBLE4, path: 'assets/images/cloud4.png' },
    { assetKey: ASSET_KEYS.BUBBLE_POPPED, path: 'assets/images/cloudBurst1.png' },
    { assetKey: ASSET_KEYS.BUBBLE_POPPED1, path: 'assets/images/cloudBurst2.png' },
  ],
  audio: [
    { assetKey: ASSET_KEYS.BUBBLE_POP_SOUND, path: 'assets/audio/bubble_pop.wav' },
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
  ],
  atlases: [],
  rive: [{ assetKey: ASSET_KEYS.RIVE_BEAR_Stg2, path: 'assets/rive/Euzoulis_Mascot_Stage02.riv' }],
};

export const STAGE3_ASSETS = {
  images: [
    { assetKey: ASSET_KEYS.BACKGROUND_Stg3, path: 'assets/images/Stage03_BG.png' },
    { assetKey: ASSET_KEYS.STAGE3_LOGO, path: 'assets/images/Stage03.png' },
    { assetKey: ASSET_KEYS.BEAR_BODY, path: 'assets/images/Body.png' },
    { assetKey: ASSET_KEYS.CHAR_ARM_R, path: 'assets/images/Arm_R.png' },
    { assetKey: ASSET_KEYS.CHAR_ARM_L, path: 'assets/images/Arm_L.png' },
    { assetKey: ASSET_KEYS.CHAR_LEG_R, path: 'assets/images/Leg_R.png' },
    { assetKey: ASSET_KEYS.CHAR_LEG_L, path: 'assets/images/Leg_L.png' },
  ],
  audio: [
    { assetKey: ASSET_KEYS.SFX_LAUGH, path: 'assets/audio/VO_Sfx/EZ-S5.mp3' },
    { assetKey: ASSET_KEYS.EZ_29, path: 'assets/audio/Stage3/EZ-29.mp3' },
    { assetKey: ASSET_KEYS.EZ_30, path: 'assets/audio/Stage3/EZ-30.mp3' },
    { assetKey: ASSET_KEYS.EZ_31, path: 'assets/audio/Stage3/EZ-31.mp3' },
    { assetKey: ASSET_KEYS.EZ_32, path: 'assets/audio/Stage3/EZ-32.mp3' },
    { assetKey: ASSET_KEYS.EZ_33, path: 'assets/audio/Stage3/EZ-33.mp3' },
    { assetKey: ASSET_KEYS.EZ_34, path: 'assets/audio/Stage3/EZ-34.mp3' },
    { assetKey: ASSET_KEYS.EZ_35, path: 'assets/audio/Stage3/EZ-35.mp3' },
    { assetKey: ASSET_KEYS.EZ_36, path: 'assets/audio/Stage3/EZ-36.mp3' },
    { assetKey: ASSET_KEYS.EZ_38, path: 'assets/audio/Stage3/EZ-38.mp3' },
  ],
  atlases: [],
  rive: [
    { assetKey: ASSET_KEYS.RIVE_BEAR_Stg3, path: 'assets/rive/Euzoulis_Mascot_Stage03.riv' },
    { assetKey: ASSET_KEYS.RIVE_BEAR_Stg3_HEAD, path: 'assets/rive/Euzoulis_Mascot_Head 2.riv' },
  ],
};

export const OUTRO_ASSETS = {
  images: [{ assetKey: ASSET_KEYS.BACKGROUND_OUTRO, path: 'assets/images/outroBG.png' }],
  audio: [
    { assetKey: ASSET_KEYS.EZ_39, path: 'assets/audio/Outro/EZ-39.mp3' },
    { assetKey: ASSET_KEYS.EZ_40, path: 'assets/audio/Outro/EZ-40.mp3' },
  ],
  atlases: [],
  rive: [{ assetKey: ASSET_KEYS.RIVE_BEAR_OUTRO, path: 'assets/rive/Euzoulis_Mascot_Outro.riv' }],
};

//#endregion

//#region Asset Loading
// queueAssetBucket() queues one bucket above onto a scene's Loader — caller
// decides when to call scene.load.start(). ensureBucketLoaded()/markBucketLoaded()
// are how BackgroundLoaderScene (see background-loader-scene.js) signals gameplay
// scenes that their bucket is ready.

/**
 * @typedef {{assetKey: string, path?: string, textureURL?: string, atlasURL?: string}} BucketAsset
 * @param {Phaser.Scene} scene
 * @param {{images?: BucketAsset[], audio?: BucketAsset[], atlases?: BucketAsset[], rive?: BucketAsset[]}} bucket
 */
export function queueAssetBucket(scene, bucket) {
  bucket.images?.forEach((asset) => scene.load.image(asset.assetKey, asset.path));
  bucket.audio?.forEach((asset) => scene.load.audio(asset.assetKey, asset.path));
  // Atlas loading intentionally disabled — this project doesn't use any texture
  // atlases right now. Uncomment if a bucket ever actually needs one.
  // bucket.atlases?.forEach((asset) => scene.load.atlas(asset.assetKey, asset.textureURL, asset.atlasURL));
  bucket.rive?.forEach((asset) => scene.load.binary(asset.assetKey, asset.path));
}

const loadedBucketNames = new Set();
const bucketEvents = new Phaser.Events.EventEmitter();

/** @param {string} name */
export function markBucketLoaded(name) {
  loadedBucketNames.add(name);
  bucketEvents.emit(name);
}

/**
 * Resolves immediately if the named bucket is already loaded, otherwise
 * resolves the moment BackgroundLoaderScene finishes loading it.
 * @param {string} name
 * @returns {Promise<void>}
 */
export function ensureBucketLoaded(name) {
  if (loadedBucketNames.has(name)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => bucketEvents.once(name, resolve));
}

//#endregion
