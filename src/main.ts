import Phaser from 'phaser'
import { Game } from './scenes/Game'
import { Preload } from './scenes/Preload'
import { UI } from './scenes/UI'
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin'
import GrayscalePipelinePlugin from 'phaser3-rex-plugins/plugins/grayscalepipeline-plugin'
import { Start } from './scenes/Start'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  parent: 'phaser',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      // debug: true,
    },
  },
  dom: {
    createContainer: true,
  },
  plugins: {
    global: [
      {
        key: 'rexOutlinePipeline',
        plugin: OutlinePipelinePlugin,
        start: true,
      },
      {
        key: 'rexGrayscalePipeline',
        plugin: GrayscalePipelinePlugin,
        start: true,
      },
    ],
  },
  pixelArt: true,
  scale: {
    parent: 'parent',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [Preload, Start, Game, UI],
}

export default new Phaser.Game(config)
