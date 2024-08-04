
// Aplicando logica de mario al comerse el hongo
const MARIO_ANIMATIONS = {
  grow: {
    idle: 'mario-grow-idle',
    walk: 'mario-grow-walk',
    jump: 'mario-grow-jump'
  },
  normal: {
    idle: 'mario-idle',
    walk: 'mario-walk',
    jump: 'mario-jump'
  }
}



export function checkControls({ mario, keys }) {
  const isMarioTouchingFloor = mario.body.touching.down;

  const isLeftKeyDown = keys.left.isDown;
  const isRightKeyDown = keys.right.isDown;
  const isUpKeyDown = keys.up.isDown;

  if (mario.isDead) return;
  if (mario.isBlocked) return;

  // Aplicando logica de mario al comerse el hongo en un operador ternario
  const marioAnimations = mario.isGrown 
  ? MARIO_ANIMATIONS.grow 
  : MARIO_ANIMATIONS.normal;



  if (isLeftKeyDown) {
    //animaciond emario caminando
    isMarioTouchingFloor && mario.anims.play("mario-walk", true);
    //velocidad de mario
    mario.x -= 2;
    //mario se da vuelta hacia la izquierda
    mario.flipX = true;
  } else if (isRightKeyDown) {
    isMarioTouchingFloor && mario.anims.play("mario-walk", true);
    mario.x += 2;
    mario.flipX = false;
  } else if (isMarioTouchingFloor) {
    //mario se queda quieto
    mario.anims.play(marioAnimations.idle, true);
  }

  if (isUpKeyDown && isMarioTouchingFloor) {
    //altura de mario
    mario.setVelocityY(-300);
    mario.anims.play("mario-jump", true);
  }
}
