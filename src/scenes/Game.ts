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

  // Tilemaps
  public tileMap!: Phaser.Tilemaps.Tilemap
  public layerMappings: { [key: string]: Phaser.Tilemaps.TilemapLayer } = {}

  // Spawners
  public leftMinionSpawner!: MinionSpawner
  public rightMinionSpawner!: MinionSpawner

  // Towers
  public rightTowers: Tower[] = []
  public leftTowers: Tower[] = []

  // Champions
  public leftChampionsGroup!: Phaser.GameObjects.Group
  public rightChampionsGroup!: Phaser.GameObjects.Group

  constructor() {
    super('game')
  }

  preload() {
    this.graphics = this.add.graphics({
      lineStyle: {
        width: 1,
        color: 0x00ff00,
        alpha: 1,
      },
    })
    this.projectileGroup = this.add.group()
    this.leftChampionsGroup = this.add.group()
    this.rightChampionsGroup = this.add.group()
  }

  create() {
    this.debug = new Debug(this)
    this.initCamera()
    this.initTilemap()
    this.initPlayer()
    this.initMinionSpawners()
    this.initTowers()
  }

  public get leftChampions() {
    return this.leftChampionsGroup.children.entries.map((entry) => {
      return entry.getData('ref') as Champion
    })
  }

  public get rightChampions() {
    return this.rightChampionsGroup.children.entries.map((entry) => {
      return entry.getData('ref') as Champion
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
    this.physics.add.collider(this.leftMinionSpawner.minions, this.rightMinionSpawner.minions)
    this.physics.add.collider(this.leftMinionSpawner.minions, this.leftMinionSpawner.minions)
    this.physics.add.collider(this.rightMinionSpawner.minions, this.rightMinionSpawner.minions)

    this.rightMinionSpawner.startSpawning()
    this.leftMinionSpawner.startSpawning()
  }

  initTowers() {
    Constants.LEFT_TOWER_CONFIGS.forEach((config) => {
      this.leftTowers.push(
        new Tower(this, {
          position: config.position,
          texture: 'tower_blue',
          scale: 2,
          side: Side.LEFT,
        })
      )
    })
    Constants.RIGHT_TOWER_CONFIGS.forEach((config) => {
      this.rightTowers.push(
        new Tower(this, {
          position: config.position,
          texture: 'tower_red',
          scale: 2,
          side: Side.RIGHT,
        })
      )
    })
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
        side: Side.LEFT,
      },
    })
    this.cameras.main.startFollow(this.player.champion.sprite, true)
    this.leftChampionsGroup.add(this.player.champion.sprite)
  }

  getMinionAtPosition(side: Side, x: number, y: number, range: number) {
    const minionsGroup =
      side === Side.LEFT ? this.leftMinionSpawner.minions : this.rightMinionSpawner.minions
    return minionsGroup.children.entries.find((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite
      return (
        sprite.x >= x - range &&
        sprite.x <= x + range &&
        sprite.y >= y - range &&
        sprite.y <= y + range
      )
    })
  }

  getTowerAtPosition(side: Side, x: number, y: number, range: number) {
    const towersList = side === Side.LEFT ? this.leftTowers : this.rightTowers
    return towersList.find((tower) => {
      return (
        tower.sprite.x >= x - range &&
        tower.sprite.x <= x + range &&
        tower.sprite.y >= y - range &&
        tower.sprite.y <= y + range
      )
    })
  }

  initTilemap() {
    this.tileMap = this.make.tilemap({
      key: 'map',
    })
    const tileset = this.tileMap.addTilesetImage('tilemap_packed', 'tilemap_packed')
    this.createLayer('wall', tileset)
    this.createLayer('ground', tileset)
    this.physics.add.collider(this.leftChampionsGroup, this.layerMappings['wall'])
    this.physics.add.collider(this.rightChampionsGroup, this.layerMappings['wall'])
  }

  createLayer(layerName: string, tileset: Phaser.Tilemaps.Tileset) {
    const newLayer = this.tileMap.createLayer(layerName, tileset)
    newLayer.setCollisionByExclusion([-1])
    this.layerMappings[layerName] = newLayer
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
