export const createFireAOEExplosionAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'fire-aoe-explosion',
    frames: anims.generateFrameNames('fire-aoe-explosion', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
