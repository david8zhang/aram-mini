import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../../Champion'
import { ChampionStates } from '../../states/ChampionStates'
import { Ability } from '../Ability'
import { CooldownTimer } from '../CooldownTimer'
import { TrackingAbility } from '../TrackingAbility'

export class ExecutionStrike implements Ability, TrackingAbility {
  game: Game
  champion: Champion

  private static readonly EXECUTION_HEALTH_PCT_THRESHOLD = 0.2
  private static readonly ABILITY_RANGE = 50
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 75
  private static readonly MANA_COST = 100
  private static readonly STUN_DURATION = 2000

  public iconTexture: string = 'execution-strike-icon'
  public key!: Phaser.Input.Keyboard.Key | null
  public mouseTriggered: boolean = false
  public isTargetingMode: boolean = false

  public targetingCursor: Phaser.GameObjects.Sprite
  public rangeCircle: Phaser.GameObjects.Arc
  public abilityRange: number = ExecutionStrike.ABILITY_RANGE
  public abilityTargetEntity: Champion | Minion | null = null
  public isTriggeringAbility: boolean = false

  public cooldownTimer: CooldownTimer
  public executionReadySpriteArray: Phaser.GameObjects.Sprite[] = []
  public executionStrikeSprite!: Phaser.GameObjects.Sprite

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R)
    }

    this.targetingCursor = this.game.add
      .sprite(0, 0, 'targeting-cursor')
      .setVisible(false)
      .setDepth(1000)
    this.rangeCircle = this.game.add
      .circle(0, 0, this.abilityRange, Constants.UI_HIGHLIGHT_COLOR, 0.25)
      .setDepth(1000)
      .setStrokeStyle(2, Constants.UI_HIGHLIGHT_COLOR, 1)
      .setVisible(false)
    this.cooldownTimer = new CooldownTimer(this.game, ExecutionStrike.ABILITY_COOLDOWN_TIME_SECONDS)
    this.setupExecutionStrikeSprite()
  }

  setupExecutionStrikeSprite() {
    this.executionStrikeSprite = this.game.add
      .sprite(0, 0, 'execution-strike')
      .setVisible(false)
      .setDepth(1000)
    this.executionStrikeSprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (anim, frame, gameObject) => {
        if (this.abilityTargetEntity) {
          this.executionStrikeSprite.setPosition(
            this.abilityTargetEntity.sprite.x,
            this.abilityTargetEntity.sprite.y - this.abilityTargetEntity.sprite.displayHeight * 2
          )
        }
        if (frame.index === 3) {
          this.isTriggeringAbility = false
          if (this.abilityTargetEntity) {
            if (this.isReadyForExecution(this.abilityTargetEntity as Champion)) {
              this.champion.handleLastHit(this.abilityTargetEntity)
              this.abilityTargetEntity.takeDamage(this.abilityTargetEntity.getHealth())
            } else {
              this.abilityTargetEntity.takeDamage(this.damage)
            }
          }
        }
      }
    )
    this.executionStrikeSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.game.tweens.add({
        targets: this.executionStrikeSprite,
        alpha: { from: 1, to: 0 },
        duration: 500,
        onComplete: () => {
          this.executionStrikeSprite.setVisible(false).setAlpha(1)
        },
      })
    })
  }

  setupExecutionReadySprites() {
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    enemyChampions.forEach(() => {
      const executionReadySprite = this.game.add
        .sprite(0, 0, 'execution-ready-icon')
        .setVisible(false)
        .setFlipY(true)
        .setDepth(1000)
      this.executionReadySpriteArray.push(executionReadySprite)
    })
  }

  public get isInCooldown(): boolean {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires(): number {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  canTriggerAbility(): boolean {
    return !this.isInCooldown && this.champion.manaAmount >= ExecutionStrike.MANA_COST
  }

  triggerAbility(): void {
    const targetingCircle = new Phaser.Geom.Circle(
      this.game.input.mousePointer.worldX,
      this.game.input.mousePointer.worldY,
      8
    )
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    const clickedEntity = this.getClickedEntity(enemyChampions, targetingCircle)
    this.abilityTargetEntity = clickedEntity
    if (this.abilityTargetEntity) {
      if (this.isInRange()) {
        this.triggerAbilityTowardsTarget(this.abilityTargetEntity, null)
      } else {
        this.champion.trackingAbility = this
        this.champion.stateMachine.transition(ChampionStates.TRACKING_ABILITY_MOVE)
      }
    }
  }

  getClickedEntity(champions: Champion[], targetingCircle: Phaser.Geom.Circle) {
    const overlappedEntities: (Minion | Champion)[] = []
    champions.forEach((champion: Champion) => {
      if (targetingCircle.contains(champion.sprite.x, champion.sprite.y)) {
        overlappedEntities.push(champion)
      }
    })

    let closestToCircleCenter: Minion | Champion | null = null
    let minDistanceToCircleCenter: number = Number.MAX_SAFE_INTEGER
    overlappedEntities.forEach((entity: Minion | Champion) => {
      const distanceToCircleCenter = Phaser.Math.Distance.Between(
        entity.sprite.x,
        entity.sprite.y,
        targetingCircle.x,
        targetingCircle.y
      )
      if (distanceToCircleCenter <= minDistanceToCircleCenter) {
        closestToCircleCenter = entity
        minDistanceToCircleCenter = distanceToCircleCenter
      }
    })
    return closestToCircleCenter
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
          this.rangeCircle.setVisible(false)
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    }
  }

  public get damage() {
    return 150
  }

  triggerAbilityTowardsTarget(target: Champion, onCompleteCallback: Function | null): void {
    this.isTriggeringAbility = true
    this.champion.decreaseMana(ExecutionStrike.MANA_COST)
    this.cooldownTimer.startAbilityCooldown()
    const executionReadySprite = this.executionReadySpriteArray[0]
    if (executionReadySprite) {
      executionReadySprite.setVisible(false)
    }
    const prevState = target.stateMachine.getState()
    target.stateMachine.transition(
      ChampionStates.STUNNED,
      this.game,
      ExecutionStrike.STUN_DURATION,
      prevState
    )
    this.executionStrikeSprite
      .setPosition(target.sprite.x, target.sprite.y - target.sprite.displayHeight * 2)
      .setVisible(true)
      .setScale(2)
    this.executionStrikeSprite.play('execution-strike')
    if (onCompleteCallback) {
      onCompleteCallback()
    }
  }

  isInRangeOfTarget(target: Champion | Minion): boolean {
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      target.sprite.x,
      target.sprite.y
    )
    return distanceToTarget <= this.abilityRange
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.game.hideCursor()
      this.rangeCircle.setVisible(true)
      this.rangeCircle.setPosition(this.champion.sprite.x, this.champion.sprite.y)
      this.targetingCursor.setVisible(true)
      this.targetingCursor.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
    } else {
      this.game.showCursor()
    }
  }

  isInRange(): boolean {
    if (this.abilityTargetEntity) {
      return this.isInRangeOfTarget(this.abilityTargetEntity)
    }
    return false
  }

  renderEnemyChampionExecutionStatus() {
    if (this.isTriggeringAbility) {
      return
    }
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    if (enemyChampions.length > 0 && this.executionReadySpriteArray.length === 0) {
      this.setupExecutionReadySprites()
    }
    enemyChampions.forEach((c: Champion, index: number) => {
      const executionReadySprite = this.executionReadySpriteArray[index]
      if (executionReadySprite) {
        if (this.isReadyForExecution(c)) {
          executionReadySprite.setVisible(true)
          executionReadySprite.setPosition(c.sprite.x, c.sprite.y - c.sprite.displayHeight * 2)
        } else {
          executionReadySprite.setVisible(false)
        }
      }
    })
  }

  isReadyForExecution(champion: Champion): boolean {
    const executionHealthAmt = Math.round(
      champion.getTotalHealth() * ExecutionStrike.EXECUTION_HEALTH_PCT_THRESHOLD
    )
    return champion.getHealth() > 0 && champion.getHealth() <= executionHealthAmt
  }

  update() {
    this.handleKeyPress()
    this.renderTargetingUI()
    this.renderEnemyChampionExecutionStatus()
  }
}
