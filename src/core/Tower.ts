import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { HealthBar } from './ui/Healthbar'

export interface TowerConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  scale: number
  side: Side
}

export class Tower {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public side: Side
  public markerRectangle: Phaser.Geom.Rectangle
  public healthBar: HealthBar

  constructor(game: Game, config: TowerConfig) {
    this.game = game
    this.side = config.side
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, config.texture)
      .setScale(config.scale)

    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )

    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x - this.sprite.displayWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight / 2 - 5,
      maxValue: 100,
      height: 4,
      width: this.sprite.displayWidth,
      borderWidth: 1,
    })
  }

  update() {
    this.game.graphics.strokeRectShape(this.markerRectangle).setDepth(100)
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - this.sprite.displayWidth / 2
      this.healthBar.y = this.sprite.y - this.sprite.displayHeight / 2 - 5
      this.healthBar.draw()
    }
  }

  takeDamage(damage: number) {
    if (this.healthBar) {
      this.healthBar.decrease(damage)
    }
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  destroy() {
    this.sprite.destroy()
    this.healthBar.destroy()
  }
}
