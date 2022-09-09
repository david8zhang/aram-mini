import { Projectile } from '~/core/Projectile'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../Champion'
import { AutoAttack } from './AutoAttack'

export class RangedAttack implements AutoAttack {
  private game: Game
  private champion: Champion

  public attackRange: number = Constants.CHAMPION_ATTACK_RANGE_RANGED

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
  }

  public get damage() {
    if (this.champion.damageOverride) {
      return this.champion.damageOverride
    }
    return Constants.CHAMPION_DAMAGE_RANGED
  }

  public attack() {
    const projectileColor = this.champion.side === Side.LEFT ? 'blue' : 'red'
    const projectile = new Projectile(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      target: this.champion.attackTarget!,
      speed: 200,
      texture: `projectile_${projectileColor}`,
    })
    projectile.destroyCallback = () => {
      if (this.champion.attackTarget && this.champion.attackTarget.getHealth() > 0) {
        if (this.champion.attackTarget.getHealth() - this.damage <= 0) {
          this.champion.handleLastHit(this.damage)
        }
        this.champion.attackTarget.takeDamage(this.damage)
      }
    }
    this.game.projectileGroup.add(projectile.sprite)
  }
}
