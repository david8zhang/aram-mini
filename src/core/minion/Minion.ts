import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Champion } from '../champion/Champion'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { Tower } from '../tower/Tower'
import { HealthBar } from '../ui/Healthbar'
import { AttackState } from './states/AttackState'
import { MinionStates } from './states/MinionStates'
import { MoveState } from './states/MoveState'

export interface MinionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
  side: Side
  moveTarget: {
    x: number
    y: number
  }
}

export class Minion {
  private game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public moveTarget: { x: number; y: number }
  public stateMachine: StateMachine
  public side: Side

  // Detectors
  public attackRadius: number = Constants.MINION_ATTACK_RANGE
  public attackCircle: Phaser.GameObjects.Arc

  public healthBar: HealthBar | undefined
  public attackTarget: Minion | Tower | Champion | null = null

  constructor(game: Game, config: MinionConfig) {
    this.game = game
    this.side = config.side
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite.setData('ref', this)
    this.stateMachine = new StateMachine(
      MinionStates.MOVE,
      {
        [MinionStates.MOVE]: new MoveState(),
        [MinionStates.ATTACK]: new AttackState(),
      },
      [this]
    )
    this.healthBar = new HealthBar(this.game, {
      x: this.sprite.x,
      y: this.sprite.y,
      maxValue: 50,
      height: 3,
      width: 20,
      borderWidth: 1,
    })
    this.moveTarget = config.moveTarget
    this.attackCircle = this.game.add
      .circle(this.sprite.x, this.sprite.y, this.attackRadius, 0xff0000, 0.2)
      .setVisible(false)
    this.game.debug.onDebugToggleHooks.push(() => {
      this.attackCircle.setVisible(!this.attackCircle.visible)
    })
  }

  public get attackRange() {
    return this.attackRadius
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  takeDamage(damage: number) {
    if (this.healthBar) {
      this.healthBar.decrease(damage)
    }
  }

  attack(target: Minion | Tower | Champion) {
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
    })
    projectile.destroyCallback = () => {
      target.takeDamage(Constants.MINION_DAMAGE)
      if (target.getHealth() === 0) {
        target.destroy()
      }
    }
    this.game.projectileGroup.add(projectile.sprite)
  }

  update() {
    this.stateMachine.step()
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - 10
      this.healthBar.y = this.sprite.y - this.sprite.body.height
      this.healthBar.draw()
    }
    this.attackCircle.setPosition(this.sprite.x, this.sprite.y)
  }
  getDetectedEnemies() {
    const enemyList =
      this.side === Side.LEFT
        ? this.game.rightMinionSpawner.minions
        : this.game.leftMinionSpawner.minions
    const minions: Minion[] = enemyList.children.entries
      .map((obj) => obj.getData('ref') as Minion)
      .filter((minion) => {
        const distance = Phaser.Math.Distance.Between(
          this.sprite.x,
          this.sprite.y,
          minion.sprite.x,
          minion.sprite.y
        )
        return distance <= this.attackRadius && minion.sprite.active && minion.getHealth() > 0
      })
    return minions
  }

  getDetectedTowers() {
    const towerList = this.side === Side.LEFT ? this.game.rightTowers : this.game.leftTowers
    return towerList.filter((tower: Tower) => {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        tower.sprite.x,
        tower.sprite.y
      )
      return distance <= this.attackRadius && !tower.isDead
    })
  }

  getDetectedChampions() {
    const championList =
      this.side === Side.LEFT ? this.game.rightChampions : this.game.leftChampions
    return championList.filter((champion: Champion) => {
      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        champion.sprite.x,
        champion.sprite.y
      )
      return distance <= this.attackRadius && !champion.isDead
    })
  }

  destroy() {
    this.sprite.destroy()
    if (this.healthBar) {
      this.healthBar.destroy()
      this.healthBar = undefined
    }
    this.attackCircle.destroy()
  }

  setMoveTarget(moveTarget: { x: number; y: number }) {
    this.moveTarget = moveTarget
  }

  stop() {
    this.sprite.setVelocity(0, 0)
  }

  isAtMoveTarget() {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      this.moveTarget!.x,
      this.moveTarget!.y
    )
    return distance <= 5
  }

  moveToTarget() {
    if (this.moveTarget) {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: this.moveTarget.x,
          y: this.moveTarget.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, Constants.MINION_MOVE_SPEED, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    }
  }
}
