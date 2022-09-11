export const createFireballExplosionAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'fireball-explosion',
    frames: anims.generateFrameNames('fireball-explosion', {
      start: 0,
      end: 4,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
