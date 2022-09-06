import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { Champion } from '../../Champion'
import { Ability } from '../Ability'
import { CooldownTimer } from '../CooldownTimer'

export class AxeSpin implements Ability {
  public game: Game
  public champion: Champion

  public static readonly ABILITY_COOLDOWN_TIME_SECONDS = 5
  public static readonly MANA_COST = 25

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public iconTexture: string = 'axe'
  public key!: Phaser.Input.Keyboard.Key | null

  // Graphics
  public axeHitbox: Phaser.Geom.Circle
  public axeSprite: Phaser.GameObjects.Sprite
  public slashArc: Phaser.GameObjects.Arc
  public slashArcInner: Phaser.GameObjects.Arc

  public isHitboxActive = false
  public isTriggeringAbility: boolean = false
  public cooldownTimer: CooldownTimer

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }

    // Set up slash path arc
    this.slashArc = this.game.add
      .circle(this.champion.sprite.x, this.champion.sprite.y, 50)
      .setVisible(false)
      .setStrokeStyle(15, 0xff0000)
      .setDepth(100)
      .setAlpha(0)

    this.slashArcInner = this.game.add
      .circle(this.champion.sprite.x, this.champion.sprite.y, 30)
      .setVisible(false)
      .setStrokeStyle(18, 0xff0000)
      .setDepth(100)
      .setAlpha(0)

    // Setup axe sprite
    this.axeHitbox = new Phaser.Geom.Circle(0, 0, 57)
    this.axeSprite = this.game.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, 'axe-spin')
      .setVisible(false)
      .setScale(1)
      .setDepth(100)
      .setOrigin(0.5, 1.75)

    this.cooldownTimer = new CooldownTimer(this.game, AxeSpin.ABILITY_COOLDOWN_TIME_SECONDS)
  }

  handleCollisionWithTarget(target: Phaser.Physics.Arcade.Sprite) {
    const isHit = target.getData('isCollidedWithAxeSpin')
    if (!isHit && this.isHitboxActive) {
      // Show burst of blood particles
      this.game.particleEmitter.emitParticles({
        texture: 'blood',
        scale: 1,
        gravity: true,
        position: {
          x: target.x,
          y: target.y,
        },
        count: 3,
      })
      target.setTintFill(0xff0000)
      this.game.time.delayedCall(100, () => {
        target.clearTint()
      })
      target.setData('isCollidedWithAxeSpin', true)
      const entity = target.getData('ref')
      const damage = this.getDamageBasedOnChampionLevel()
      if (entity.getHealth() > 0) {
        if (entity.getHealth() - damage <= 0) {
          this.champion.handleLastHit(entity)
        } else {
          this.game.time.delayedCall(1000, () => {
            if (target.active) {
              target.setData('isCollidedWithAxeSpin', false)
            }
          })
        }
        entity.takeDamage(damage)
      }
    }
  }

  handleDamageToEntitiesWithinHitbox() {
    const enemyMinions =
      this.champion.side === Side.LEFT ? this.game.rightMinions : this.game.leftMinions
    const enemyChampion =
      this.champion.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    enemyMinions.forEach((minion: Minion) => {
      const isInHitbox = this.axeHitbox.contains(minion.sprite.x, minion.sprite.y)
      if (isInHitbox) {
        this.handleCollisionWithTarget(minion.sprite)
      }
    })
    enemyChampion.forEach((champion: Champion) => {
      const isInHitbox = this.axeHitbox.contains(champion.sprite.x, champion.sprite.y)
      if (isInHitbox) {
        this.handleCollisionWithTarget(champion.sprite)
      }
    })
  }

  public canTriggerAbility(): boolean {
    return (
      !this.isTriggeringAbility &&
      !this.champion.isDead &&
      this.champion.manaAmount >= AxeSpin.MANA_COST &&
      !this.isInCooldown
    )
  }

  public getDamageBasedOnChampionLevel() {
    return Math.round((775 * this.champion.level) / 17 + 350 / 17)
  }

  public get isInCooldown() {
    return this.cooldownTimer.isInCooldown
  }

  public get secondsUntilCooldownExpires() {
    return this.cooldownTimer.secondsUntilCooldownExpires
  }

  triggerAbility(): void {
    this.cooldownTimer.startAbilityCooldown()
    this.champion.decreaseMana(AxeSpin.MANA_COST)
    const event = this.game.time.addEvent({
      delay: 1,
      callback: () => {
        this.slashArcInner
          .setPosition(this.champion.sprite.x, this.champion.sprite.y)
          .setVisible(true)
        this.slashArc.setPosition(this.champion.sprite.x, this.champion.sprite.y).setVisible(true)
        this.axeSprite
          .setPosition(this.champion.sprite.x, this.champion.sprite.y)
          .setAlpha(1)
          .setVisible(true)
      },
      repeat: -1,
    })

    const graphics = this.game.add.graphics()

    this.game.add.tween({
      alpha: { from: 0, to: 0.3 },
      duration: 400,
      targets: [this.slashArc, this.slashArcInner],
      onComplete: () => {
        this.champion.stop()
        event.destroy()
        this.game.add.tween({
          targets: this.axeSprite,
          angle: { from: 0, to: 360 },
          duration: 250,
          onStart: () => {
            this.isHitboxActive = true
          },
          onUpdate: () => {
            this.axeHitbox.setPosition(this.champion.sprite.x, this.champion.sprite.y)
            this.handleDamageToEntitiesWithinHitbox()
          },
          repeat: 0,
          onComplete: () => {
            graphics.clear()
            this.game.add.tween({
              targets: [this.slashArc, this.slashArcInner],
              alpha: { from: 0.3, to: 0 },
              duration: 200,
              onComplete: () => {
                this.isHitboxActive = false
                this.slashArcInner.setVisible(false).setAlpha(0)
                this.slashArc.setVisible(false).setAlpha(0)
              },
            })
            this.game.add.tween({
              targets: this.axeSprite,
              alpha: { from: 1, to: 0 },
              duration: 200,
              onComplete: () => {
                this.axeSprite.setVisible(false)
                this.isTriggeringAbility = false
              },
            })
          },
        })
      },
    })
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

  update() {
    this.handleKeyPress()
  }
}
