import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../Champion'
import { Ability } from './Ability'
import { CooldownTimer } from './CooldownTimer'

export class AxePull implements Ability {
  game: Game
  champion: Champion

  private static readonly MANA_COST = 20
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 5
  private static readonly PULL_SPEED = 500

  public iconTexture: string = 'axe-pull-icon'
  public key!: Phaser.Input.Keyboard.Key | null

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public targetingRectangle: Phaser.GameObjects.Rectangle
  public cooldownTimer: CooldownTimer

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    }
    this.targetingRectangle = this.game.add
      .rectangle(
        this.champion.sprite.x,
        this.champion.sprite.y,
        70,
        30,
        Constants.UI_HIGHLIGHT_COLOR,
        0.75
      )
      .setOrigin(0, 0.5)
      .setVisible(false)
    this.cooldownTimer = new CooldownTimer(this.game, AxePull.ABILITY_COOLDOWN_TIME_SECONDS)
    this.setupMouseClickListener()
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.targetingRectangle.setVisible(false)
          this.triggerAbility()
        }
      }
    })
  }

  public get isInCooldown(): boolean {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires(): number {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  public canTriggerAbility(): boolean {
    return true
  }

  triggerAbility(): void {
    this.champion.decreaseMana(AxePull.MANA_COST)
    this.cooldownTimer.startAbilityCooldown()
    const enemyMinions =
      this.champion.side === Side.LEFT ? this.game.rightMinions : this.game.leftMinions
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    enemyMinions.forEach((minion: Minion) => {
      if (this.targetingRectangle.getBounds().contains(minion.sprite.x, minion.sprite.y)) {
        this.pushTowardsChampion(minion)
      }
    })
    enemyChampions.forEach((champion: Champion) => {
      if (this.targetingRectangle.getBounds().contains(champion.sprite.x, champion.sprite.y)) {
        this.pushTowardsChampion(champion)
      }
    })
  }

  pushTowardsChampion(entity: Champion | Minion) {
    const angleTowardsChampion = Phaser.Math.Angle.BetweenPoints(
      {
        x: entity.sprite.x,
        y: entity.sprite.y,
      },
      {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      }
    )
    const velocityVector = new Phaser.Math.Vector2()
    this.game.physics.velocityFromRotation(angleTowardsChampion, AxePull.PULL_SPEED, velocityVector)
    const checkAtMoveTargetEvent = this.game.time.addEvent({
      delay: 1,
      repeat: -1,
      callback: () => {
        const distance = Phaser.Math.Distance.Between(
          this.champion.sprite.x,
          this.champion.sprite.y,
          entity.sprite.x,
          entity.sprite.y
        )
        if (distance <= this.champion.attackRange) {
          if (entity.sprite.active) {
            entity.sprite.setVelocity(0)
          }
          checkAtMoveTargetEvent.destroy()
        } else {
          if (entity.sprite.active) {
            entity.sprite.setVelocity(velocityVector.x, velocityVector.y)
          }
        }
      },
    })
  }

  update(): void {
    this.handleKeyPress()
    this.renderTargetingUI()
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.game.player.inAttackTargetingMode) {
        return
      }
      if (this.key.isDown && !this.mouseTriggered) {
        if (this.canTriggerAbility()) {
          this.isTargetingMode = true
        }
      } else if (this.key.isUp) {
        this.mouseTriggered = false
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.targetingRectangle.setVisible(false)
          this.triggerAbility()
        }
      }
    }
  }

  renderRectangleToChampion() {
    this.targetingRectangle.setVisible(true)
    this.targetingRectangle.setPosition(this.champion.sprite.x, this.champion.sprite.y)
    const angleToMousePointer = Phaser.Math.Angle.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      this.game.input.mousePointer.worldX,
      this.game.input.mousePointer.worldY
    )
    this.targetingRectangle.setRotation(angleToMousePointer)
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.renderRectangleToChampion()
    }
  }
}
