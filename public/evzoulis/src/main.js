import Phaser from './lib/phaser.js';
import { SCENE_KEYS } from './common/scene-keys.js';
import { IntroScene } from './scenes/intro-scene.js';
import { GameScene } from './scenes/game-scene.js';
import { GameScene2 } from './scenes/game-scene2.js';
import { GameScene3 } from './scenes/game-scene3.js';
import { OutroScene } from './scenes/outro-scene.js';
import { PreloadScene } from './scenes/preload-scene.js';

/** @type {Phaser.Types.Core.GameConfig} */
const gameConfig = {
  type: Phaser.AUTO,
  pixelArt: false,
  title: 'Euzoulis',
  scale: {
    parent: 'game-container',
    width: 1080,
    height: 1920,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    mode: Phaser.Scale.FIT,
  },
  backgroundColor: '#000000',
};

const game = new Phaser.Game(gameConfig);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.EUZOYLIS_INTRO_SCENE, IntroScene);
game.scene.add(SCENE_KEYS.EUZOYLIS_GAME_SCENE1, GameScene);
game.scene.add(SCENE_KEYS.EUZOYLIS_GAME_SCENE2, GameScene2);
game.scene.add(SCENE_KEYS.EUZOYLIS_GAME_SCENE3, GameScene3);
game.scene.add(SCENE_KEYS.EUZOYLIS_OUTRO_SCENE, OutroScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);
