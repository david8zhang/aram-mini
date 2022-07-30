import Phaser from 'phaser'
import { MinionSpawner } from '~/core/minion/MinionSpawner'
import { Player } from '~/core/Player'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'

export class Game extends Phaser.Scene {
  public player!: Player
  public updateHooks: Function[] = []
  public leftMinionSpawner!: MinionSpawner
  public rightMinionSpawner!: MinionSpawner
  public graphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('game')
  }

  create() {
    this.initCamera()
    this.initTilemap()
    this.initPlayer()
    this.initMinionSpawners()
    this.graphics = this.add.graphics({
      lineStyle: {
        width: 1,
        color: 0x00ff00,
        alpha: 1,
      },
    })
  }

  initCamera() {
    this.cameras.main.setBounds(0, 0, Constants.GAME_WIDTH, Constants.GAME_HEIGHT)
  }

  initMinionSpawners() {
    this.leftMinionSpawner = new MinionSpawner(this, {
      spawnPosition: Constants.LEFT_SPAWN,
      targetPosition: Constants.RIGHT_SPAWN,
      side: Side.LEFT,
      minionConfig: {
        texture: 'minion_blue',
      },
    })
    this.rightMinionSpawner = new MinionSpawner(this, {
      spawnPosition: Constants.RIGHT_SPAWN,
      targetPosition: Constants.LEFT_SPAWN,
      side: Side.RIGHT,
      minionConfig: {
        texture: 'minion_red',
      },
    })
    this.rightMinionSpawner.startSpawning()
    this.leftMinionSpawner.startSpawning()
  }

  initPlayer() {
    this.player = new Player({
      game: this,
      championConfig: {
        texture: 'wizard',
        position: {
          x: Constants.LEFT_SPAWN.x,
          y: Constants.LEFT_SPAWN.y,
        },
      },
    })
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
    this.graphics.clear()
    this.updateHooks.forEach((fn) => {
      fn()
    })
    this.graphics.lineStyle(1, 0x00ff00, 1)
  }
}
