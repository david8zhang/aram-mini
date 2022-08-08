import { Scene } from 'phaser'

export class Preload extends Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('warrior', 'warrior.png')
    this.load.image('wizard', 'wizard.png')
    this.load.image('minion_blue', 'minion_blue.png')
    this.load.image('minion_red', 'minion_red.png')
    this.load.image('projectile_blue', 'projectile-blue.png')
    this.load.image('projectile_red', 'projectile-red.png')
    this.load.image('tilemap_packed', 'tilemap_packed.png')
    this.load.image('tower_red', 'tower-red.png')
    this.load.image('tower_blue', 'tower-blue.png')
    this.load.tilemapTiledJSON('map', 'map.json')
    this.load.image('attack-cursor', 'attack-cursor.png')
  }

  create() {
    this.scene.start('game')
  }
}
