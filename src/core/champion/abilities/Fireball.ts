import { Minion } from '~/core/minion/Minion'
import { Projectile } from '~/core/Projectile'
import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Champion } from '../Champion'
import { Ability } from './Ability'
import { TargetingArrow } from './TargetingArrow'

export class Fireball implements Ability {
  game: Game
  champion: Champion

  public static readonly DAMAGE = 1000
  public isTargetingMode: boolean = false
  public key!: Phaser.Input.Keyboard.Key | null
  public attackRange = Constants.CHAMPION_ATTACK_RANGE + 25
  public targetingArrow: TargetingArrow
  public iconTexture: string = 'fireball'

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    if (this.champion.isPlayerControlled) {
      this.key = this.game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q)
    }
    this.targetingArrow = new TargetingArrow(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      width: this.attackRange,
      height: 5,
    })
  }

  handleKeyPress() {
    if (this.key && this.champion.isPlayerControlled) {
      if (this.key.isDown) {
        this.isTargetingMode = true
      } else {
        if (this.isTargetingMode) {
          this.isTargetingMode = false
          this.targetingArrow.hide()
          this.triggerAbility()
        }
      }
    }
  }

  triggerAbility() {
    const targetPoint = this.targetingArrow.getArrowPositionEnd()
    const angleToTargetPoint = Phaser.Math.Angle.Between(
      this.champion.sprite.x,
      this.champion.sprite.y,
      targetPoint.x,
      targetPoint.y
    )

    const fireball = new Projectile(this.game, {
      position: {
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      },
      texture: 'fireball',
      staticTarget: targetPoint,
      speed: 150,
      scale: 2,
      rotation: angleToTargetPoint,
      bodyConfig: {
        scaleX: 0.4,
        scaleY: 0.4,
      },
      onOverlapFn: (target: Minion | Champion) => {
        if (target.side !== this.champion.side) {
          if (target.getHealth() > 0) {
            if (target.getHealth() - Fireball.DAMAGE <= 0) {
              this.champion.handleLastHit(target)
            }
            target.takeDamage(Fireball.DAMAGE)
            fireball.destroy()
          }
        }
      },
    })
    this.game.projectileGroup.add(fireball.sprite)
  }

  renderTargetingUI() {
    if (this.isTargetingMode) {
      this.targetingArrow.renderToPosition({
        x: this.champion.sprite.x,
        y: this.champion.sprite.y,
      })
    }
  }

  update() {
    this.handleKeyPress()
    this.renderTargetingUI()
  }
}
