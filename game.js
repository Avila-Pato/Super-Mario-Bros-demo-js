import { createAnimations } from "./animations/animations.js";

const config = {
  type: Phaser.AUTO,
  width: 256,
  height: 244,
  backgroundColor: "#049cd8",
  parent: "game",
  physics: {
    // Comportamietno del juego
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: {
    preload, // se ejecuta para precargar recursos
    create, // se ejecuta cuando el juego comienza
    update, // se ejecuta en cada frame
  },
};

new Phaser.Game(config);
// this -> game -> el juego que estamos construyendo

function preload() {
  this.load.image(
    "cloud1", // id del asset
    "./assets/scenery/overworld/cloud1.png"
  );
  this.load.image("floorbricks", "./assets/scenery/overworld/floorbricks.png");

  this.load.spritesheet(
    "mario", // <--- id
    "assets/entities/mario.png",
    // definen  las dimensiones de un marco o contenedor en gráficos
    { frameWidth: 18, frameHeight: 16 }

    //Propeidad de Freames (anims)
  );

  this.load.audio("gameover", "./assets/sound/music/gameover.mp3");
} // 1.

function create() {
  // image(x, y, id-del-asset)
  this.add
    .image(100, 50, "cloud1")
    .setOrigin(0, 0) // indicar donde debe estar la iamgen.
    .setScale(0.15); // tamaño del sprite.

  //Suelo del Juego agregando  agrupacion
  this.floor = this.physics.add.staticGroup();

  this.floor
    .create(0, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.floor
    .create(170, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  //   this.add
  //     .tileSprite(0, config.height - 32, 64, 32, "floorbricks")
  //     .setOrigin(0, 0); // indicar donde;
  //   this.add
  //     .tileSprite(100, config.height - 32, 64, 32, "floorbricks")
  //     .setOrigin(0, 0); // indicar donde;

  //this.mario = this.add
  //.sprite(50, 210, "mario") // posicion del sprite de mario.
  //.setOrigin(0, 1);

  // cuando se agrega fisica al juego los componentes tienen que cambiar
  this.mario = this.physics.add
    .sprite(50, 100, "mario")
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300);

  //Largo del mundo y altura. (2000, -- config.height)
  this.physics.world.setBounds(0, 0, 2000, config.height);
  this.physics.add.collider(this.mario, this.floor);

  //Limite de la camara, (Mimsa configuracion ue el limite del mundo)
  this.cameras.main.setBounds(0, 0, 2000, config.height);
  // camara principal que sigue a mario
  this.cameras.main.startFollow(this.mario);

  createAnimations(this);

  //   this.anims.create({
  //     key: "mario-walk",
  //     frames: this.anims.generateFrameNumbers("mario", { start: 1, end: 3 }), // leer frames de comienzo de la caminata de mario(img) usando(generateFrameNumbers)
  //     frameRate: 12, // duracion de las imagenes  por frame
  //     repeat: -1,
  //   });

  //   this.anims.create({
  //     key: "mario-idle",
  //     frames: [{ key: "mario", frame: 0 }],
  //   });
  //   this.anims.create({
  //     key: "mario-jump",
  //     frames: [{ key: "mario", frame: 5 }],
  //   });

  this.keys = this.input.keyboard.createCursorKeys();
}

function update() {
  if (this.mario.isDead) return;

  if (this.keys.left.isDown) {
    this.mario.setVelocityX(-160);
    this.mario.anims.play("mario-walk", true);
    this.mario.flipX = true;
  } else if (this.keys.right.isDown) {
    this.mario.setVelocityX(160);
    this.mario.anims.play("mario-walk", true);
    this.mario.flipX = false;
  } else {
    this.mario.setVelocityX(0);
    this.mario.anims.play("mario-idle", true);
  }

  if (this.keys.up.isDown && this.mario.body.touching.down) {
    this.mario.setVelocityY(-330);
    this.mario.anims.play("mario-jump", true);
  }

  if (this.mario.y >= config.height) {
    this.mario.isDead = true;
    this.mario.anims.play("mario-dead");
    this.mario.setCollideWorldBounds(false);
    this.sound.add("gameover", { volume: 0.2 }).play();

    // reseteo de la escena para volver a jugar
    setTimeout(() => {
      this.mario.setVelocityY(-350);
    }, 100);

    setTimeout(() => {
      this.scene.restart();
    }, 2000);
  }
}
