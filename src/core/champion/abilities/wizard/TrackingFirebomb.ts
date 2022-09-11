import { Minion } from '~/core/minion/Minion'
import { Projectile } from '~/core/Projectile'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../../Champion'
import { ChampionStates } from '../../states/ChampionStates'
import { Ability } from '../Ability'
import { CooldownTimer } from '../CooldownTimer'
import { CPUAbility } from '../CPUAbility'
import { TrackingAbility } from '../TrackingAbility'

export class TrackingFirebomb implements Ability, TrackingAbility, CPUAbility {
  game: Game
  champion: Champion

  private static readonly MANA_COST = 100
  private static readonly ABILITY_RANGE = 200
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 60
  private static readonly EXPLOSION_CIRCLE_COLOR = 0xfe7817
  private static readonly EXPLOSION_CIRCLE_OUTLINE_COLOR = 0xfed874
  private static readonly EXPLOSION_SPLASH_RADIUS = 50

  // Targeting UI
  public key!: Phaser.Input.Keyboard.Key | null
  public mouseTriggered: boolean = false
  public isTargetingMode: boolean = false
  public targetingCursor: Phaser.GameObjects.Sprite
  public manaCost: number = TrackingFirebomb.MANA_COST

  public abilityRange: number = TrackingFirebomb.ABILITY_RANGE
  public abilityTargetEntity: Champion | Minion | null = null
  public rangeCircle: Phaser.GameObjects.Arc

  public iconTexture: string = 'tracking-fireball'
  public cooldownTimer: CooldownTimer
  public explosionSprite: Phaser.GameObjects.Sprite

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
    this.cooldownTimer = new CooldownTimer(
      this.game,
      TrackingFirebomb.ABILITY_COOLDOWN_TIME_SECONDS
    )
    this.explosionSprite = this.game.add
      .sprite(0, 0, 'explosion')
      .setVisible(false)
      .setScale(2)
      .setDepth(1000)
    this.explosionSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.explosionSprite.setVisible(false)
    })
    this.setupMouseClickListener()
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.rangeCircle.setVisible(false)
          this.targetingCursor.setVisible(false)
          this.triggerAbility()
        }
      }
    })
  }

  public canTriggerAbility(): boolean {
    return this.champion.manaAmount >= TrackingFirebomb.MANA_COST && !this.isInCooldown
  }

  public get damage() {
    return 200
  }

  public get isInCooldown() {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires() {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  shootFireballAtTarget(target: Champion, onCompleteCallback: Function | null) {
    const fireball = new Projectile(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      texture: 'tracking-fireball',
      target,
      speed: 150,
      scale: 3,
      autoRotate: true,
      bodyConfig: {
        scaleX: 0.4,
        scaleY: 0.4,
      },
      onOverlapFn: (target: Champion) => {
        if (target.side !== this.champion.side && target.constructor.name === 'Champion') {
          if (target.getHealth() > 0) {
            if (target.getHealth() - this.damage <= 0) {
              this.champion.handleLastHit(target)
            }
            this.explosionSprite.setVisible(true).setPosition(target.sprite.x, target.sprite.y)
            this.explosionSprite.play('explosion')
            target.takeDamage(this.damage)
            fireball.destroy()
            this.handleSplashDamage(target, onCompleteCallback)
          }
        }
      },
    })
    this.game.projectileGroup.add(fireball.sprite)
  }

  handleSplashDamage(target: Champion, onCompleteCallback: Function | null) {
    const explosionCircle = this.game.add
      .circle(target.sprite.x, target.sprite.y, 0, TrackingFirebomb.EXPLOSION_CIRCLE_COLOR, 0.5)
      .setStrokeStyle(2, TrackingFirebomb.EXPLOSION_CIRCLE_OUTLINE_COLOR, 1)
    this.game.tweens.add({
      targets: explosionCircle,
      radius: { from: 0, to: TrackingFirebomb.EXPLOSION_SPLASH_RADIUS },
      duration: 250,
      onComplete: () => {
        this.game.tweens.add({
          targets: explosionCircle,
          alpha: { from: 1, to: 0.2 },
          duration: 500,
          onComplete: () => {
            explosionCircle.destroy()
            if (onCompleteCallback) {
              onCompleteCallback()
            }
          },
        })
      },
    })
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

  triggerCPUAbility(target?: Champion | undefined): void {
    if (!target) {
      return
    }
    this.triggerAbilityTowardsTarget(target, null)
  }

  triggerAbilityTowardsTarget(
    target: Champion | Minion,
    onCompleteCallback: Function | null
  ): void {
    this.champion.decreaseMana(TrackingFirebomb.MANA_COST)
    this.cooldownTimer.startAbilityCooldown()
    this.shootFireballAtTarget(target as Champion, onCompleteCallback)
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
    if (clickedEntity) {
      if (this.isInRange()) {
        this.triggerAbilityTowardsTarget(clickedEntity, null)
      } else {
        this.abilityTargetEntity = clickedEntity
        this.champion.trackingAbility = this
        this.champion.stateMachine.transition(ChampionStates.TRACKING_ABILITY_MOVE)
      }
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

  isInRange(): boolean {
    if (this.abilityTargetEntity) {
      return this.isInRangeOfTarget(this.abilityTargetEntity)
    }
    return false
  }

  update(): void {
    this.renderTargetingUI()
    this.handleKeyPress()
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
}
