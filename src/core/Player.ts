import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { Champion, ChampionConfig } from './champion/Champion'
import { ChampionStates } from './champion/states/ChampionStates'
import { Minion } from './minion/Minion'
import { Nexus } from './Nexus'
import { Tower } from './tower/Tower'

export interface PlayerConfig {
  game: Game
  championConfig: ChampionConfig
}

export class Player {
  public game: Game
  public champion: Champion
  public moveTargetMarker?: Phaser.GameObjects.Arc
  public side: Side = Side.LEFT
  public inAttackTargetingMode: boolean = false
  public clickBox: Phaser.Physics.Arcade.Sprite
  public attackCursorImage: Phaser.GameObjects.Image

  constructor(config: PlayerConfig) {
    this.game = config.game
    this.champion = new Champion(this.game, config.championConfig)
    this.setupMouseClickListener()
    this.setupKeyboardListener()
    this.clickBox = this.game.physics.add.sprite(0, 0, '').setSize(10, 10).setVisible(false)
    this.attackCursorImage = this.game.add
      .image(0, 0, 'attack-cursor')
      .setVisible(false)
      .setDepth(100)
  }

  update() {
    this.champion.update()
    if (this.inAttackTargetingMode) {
      this.attackCursorImage.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
    }
  }

  setupMouseClickListener() {
    this.game.input.mouse.disableContextMenu()
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        const minion = this.game.getMinionAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        const tower = this.game.getTowerAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        const nexus = this.game.getNexusAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        if (tower) {
          this.setChampionAttackTarget(tower)
        } else if (minion) {
          this.setChampionAttackTarget(minion.getData('ref') as Minion)
        } else if (nexus) {
          this.setChampionAttackTarget(nexus)
        } else {
          this.moveChampionToPosition(pointer)
        }
      } else if (pointer.leftButtonDown()) {
        if (this.inAttackTargetingMode) {
          const minion = this.game.getMinionAtPosition(
            Side.RIGHT,
            pointer.worldX,
            pointer.worldY,
            15
          )
          const tower = this.game.getTowerAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
          const nexus = this.game.getNexusAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
          if (tower) {
            this.setChampionAttackTarget(tower)
          } else if (minion) {
            this.setChampionAttackTarget(minion.getData('ref') as Minion)
          } else if (nexus) {
            this.setChampionAttackTarget(nexus)
          }
        }
      }
      this.disableAttackTargeting()
    })
  }

  setupKeyboardListener() {
    this.game.input.keyboard.on('keydown', (event: Phaser.Input.Keyboard.Key) => {
      switch (event.keyCode) {
        case Phaser.Input.Keyboard.KeyCodes.S: {
          this.stopChampion()
          break
        }
        case Phaser.Input.Keyboard.KeyCodes.A: {
          this.enableAttackTargeting()
          break
        }
      }
    })
  }

  enableAttackTargeting() {
    document.getElementById('phaser')?.setAttribute('style', 'cursor:none;')
    this.attackCursorImage.setVisible(true)
    this.inAttackTargetingMode = true
  }

  disableAttackTargeting() {
    document.getElementById('phaser')?.setAttribute('style', 'cursor:default;')
    this.attackCursorImage.setVisible(false)
    this.inAttackTargetingMode = false
  }

  stopChampion() {
    if (!this.champion.isDead) {
      this.disableAttackTargeting()
      this.champion.stateMachine.transition(ChampionStates.IDLE)
    }
  }

  moveChampionToPosition(pointer: Phaser.Input.Pointer) {
    if (!this.champion.isDead) {
      this.champion.setMoveTarget(Math.round(pointer.worldX), Math.round(pointer.worldY))
      this.champion.stateMachine.transition(ChampionStates.MOVE)
    }
  }

  setChampionAttackTarget(target: Minion | Champion | Tower | Nexus) {
    if (!this.champion.isDead) {
      this.champion.attackTarget = target
      this.champion.stateMachine.transition(ChampionStates.ATTACK)
    }
  }
}
