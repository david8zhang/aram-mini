import Phaser from 'phaser'
import { createSlashAnims } from '~/core/anims/slashAnims'
import { Champion } from '~/core/champion/Champion'
import { CPU } from '~/core/cpu/CPU'
import { Debug } from '~/core/Debug'
import { HealthRelic } from '~/core/HealthRelic'
import { Minion } from '~/core/minion/Minion'
import { MinionSpawner } from '~/core/minion/MinionSpawner'
import { Nexus } from '~/core/Nexus'
import { ParticleEmitter } from '~/core/ParticleEmitter'
import { Player } from '~/core/player/Player'
import { Projectile } from '~/core/Projectile'
import { Tower } from '~/core/tower/Tower'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { UI } from './UI'

export enum IgnoreDepthSortName {
  MELEE_ATTACK = 'MELEE_ATTACK',
}

export class Game extends Phaser.Scene {
  private static _instance: Game
  public player!: Player
  public projectileGroup!: Phaser.GameObjects.Group
  public graphics!: Phaser.GameObjects.Graphics
  public isDebug: boolean = false
  public debug!: Debug
  public cpu!: CPU

  public ignoreDepthSortNames = [IgnoreDepthSortName.MELEE_ATTACK]
  public postFxPlugin: any
  public grayscalePlugin: any
  public cameraGrayscaleFilter: any

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

  public isGameOver: boolean = false
  public particleEmitter!: ParticleEmitter
  public healthRelics: HealthRelic[] = []

  constructor() {
    super('game')
    Game._instance = this
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

  initPlugins() {
    this.postFxPlugin = this.plugins.get('rexOutlinePipeline')
    this.grayscalePlugin = this.plugins.get('rexGrayscalePipeline')
    this.cameraGrayscaleFilter = this.grayscalePlugin.add(this.cameras.main, { intensity: 0 })
  }

  create() {
    this.debug = new Debug(this)
    this.initAnimations()
    this.initPlugins()
    this.initCamera()
    this.initTilemap()
    this.initPlayer()
    this.initCPU()
    this.initMinionSpawners()
    this.initTowers()
    this.initNexuses()
    this.initColliders()
    this.initParticleEmitters()
    this.initHealthRelics()
  }

  initParticleEmitters() {
    this.particleEmitter = new ParticleEmitter(this)
  }

  initAnimations() {
    createSlashAnims(this.anims)
  }

  initColliders() {
    const handleOverlap = (obj1, obj2) => {
      const projectile = obj1.getData('ref') as Projectile
      const target = obj2.getData('ref')
      projectile.handleOverlap(target)
    }

    this.physics.add.overlap(this.projectileGroup, this.leftChampionsGroup, handleOverlap)
    this.physics.add.overlap(this.projectileGroup, this.rightChampionsGroup, handleOverlap)
    this.physics.add.overlap(this.projectileGroup, this.leftMinionSpawner.minions, handleOverlap)
    this.physics.add.overlap(this.projectileGroup, this.rightMinionSpawner.minions, handleOverlap)
  }

  public get leftMinions() {
    return this.leftMinionSpawner.minions.children.entries.map((entry) => {
      return entry.getData('ref') as Minion
    })
  }

  public get rightMinions() {
    return this.rightMinionSpawner.minions.children.entries.map((entry) => {
      return entry.getData('ref') as Minion
    })
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

  public static get instance() {
    return Game._instance
  }

  public hideCursor() {
    document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:none;')
  }

  public showCursor() {
    document.getElementsByTagName('body')[0]?.setAttribute('style', 'cursor:visible;')
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
      onDestroyCallback: () => {
        this.handleEndOfGame(Side.RIGHT)
      },
      side: Side.LEFT,
    })
    this.rightNexus = new Nexus(this, {
      position: Constants.RIGHT_NEXUS_SPAWN,
      texture: 'nexus_red',
      scale: 3,
      onDestroyCallback: () => {
        this.handleEndOfGame(Side.LEFT)
      },
      side: Side.RIGHT,
    })
  }

  handleEndOfGame(victoriousSide: Side) {
    UI.instance.showGameOverUI(victoriousSide === this.player.side)
    this.scene.pause()
    this.isGameOver = true
  }

  resumeGame() {
    this.scene.restart()
    this.isGameOver = false
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

  initHealthRelics() {
    const coordinates = [
      [16, 5],
      [12, 9],
      [5, 16],
      [9, 12],
    ]
    coordinates.forEach((coordinate) => {
      const worldPosition = this.debug.getWorldPositionForCoordinates(coordinate[0], coordinate[1])
      const healthRelic = new HealthRelic(this, {
        position: worldPosition,
        healAmount: 100,
      })
      this.healthRelics.push(healthRelic)
    })
  }

  playAnimationFrames(
    sprite: Phaser.Physics.Arcade.Sprite,
    frames: any[],
    frameIndex: number,
    onCompletedFn: Function
  ) {
    if (frameIndex == frames.length) {
      this.time.delayedCall(100, onCompletedFn)
      return
    }
    const frame = frames[frameIndex]
    this.time.delayedCall(frame.time, () => {
      const xPos = this.player.champion.sprite.x + frame.x
      const yPos = this.player.champion.sprite.y + frame.y
      sprite.setAngle(frame.angle)
      sprite.setPosition(xPos, yPos)
      if (frame.onShowFn) {
        frame.onShowFn()
      }
      this.playAnimationFrames(sprite, frames, frameIndex + 1, onCompletedFn)
    })
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
    this.healthRelics.forEach((h) => h.update())
    this.graphics.lineStyle(1, 0x00ff00, 1)
    // this.depthSort()
  }

  depthSort() {
    const sortedByY = this.sys.displayList
      .getChildren()
      .filter((child: any) => {
        return child.y && !this.ignoreDepthSortNames.includes(child.name)
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
