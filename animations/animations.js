export const createAnimations = (game) => {
  game.anims.create({
    key: "mario-walk",
    frames: game.anims.generateFrameNumbers("mario", { start: 1, end: 3 }),
    frameRate: 12,
    repeat: -1,
  });

  game.anims.create({
    key: "mario-idle",
    frames: [{ key: "mario", frame: 0 }],
  });

  game.anims.create({
    key: "mario-jump",
    frames: [{ key: "mario", frame: 5 }],
  });

  game.anims.create({
    key: "mario-dead",
    frames: [{ key: "mario", frame: 4 }],
  });

  // goomba caminando
  game.anims.create({
    key: "goomba-walk",
    frames: game.anims.generateFrameNumbers("goomba", { start: 0, end: 1 }),
    frameRate: 12,
    repeat: -1,
  });

  //goomba murisiendo
  game.anims.create({
    key: "goomba-hit",
    frames: [{ key: "goomba", frame: 2 }],
  });

  // animando el coin

  game.anims.create({
    key: "coin-spin",
    frames: game.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
    frameRate: 12,
    repeat: -1,
  });

};
