import { State } from '~/core/StateMachine'
import { Minion } from '../Minion'

export class AttackState extends State {
  execute(minion: Minion) {
    minion.stop()
  }
}
