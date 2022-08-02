import { State } from '~/core/StateMachine'
import { Champion } from '../Champion'

export class AttackState extends State {
  public lastAttackedTimestamp: number = 0
  execute(champion: Champion) {
    const currTime = Date.now()
    champion.sprite.setVelocity(0, 0)
    if (currTime - this.lastAttackedTimestamp > 1000) {
      this.lastAttackedTimestamp = currTime
      champion.attack()
    }
  }
}
