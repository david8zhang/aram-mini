import { Game, IgnoreDepthSortName } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Champion } from '../Champion'
import { AutoAttack } from './AutoAttack'

export class MeleeAttack implements AutoAttack {
  private game: Game
  private champion: Champion
  public slashAnimationSprite: Phaser.GameObjects.Sprite

  public attackRange: number = Constants.CHAMPION_ATTACK_RANGE_MELEE

  constructor(game: Game, champion: Champion) {
    this.game = game
    this.champion = champion
    this.slashAnimationSprite = this.game.add
      .sprite(this.champion.sprite.x, this.champion.sprite.y, 'slash')
      .setName(IgnoreDepthSortName.MELEE_ATTACK)
      .setVisible(false)

    this.slashAnimationSprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      (anim, frame, gameObject) => {
        const attackTarget = this.champion.attackTarget
        if (attackTarget) {
          if (frame.index === 3) {
            attackTarget.sprite.setTintFill(0xff0000)
            if (attackTarget.getHealth() - this.damage <= 0) {
              this.champion.handleLastHit(this.champion.attackTarget)
            }
            attackTarget.takeDamage(this.damage)
          } else if (frame.index === 5) {
            attackTarget.sprite.clearTint()
          }
        }
      }
    )
  }

  public get damage() {
    if (this.champion.damageOverride) {
      return this.champion.damageOverride
    }
    return Constants.CHAMPION_DAMAGE_MELEE
  }

  attack() {
    const attackTarget = this.champion.attackTarget
    if (attackTarget) {
      if (attackTarget.sprite.x < this.champion.sprite.x) {
        this.slashAnimationSprite
          .setPosition(this.champion.sprite.x - 20, this.champion.sprite.y)
          .setFlipX(true)
      } else {
        this.slashAnimationSprite
          .setPosition(this.champion.sprite.x + 20, this.champion.sprite.y)
          .setFlipX(false)
      }
      this.slashAnimationSprite.setDepth(this.champion.sprite.depth + 100).setVisible(true)
      this.slashAnimationSprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        this.slashAnimationSprite.setVisible(false)
      })
      if (!this.slashAnimationSprite.anims.isPlaying) {
        this.slashAnimationSprite.anims.play('slash')
      }
    }
  }
}
