import Phaser from '../lib/phaser.js';
import { ASSET_KEYS } from './assets.js';
import { TEXT_STYLES } from './sharedGameSettings.js';
import { spawnRiveAnimation, removeRiveAnimation, setStateMachineInput, setRiveCssClass, BEAR_RIVE_MAX_DPR, getRiveAnchorScenePosition } from './rive-stage.js';

/* ============================================================
   SPEECH BUBBLE CONTROLS (level intro) — the only numbers you should need
   to touch to move/resize the bubble relative to the character. The
   bubble's position is computed FROM the character's real on-screen
   position (getRiveAnchorScenePosition in rive-stage.js), not a separate
   guess, so if you change the character's SCALE/TOP/LEFT in style.css the
   bubble follows it without needing to be retuned.
   ============================================================ */
// Bubble image size (0.35 = 35% of its source image's native size).
const BUBBLE_SCALE = 0.35;
// Horizontal distance from the character's center, in PIXELS.
// Negative = bubble sits to the LEFT of the character, positive = RIGHT.
const BUBBLE_OFFSET_X = -280;
// Vertical distance from the character's center, in PIXELS.
// Negative = bubble sits ABOVE the character, positive = BELOW.
// TO MOVE THE BUBBLE DOWN: make this number bigger (e.g. -400 -> -200 -> 0 -> 200).
const BUBBLE_OFFSET_Y = -500;

// Level-intro character reuses the outro/celebration bear + spot — template
// until per-level intro art/rive exists. Own CSS class so it can be tuned independently.
const LEVEL_INTRO_RIVE_CSS_CLASS = 'rive-stage--level-intro';

//#region Level Intro (Character Voiceover)

/**
 * Per-level intro: logo card plus the bear (template:
 * Bear_Outro.riv, same spot as the outro/celebration) speaking through
 * `lines` in order — any number of lines (1, 2, however many) — each
 * showing its own text + audio for its own durationSeconds, before
 * everything is torn down and gameplay starts.
 * @param {Phaser.Scene} scene
 * @param {{ lines: { text: string, audioKey: string, durationSeconds: number }[], logoAssetKey: string, onComplete: () => void }} options
 */
export function showLevelIntroWithVoiceover(scene, { lines, logoAssetKey, onComplete }) {
  const { width, height } = scene.scale;

  const introBg = scene.add.image(width / 2, height / 2, ASSET_KEYS.BACKGROUND_GENERIC).setDepth(1000);
  // Header position — near the top of the 1080x1920 canvas, not mid-screen.
  const introLogo = scene.add.image(width / 2, height * 0.2, logoAssetKey).setDepth(1001).setScale(0.55);

  const riveInstance = spawnRiveAnimation(
    scene.cache.binary.get(ASSET_KEYS.RIVE_BEAR_OUTRO),
    'Timeline_Bear_Outro',
    LEVEL_INTRO_RIVE_CSS_CLASS,
    true,  // loop
    false, // isStateMachine — plain Animation, same as outro-scene.js
    BEAR_RIVE_MAX_DPR,
  );

  const anchor = getRiveAnchorScenePosition(scene);
  const bubbleX = anchor.x + BUBBLE_OFFSET_X;
  const bubbleY = anchor.y + BUBBLE_OFFSET_Y;
  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(BUBBLE_SCALE);
  const bubbleText = scene.add.text(0, -20, lines[0].text, TEXT_STYLES.SPEECH_BUBBLE).setOrigin(0.5);
  const bubbleContainer = scene.add
    .container(bubbleX, bubbleY, [bubbleImage, bubbleText])
    .setDepth(1002)
    .setAlpha(0);
  scene.tweens.add({
    targets: [bubbleContainer],
    alpha: 1,
    duration: 400,
    ease: 'Sine.easeOut',
  });

  /** @type {Phaser.Sound.BaseSound | null} */
  let currentVoiceover = null;
  /** @param {{ text: string, audioKey: string, durationSeconds: number }} line */
  const playLine = (line) => {
    currentVoiceover?.stop();
    bubbleText.setText(line.text);
    currentVoiceover = scene.sound.add(line.audioKey);
    currentVoiceover.play();
  };

  playLine(lines[0]);

  let elapsedMs = 0;
  lines.forEach((line, index) => {
    elapsedMs += line.durationSeconds * 1000;
    const nextLine = lines[index + 1];
    scene.time.delayedCall(elapsedMs, () => {
      if (nextLine) {
        playLine(nextLine);
        return;
      }
      currentVoiceover?.stop();
      introBg.destroy();
      introLogo.destroy();
      bubbleContainer.destroy();
      removeRiveAnimation(riveInstance, LEVEL_INTRO_RIVE_CSS_CLASS);
      onComplete();
    });
  });
}

//#endregion

//#region Animated Character

/**
 * One persistent state-machine-driven character (spawn once, animate via
 * one integer parameter), shared by any stage that needs it — avoids each
 * stage's scene file duplicating this machinery.
 *
 * Every number here is plain and absolute — position/bubble placement is
 * never computed from where the character visually renders, only from
 * whatever you set. To move/resize something, edit the position object.
 *
 * @param {Phaser.Scene} scene
 * @param {{ riveAssetKey: string, stateMachineName: string, animParamName: string, idleParam: number }} config
 * @param {{ cssClass: string, bubbleScale: number, bubbleX: number, bubbleY: number, textStyle: object }} initialPosition
 * @param {() => void} [onReady]
 * @returns {{
 *   moveTo: (position: { cssClass: string, bubbleScale: number, bubbleX: number, bubbleY: number, textStyle: object }) => void,
 *   setAnimationParam: (value: number) => void,
 *   playMoment: (moment: { animationParam: number, audioKey: string, durationSeconds: number }, onComplete?: () => void) => void,
 *   playMomentWithSpeech: (moment: { animationParam: number, audioKey: string, durationSeconds: number, text: string }, onComplete?: () => void) => void,
 *   playMomentAuto: (moment: { animationParam: number, audioKey: string, durationSeconds: number, text?: string }, onComplete?: () => void) => void,
 *   playSequence: (steps: { animationParam: number, audioKey: string, durationSeconds?: number, text?: string, waitForButton?: { assetKey: string, x: number, y: number, scale?: number } }[], onComplete?: () => void) => void,
 *   playFeedback: (step: { animationParam: number, audioKey: string, durationSeconds: number, text?: string }, onComplete?: () => void) => void,
 *   hideBubble: () => void,
 *   cancelPendingFeedback: () => void,
 *   destroy: () => void,
 * }}
 */
export function createAnimatedCharacter(scene, config, initialPosition, onReady) {
  const riveInstance = spawnRiveAnimation(
    scene.cache.binary.get(config.riveAssetKey),
    config.stateMachineName,
    initialPosition.cssClass,
    false,
    true,
    BEAR_RIVE_MAX_DPR,
    onReady,
  );

  const bubbleImage = scene.add.image(0, 0, ASSET_KEYS.SPEECH_BUBBLE).setScale(initialPosition.bubbleScale);
  const bubbleText = scene.add.text(0, -20, '', initialPosition.textStyle).setOrigin(0.5);
  const bubbleContainer = scene.add
    .container(initialPosition.bubbleX, initialPosition.bubbleY, [bubbleImage, bubbleText])
    .setDepth(1002)
    .setVisible(false);

  let cssClass = initialPosition.cssClass;
  /** @type {Phaser.Sound.BaseSound | null} */
  let currentVoiceover = null;
  /** @type {Phaser.Time.TimerEvent | null} */
  let pendingTimer = null;
  /** @type {Phaser.GameObjects.Image | null} */
  let currentButton = null;

  /** @param {number} value */
  function setAnimationParam(value) {
    setStateMachineInput(riveInstance, config.stateMachineName, config.animParamName, value);
    // Rive pauses its own render loop once it thinks nothing is animating — this forces it to resume.
    riveInstance.play();
  }

  /** @param {{ cssClass: string, bubbleScale: number, bubbleX: number, bubbleY: number, textStyle: object }} position */
  function moveTo(position) {
    setRiveCssClass(position.cssClass, cssClass);
    cssClass = position.cssClass;
    bubbleImage.setScale(position.bubbleScale);
    bubbleText.setStyle(position.textStyle);
    bubbleContainer.setPosition(position.bubbleX, position.bubbleY);
  }

  function playMoment(moment, onComplete) {
    pendingTimer?.remove();
    setAnimationParam(moment.animationParam);
    currentVoiceover?.stop();
    currentVoiceover = scene.sound.add(moment.audioKey);
    currentVoiceover.play();
    pendingTimer = scene.time.delayedCall(moment.durationSeconds * 1000, () => {
      pendingTimer = null;
      onComplete?.();
    });
  }

  function playMomentWithSpeech(moment, onComplete) {
    bubbleText.setText(moment.text);
    bubbleContainer.setVisible(true);
    playMoment(moment, () => {
      bubbleContainer.setVisible(false);
      onComplete?.();
    });
  }

  function playMomentAuto(moment, onComplete) {
    if (moment.text) {
      playMomentWithSpeech(moment, onComplete);
    } else {
      // A previous step may have left the bubble open (it has its own text) — this step has none, so close it now rather than orphaning it visible forever.
      bubbleContainer.setVisible(false);
      playMoment(moment, onComplete);
    }
  }

  /**
   * @param {{ animationParam: number, audioKey: string, text?: string }} step
   * @param {{ assetKey: string, x: number, y: number, scale?: number }} buttonConfig
   * @param {() => void} onComplete
   */
  function playMomentWaitForButton(step, buttonConfig, onComplete) {
    setAnimationParam(step.animationParam);
    currentVoiceover?.stop();
    currentVoiceover = scene.sound.add(step.audioKey);
    currentVoiceover.play();
    if (step.text) {
      bubbleText.setText(step.text);
      bubbleContainer.setVisible(true);
    }

    currentButton = scene.add
      .image(buttonConfig.x, buttonConfig.y, buttonConfig.assetKey)
      .setScale(buttonConfig.scale ?? 0.45)
      .setInteractive({ useHandCursor: true });
    currentButton.once(Phaser.Input.Events.POINTER_DOWN, () => {
      currentButton?.destroy();
      currentButton = null;
      bubbleContainer.setVisible(false);
      onComplete();
    });
  }

  /** One-off feedback moment — plays then returns to idle, then calls onComplete (e.g. to re-enable input). */
  function playFeedback(step, onComplete) {
    playMomentAuto(step, () => {
      setAnimationParam(config.idleParam);
      onComplete?.();
    });
  }

  /**
   * Walks `steps` in order — each step's own durationSeconds, chained. Steps
   * with `text` show the bubble; steps without play silently. A step with
   * `waitForButton` skips durationSeconds and instead spawns a button, advancing
   * on click. After the LAST step, resets to idle.
   */
  function playSequence(steps, onComplete) {
    const playAt = (index) => {
      const step = steps[index];
      const isLast = index === steps.length - 1;
      const advance = () => {
        if (isLast) {
          setAnimationParam(config.idleParam);
          onComplete?.();
          return;
        }
        playAt(index + 1);
      };

      if (step.waitForButton) {
        playMomentWaitForButton(step, step.waitForButton, advance);
      } else {
        playMomentAuto(step, advance);
      }
    };

    playAt(0);
  }

  /** Force-hides the bubble immediately, independent of whatever moment/timer is running — e.g. dismiss it on a new player action. */
  function hideBubble() {
    bubbleContainer.setVisible(false);
  }

  /**
   * Cancels whatever playMoment/playFeedback duration timer + audio is still
   * running, without starting anything new. For real-time gesture-driven
   * poses (raw setAnimationParam calls outside the moment system, e.g. Stage
   * 1's swipe/hold tracking) — call this first so a stale feedback timer
   * can't survive and later snap the pose back on its own, ignoring new input.
   */
  function cancelPendingFeedback() {
    pendingTimer?.remove();
    pendingTimer = null;
    currentVoiceover?.stop();
  }

  function destroy() {
    currentVoiceover?.stop();
    pendingTimer?.remove();
    currentButton?.destroy();
    bubbleContainer.destroy();
    removeRiveAnimation(riveInstance, cssClass);
  }

  return { moveTo, setAnimationParam, playMoment, playMomentWithSpeech, playMomentAuto, playSequence, playFeedback, hideBubble, cancelPendingFeedback, destroy };
}

//#endregion
