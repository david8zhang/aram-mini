import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export class Debug {
  private game: Game
  public isVisible: boolean = false
  private objects: Phaser.GameObjects.Group
  public static FIELD_ZONE_WIDTH = 40
  public static FIELD_ZONE_HEIGHT = 40

  public onDebugToggleHooks: Function[] = []

  constructor(game: Game) {
    this.game = game
    this.objects = this.game.add.group()
    this.debugFieldGrid()
    this.handleDebugToggleInput()
  }

  handleDebugToggleInput() {
    this.game.input.keyboard.on('keydown', (e) => {
      switch (e.code) {
        case 'Backquote': {
          this.setVisible(!this.isVisible)
          this.onDebugToggleHooks.forEach((fn) => {
            fn(this.isVisible)
          })
          break
        }
      }
    })
  }

  debugFieldGrid() {
    let position = {
      x: 20,
      y: 20,
    }
    const gridWidth = Constants.GAME_WIDTH / Debug.FIELD_ZONE_WIDTH
    const gridHeight = Constants.GAME_HEIGHT / Debug.FIELD_ZONE_HEIGHT

    for (let i = 0; i < gridWidth; i++) {
      position.x = 20
      for (let j = 0; j < gridHeight; j++) {
        const zoneRect = this.game.add
          .rectangle(
            position.x,
            position.y,
            Debug.FIELD_ZONE_WIDTH,
            Debug.FIELD_ZONE_HEIGHT,
            0x000000,
            0
          )
          .setStrokeStyle(3, 0x00ff00, 1)
          .setVisible(this.isVisible)
          .setDepth(100)
        const text = this.game.add
          .text(position.x, position.y, `${i},${j}`)
          .setTintFill(0x00ff00)
          .setAlpha(1)
          .setVisible(this.isVisible)
          .setDepth(100)
          .setFontSize(12)
        text.setPosition(position.x - text.displayWidth / 2, position.y - text.displayHeight / 2)
        this.objects.add(zoneRect)
        this.objects.add(text)
        position.x += Debug.FIELD_ZONE_WIDTH
      }
      position.y += Debug.FIELD_ZONE_HEIGHT
    }
  }

  setVisible(isVisible: boolean) {
    this.isVisible = isVisible
    this.objects.setVisible(isVisible)
  }
}
