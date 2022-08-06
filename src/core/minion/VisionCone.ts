import { Game } from '~/scenes/Game'

export interface TrackableEntity {
  sprite: Phaser.Physics.Arcade.Sprite
  moveTarget: { x: number; y: number }
  markerRectangle?: Phaser.Geom.Rectangle
}

export interface TargetableEntity {
  markerRectangle?: Phaser.Geom.Rectangle
}

export interface VisionConeConfig {
  entityToTrack: TrackableEntity
  angleDiff: number
  rayLength?: number
}

export class VisionCone {
  private game: Game
  private rays: Phaser.Geom.Line[] = []
  private config: VisionConeConfig
  public attackRange: number = 0

  constructor(game: Game, config: VisionConeConfig) {
    this.game = game
    this.config = config
    this.attackRange = config.rayLength || 20
    this.createVisionRays()
  }

  getAngles(config: VisionConeConfig): number[] {
    const { angleDiff, entityToTrack } = config
    const angleToGoal = Phaser.Math.Angle.BetweenPoints(
      {
        x: entityToTrack.sprite.x,
        y: entityToTrack.sprite.y,
      },
      {
        x: entityToTrack.moveTarget!.x,
        y: entityToTrack.moveTarget!.y,
      }
    )
    const angles: number[] = []
    for (let i = -angleDiff * 2; i <= angleDiff * 2; i += angleDiff) {
      angles.push(angleToGoal + Phaser.Math.DegToRad(i))
    }
    return angles
  }

  createVisionRays() {
    const { entityToTrack, rayLength } = this.config
    const angles = this.getAngles(this.config)
    angles.forEach((angle) => {
      const ray = new Phaser.Geom.Line()
      Phaser.Geom.Line.SetToAngle(
        ray,
        entityToTrack.sprite.x,
        entityToTrack.sprite.y,
        angle,
        rayLength || 20
      )
      this.rays.push(ray)
    })
  }

  public updateRayPositions() {
    if (!this.config.entityToTrack.markerRectangle) {
      return
    }
    const { entityToTrack, rayLength } = this.config
    const angles = this.getAngles(this.config)
    angles.forEach((angle, index) => {
      const ray = this.rays[index]
      if (ray) {
        Phaser.Geom.Line.SetToAngle(
          ray,
          entityToTrack.sprite.x,
          entityToTrack.sprite.y,
          angle,
          rayLength || 20
        )
        if (this.game.isDebug) {
          this.game.graphics.strokeLineShape(ray)
        }
      }
    })
  }

  getDetectedEntities(entityList: TargetableEntity[]): TargetableEntity[] {
    const detectedEntities: TargetableEntity[] = []
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i]
      for (let j = 0; j < entityList.length; j++) {
        const entity = entityList[j]
        if (
          entity.markerRectangle &&
          Phaser.Geom.Intersects.LineToRectangle(ray, entity.markerRectangle)
        ) {
          detectedEntities.push(entity)
        }
      }
    }
    return detectedEntities
  }

  destroy() {
    this.rays = []
  }
}
