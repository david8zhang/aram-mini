import { Game } from '~/scenes/Game'
import { Side } from '~/utils/Side'
import { Champion, ChampionConfig } from './champion/Champion'
import { ChampionStates } from './champion/states/ChampionStates'
import { Minion } from './minion/Minion'

export interface PlayerConfig {
  game: Game
  championConfig: ChampionConfig
}

export class Player {
  public game: Game
  public champion: Champion
  public moveTargetMarker?: Phaser.GameObjects.Arc
  public side: Side = Side.LEFT
  public clickBox: Phaser.Physics.Arcade.Sprite

  constructor(config: PlayerConfig) {
    this.game = config.game
    this.champion = new Champion(this.game, config.championConfig)
    this.setupMouseClickListener()
    this.clickBox = this.game.physics.add.sprite(0, 0, '').setSize(10, 10).setVisible(false)
  }

  update() {
    this.champion.update()
  }

  setupMouseClickListener() {
    this.game.input.mouse.disableContextMenu()
    this.game.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        const minion = this.game.rightMinionSpawner.getMinionAtPosition(
          pointer.worldX,
          pointer.worldY,
          15
        )
        if (minion) {
          this.setChampionAttackTarget(minion.getData('ref') as Minion)
        } else {
          this.moveChampionToPosition(pointer)
        }
      }
    })
  }

  moveChampionToPosition(pointer: Phaser.Input.Pointer) {
    this.champion.setMoveTarget(Math.round(pointer.worldX), Math.round(pointer.worldY))
    this.champion.stateMachine.transition(ChampionStates.MOVE)
  }

  setChampionAttackTarget(target: Minion | Champion) {
    this.champion.attackTarget = target
    this.champion.stateMachine.transition(ChampionStates.ATTACK)
  }
}
