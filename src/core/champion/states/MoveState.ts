import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'

export class MoveState extends State {
  execute(champion: Champion) {
    const moveTarget = champion.moveTarget
    if (moveTarget) {
      champion.handleMovementToPoint(moveTarget)
    }
  }
}
