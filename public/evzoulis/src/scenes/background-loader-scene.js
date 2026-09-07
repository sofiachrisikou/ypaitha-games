import Phaser from '../lib/phaser.js';
import { SCENE_KEYS } from '../common/scene-keys.js';
import {
  INTRO_CHARACTER_ASSETS,
  GAMEPLAY_SHARED_ASSETS,
  STAGE1_ASSETS,
  STAGE2_ASSETS,
  STAGE3_ASSETS,
  OUTRO_ASSETS,
  queueAssetBucket,
  markBucketLoaded,
} from '../common/assets.js';
import { debugLog } from '../common/sharedGameSettings.js';

// One bucket at a time, in order — each waits for the previous to finish
// downloading before the next is queued, so a slow connection never floods
// itself with every remaining stage's files at once. INTRO_CHARACTER goes
// first — it's the one thing gating IntroScene's Start button, so it should
// win the race over everything else that has no visible deadline yet.
const LOAD_SEQUENCE = [
  ['INTRO_CHARACTER', INTRO_CHARACTER_ASSETS],
  ['GAMEPLAY_SHARED', GAMEPLAY_SHARED_ASSETS],
  ['STAGE1', STAGE1_ASSETS],
  ['STAGE2', STAGE2_ASSETS],
  ['STAGE3', STAGE3_ASSETS],
  ['OUTRO', OUTRO_ASSETS],
];

// Runs invisibly for the whole session, launched once alongside IntroScene
// and never stopped — so a background load is never at risk of being cut
// off by a gameplay scene shutting down mid-fetch. No visuals, no update().
export class BackgroundLoaderScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_KEYS.BACKGROUND_LOADER_SCENE });
  }

  create() {
    // Always-on, not gated by DEBUG — a failed file download is a real
    // problem worth knowing about even in a shipped kiosk build.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, (file) => {
      console.warn(`[Loading] FAILED: ${file.key} (${file.src})`);
    });
    this.#loadNext(0);
  }

  #loadNext(index) {
    if (index >= LOAD_SEQUENCE.length) {
      return;
    }
    const [name, bucket] = LOAD_SEQUENCE[index];
    debugLog(`[Loading] ${name}: started`);
    queueAssetBucket(this, bucket);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      debugLog(`[Loading] ${name}: finished`);
      markBucketLoaded(name);
      this.#loadNext(index + 1);
    });
    this.load.start();
  }
}
