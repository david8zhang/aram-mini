export const createExecutionStrikeAnims = (anims: Phaser.Animations.AnimationManager) => {
  anims.create({
    key: 'execution-strike',
    frames: anims.generateFrameNames('execution-strike', {
      start: 0,
      end: 7,
      suffix: '.png',
    }),
    repeat: 0,
    frameRate: 10,
  })
}
