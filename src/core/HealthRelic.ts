import { Game } from '~/scenes/Game'
import { CooldownTimer } from './champion/abilities/CooldownTimer'
import { Champion } from './champion/Champion'

export interface HealthRelicConfig {
  healAmount: number
  position: {
    x: number
    y: number
  }
}

export class HealthRelic {
  private game: Game
  public static readonly HEALTH_RELIC_COOLDOWN_SECONDS = 90

  public healAmount: number
  public sprite: Phaser.Physics.Arcade.Sprite
  public colliders: Phaser.Physics.Arcade.Collider[] = []
  public cooldownTimer: CooldownTimer
  public cooldownText: Phaser.GameObjects.Text

  constructor(game: Game, config: HealthRelicConfig) {
    this.game = game
    this.healAmount = config.healAmount
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, 'health-relic')
    this.game.physics.world.enable(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.setupColliders()
    this.cooldownTimer = new CooldownTimer(game, HealthRelic.HEALTH_RELIC_COOLDOWN_SECONDS)
    this.cooldownText = this.game.add
      .text(this.sprite.x, this.sprite.y, '', {
        fontSize: '10px',
        color: '#000000',
      })
      .setVisible(false)
  }

  setupColliders() {
    this.createCollider(this.game.leftChampionsGroup)
    this.createCollider(this.game.rightChampionsGroup)
  }

  createCollider(group: Phaser.GameObjects.Group) {
    const collider = this.game.physics.add.overlap(group, this.sprite, (obj1, obj2) => {
      this.handleHealthPickup(obj1.getData('ref') as Champion)
    })
    this.colliders.push(collider)
  }

  handleHealthPickup(champion: Champion) {
    if (!this.cooldownTimer.isInCooldown) {
      const circle = this.game.add.circle(this.sprite.x, this.sprite.y, 25, 0x43e1b3, 1)
      this.game.tweens.add({
        targets: circle,
        alpha: { from: 1, to: 0 },
        duration: 1000,
      })
      this.game.tweens.add({
        targets: circle,
        radius: { from: 25, to: 75 },
        duration: 1000,
        onComplete: () => {
          circle.destroy()
        },
      })
      champion.heal(this.healAmount)
      this.cooldownTimer.startAbilityCooldown()
    }
  }

  update() {
    if (this.cooldownTimer.isInCooldown) {
      this.sprite.body.enable = false
      this.sprite.setVisible(false)
      this.cooldownText.setVisible(true)
      this.cooldownText.setText(`${this.cooldownTimer.secondsUntilCooldownExpires}`)
    } else {
      this.sprite.body.enable = true
      this.sprite.setVisible(true)
      this.cooldownText.setVisible(false)
    }
  }
}
