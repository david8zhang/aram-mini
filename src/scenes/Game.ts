import Phaser from 'phaser'
import { Champion } from '~/core/champion/Champion'
import { CPU } from '~/core/cpu/CPU'
import { Debug } from '~/core/Debug'
import { MinionSpawner } from '~/core/minion/MinionSpawner'
import { Nexus } from '~/core/Nexus'
import { Player } from '~/core/player/Player'
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
  public cpu!: CPU

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

  // Nexuses
  public leftNexus!: Nexus
  public rightNexus!: Nexus

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
    this.initCPU()
    this.initMinionSpawners()
    this.initTowers()
    this.initNexuses()
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
      spawnPosition: Constants.LEFT_NEXUS_SPAWN,
      targetPosition: Constants.RIGHT_NEXUS_SPAWN,
      side: Side.LEFT,
      minionConfig: {
        texture: 'minion_blue',
      },
    })
    this.rightMinionSpawner = new MinionSpawner(this, {
      spawnPosition: Constants.RIGHT_NEXUS_SPAWN,
      targetPosition: Constants.LEFT_NEXUS_SPAWN,
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

  initNexuses() {
    this.leftNexus = new Nexus(this, {
      position: Constants.LEFT_NEXUS_SPAWN,
      texture: 'nexus_blue',
      scale: 3,
      onDestroyCallback: () => {},
      side: Side.LEFT,
    })
    this.rightNexus = new Nexus(this, {
      position: Constants.RIGHT_NEXUS_SPAWN,
      texture: 'nexus_red',
      scale: 3,
      onDestroyCallback: () => {},
      side: Side.RIGHT,
    })
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

  initCPU() {
    this.cpu = new CPU(this)
    this.rightChampionsGroup.add(this.cpu.champion.sprite)
  }

  initPlayer() {
    this.player = new Player(this)
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

  getNexusAtPosition(side: Side, x: number, y: number, range: number) {
    const nexus = side === Side.LEFT ? this.leftNexus : this.rightNexus
    const isWithinRange =
      nexus.sprite.x >= x - range &&
      nexus.sprite.x <= x + range &&
      nexus.sprite.y >= y - range &&
      nexus.sprite.y <= y + range
    return isWithinRange && nexus.isTargetable ? nexus : null
  }

  getChampionAtPosition(side: Side, x: number, y: number, range: number) {
    const championsList = side === Side.LEFT ? this.leftChampions : this.rightChampions
    return championsList.find((c) => {
      return (
        c.sprite.x >= x - range &&
        c.sprite.x <= x + range &&
        c.sprite.y >= y - range &&
        c.sprite.y <= y + range
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
    this.cpu.update()
    this.leftMinionSpawner.update()
    this.rightMinionSpawner.update()
    this.projectileGroup.children.entries.forEach((entry) => {
      const projectile = entry.getData('ref') as Projectile
      projectile.update()
    })
    this.leftTowers.forEach((t) => t.update())
    this.rightTowers.forEach((t) => t.update())
    this.graphics.lineStyle(1, 0x00ff00, 1)
    this.depthSort()
  }

  depthSort() {
    const sortedByY = this.sys.displayList
      .getChildren()
      .filter((child: any) => {
        return child.y
      })
      .sort((a: any, b: any) => {
        return a.y - b.y
      })
    let lowestLayer = 1
    sortedByY.forEach((c: any, index: number) => {
      if (c.setDepth) {
        c.setDepth(lowestLayer + index)
      }
    })
  }
}
