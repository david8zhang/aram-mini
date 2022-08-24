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
    const spawnPosition = champion.side === Side.LEFT ? Constants.LEFT_SPAWN : Constants.RIGHT_SPAWN
    champion.sprite.setPosition(spawnPosition.x, spawnPosition.y)
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
