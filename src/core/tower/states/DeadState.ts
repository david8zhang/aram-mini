import { State } from '~/core/StateMachine'
import { Tower } from '../Tower'

export class DeadState extends State {
  enter(tower: Tower) {
    tower.attackTarget = null
  }
}
