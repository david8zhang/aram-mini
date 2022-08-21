import { Game } from '~/scenes/Game'
import { Constants } from '~/utils/Constants'

export interface TargetingArrowConfig {
  position: {
    x: number
    y: number
  }
  width: number
  height: number
}

export class TargetingArrow {
  private game: Game
  private rectangle: Phaser.GameObjects.Rectangle
  private triangle: Phaser.GameObjects.Triangle

  constructor(game: Game, config: TargetingArrowConfig) {
    this.game = game
    this.rectangle = this.game.add
      .rectangle(
        config.position.x,
        config.position.y,
        config.width,
        config.height,
        Constants.UI_HIGHLIGHT_COLOR,
        0.75
      )
      .setOrigin(0, 0.5)
      .setVisible(false)
    this.triangle = this.game.add
      .triangle(config.position.x, config.position.y, 0, 7, 14, 0, 14, 14)
      .setOrigin(0.5, 0.5)
      .setAlpha(0.9)

    this.triangle.setScale(-1).setVisible(false)
    this.triangle.setFillStyle(Constants.UI_HIGHLIGHT_COLOR)
  }

  renderToPosition(startPosition: { x: number; y: number }) {
    this.rectangle.setVisible(true)
    this.triangle.setVisible(true)
    this.rectangle.setPosition(startPosition.x, startPosition.y)
    const angleToMousePointer = Phaser.Math.Angle.Between(
      startPosition.x,
      startPosition.y,
      this.game.input.mousePointer.worldX,
      this.game.input.mousePointer.worldY
    )
    this.rectangle.setRotation(angleToMousePointer)
    const rightCenterPos = this.rectangle.getRightCenter()
    this.triangle.setPosition(rightCenterPos.x, rightCenterPos.y)
    this.triangle.setRotation(angleToMousePointer)
  }

  getArrowPositionEnd() {
    return this.triangle.getLeftCenter()
  }

  hide() {
    this.rectangle.setVisible(false)
    this.triangle.setVisible(false)
  }
}
