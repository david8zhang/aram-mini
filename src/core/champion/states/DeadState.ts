import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'
import { ChampionStates } from './ChampionStates'

export class DeadState extends State {
  public deathTimestamp: number = 0

  enter(champion: Champion) {
    champion.game.cameras.main.stopFollow()
    this.deathTimestamp = Date.now()
  }

  execute(champion: Champion) {
    const currTimestamp = Date.now()
    if (currTimestamp - this.deathTimestamp > 10000) {
      champion.respawn()
      champion.stateMachine.transition(ChampionStates.IDLE)
    }
  }
}
