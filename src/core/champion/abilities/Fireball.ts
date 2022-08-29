import { Minion } from '~/core/minion/Minion'
import { Projectile } from '~/core/Projectile'
import { Game } from '~/scenes/Game'
import { Champion } from '../Champion'
import { Ability } from './Ability'
import { TargetingArrow } from './TargetingArrow'

export class Fireball implements Ability {
  game: Game
  champion: Champion

  public static readonly DAMAGE = 1000
  public static readonly MANA_COST = 50
  public static readonly ATTACK_RANGE = 100
  public static readonly ABILITY_COOLDOWN_TIME = 10

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public key!: Phaser.Input.Keyboard.Key | null
  public targetingArrow: TargetingArrow
  public iconTexture: string = 'fireball'

  public isInCooldown: boolean = false
  public secondsUntilCooldownExpires: number = 0

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
      width: Fireball.ATTACK_RANGE,
      height: 5,
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

  canTriggerAbility() {
    return this.champion.manaAmount >= Fireball.MANA_COST && !this.isInCooldown
  }

  startAbilityCooldown() {
    this.isInCooldown = true
    this.secondsUntilCooldownExpires = Fireball.ABILITY_COOLDOWN_TIME
    const cooldownEvent = this.game.time.addEvent({
      delay: 1000,
      callback: () => {
        this.secondsUntilCooldownExpires--
        if (this.secondsUntilCooldownExpires === 0) {
          this.isInCooldown = false
          cooldownEvent.remove()
        }
      },
      repeat: -1,
    })
  }

  triggerAbility() {
    this.startAbilityCooldown()
    this.champion.decreaseMana(Fireball.MANA_COST)
    const targetPoint = this.targetingArrow.getArrowPositionEnd()
    const angleToTargetPoint = Phaser.Math.Angle.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      targetPoint.x,
      targetPoint.y
    )

    const fireball = new Projectile(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      texture: 'fireball',
      staticTarget: targetPoint,
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
            if (target.getHealth() - Fireball.DAMAGE <= 0) {
              this.champion.handleLastHit(target)
            }
            target.takeDamage(Fireball.DAMAGE)
            fireball.destroy()
          }
        }
      },
    })
    this.game.projectileGroup.add(fireball.sprite)
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
