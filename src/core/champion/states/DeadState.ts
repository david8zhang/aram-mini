import { State } from '~/core/StateMachine'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class DeadState extends State {
  public deathTimestamp: number = 0

  enter(champion: Champion) {
    if (champion.side === champion.game.player.side) {
      champion.game.cameras.main.stopFollow()
    }
    this.deathTimestamp = Date.now()
  }

  execute(champion: Champion) {
    const currTimestamp = Date.now()
    if (currTimestamp - this.deathTimestamp > Constants.CHAMPION_RESPAWN_DELAY_MILLISECONDS) {
      champion.respawn()
      champion.stateMachine.transition(ChampionStates.IDLE)
    }
  }
}
