import { Scene } from 'phaser'

export class Preload extends Scene {
  constructor() {
    super('preload')
  }

  preload() {
    this.load.image('warrior', 'warrior.png')
    this.load.image('wizard', 'wizard.png')
    this.load.image('tilemap_packed', 'tilemap_packed.png')
    this.load.tilemapTiledJSON('map', 'map.json')
  }

  create() {
    this.scene.start('game')
  }
}
