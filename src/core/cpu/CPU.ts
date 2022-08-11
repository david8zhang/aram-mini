import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { StateMachine } from '../StateMachine'

export class CPU {
  public game: Game
  public champion: Champion

  constructor(game: Game) {
    this.game = game
    this.champion = new Champion(this.game, {
      texture: 'wizard',
      position: {
        x: Constants.RIGHT_SPAWN.x,
        y: Constants.RIGHT_SPAWN.y,
      },
      side: Side.RIGHT,
    })
  }

  update() {
    this.champion.update()
  }
}
