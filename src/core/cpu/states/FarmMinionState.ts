import { Champion } from '~/core/champion/Champion'
import { ChampionStates } from '~/core/champion/states/ChampionStates'
import { Minion } from '~/core/minion/Minion'
import { State } from '~/core/StateMachine'
import { Game } from '~/scenes/Game'
import { CPU } from '../CPU'

export class FarmMinionState extends State {
  execute(cpu: CPU) {
    const champion = cpu.champion
    const game = cpu.game
    if (!champion.attackTarget || champion.attackTarget.getHealth() <= 0) {
      const closestMinion = this.getClosestMinion(champion, game)
      if (closestMinion) {
        champion.attackTarget = closestMinion
        champion.stateMachine.transition(ChampionStates.ATTACK)
      }
    }
  }

  getClosestMinion(champion: Champion, game: Game): Minion | null {
    let minDistance = Number.MAX_SAFE_INTEGER
    let closestMinion: Minion | null = null
    const enemyMinionsGroup = game.leftMinionSpawner.minions
    enemyMinionsGroup.children.entries.forEach((entity) => {
      const minionSprite = entity as Phaser.Physics.Arcade.Sprite
      const distance = Phaser.Math.Distance.Between(
        champion.sprite.x,
        champion.sprite.y,
        minionSprite.x,
        minionSprite.y
      )
      if (distance < minDistance) {
        closestMinion = entity.getData('ref') as Minion
        minDistance = distance
      }
    })
    return closestMinion
  }
}
