import { Game } from '~/scenes/Game'

export interface Entity {
  sprite: Phaser.Physics.Arcade.Sprite
}

export interface ProjectileConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  target: Entity
  speed: number
}

export class Projectile {
  private game: Game
  public target: Entity
  public sprite: Phaser.Physics.Arcade.Sprite
  public speed: number = 200
  public destroyCallback: Function | null = null

  constructor(game: Game, config: ProjectileConfig) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite.setData('ref', this)
    this.target = config.target
    this.speed = config.speed
  }

  isAtMoveTarget() {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.target.sprite.x,
      this.target.sprite.y
    )
    return distance <= 5
  }

  moveToTarget() {
    if (this.target) {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.target.sprite.x,
          y: this.target.sprite.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, this.speed, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }

  update() {
    if (this.isAtMoveTarget()) {
      this.destroy()
    } else {
      this.moveToTarget()
    }
  }

  destroy() {
    if (this.destroyCallback) {
      this.destroyCallback()
    }
    this.sprite.destroy()
  }
}
