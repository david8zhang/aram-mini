import Phaser from 'phaser'
import { Player } from '~/core/Player'

export class Game extends Phaser.Scene {
  public player!: Player
  public updateHooks: Function[] = []

  constructor() {
    super('game')
  }

  create() {
    this.player = new Player({
      game: this,
      championConfig: {
        texture: 'wizard',
        position: {
          x: 100,
          y: 100,
        },
      },
    })
  }

  update() {
    this.updateHooks.forEach((fn) => {
      fn()
    })
  }
}
