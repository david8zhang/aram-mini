import { Game } from '~/scenes/Game'
import { ChampionTypes } from '~/utils/ChampionTypes'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { AbilityKeys } from '../champion/abilities/AbilityKeys'
import { AxePull } from '../champion/abilities/warrior/AxePull'
import { AxeSpin } from '../champion/abilities/warrior/AxeSpin'
import { EmpoweredStrike } from '../champion/abilities/warrior/EmpoweredStrike'
import { ExecutionStrike } from '../champion/abilities/warrior/ExecutionStrike'
import { Fireball } from '../champion/abilities/wizard/Fireball'
import { FireBlastAOE } from '../champion/abilities/wizard/FireBlastAOE'
import { FlameSpread } from '../champion/abilities/wizard/FlameSpread'
import { TrackingFirebomb } from '../champion/abilities/wizard/TrackingFirebomb'
import { AutoAttackType } from '../champion/auto-attack/AutoAttackType'
import { Champion } from '../champion/Champion'
import { ChampionStates } from '../champion/states/ChampionStates'
import { Minion } from '../minion/Minion'
import { Nexus } from '../Nexus'
import { Tower } from '../tower/Tower'

export class Player {
  public game: Game
  public champion: Champion
  public moveTargetMarker?: Phaser.GameObjects.Arc
  public side: Side = Side.LEFT
  public inAttackTargetingMode: boolean = false
  public attackCursorImage: Phaser.GameObjects.Image
  public attackRangeCircle: Phaser.GameObjects.Arc
  public targetToHighlight: Minion | Champion | Tower | Nexus | null = null
  public clickTarget: {
    [key: string]: Minion | Champion | Tower | Nexus | null
  } = {}

  constructor(game: Game, championType: ChampionTypes | undefined) {
    this.game = game
    this.setupMouseClickListener()
    this.setupKeyboardListener()
    this.champion = this.setupChampion(championType!)
    this.attackCursorImage = this.game.add
      .image(0, 0, 'attack-cursor')
      .setVisible(false)
      .setDepth(100)
    this.attackRangeCircle = this.game.add
      .circle(this.champion.sprite.x, this.champion.sprite.y, this.champion.attackRange)
      .setVisible(false)
      .setFillStyle(Constants.ATTACK_RANGE_COLOR, 0.2)
      .setStrokeStyle(2, Constants.ATTACK_RANGE_COLOR)
  }

  setupChampion(championType: ChampionTypes) {
    switch (championType) {
      case ChampionTypes.WARRIOR: {
        return new Champion(this.game, {
          texture: ChampionTypes.WARRIOR,
          isPlayerControlled: true,
          position: {
            x: Constants.LEFT_SPAWN.x,
            y: Constants.LEFT_SPAWN.y,
          },
          side: Side.LEFT,
          abilities: {
            [AbilityKeys.Q]: AxeSpin,
            [AbilityKeys.W]: EmpoweredStrike,
            [AbilityKeys.E]: AxePull,
            [AbilityKeys.R]: ExecutionStrike,
          },
          autoAttackType: AutoAttackType.MELEE,
        })
      }
      case ChampionTypes.WIZARD: {
        return new Champion(this.game, {
          texture: ChampionTypes.WIZARD,
          isPlayerControlled: true,
          position: {
            x: Constants.LEFT_SPAWN.x,
            y: Constants.LEFT_SPAWN.y,
          },
          side: Side.LEFT,
          abilities: {
            [AbilityKeys.Q]: Fireball,
            [AbilityKeys.W]: FireBlastAOE,
            [AbilityKeys.E]: FlameSpread,
            [AbilityKeys.R]: TrackingFirebomb,
          },
          autoAttackType: AutoAttackType.RANGED,
        })
      }
    }
  }

  update() {
    this.champion.update()
    if (this.inAttackTargetingMode) {
      this.attackCursorImage.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
      this.attackRangeCircle.setPosition(this.champion.sprite.x, this.champion.sprite.y)
    }
  }

  setupMouseClickListener() {
    this.game.input.mouse.disableContextMenu()
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.champion.isDead) {
        return
      }
      if (pointer.rightButtonDown()) {
        const minion = this.getClickTarget('minion')
        const tower = this.getClickTarget('tower')
        const nexus = this.getClickTarget('nexus')
        const champion = this.getClickTarget('champion')
        if (champion) {
          this.setChampionAttackTarget(champion)
        } else if (tower) {
          this.setChampionAttackTarget(tower)
        } else if (minion) {
          this.setChampionAttackTarget(minion)
        } else if (nexus) {
          this.setChampionAttackTarget(nexus)
        } else {
          this.moveChampionToPosition(pointer)
        }
      } else if (pointer.leftButtonDown()) {
        if (this.inAttackTargetingMode) {
          const target = this.getNearestTargetToCursor(pointer.worldX, pointer.worldY)
          if (target) {
            this.setChampionAttackTarget(target)
          }
        }
      }
      this.disableAttackTargeting()
    })
  }

  getClickTarget(key: string) {
    const target = this.clickTarget[key]
    if (!target || !target.sprite.active || target.getHealth() <= 0) {
      this.clickTarget[key] = null
      return null
    }
    return target
  }

  getNearestTargetToCursor(pointerX: number, pointerY: number) {
    let minDistance = Number.MAX_SAFE_INTEGER
    let closestTarget: Minion | Nexus | Tower | Champion | null = null

    const enemyChampion = this.game.rightChampions
    enemyChampion.forEach((c) => {
      const distance = Phaser.Math.Distance.Between(pointerX, pointerY, c.sprite.x, c.sprite.y)
      if (distance <= minDistance) {
        closestTarget = c
        minDistance = distance
      }
    })

    const minionGroup = this.game.rightMinionSpawner.minions
    minionGroup.children.entries.forEach((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite
      const distance = Phaser.Math.Distance.Between(pointerX, pointerY, sprite.x, sprite.y)
      if (distance <= minDistance) {
        closestTarget = child.getData('ref') as Minion
        minDistance = distance
      }
    })

    this.game.rightTowers.forEach((tower) => {
      const distance = Phaser.Math.Distance.Between(
        pointerX,
        pointerY,
        tower.sprite.x,
        tower.sprite.y
      )
      if (distance <= minDistance && !tower.isDead) {
        closestTarget = tower
        minDistance = distance
      }
    })
    const distanceToNexus = Phaser.Math.Distance.Between(
      pointerX,
      pointerY,
      this.game.rightNexus.sprite.x,
      this.game.rightNexus.sprite.y
    )
    if (distanceToNexus <= minDistance && this.game.rightNexus.isTargetable) {
      closestTarget = this.game.rightNexus
      minDistance = distanceToNexus
    }
    if (minDistance <= 50) {
      return closestTarget
    }
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
    this.game.hideCursor()
    this.attackCursorImage.setVisible(true)
    this.attackRangeCircle.setVisible(true)
    this.inAttackTargetingMode = true
  }

  disableAttackTargeting() {
    this.game.showCursor()
    this.attackCursorImage.setVisible(false)
    this.attackRangeCircle.setVisible(false)
    this.inAttackTargetingMode = false
  }

  stopChampion() {
    if (!this.champion.isDead) {
      this.disableAttackTargeting()
      this.champion.stateMachine.transition(ChampionStates.IDLE)
      this.deHighlightAttackTarget()
    }
  }

  moveChampionToPosition(pointer: Phaser.Input.Pointer) {
    if (!this.champion.isDead) {
      this.champion.setMoveTarget(Math.round(pointer.worldX), Math.round(pointer.worldY))
      this.champion.stateMachine.transition(ChampionStates.MOVE)
      this.deHighlightAttackTarget()
    }
  }

  setChampionAttackTarget(target: Minion | Champion | Tower | Nexus) {
    if (!this.champion.isDead) {
      this.champion.attackTarget = target
      this.champion.stateMachine.transition(ChampionStates.ATTACK)
      this.highlightAttackTarget(target)
    }
  }

  deHighlightAttackTarget() {
    if (this.targetToHighlight) {
      this.game.postFxPlugin.remove(this.targetToHighlight.sprite)
      this.targetToHighlight.shouldShowHoverOutline = true
      this.targetToHighlight = null
    }
  }

  highlightAttackTarget(target: Minion | Champion | Tower | Nexus) {
    if (this.targetToHighlight && this.targetToHighlight.sprite.active) {
      this.game.postFxPlugin.remove(this.targetToHighlight.sprite)
    }

    target.shouldShowHoverOutline = false
    this.game.postFxPlugin.remove(target.sprite)
    this.targetToHighlight = target
    this.game.postFxPlugin.add(this.targetToHighlight.sprite, {
      thickness: 2,
      outlineColor: Constants.RIGHT_COLOR,
    })
  }
}
