import { Minion } from '~/core/minion/Minion'
import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { Champion } from '../Champion'
import { Ability } from './Ability'
import { CooldownTimer } from './CooldownTimer'

export class AxeSpin implements Ability {
  public game: Game
  public champion: Champion

  public static readonly DAMAGE = 25
  public static readonly ABILITY_COOLDOWN_TIME_SECONDS = 5
  public static readonly MANA_COST = 25

  public isTargetingMode: boolean = false
  public mouseTriggered: boolean = false
  public iconTexture: string = 'axe'
  public key!: Phaser.Input.Keyboard.Key | null

  // Graphics
  public axeHitbox: Phaser.Physics.Arcade.Sprite
  public axeSprite: Phaser.GameObjects.Sprite
  public slashArc: Phaser.GameObjects.Arc

  public minionCollider!: Phaser.Physics.Arcade.Collider
  public championCollider!: Phaser.Physics.Arcade.Collider

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
      .setStrokeStyle(20, 0xff0000)
      .setDepth(100)
      .setAlpha(0)

    // Setup axe sprite
    this.axeHitbox = this.game.physics.add.sprite(0, 0, '').setVisible(false)
    this.axeHitbox.body.setSize(16, 16)
    this.axeSprite = this.game.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, 'axe')
      .setVisible(false)
      .setScale(1)
      .setDepth(100)
      .setOrigin(0.5, 3.5)

    this.cooldownTimer = new CooldownTimer(this.game, AxeSpin.ABILITY_COOLDOWN_TIME_SECONDS)
  }

  setupColliders() {
    if (!this.minionCollider) {
      if (this.game.leftMinionSpawner && this.game.rightMinionSpawner) {
        const enemyMinionsGroup =
          this.champion.side === Side.LEFT
            ? this.game.rightMinionSpawner.minions
            : this.game.leftMinionSpawner.minions
        this.minionCollider = this.game.physics.add.overlap(
          enemyMinionsGroup,
          this.axeHitbox,
          (obj1, obj2) => {
            this.handleCollisionWithTarget(obj1 as Phaser.Physics.Arcade.Sprite)
          }
        )
      }
    }
    if (!this.championCollider) {
      const enemyChampionsGroup =
        this.champion.side === Side.LEFT
          ? this.game.rightChampionsGroup
          : this.game.leftChampionsGroup
      this.championCollider = this.game.physics.add.overlap(
        enemyChampionsGroup,
        this.axeHitbox,
        (obj1, obj2) => {
          this.handleCollisionWithTarget(obj1 as Phaser.Physics.Arcade.Sprite)
        }
      )
    }
  }

  handleCollisionWithTarget(target: Phaser.Physics.Arcade.Sprite) {
    const isHit = target.getData('isCollidedWithAxeSpin')
    if (!isHit && this.isHitboxActive) {
      target.setTintFill(0xff0000)
      this.game.time.delayedCall(100, () => {
        target.clearTint()
      })
      target.setData('isCollidedWithAxeSpin', true)
      const entity = target.getData('ref')
      if (entity.getHealth() > 0) {
        if (entity.getHealth() - AxeSpin.DAMAGE <= 0) {
          this.champion.handleLastHit(entity)
        } else {
          this.game.time.delayedCall(1000, () => {
            if (target.active) {
              target.setData('isCollidedWithAxeSpin', false)
            }
          })
        }
        entity.takeDamage(AxeSpin.DAMAGE)
      }
    }
  }

  public canTriggerAbility(): boolean {
    return (
      !this.isTriggeringAbility &&
      !this.champion.isDead &&
      this.champion.manaAmount >= AxeSpin.MANA_COST &&
      !this.isInCooldown
    )
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
        this.slashArc.setPosition(this.champion.sprite.x, this.champion.sprite.y).setVisible(true)
        this.axeSprite
          .setPosition(this.champion.sprite.x, this.champion.sprite.y)
          .setAlpha(1)
          .setVisible(true)
      },
      repeat: -1,
    })

    this.game.add.tween({
      alpha: { from: 0, to: 0.3 },
      duration: 400,
      targets: this.slashArc,
      onComplete: () => {
        this.champion.stop()
        event.destroy()
        this.game.add.tween({
          targets: this.axeSprite,
          angle: { from: 0, to: 360 },
          duration: 350,
          onStart: () => {
            this.isHitboxActive = true
          },
          onUpdate: () => {
            const topCenter = this.axeSprite.getTopCenter()
            this.axeHitbox.setPosition(topCenter.x, topCenter.y)
          },
          repeat: 0,
          onComplete: () => {
            this.game.add.tween({
              targets: this.slashArc,
              alpha: { from: 0.3, to: 0 },
              duration: 200,
              onComplete: () => {
                this.isHitboxActive = false
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
      if (this.key.isDown && this.canTriggerAbility()) {
        this.isTriggeringAbility = true
        this.triggerAbility()
      }
    }
  }

  update() {
    this.handleKeyPress()
    this.setupColliders()
  }
}
