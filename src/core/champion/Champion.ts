import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'
import { Side } from '~/utils/Side'
import { Minion } from '../minion/Minion'
import { Nexus } from '../Nexus'
import { Projectile } from '../Projectile'
import { StateMachine } from '../StateMachine'
import { Tower } from '../tower/Tower'
import { UIValueBar } from '../ui/UIValueBar'
import { AttackState } from './states/AttackState'
import { ChampionStates } from './states/ChampionStates'
import { DeadState } from './states/DeadState'
import { IdleState } from './states/IdleState'
import { MoveState } from './states/MoveState'

export interface ChampionConfig {
  texture: string
  position: {
    x: number
    y: number
  }
  isPlayerControlled?: boolean
  side: Side
  abilities: {
    [key: string]: any
  }
}

export class Champion {
  public game: Game
  public sprite: Phaser.Physics.Arcade.Sprite
  public stateMachine: StateMachine
  public side: Side
  public isPlayerControlled: boolean = false

  public moveTarget: { x: number; y: number } | null = null
  public moveMarker: Phaser.GameObjects.Arc | null = null

  public attackTarget: Champion | Minion | Tower | Nexus | null = null
  public markerRectangle: Phaser.Geom.Rectangle
  public healthBar: UIValueBar

  public totalExp: number = 0
  public level: number = 1
  public csScore: number = 0
  public numKills: number = 0
  public numDeaths: number = 0

  public attackRange: number = Constants.CHAMPION_ATTACK_RANGE
  public onDestroyedCallbacks: Function[] = []
  public abilities: any[] = []

  private _damageOverride: number = -1
  public shouldShowHoverOutline: boolean = true

  constructor(game: Game, config: ChampionConfig) {
    this.game = game
    this.side = config.side
    if (config.isPlayerControlled) {
      this.isPlayerControlled = config.isPlayerControlled
    }
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, config.texture)
    this.sprite
      .setData('ref', this)
      .setInteractive()
      .on('pointerover', () => {
        if (this.shouldShowHoverOutline) {
          this.game.postFxPlugin.add(this.sprite, {
            thickness: 2,
            outlineColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
          })
        }
      })
      .on('pointerout', () => {
        if (this.shouldShowHoverOutline) {
          this.game.postFxPlugin.remove(this.sprite)
        }
      })

    this.game.physics.world.enableBody(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.stateMachine = new StateMachine(
      ChampionStates.IDLE,
      {
        [ChampionStates.IDLE]: new IdleState(),
        [ChampionStates.MOVE]: new MoveState(),
        [ChampionStates.ATTACK]: new AttackState(),
        [ChampionStates.DEAD]: new DeadState(),
      },
      [this]
    )
    this.markerRectangle = new Phaser.Geom.Rectangle(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayHeight / 2,
      this.sprite.displayWidth,
      this.sprite.displayHeight
    )
    this.healthBar = new UIValueBar(this.game, {
      x: this.sprite.x - 15,
      y: this.sprite.y - this.sprite.body.height,
      maxValue: Constants.CHAMPION_HEALTH,
      height: 4,
      width: 30,
      borderWidth: 1,
      fillColor: this.side === Side.LEFT ? Constants.LEFT_COLOR : Constants.RIGHT_COLOR,
    })
    this.configureAbilities(config.abilities)
  }

  configureAbilities(abilityConfig: { [key: string]: any }) {
    if (abilityConfig) {
      const QAbilityClass = abilityConfig['Q']
      this.abilities.push(new QAbilityClass(this.game, this))
    }
  }

  public get isDead() {
    return this.stateMachine.getState() === ChampionStates.DEAD
  }

  attack() {
    if (this.isDead) {
      return
    }
    if (this.attackTarget) {
      if (!this.attackTarget.sprite.active || this.attackTarget.getHealth() === 0) {
        return
      }
      const projectileColor = this.side === Side.LEFT ? 'blue' : 'red'
      const projectile = new Projectile(this.game, {
        position: {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        target: this.attackTarget,
        speed: 200,
        texture: `projectile_${projectileColor}`,
      })
      projectile.destroyCallback = () => {
        if (this.attackTarget && this.attackTarget.getHealth() > 0) {
          if (this.attackTarget.getHealth() - this.damage <= 0) {
            this.handleLastHit(this.attackTarget)
          }
          this.attackTarget.takeDamage(this.damage)
        }
      }
      this.game.projectileGroup.add(projectile.sprite)
    }
  }

  public handleLastHit(attackTarget) {
    if (!attackTarget) {
      return
    }
    switch (attackTarget.constructor.name) {
      case 'Champion': {
        const expForNextLevel = this.getExpForNextLevel()
        this.addExp(
          Math.round(
            0.75 *
              expForNextLevel *
              Constants.getLevelDiffExpAdjuster(this.level, (attackTarget as Champion).level)
          )
        )
        console.log('KILLED CHAMPION!')
        this.numKills++
        break
      }
      case 'Minion': {
        this.csScore++
        break
      }
    }
  }

  public addExp(exp: number) {
    this.totalExp += exp
    this.level = this.getLevelForTotalExp(this.totalExp)
  }

  set damageOverride(newDamage: number) {
    this._damageOverride = newDamage
  }

  get damage(): number {
    if (this._damageOverride != -1) {
      return this._damageOverride
    }
    return this.level * Constants.CHAMPION_DAMAGE
  }

  getLevelForTotalExp(totalExp: number) {
    const levelRanges = Constants.EXP_TO_LEVEL_RANGES
    const maxExp = levelRanges[levelRanges.length - 1][1]
    if (totalExp === 0) {
      return 1
    }
    if (totalExp >= maxExp) {
      return levelRanges.length
    }
    for (let i = 0; i < levelRanges.length; i++) {
      const currRange = levelRanges[i]
      if (totalExp >= currRange[0] && totalExp < currRange[1]) {
        return i + 1
      }
    }
    return levelRanges.length
  }

  getExpForNextLevel() {
    const currRange = Constants.EXP_TO_LEVEL_RANGES[this.level - 1]
    return currRange[1] - this.totalExp
  }

  getHealth() {
    if (this.healthBar) {
      return this.healthBar.currValue
    }
    return 0
  }

  getTotalHealth() {
    if (this.healthBar) {
      return this.healthBar.maxValue
    }
    return 0
  }

  respawn() {
    const spawnPosition = this.side === Side.LEFT ? Constants.LEFT_SPAWN : Constants.RIGHT_SPAWN
    this.sprite.setPosition(spawnPosition.x, spawnPosition.y)
    this.healthBar.setCurrValue(Constants.CHAMPION_HEALTH)
    this.healthBar.setVisible(true)
    this.sprite.setVisible(true)
    if (this.side === Side.LEFT) {
      this.game.cameras.main.startFollow(this.sprite, true)
    }
  }

  stop() {
    this.moveTarget = null
    this.attackTarget = null
    this.sprite.setVelocity(0, 0)
  }

  destroy() {
    this.sprite.setVisible(false)
    this.healthBar.setVisible(false)
    this.moveTarget = null
    this.onDestroyedCallbacks.forEach((cb) => cb())
    this.numDeaths++
    this.stateMachine.transition(ChampionStates.DEAD)
  }

  takeDamage(damage: number) {
    this.healthBar.decrease(damage)
    if (this.healthBar.currValue == 0) {
      this.destroy()
    }
  }

  update() {
    this.stateMachine.step()
    this.markerRectangle.setPosition(
      this.sprite.x - this.sprite.displayWidth / 2,
      this.sprite.y - this.sprite.displayWidth / 2
    )
    if (this.healthBar) {
      this.healthBar.x = this.sprite.x - 15
      this.healthBar.y = this.sprite.y - this.sprite.body.height
      this.healthBar.draw()
    }
    this.abilities.forEach((ability) => {
      ability.update()
    })
  }

  isAtMoveTarget(moveTarget: { x: number; y: number }) {
    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      moveTarget!.x,
      moveTarget!.y
    )
    return distance <= 5
  }

  handleMovementToPoint(moveTarget: { x: number; y: number }) {
    if (this.isDead) {
      return
    }
    if (moveTarget && !this.isAtMoveTarget(moveTarget)) {
      let angle = Phaser.Math.Angle.BetweenPoints(
        {
          x: this.sprite.x,
          y: this.sprite.y,
        },
        {
          x: moveTarget.x,
          y: moveTarget.y,
        }
      )
      const velocityVector = new Phaser.Math.Vector2()
      this.game.physics.velocityFromRotation(angle, 100, velocityVector)
      this.sprite.setVelocity(velocityVector.x, velocityVector.y)
    } else {
      this.sprite.setVelocity(0, 0)
    }
  }

  setMoveTarget(x: number, y: number) {
    if (this.isDead) {
      return
    }
    this.moveTarget = new Phaser.Math.Vector2(x, y)
    if (!this.moveMarker) {
      this.moveMarker = this.game.add.circle(x, y, 1, 0x00ff00)
    } else {
      this.moveMarker.setPosition(x, y)
    }
  }
}
