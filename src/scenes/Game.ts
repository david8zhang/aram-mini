import Phaser from 'phaser'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'

export class Game extends Phaser.Scene {
  public player!: Player
  public updateHooks: Function[] = []

  constructor() {
    super('game')
  }

  create() {
    this.initTilemap()
    this.player = new Player({
      game: this,
      championConfig: {
        texture: 'wizard',
        position: {
          x: 45,
          y: 750,
        },
      },
    })
    this.cameras.main.setBounds(0, 0, Constants.GAME_WIDTH, Constants.GAME_HEIGHT)
    this.cameras.main.startFollow(this.player.champion.sprite, true)
  }

  initTilemap() {
    const tileMap = this.make.tilemap({
      key: 'map',
    })
    const tileset = tileMap.addTilesetImage('tilemap_packed', 'tilemap_packed')
    tileMap.createLayer('default', tileset)
  }

  update() {
    this.updateHooks.forEach((fn) => {
      fn()
    })
  }
}
