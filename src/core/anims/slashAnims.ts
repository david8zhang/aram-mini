export const createSlashAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'slash',
    frames: anims.generateFrameNames('slash', {
      start: 0,
      end: 5,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
