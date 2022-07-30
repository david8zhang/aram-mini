import { State } from '~/core/StateMachine'
import { Minion } from '../Minion'
import { MinionStates } from './MinionStates'

export class MoveState extends State {
  execute(minion: Minion) {
    if (minion.isAtMoveTarget()) {
      minion.destroy()
    } else {
      minion.moveToTarget()
    }
  }
}
