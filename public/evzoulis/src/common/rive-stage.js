const { Rive, Layout, Fit, Alignment } = window.rive;

/**
 * @param {string} src
 * @param {string} name - state machine OR animation name, depending on isStateMachine
 * @param {string} cssClass
 * @param {boolean} loop - default false
 * @param {boolean} isStateMachine - default true (matches your existing intro/level1 files); pass false for files like this one where the runtime reports it's a plain Animation, not a State Machine
 */
export function spawnRiveAnimation(src, name, cssClass, loop = false, isStateMachine = true) {
  const canvas = document.getElementById('rive-stage');
  canvas.classList.add(cssClass);

  const instance = new Rive({
    src,
    canvas,
    autoplay: true,
    ...(isStateMachine ? { stateMachines: name } : { animations: name }),
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoad: () => instance.resizeDrawingSurfaceToCanvas(),
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