import { Game } from '~/scenes/Game'
import { Champion } from '../../Champion'
import { Ability } from '../Ability'
import { CooldownTimer } from '../CooldownTimer'
import { EmpoweredAbility } from '../EmpoweredAbility'

export class EmpoweredStrike implements Ability, EmpoweredAbility {
  game: Game
  champion: Champion

  private static readonly MANA_COST = 20
  private static readonly ABILITY_COOLDOWN_TIME_SECONDS = 5

  public key!: Phaser.Input.Keyboard.Key | null
  public iconTexture: string = 'empowered-strike-icon'
  public isTriggeringAbility: boolean = false
  public flashingTween: Phaser.Tweens.Tween
  public spriteTint: Phaser.Physics.Arcade.Sprite
  public empoweredStrikeSprite: Phaser.GameObjects.Sprite
  public cooldownTimer: CooldownTimer
  public manaCost: number = EmpoweredStrike.MANA_COST

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    }
    this.spriteTint = this.game.physics.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, this.champion.sprite.texture.key)
      .setTintFill(0xff0000)
      .setAlpha(0)

    this.empoweredStrikeSprite = this.game.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, 'empowered-strike')
      .setVisible(false)

    this.empoweredStrikeSprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (anim, frame, gameObject) => {
        const attackTarget = this.champion.attackTarget
        if (attackTarget) {
          if (frame.index === 3) {
            attackTarget.sprite.setTintFill(0xff0000)
            if (attackTarget.getHealth() - this.damage <= 0) {
              this.champion.handleLastHit(this.champion.attackTarget)
            }
            attackTarget.takeDamage(this.damage)
          } else if (frame.index === 5) {
            attackTarget.sprite.clearTint()
          }
        }
      }
    )

    this.empoweredStrikeSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.isTriggeringAbility = false
    })

    this.flashingTween = this.game.tweens.add({
      targets: this.spriteTint,
      alpha: { from: 0, to: 0.5 },
      scale: { from: 1, to: 1.5 },
      duration: 250,
      repeat: -1,
      yoyo: true,
    })
    this.flashingTween.stop()
    this.cooldownTimer = new CooldownTimer(this.game, EmpoweredStrike.ABILITY_COOLDOWN_TIME_SECONDS)
  }

  public get isInCooldown(): boolean {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires(): number {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  update(): void {
    this.handleKeyPress()
    const isBlocked = !this.champion.sprite.body.blocked.none
    if (!isBlocked) {
      this.spriteTint.setPosition(this.champion.sprite.x, this.champion.sprite.y)
      this.spriteTint.setVelocity(
        this.champion.sprite.body.velocity.x,
        this.champion.sprite.body.velocity.y
      )
    } else {
      this.spriteTint.setVelocity(0, 0)
      this.spriteTint.setPosition(this.champion.sprite.x, this.champion.sprite.y)
    }
  }

  canInterceptAutoAttack(): boolean {
    const attackTarget = this.champion.attackTarget
    if (
      !attackTarget ||
      !(attackTarget.constructor.name === 'Champion' || attackTarget.constructor.name === 'Minion')
    ) {
      return false
    }
    return true
  }

  triggerAbility(): void {
    this.cooldownTimer.startAbilityCooldown()
    this.champion.decreaseMana(EmpoweredStrike.MANA_COST)
    this.flashingTween.restart()
    this.champion.empoweredAbility = this
  }

  public get damage(): number {
    return 25
  }

  public interceptAutoAttack(): void {
    this.flashingTween.restart()
    this.flashingTween.stop()

    const attackTarget = this.champion.attackTarget
    if (attackTarget) {
      if (attackTarget.sprite.x < this.champion.sprite.x) {
        this.empoweredStrikeSprite
          .setPosition(this.champion.sprite.x - 20, this.champion.sprite.y)
          .setFlipX(true)
      } else {
        this.empoweredStrikeSprite
          .setPosition(this.champion.sprite.x + 20, this.champion.sprite.y)
          .setFlipX(false)
      }
      this.empoweredStrikeSprite.setDepth(this.champion.sprite.depth + 100).setVisible(true)
      this.empoweredStrikeSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.empoweredStrikeSprite.setVisible(false)
      })
      if (!this.empoweredStrikeSprite.anims.isPlaying) {
        this.empoweredStrikeSprite.anims.play('empowered-strike')
      }
    }
    this.champion.empoweredAbility = null
  }

  public canTriggerAbility(): boolean {
    return (
      !this.isTriggeringAbility &&
      this.champion.manaAmount >= EmpoweredStrike.MANA_COST &&
      !this.isInCooldown
    )
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.game.player.inAttackTargetingMode) {
        return
      }
      if (this.key.isDown && this.canTriggerAbility()) {
        this.isTriggeringAbility = true
        this.triggerAbility()
      }
    }
  }
}
