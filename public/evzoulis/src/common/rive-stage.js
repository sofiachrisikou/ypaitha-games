const { Rive, Layout, Fit, Alignment } = window.rive;

// Shared cap for spots where the #rive-stage canvas box is intentionally much
// bigger than the visible artwork (the oversized-box-plus-off-center-crop
// trick used by the level-intro, level-end celebration, and main outro bear).
// Confirmed visually identical to using the real screen devicePixelRatio;
// bump this if it ever looks too soft on a high-DPI screen.
export const BEAR_RIVE_MAX_DPR = 1;

//#region Rive Animation

/**
 * @param {ArrayBuffer} buffer - preloaded .riv bytes, e.g. scene.cache.binary.get(ASSET_KEYS.RIVE_...)
 * @param {string} name - state machine OR animation name, depending on isStateMachine
 * @param {string} cssClass
 * @param {boolean} loop - default false
 * @param {boolean} isStateMachine - default true (matches your existing intro/level1 files); pass false for files like this one where the runtime reports it's a plain Animation, not a State Machine
 * @param {number} [maxDevicePixelRatio] - caps the raster resolution below the screen's real devicePixelRatio (e.g. 1 or 1.5) without changing the canvas's CSS size/position/crop — use this to cut render cost on a spot where the canvas box is much bigger than the visible artwork. Omit to use the screen's real devicePixelRatio (previous/default behavior).
 */
export function spawnRiveAnimation(buffer, name, cssClass, loop = false, isStateMachine = true, maxDevicePixelRatio) {
  const canvas = document.getElementById('rive-stage');
  canvas.classList.add(cssClass);

  const instance = new Rive({
    buffer,
    canvas,
    autoplay: true,
    ...(isStateMachine ? { stateMachines: name } : { animations: name }),
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: () => instance.resizeDrawingSurfaceToCanvas(maxDevicePixelRatio),
  });

  if (loop) {
    instance.on(window.rive.EventType.Stop, () => instance.play());
  }

  return instance;
}

export function removeRiveAnimation(riveInstance, cssClass) {
  const canvas = document.getElementById('rive-stage');
  riveInstance?.cleanup();
  canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  canvas.classList.remove(cssClass);
}

//#endregion

//#region Anchor Position

/**
 * Where the #rive-stage canvas is ACTUALLY rendered right now, converted into
 * this scene's own Phaser coordinates — lets a speech bubble stay positioned
 * relative to wherever the character really is, instead of two independently
 * guessed numbers (a CSS % for the character, a Phaser pixel offset for the
 * bubble) that go out of sync every time either one is retuned.
 * translate(-50%,-50%) on every .rive-stage--* class means the box's own
 * center is the intended anchor point, so that's what this returns (plus the
 * box's size, so callers can e.g. place a bubble "above" the character as a
 * fraction of its own on-screen height rather than a flat pixel number).
 * Call this AFTER spawnRiveAnimation (so the CSS class is already applied).
 * @param {Phaser.Scene} scene
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export function getRiveAnchorScenePosition(scene) {
  const riveCanvas = /** @type {HTMLElement} */ (document.getElementById('rive-stage'));
  const riveRect = riveCanvas.getBoundingClientRect();
  const gameCanvasRect = scene.sys.game.canvas.getBoundingClientRect();

  /**
   * @param {number} clientX
   * @param {number} clientY
   */
  const toScene = (clientX, clientY) => ({
    x: ((clientX - gameCanvasRect.left) / gameCanvasRect.width) * scene.scale.width,
    y: ((clientY - gameCanvasRect.top) / gameCanvasRect.height) * scene.scale.height,
  });

  const center = toScene(riveRect.left + riveRect.width / 2, riveRect.top + riveRect.height / 2);
  const topLeft = toScene(riveRect.left, riveRect.top);

  return {
    x: center.x,
    y: center.y,
    width: (center.x - topLeft.x) * 2,
    height: (center.y - topLeft.y) * 2,
  };
}

//#endregion

//#region Input

/**
 * @param {object} riveInstance
 * @param {string} stateMachineName
 * @param {string} inputName
 * @param {boolean|number} value
 */
export function setStateMachineInput(riveInstance, stateMachineName, inputName, value) {
  const inputs = riveInstance.stateMachineInputs(stateMachineName);
  const input = inputs.find(i => i.name === inputName);
  if (!input) {
    console.warn(`Rive input "${inputName}" not found on "${stateMachineName}"`);
    return;
  }
  input.value = value;
}

//#endregion
