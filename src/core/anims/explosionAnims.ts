export const createExplosionAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'explosion',
    frames: anims.generateFrameNames('explosion', {
      start: 0,
      end: 7,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
