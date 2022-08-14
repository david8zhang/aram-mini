import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'

export class IdleState extends State {
  execute(champion: Champion) {
    champion.stop()
  }
}
