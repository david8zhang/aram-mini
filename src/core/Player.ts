import { Game } from '~/scenes/Game'
import { Champion, ChampionConfig } from './champion/Champion'
import { MouseMoveController } from './MouseMoveController'

export interface PlayerConfig {
  game: Game
  championConfig: ChampionConfig
}

export class Player {
  public game: Game
  public champion: Champion
  public mouseMoveController: MouseMoveController

  constructor(config: PlayerConfig) {
    this.game = config.game
    this.champion = new Champion(this.game, config.championConfig)
    this.mouseMoveController = new MouseMoveController({
      game: this.game,
      sprite: this.champion.sprite,
    })
  }
}
