export const createFlameSpreadAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'flame-spread-explosion',
    frames: anims.generateFrameNames('flame-spread-explosion', {
      start: 0,
      end: 4,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
