import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { StateMachine } from '../StateMachine'
import { CPUStates } from './states/CPUStates'
import { FarmMinionState } from './states/FarmMinionState'
import { RetreatToSafetyState } from './states/RetreatToSafetyState'
import { SeekPlayerState } from './states/SeekPlayerState'

export class CPU {
  public game: Game
  public champion: Champion
  public stateMachine: StateMachine

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
    this.stateMachine = new StateMachine(
      CPUStates.FARM_MINION,
      {
        [CPUStates.FARM_MINION]: new FarmMinionState(),
        [CPUStates.RETREAT_TO_SAFETY]: new RetreatToSafetyState(),
        [CPUStates.SEEK_PLAYER]: new SeekPlayerState(),
      },
      [this]
    )
  }

  update() {
    this.stateMachine.step()
    this.champion.update()
  }
}
