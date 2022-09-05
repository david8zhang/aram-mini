export const createEmpoweredStrikeAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'empowered-strike',
    frames: anims.generateFrameNames('empowered-strike', {
      start: 0,
      end: 6,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
