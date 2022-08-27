import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

interface EmissionConfig {
  texture: string
  scale: number
  position: {
    x: number
    y: number
  }
  count: number
  gravity?: boolean
}

export class ParticleEmitter {
  private game: Game
  constructor(game: Game) {
    this.game = game
  }

  emitParticles(config: EmissionConfig) {
    for (let i = 0; i < config.count; i++) {
      const xVelocity = Phaser.Math.Between(-50, 50)
      const yVelocity = Phaser.Math.Between(-100, -50)
      const sprite = this.game.physics.add.sprite(
        config.position.x,
        config.position.y,
        config.texture
      )
      sprite.setScale(config.scale)
      sprite.setVelocity(xVelocity, yVelocity)

      if (config.gravity) {
        sprite.setGravityY(200)
        sprite.setBounce(0, 0.6)
      }
      this.game.add.tween({
        targets: sprite,
        alpha: { value: 0, duration: 800, ease: 'Linear ' },
        onComplete: () => {
          sprite.destroy()
        },
      })
    }
  }
}
