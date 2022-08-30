import { Game } from '~/scenes/Game'
import { Champion } from './champion/Champion'

export interface HealthOrbConfig {
  healAmount: number
  position: {
    x: number
    y: number
  }
}

export class HealthOrb {
  private game: Game
  public healAmount: number
  public sprite: Phaser.Physics.Arcade.Sprite
  public colliders: Phaser.Physics.Arcade.Collider[] = []

  constructor(game: Game, config: HealthOrbConfig) {
    this.game = game
    this.healAmount = config.healAmount
    this.sprite = this.game.physics.add.sprite(config.position.x, config.position.y, '')
    this.game.physics.world.enable(this.sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)
    this.setupColliders()
  }

  setupColliders() {
    this.createCollider(this.game.leftChampionsGroup)
    this.createCollider(this.game.rightChampionsGroup)
  }

  createCollider(group: Phaser.GameObjects.Group) {
    const collider = this.game.physics.add.overlap(group, this.sprite, (obj1, obj2) => {
      this.handleHealthPickup(obj1.getData('ref') as Champion)
    })
    this.colliders.push(collider)
  }

  handleHealthPickup(champion: Champion) {
    console.log('Champion: ', champion)
  }
}
