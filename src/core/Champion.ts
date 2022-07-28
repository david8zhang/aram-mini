import { Game } from '~/scenes/Game'

export interface ChampionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
}

export class Champion {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  constructor(game: Game, config: ChampionConfig) {
    this.game = game
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
  }
}
