import { Minion } from '~/core/minion/Minion'
import { Projectile } from '~/core/Projectile'
import { Game } from '~/scenes/Game'
import { Champion } from '../../Champion'
import { Ability } from '../Ability'
import { CooldownTimer } from '../CooldownTimer'
import { CPUAbility } from '../CPUAbility'
import { TargetingArrow } from '../TargetingArrow'

export class Fireball implements Ability, CPUAbility {
  game: Game
  champion: Champion

  public static readonly MANA_COST = 50
  public static readonly ABILITY_RANGE = 100
  public static readonly ABILITY_COOLDOWN_TIME_SECONDS = 1

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public key!: Phaser.Input.Keyboard.Key | null
  public targetingArrow: TargetingArrow
  public iconTexture: string = 'fireball'
  public manaCost = Fireball.MANA_COST
  public abilityRange: number = Fireball.ABILITY_RANGE

  public cooldownTimer: CooldownTimer
  public fireballExplosionSprite: Phaser.GameObjects.Sprite

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }
    this.targetingArrow = new TargetingArrow(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      width: this.abilityRange,
      height: 5,
    })
    this.cooldownTimer = new CooldownTimer(this.game, Fireball.ABILITY_COOLDOWN_TIME_SECONDS)
    this.fireballExplosionSprite = this.game.add
      .sprite(0, 0, 'fireball-explosion')
      .setVisible(false)
      .setDepth(1000)
      .setScale(2)
    this.fireballExplosionSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.fireballExplosionSprite.setVisible(false)
    })
    this.setupMouseClickListener()
  }

  setupMouseClickListener() {
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.mouseTriggered = true
          this.targetingArrow.hide()
          this.triggerAbility()
        }
      }
    })
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
          this.targetingArrow.hide()
          this.triggerAbility()
        }
      }
    }
  }

  public get isInCooldown() {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires() {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  canTriggerAbility() {
    return this.champion.manaAmount >= Fireball.MANA_COST && !this.isInCooldown
  }

  triggerCPUAbility(target?: Champion | undefined): void {
    if (!target) {
      return
    }
    this.triggerAbilityAtTarget({
      x: target.sprite.x,
      y: target.sprite.y,
    })
  }

  triggerAbilityAtTarget(targetPosition: { x: number; y: number }): void {
    this.cooldownTimer.startAbilityCooldown()
    this.champion.decreaseMana(Fireball.MANA_COST)
    const angleToTargetPoint = Phaser.Math.Angle.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      targetPosition.x,
      targetPosition.y
    )

    const fireball = new Projectile(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      texture: 'fireball',
      staticTarget: targetPosition,
      speed: 150,
      scale: 2,
      rotation: angleToTargetPoint,
      bodyConfig: {
        scaleX: 0.4,
        scaleY: 0.4,
      },
      onOverlapFn: (target: Minion | Champion) => {
        if (target.side !== this.champion.side) {
          if (target.getHealth() > 0) {
            if (target.getHealth() - this.damage <= 0) {
              this.champion.handleLastHit(target)
            }
            target.takeDamage(this.damage)
            this.fireballExplosionSprite
              .setPosition(target.sprite.x, target.sprite.y)
              .setVisible(true)
            this.fireballExplosionSprite.play('fireball-explosion')
            fireball.destroy()
          }
        }
      },
    })
    this.game.projectileGroup.add(fireball.sprite)
  }

  triggerAbility() {
    this.triggerAbilityAtTarget(this.targetingArrow.getArrowPositionEnd())
  }

  get damage() {
    return Math.round((450 * this.champion.level) / 17 + 400 / 17)
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.targetingArrow.renderToPosition({
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      })
    }
  }

  update() {
    this.handleKeyPress()
    this.renderTargetingUI()
  }
}
