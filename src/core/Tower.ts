import { Game } from '~/scenes/Game'

export interface TowerConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  scale: number
}

export class Tower {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite

  constructor(game: Game, config: TowerConfig) {
    this.game = game
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, config.texture)
      .setScale(config.scale)
  }
}
