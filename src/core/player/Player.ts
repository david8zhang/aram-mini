import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion, ChampionConfig } from '../champion/Champion'
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

  constructor(game: Game) {
    this.game = game
    this.champion = new Champion(this.game, {
      texture: 'wizard',
      position: {
        x: Constants.LEFT_SPAWN.x,
        y: Constants.LEFT_SPAWN.y,
      },
      side: Side.LEFT,
    })
    this.setupMouseClickListener()
    this.setupKeyboardListener()
    this.attackCursorImage = this.game.add
      .image(0, 0, 'attack-cursor')
      .setVisible(false)
      .setDepth(100)
    this.attackRangeCircle = this.game.add
      .circle(this.champion.sprite.x, this.champion.sprite.y, Constants.CHAMPION_ATTACK_RANGE)
      .setVisible(false)
      .setFillStyle(0xadd8e6, 0.2)
      .setStrokeStyle(2, 0xadd8e6)
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
      if (pointer.rightButtonDown()) {
        const minion = this.game.getMinionAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        const tower = this.game.getTowerAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        const nexus = this.game.getNexusAtPosition(Side.RIGHT, pointer.worldX, pointer.worldY, 15)
        const champion = this.game.getChampionAtPosition(
          Side.RIGHT,
          pointer.worldX,
          pointer.worldY,
          15
        )
        if (champion) {
          this.setChampionAttackTarget(champion)
        } else if (tower) {
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
          const target = this.getNearestTargetToCursor(pointer.worldX, pointer.worldY)
          if (target) {
            this.setChampionAttackTarget(target)
          }
        }
      }
      this.disableAttackTargeting()
    })
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
    document.getElementById('phaser')?.setAttribute('style', 'cursor:none;')
    this.attackCursorImage.setVisible(true)
    this.attackRangeCircle.setVisible(true)
    this.inAttackTargetingMode = true
  }

  disableAttackTargeting() {
    document.getElementById('phaser')?.setAttribute('style', 'cursor:default;')
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
