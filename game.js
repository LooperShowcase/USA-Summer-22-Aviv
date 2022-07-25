kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  clearColor: [0, 0, 1, 0.7],

  // (0,0,0) is black using RGB structure from 0-255
});

loadRoot("./sprites/");
loadSprite("mario", "mario.png");
loadSprite("block", "block.png");
loadSprite("unboxed", "unboxed.png");
loadSprite("coin", "coin.png");
loadSprite("goomba", "evil_mushroom.png");
loadSprite("surprise", "surprise.png");
loadSprite("pipe", "pipe_up.png");
loadSprite("mushroom", "mushroom.png");
loadSprite("castle", "castle.png");
loadSound("gameSound", "gameSound.mp3");
loadSound("jumpSound", "jumpSound.mp3");
// Loading the various sprites/animations from the sprites folder

////////////////////////////////////////
scene("lose", () => {
  add([
    text("GAME OVER\n press r to restart", 32),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
  keyPress("r", () => {
    go("game");
  });
});

scene("win", (score) => {
  add([
    text(
      "Good Game, You Won\n\nScore: " + score + "\n\npress r to restart",
      32
    ),
    pos(width() / 2, height() / 2),
    origin("center"),
  ]);
  keyPress("r", () => {
    go("game");
  });
});

scene("start", () => {
  add([
    text("Welcome to the game", 32),
    pos(width() / 2, height() / 2 - 25),
    origin("center"),
  ]);
  const button = add([
    rect(150, 50),
    pos(width() / 2, height() / 2 + 50),
    origin("center"),
  ]);

  add([
    text("start", 28),
    pos(width() / 2, height() / 2 + 50),
    origin("center"),
    color(0, 0, 0),
  ]);
  button.action(() => {
    if (button.isHovered()) {
      button.color = rgb(0.5, 0.5, 0.5);
      if (mouseIsClicked()) {
        go("game");
      }
    } else {
      button.color = rgb(1, 1, 1);
    }
  });
});
scene("game", () => {
  layers(["bg", "obj", "ui"], "obj");
  const map = [
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "                                        ",
    "       ^^                               ",
    "              $                         ",
    "                                        ",
    "           ==     ?   =                 ",
    "          =  =       = =                ",
    "         =    =     =   =           @   ",
    "        =      =   =     =              ",
    "       =        = =       ^^^           ",
    "      =          =                      ",
    "========================================",
  ];

  const moveSpeed = 88;
  const jumpForce = 400;
  let isJumping = false;
  let isBig = true;

  play("gameSound");
  const mapSymbols = {
    width: 20,
    height: 20,

    "=": [sprite("block"), solid()],
    $: [sprite("surprise"), solid(), "surprise-coin"],
    "?": [sprite("surprise"), solid(), "surprise-mushroom"],
    c: [sprite("coin"), "coin"],
    v: [sprite("unboxed"), solid(), "unboxed"],
    m: [sprite("mushroom"), solid(), "mushroom", body()],
    "^": [sprite("goomba"), "goomba", body(), solid()],
    "@": [sprite("castle"), "castle"],
  };

  const gameLevel = addLevel(map, mapSymbols);

  const player = add([
    sprite("mario"),
    solid(),
    pos(30, 0),
    body(),
    origin("bot"),
    big(jumpForce),
  ]);

  let score = 0;
  const scoreLabel = add([
    text("score: " + score),
    pos(player.pos.x, player.pos.y + 20),
    layer("ui"),
    {
      value: score,
    },
  ]);

  keyDown("right", () => {
    player.move(moveSpeed, 0);
  });

  keyDown("left", () => {
    player.move(-moveSpeed, 0);
  });

  keyDown("d", () => {
    player.move(moveSpeed, 0);
  });

  keyDown("a", () => {
    player.move(-moveSpeed, 0);
  });

  keyDown("up", () => {
    if (player.grounded()) {
      player.jump(jumpForce);
      play("jumpSound");
      isJumping = true;
    }
  });

  keyDown("w", () => {
    if (player.grounded()) {
      player.jump(jumpForce);
      play("jumpSound");
    }
  });

  player.on("headbump", (obj) => {
    if (obj.is("surprise-coin")) {
      gameLevel.spawn("c", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("v", obj.gridPos.sub(0, 0));
    }

    if (obj.is("surprise-mushroom")) {
      gameLevel.spawn("m", obj.gridPos.sub(0, 1));
      destroy(obj);
      gameLevel.spawn("v", obj.gridPos.sub(0, 0));
    }
  });

  player.collides("coin", (obj) => {
    destroy(obj);
    scoreLabel.value += 100;
    scoreLabel.text = "Score: " + scoreLabel.value;
  });

  player.collides("mushroom", (obj) => {
    destroy(obj);
    player.biggify(10);
  });

  action("mushroom", (x) => {
    x.move(20, 0);
  });

  action("goomba", (x) => {
    x.move(-20, 0);
  });

  player.collides("goomba", (obj) => {
    if (isJumping) {
      destroy(obj);
    } else {
      if (isBig) {
        destroy(obj);
        player.smallify();
      } else {
        destroy(player);
        go("lose");
      }
    }
  });

  player.action(() => {
    camPos(player.pos);
    if (player.grounded()) {
      isJumping = false;
    } else {
      isJumping = true;
    }
    if (player.pos.x > 759.568) {
      go("win", scoreLabel.value);
    }
  });
});

start("start");
