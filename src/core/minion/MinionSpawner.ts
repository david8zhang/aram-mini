import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { Minion } from './Minion'

export interface MinionSpawnerConfig {
  spawnPosition: {
    x: number
    y: number
  }
  targetPosition: {
    x: number
    y: number
  }
  side: Side
  minionConfig: {
    texture: string
  }
}

export class MinionSpawner {
  private game: Game
  private spawnPosition: { x: number; y: number }
  private targetPosition: { x: number; y: number }
  private spawnEvent: Phaser.Time.TimerEvent
  private minionConfig: { texture: string }
  public side: Side
  public minions: Phaser.GameObjects.Group

  constructor(game: Game, config: MinionSpawnerConfig) {
    this.game = game
    this.spawnPosition = config.spawnPosition
    this.targetPosition = config.targetPosition
    this.minionConfig = config.minionConfig
    this.spawnEvent = this.game.time.addEvent({
      delay: 5000,
      repeat: -1,
      callback: () => {
        this.spawnMinions(3)
      },
      paused: true,
    })
    this.side = config.side
    this.minions = this.game.add.group()
  }

  startSpawning() {
    this.spawnEvent.paused = false
  }

  spawnMinions(numMinions: number) {
    if (numMinions === 0) {
      return
    }
    this.game.time.delayedCall(500, () => {
      const minion = new Minion(this.game, {
        position: {
          x: this.spawnPosition.x,
          y: this.spawnPosition.y,
        },
        moveTarget: this.targetPosition,
        texture: this.minionConfig.texture,
        side: this.side,
      })
      this.minions.add(minion.sprite)
      this.spawnMinions(numMinions - 1)
    })
  }
}
