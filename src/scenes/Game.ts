import Phaser from 'phaser'
import { Champion } from '~/core/champion/Champion'
import { Debug } from '~/core/Debug'
import { MinionSpawner } from '~/core/minion/MinionSpawner'
import { Player } from '~/core/Player'
import { Projectile } from '~/core/Projectile'
import { Tower } from '~/core/tower/Tower'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'

export class Game extends Phaser.Scene {
  public player!: Player
  public projectileGroup!: Phaser.GameObjects.Group
  public graphics!: Phaser.GameObjects.Graphics
  public isDebug: boolean = false
  public debug!: Debug

  // Spawners
  public leftMinionSpawner!: MinionSpawner
  public rightMinionSpawner!: MinionSpawner

  // Towers
  public rightTowers: Tower[] = []
  public leftTowers: Tower[] = []

  // Champions
  public leftChampions: Champion[] = []
  public rightChampions: Champion[] = []

  constructor() {
    super('game')
  }

  create() {
    this.graphics = this.add.graphics({
      lineStyle: {
        width: 1,
        color: 0x00ff00,
        alpha: 1,
      },
    })
    this.debug = new Debug(this)
    this.initCamera()
    this.initTilemap()
    this.initPlayer()
    this.initMinionSpawners()
    this.initTowers()
    this.projectileGroup = this.add.group()
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
    this.physics.add.collider(this.leftMinionSpawner.minions, this.rightMinionSpawner.minions)
    this.physics.add.collider(this.leftMinionSpawner.minions, this.leftMinionSpawner.minions)
    this.physics.add.collider(this.rightMinionSpawner.minions, this.rightMinionSpawner.minions)

    this.rightMinionSpawner.startSpawning()
    // this.leftMinionSpawner.startSpawning()
  }

  initTowers() {
    const leftTower = new Tower(this, {
      position: {
        x: 220,
        y: 580,
      },
      texture: 'tower',
      scale: 2,
      side: Side.LEFT,
    })
    const rightTower = new Tower(this, {
      position: {
        x: 580,
        y: 220,
      },
      texture: 'tower',
      scale: 2,
      side: Side.RIGHT,
    })
    this.leftTowers.push(leftTower)
    this.rightTowers.push(rightTower)
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
    this.player.update()
    this.leftMinionSpawner.update()
    this.rightMinionSpawner.update()
    this.projectileGroup.children.entries.forEach((entry) => {
      const projectile = entry.getData('ref') as Projectile
      projectile.update()
    })
    this.leftTowers.forEach((t) => t.update())
    this.rightTowers.forEach((t) => t.update())
    this.graphics.lineStyle(1, 0x00ff00, 1)
  }
}
