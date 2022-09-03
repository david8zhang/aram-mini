import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../Champion'
import { ChampionStates } from '../states/ChampionStates'
import { Ability } from './Ability'
import { AbilityWithRange } from './AbilityWithRange'
import { CooldownTimer } from './CooldownTimer'

export class FireBlastAOE implements Ability, AbilityWithRange {
  game: Game
  champion: Champion

  private static readonly TARGETING_CIRCLE_RADIUS = 40
  private static readonly EXPLOSION_CIRCLE_COLOR = 0xfe7817
  private static readonly EXPLOSION_CIRCLE_OUTLINE_COLOR = 0xfed874
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 1
  private static readonly MANA_COST = 75
  private static readonly ABILITY_RANGE = 100

  public isTargetingMode: boolean = false
  public key!: Phaser.Input.Keyboard.Key | null
  public mouseTriggered: boolean = false
  public targetingCircle: Phaser.GameObjects.Arc
  public rangeCircle: Phaser.GameObjects.Arc
  public iconTexture: string = 'fire-blast'

  public abilityRange: number = FireBlastAOE.ABILITY_RANGE
  public abilityTarget: { x: number; y: number } | null = null

  public cooldownTimer: CooldownTimer

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    }
    this.targetingCircle = this.game.add
      .circle(0, 0, FireBlastAOE.TARGETING_CIRCLE_RADIUS, Constants.UI_HIGHLIGHT_COLOR, 0.5)
      .setDepth(1000)
      .setStrokeStyle(2, Constants.UI_HIGHLIGHT_COLOR, 1)
      .setVisible(false)
    this.rangeCircle = this.game.add
      .circle(0, 0, this.abilityRange, Constants.UI_HIGHLIGHT_COLOR, 0.25)
      .setDepth(1000)
      .setStrokeStyle(2, Constants.UI_HIGHLIGHT_COLOR, 1)
      .setVisible(false)

    this.cooldownTimer = new CooldownTimer(this.game, FireBlastAOE.ABILITY_COOLDOWN_TIME_SECONDS)
    this.setupMouseClickListener()
  }

  triggerAbilityAtPosition(
    position: { x: number; y: number },
    onCompleteCallback: Function | null
  ): void {
    this.cooldownTimer.startAbilityCooldown()
    const explosionCircle = this.game.add
      .circle(
        position.x,
        position.y,
        FireBlastAOE.TARGETING_CIRCLE_RADIUS,
        FireBlastAOE.EXPLOSION_CIRCLE_COLOR,
        0.7
      )
      .setStrokeStyle(1, FireBlastAOE.EXPLOSION_CIRCLE_COLOR, 1)
    const explosionCircleOutline = this.game.add
      .circle(
        position.x,
        position.y,
        FireBlastAOE.TARGETING_CIRCLE_RADIUS,
        FireBlastAOE.EXPLOSION_CIRCLE_OUTLINE_COLOR,
        0.2
      )
      .setStrokeStyle(2, FireBlastAOE.EXPLOSION_CIRCLE_OUTLINE_COLOR, 1)
    this.game.tweens.add({
      targets: explosionCircle,
      radius: { from: FireBlastAOE.TARGETING_CIRCLE_RADIUS, to: 0 },
      alpha: { from: 0.7, to: 1 },
      duration: 1000,
      onComplete: () => {
        this.handleDamageToEnemiesWithinExplosionRadius(explosionCircleOutline)
        explosionCircle.destroy()
        explosionCircleOutline.destroy()
        if (onCompleteCallback) {
          onCompleteCallback()
        }
      },
    })
  }

  public get isInCooldown() {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires() {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.rangeCircle.setVisible(false)
          this.targetingCircle.setVisible(false)
          this.triggerAbility()
        }
      }
    })
  }

  canTriggerAbility() {
    return this.champion.manaAmount >= FireBlastAOE.MANA_COST && !this.isInCooldown
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.key.isDown && !this.mouseTriggered) {
        if (this.canTriggerAbility()) {
          this.isTargetingMode = true
        }
      } else if (this.key.isUp) {
        this.mouseTriggered = false
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.rangeCircle.setVisible(false)
          this.targetingCircle.setVisible(false)
          this.triggerAbility()
        }
      }
    }
  }

  isInRangeOfPosition(position: { x: number; y: number }): boolean {
    const distanceToTarget = Phaser.Math.Distance.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      position.x,
      position.y
    )
    return distanceToTarget <= this.abilityRange
  }

  isInRange(): boolean {
    if (this.abilityTarget) {
      return this.isInRangeOfPosition(this.abilityTarget)
    }
    return false
  }

  triggerAbility() {
    const position = {
      x: this.game.input.mousePointer.worldX,
      y: this.game.input.mousePointer.worldY,
    }
    if (this.isInRangeOfPosition(position)) {
      this.triggerAbilityAtPosition(position, null)
    } else {
      console.log('Went here!')
      this.champion.abilityWithRange = this
      this.abilityTarget = position
      this.champion.stateMachine.transition(ChampionStates.ABILITY_MOVE)
    }
  }

  handleDamageToEnemiesWithinExplosionRadius(explosionCircleOutline: Phaser.GameObjects.Arc) {
    const hitboxCircle = new Phaser.Geom.Circle(
      explosionCircleOutline.x,
      explosionCircleOutline.y,
      explosionCircleOutline.radius
    )

    const enemyMinions =
      this.champion.side === Side.LEFT ? this.game.rightMinions : this.game.leftMinions
    const enemyChampions =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions

    enemyMinions.forEach((enemyMinion: Minion) => {
      this.handleDamage(enemyMinion, hitboxCircle)
    })
    enemyChampions.forEach((enemyChampion: Champion) => {
      this.handleDamage(enemyChampion, hitboxCircle)
    })
  }

  public handleDamage(entity: Minion | Champion, hitboxCircle: Phaser.Geom.Circle) {
    const isInExplosionRadius = hitboxCircle.contains(entity.sprite.x, entity.sprite.y)
    if (isInExplosionRadius) {
      if (entity.getHealth() > 0) {
        if (entity.getHealth() - this.damage <= 0) {
          this.champion.handleLastHit(entity)
        }
        entity.takeDamage(this.damage)
      }
    }
  }

  public get damage(): number {
    return 100
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.rangeCircle.setVisible(true)
      this.targetingCircle.setVisible(true)
      this.rangeCircle.setPosition(this.champion.sprite.x, this.champion.sprite.y)
      this.targetingCircle.setPosition(
        this.game.input.mousePointer.worldX,
        this.game.input.mousePointer.worldY
      )
    }
  }

  update() {
    this.handleKeyPress()
    this.renderTargetingUI()
  }
}
