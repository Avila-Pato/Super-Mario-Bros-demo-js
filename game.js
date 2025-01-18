import { createAnimations } from "./animations/animations.js";
import { checkControls } from "./animations/controls.js";
import { initAudio, playAudio } from "./audio/audio.js";
import { initSpritesheet } from "./spritesheet.js";

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

new Phaser.Game(config);

function preload() {
  this.load.image("cloud1", "./assets/scenery/overworld/cloud1.png");
  this.load.image("floorbricks", "./assets/scenery/overworld/floorbricks.png");
  this.load.image("supermushroom", "assets/collectibles/super-mushroom.png");
  this.load.image("logo", "assets/scenery/sign.png");
  this.load.image("bush2", "assets/scenery/overworld/bush2.png");
  this.load.image("bush1", "assets/scenery/overworld/bush1.png");

  initSpritesheet(this);
  initAudio(this);
}

function create() {
  createAnimations(this);

  // Añade las nubes
  this.add.image(100, 70, "cloud1").setOrigin(0, 0).setScale(0.15);
  this.add.image(30, 100, "cloud1").setOrigin(0, 0).setScale(0.15);
  this.add.image(180, 90, "cloud1").setOrigin(0, 0).setScale(0.15);

  // logo de mario Bros
  this.add.image(100, 10, "logo").setOrigin(0, 0).setScale(0.60);

  // Bush 
  this.add.image(210, 190, "bush2").setOrigin(0, ).setScale(0.65);
  this.add.image(10, 190, "bush1").setOrigin(0, ).setScale(0.65);




  // Piso
  this.floor = this.physics.add.staticGroup();
  this.floor.create(0, config.height - 16, "floorbricks").setOrigin(0, 0.5).refreshBody();
  this.floor.create(170, config.height - 16, "floorbricks").setOrigin(0, 0.5).refreshBody();
  this.floor.create(330, config.height - 16, "floorbricks").setOrigin(0, 0.5).refreshBody();

  // Mario
  this.mario = this.physics.add.sprite(50, 100, "mario")
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300);

  // Grupo de enemigos Goomba
  this.goombas = this.physics.add.group();

  const goombaPositions = [
    { x: 100, y: config.height - 30 },
    { x: 240, y: config.height - 30 },
    { x: 300, y: config.height - 30 },
  ];

  // Crear los Goombas en sus posiciones iniciales
  goombaPositions.forEach(({ x, y }) => {
    const goomba = this.goombas.create(x, y, "goomba");
    goomba.setOrigin(0, 1).setGravityY(300).setVelocityX(-20);
  });

  // Colisiones
  this.physics.add.collider(this.goombas, this.floor);

  // Reproducir la animación para todos los enemigos Goomba
  this.goombas.playAnimation("goomba-walk");

  // Añadir coleccionables
  this.collectibes = this.physics.add.staticGroup();
  this.collectibes.create(150, 150, "coin").anims.play("coin-spin", true);
  this.collectibes.create(250, 150, "coin").anims.play("coin-spin", true);
  this.collectibes.create(180, 150, "coin").anims.play("coin-spin", true);

  this.collectibes
    .create(200, config.height - 40, "supermushroom")
    .anims.play("supermushroom-idle", true);

  // Superposición Mario - Coleccionables
  this.physics.add.overlap(this.mario, this.collectibes, collectItem, null, this);

  // Configuración de cámara
  this.physics.world.setBounds(0, 0, 2000, config.height);
  this.physics.add.collider(this.mario, this.floor);
  this.physics.add.collider(this.mario, this.goombas, onHitEnemy, null, this);

  this.cameras.main.setBounds(0, 0, 2000, config.height);
  this.cameras.main.startFollow(this.mario);

  // Controles de teclado
  this.keys = this.input.keyboard.createCursorKeys();
}

function collectItem(mario, item) {
  const {
    texture: { key },
  } = item;
  item.destroy();

  if (key === "coin") {
    playAudio("coin-pickup", this, { volume: 0.2 });
    addToScore(100, item, this);
  } else if (key === "supermushroom") {
    playAudio("powerup", this, { volume: 0.2 });

    this.physics.world.pause();
    this.anims.pauseAll();

    // logica de mario al comerse el hongo
    if (key === "supermushroom") {
      this.physics.world.pause(); // detiene las animaciones cuando amrio crece
      this.anims.pauseAll();

      


    let i = 0;
    const interval = setInterval(() => {
        i++;
        mario.anims.play(
            i % 2 == 0 ? "mario-grown-idle" : "mario-idle",
        );
    }, 100);

    mario.isBlocked = true;
    mario.isGrown = true;

    setTimeout(() => {
        // Ajustar el tamaño permanentemente si Mario está en estado crecido
        mario.setDisplaySize(18, 32);
        this.physics.world.resume();

        this.anims.resumeAll();
        mario.isBlocked = false;
        mario.anims.play("mario-grow-idle", true); // Asegúrate de que haya una animación que represente a Mario crecido
        clearInterval(interval);
        this.physics.world.resume();
    }, 750);
  }
}
}

function addToScore(scoreToAdd, origin, game) {
  const scoreText = game.add.text(origin.x, origin.y, scoreToAdd, {
    fontFamily: "pixel",
    fontSize: config.width / 30,
  });
  game.tweens.add({
    targets: scoreText,
    duration: 500,
    y: scoreText.y - 20,
    onComplete: () => {
      game.tweens.add({
        targets: scoreText,
        duration: 100,
        alpha: 0,
        onComplete: () => {
          scoreText.destroy();
        },
      });
      scoreText.destroy();
    },
  });
}

function onHitEnemy(mario, enemy) {
  if (mario.body.touching.down && enemy.body.touching.up) {

    enemy.anims.play("goomba-hit", true);
    enemy.setVelocityX(0);
    mario.setVelocityY(-200);
    playAudio("funny", this , { volume: 0.2 });
    addToScore(200, enemy, this);
    setTimeout(() => {
      enemy.destroy();
    }, 300);
  } else {
    killMario(this);
  } 
}

function update() {
  const { mario } = this;

  checkControls(this);
  // logica de mario al quedarse quito para que quede el sprite 
 mario.isGrown = false;
 

  

  if (mario.y >= config.height) {
    killMario(this);
  }
}





function killMario(game) {
  const { mario, scene } = game;

  if (mario.isDead) return;


  mario.isDead = true;
  mario.anims.play("mario-dead");
  mario.setCollideWorldBounds(false);

  playAudio("gameover", game, { volume: 0.2 });

  mario.body.checkCollision.none = true;
  mario.setVelocityX(0);
  mario.setVelocityY(0);


  setTimeout(() => {
    mario.setVelocityY(-250);
  }, 100);

  setTimeout(() => {
    scene.restart();
  }, 2000);
}
