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



// generando el honho
  this.load.image(
  'supermushroom',
  "assets/collectibles/super-mushroom.png"
)


  //spritesheet
  initSpritesheet(this);
  // Audios
  initAudio(this);
}

function create() {
  createAnimations(this);
  // image(x, y, id-del-asset)
  this.add
    .image(100, 50, "cloud1")
    .setOrigin(0, 0) // indicar donde debe estar la iamgen.
    .setScale(0.15); // tamaño del sprite.

  //Suelo del Juego agregando  agrupacion
  this.floor = this.physics.add.staticGroup();

  // creacion de suelo
  this.floor
    .create(0, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();

  this.floor
    .create(170, config.height - 16, "floorbricks")
    .setOrigin(0, 0.5)
    .refreshBody();


  // agreagando mario al juego 
  this.mario = this.physics.add
    .sprite(50, 100, "mario")
    .setOrigin(0, 1)
    .setCollideWorldBounds(true)
    .setGravityY(300);

  // agreagando goomba enemigo al juego
  this.enemy = this.physics.add
    .sprite(100, config.height - 30, "goomba")
    .setOrigin(0, 1)
    .setGravityY(300)
    .setVelocity(-20);
    
  

  
    // caminar de enemigo
  this.enemy.anims.play("goomba-walk", true); 
  
  // agreagando moneda al juego 
  this.collectibes = this.physics.add.staticGroup()
  this.collectibes.create(150, 150, 'coin').anims.play("coin-spin", true);
  this.collectibes.create(250, 150, 'coin').anims.play("coin-spin", true);
  this.collectibes.create(180, 150, 'coin').anims.play("coin-spin", true);

  //generando seta en el juego
  this.collectibes.create(200, config.height -40, 'supermushroom')
  .anims.play("supermushroom-idle", true)
  
 // agreagando interracion de la moneda y mario
 this.physics.add.overlap(this.mario, this.collectibes, collectItem, null, this) 
 
      

  //Largo del mundo y altura. (2000, -- config.height)
  this.physics.world.setBounds(0, 0, 2000, config.height);
  //fisicas del mundo de mario para que no caiga
  this.physics.add.collider(this.mario, this.floor);
  // Fisicas del enemigo goomba para que no caiga
  this.physics.add.collider(this.enemy, this.floor);

  // agreagando colision entre mario y el goomba y el mecanismo logico para cuando alla una colision procesa true o false.
  // this tambien ya que es el contexto del juego para que haga el sonido y detecte la colision ya que this es un entorno global para el juego.
  this.physics.add.collider(this.mario, this.enemy, onHitEnemy, null, this);

  //Limite de la camara, (Mimsa configuracion ue el limite del mundo)
  this.cameras.main.setBounds(0, 0, 2000, config.height);
  // camara principal que sigue a mario
  this.cameras.main.startFollow(this.mario);

 

  this.keys = this.input.keyboard.createCursorKeys();
}

//logica de la moneda para que desaparesca  al ser recogida
function collectItem(mario, item) {
  const {texture: {key }} = item
  item.destroy()


  if(key === 'coin'){
    playAudio("coin-pickup", this, { volume: 0.2 });
    addToScore(100, item, this);

  }else if(key === 'supermushroom') {
    this.physics.world.pause();
    this.anims.pauseAll();


    
    playAudio("powerup", this, { volume: 0.2 });
    // ejecucuion de animacion (parpadeo) de mario al recoger hongo
    let i = 0
     const interval = setInterval(() => {
      i++;
       mario.anims.play(i % 2 == 0
        ? "mario-grown-idle"
        : "mario-idle",
       );
    }, 100);

    
    mario.isBlocked = true;
    mario.isGrown = true;

    setTimeout(() => {
      mario.setDisplaySize(18, 32);
      mario.body.setSize(18, 32);

      this.anims.resumeAll();
      mario.isBlocked = false;
      clearInterval(interval);
      this.physics.world.resume();
    }, 1000);
 
  }

}
 
function addToScore(scoreToAdd, origin, game) {
   // mostrar texto de moneda recolectada y su logica de animacion para que funcione
 const scoreText =  game.add.text(
  origin.x,
  origin.y,
  scoreToAdd,
  {
    fontFamily: 'pixel',
    fontSize: config.width / 30
  }
)
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
      }
    })
    scoreText.destroy();
  }
})
}



//logica de muerte de mario al chocar al enemy y saltar por arriba del goomba para que este muera
function onHitEnemy(mario, enemy) {
  if (mario.body.touching.down && enemy.body.touching.up) {
    enemy.anims.play("goomba-hit", true);
    enemy.setVelocityX(0);
    //Salto del mario al matar al goomba
    mario.setVelocityY(-200);
    // sonido de muerte de goomba
    playAudio("goomba-stomp", this);
    // puntaje al matar enemigo
    addToScore(200, enemy, this);
    // tiempo que toma el goomba en desaparecer
    setTimeout(() => {
      enemy.destroy();
    }, 300);
  } else {
    // muerte de mario
    killMario(this);
  }
}

function update() {
  const { mario } = this;

  checkControls(this);

  // check si murio mario

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

  // mario al morir pornun enemigo se cae
  mario.body.checkCollision.none = true;
  // deja morir a mario en linea recta
  mario.setVelocityX(0);

  setTimeout(() => {
    mario.setVelocityY(-250);
  }, 100);

  setTimeout(() => {
    scene.restart();
  }, 2000);
}
