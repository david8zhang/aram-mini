import { Scene } from 'phaser'

export class Preload extends Scene {
  constructor() {
    super('preload')
  }

  preload() {
    // Bitmap font
    this.load.bitmapFont('graphic-pixel', 'fonts/graphicpixel.png', 'fonts/graphicpixel.xml')

    // Champions
    this.load.image('warrior', 'warrior.png')
    this.load.image('wizard', 'wizard.png')

    // Minions
    this.load.image('minion_blue', 'minion-blue.png')
    this.load.image('minion_red', 'minion-red.png')

    // Projectiles
    this.load.image('projectile_blue', 'projectile-blue.png')
    this.load.image('projectile_red', 'projectile-red.png')

    // Towers
    this.load.image('tower_red', 'tower-red.png')
    this.load.image('tower_blue', 'tower-blue.png')

    // Nexuses
    this.load.image('nexus_blue', 'nexus-blue.png')
    this.load.image('nexus_red', 'nexus-red.png')

    // Tilemaps & Etc.
    this.load.tilemapTiledJSON('map', 'map.json')
    this.load.image('tilemap_packed', 'tilemap_packed.png')
    this.load.image('attack-cursor', 'attack-cursor.png')
  }

  create() {
    this.scene.start('game')
    this.scene.start('ui')
  }
}
