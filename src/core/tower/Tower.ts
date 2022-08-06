import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { Minion } from '../minion/Minion'
import { VisionCone } from '../minion/VisionCone'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { HealthBar } from '../ui/Healthbar'
import { AttackState } from './states/AttackState'
import { IdleState } from './states/IdleState'
import { TowerStates } from './states/TowerStates'

export interface TowerConfig {
  position: {
    x: number
    y: number
  }
  texture: string
  scale: number
  side: Side
}

export class Tower {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public side: Side
  public markerRectangle: Phaser.Geom.Rectangle
  public healthBar: HealthBar
  public visionCone: VisionCone
  public attackTarget: Minion | Champion | null = null
  public stateMachine: StateMachine

  constructor(game: Game, config: TowerConfig) {
    this.game = game
    this.side = config.side
    const { position } = config
    this.sprite = this.game.physics.add
      .sprite(position.x, position.y, config.texture)
      .setScale(config.scale)

    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )

    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x - this.sprite.displayWidth / 2,
      y: this.sprite.y - this.sprite.displayHeight / 2 - 5,
      maxValue: 500,
      height: 4,
      width: this.sprite.displayWidth,
      borderWidth: 1,
    })
    this.visionCone = new VisionCone(this.game, {
      entityToTrack: {
        sprite: this.sprite,
        markerRectangle: this.markerRectangle,
        moveTarget: this.side === Side.LEFT ? Constants.RIGHT_SPAWN : Constants.LEFT_SPAWN,
      },
      angleDiff: 20,
      rayLength: 75,
    })
    this.stateMachine = new StateMachine(
      TowerStates.IDLE,
      {
        [TowerStates.IDLE]: new IdleState(),
        [TowerStates.ATTACK]: new AttackState(),
      },
      [this]
    )
  }

  getDetectedEnemyMinions() {
    const entitiesToDetect =
      this.side === Side.LEFT
        ? this.game.rightMinionSpawner.minions
        : this.game.leftMinionSpawner.minions
    const minions: Minion[] = entitiesToDetect.children.entries.map(
      (obj) => obj.getData('ref') as Minion
    )
    return this.visionCone.getDetectedEntities(minions)
  }

  attack(target: Minion | Champion) {
    if (!target.sprite.active || target.getHealth() === 0) {
      return
    }
    const color = this.side === Side.LEFT ? 'blue' : 'red'
    const projectile = new Projectile(this.game, {
      position: {
        x: this.sprite.x,
        y: this.sprite.y,
      },
      target: target,
      speed: 200,
      texture: `projectile_${color}`,
      scale: 1.5,
    })
    projectile.destroyCallback = () => {
      target.takeDamage(Constants.TOWER_DAMAGE)
      if (target.getHealth() === 0) {
        target.destroy()
      }
    }
    this.game.projectileGroup.add(projectile.sprite)
  }

  getDetectedEnemyChampions() {}

  update() {
    this.stateMachine.step()
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - this.sprite.displayWidth / 2
      this.healthBar.y = this.sprite.y - this.sprite.displayHeight / 2 - 5
      this.healthBar.draw()
    }
  }

  takeDamage(damage: number) {
    if (this.healthBar) {
      this.healthBar.decrease(damage)
    }
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  destroy() {
    this.sprite.destroy()
    this.healthBar.destroy()
  }
}
