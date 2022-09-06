import { State } from '~/core/StateMachine'
import { Constants } from '~/utils/Constants'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class DeadState extends State {
  public deathTimestamp: number = 0
  public isDeadAlready: boolean = false

  enter(champion: Champion) {
    if (!this.isDeadAlready) {
      champion.numDeaths++
      this.isDeadAlready = true
    }
    if (champion.side === champion.game.player.side) {
      champion.game.cameras.main.stopFollow()
    }
    this.deathTimestamp = Date.now()
  }

  execute(champion: Champion) {
    const currTimestamp = Date.now()
    if (currTimestamp - this.deathTimestamp > Constants.CHAMPION_RESPAWN_DELAY_MILLISECONDS) {
      this.isDeadAlready = false
      champion.respawn()
      champion.stateMachine.transition(ChampionStates.IDLE)
    }
  }
}
