/*
Game Loop
*/
"use strict";
let canvas = document.getElementById("game-layer");
let ctx = canvas.getContext("2d", { alpha: false });
let purple = "#993f70";
let score = 0;
let percent = 0;
let lives = 3;
let livesColour = "#000";
let gameOver = false;
let gamePaused = false;
let bricks = [];
let paddle;
const balls = [];
let grid;
let then = Date.now()
const fps_ratio = ms => { return Math.min(ms / (1000 / 60), 2) }

// Timer for pausing the ball during countdowns
// and giving invincibility frames after a death
let timer = {
    active: false,
    ballPause: 0,
    diedRecently: 0,
    dying: 0
};

function resetWalls() {
    while (walls.length > 0) {
        walls.pop();
    }
}

function resetBall() {
    // remove all balls but the first two, and replace them to center of screen
    while (balls.length > 2) {
        balls.pop();
    }
    timer.ballPause = 180;
    timer.active = true;
    timer.dying = 0;
};

let level = {
    ballCount: 2,
};

function initGame() {
    /* Create global objects defined in other js files */
    paddle = new Paddle();
    grid = new Grid()
    balls[0] = new Ball(0);
    balls[1] = new Ball(1);
    swapDirection();

    /* Add event listeners */
    addUIEventListeners();

    startGame();
}

function startGame() {
    /* Starts a new game */
    balls[0].x = canvas.width / 2;
    balls[0].y = canvas.height - 96;
    balls[0].dy = -globalBall.speed;
    balls[0].dx = -globalBall.speed;
    balls[1].dy = globalBall.speed;
    balls[1].dx = globalBall.speed;
    level.ballCount = 2;
    percent = 0;
    score = 0;
    lives = 3;
    gameOver = false;
    grid.clear()
    resetWalls();
    resetBall();
    /* Start game loop by drawing the first frame */
    draw();
}

/*
*  MAIN GAME LOOP
*/

function draw() {
    let now = Date.now()
    let delta = now - then;

    /* Clear the game-layer canvas on every frame & abort early if game is paused */
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gamePaused == true) {
        drawPauseScreen();
        requestAnimationFrame(draw);
        return;
    }

    /* Expand walls, turn them into buildings, & flood_fill the grid if building is created */
    for (let wall of walls.filter(wall => { if (wall.building === null) { return wall } })) {
        wall.expand(delta);
    }

    /* Move and collide balls & delete expanding walls that intersect balls */
    for (let i_ = 0; i_ < balls.length; i_++) {
        let hit = balls[i_].move(delta);
        let collision = balls[i_].collideWithWalls(delta, hit);
        if (collision > -1) {
            if (timer.dying == 0) {
                timer.dying = 30;
                if (lives > 0) {
                    timer.diedRecently = 90;
                }
                lives--;
            }
            walls.splice(collision, 1);
        }
    }
    /* If the player is dying, tick down the timer that will cause a gameOver soon */
    if (timer.dying > 0) {
        timer.dying--;
        if (timer.dying == 0) {
            if (lives < 0) {
                gameOver = true;
            }
        }
    }

    if (gameOver == false) {
        for (let i = 0; i < walls.length; i++) {
            walls[i].draw();
        }
        for (let i = 0; i < balls.length; i++) {
            balls[i].draw();
        }
        paddle.draw();
    }
    drawUI();
    requestAnimationFrame(draw);
    then = Date.now();
}

function swapDirection() {
    if (paddle.direction == 0) { paddle.direction = 1 } else { paddle.direction = 0 };
}

function pauseGame() {
    if (gamePaused == true) {
        gamePaused = false;
        clearUI();
        drawUI(true);
    } else {
        gamePaused = true;
    }
}

function updateScore() {
    percent = Math.round(grid.percentFilled());
    if (percent > 75) {
        score += percent - 75
        nextLevel();
    }
}

function nextLevel() {
    score += 5;
    percent = 0;
    level.ballCount += 1;
    resetBall()
    resetWalls();
    grid.clear();
    for (let i = 2; i < level.ballCount; i++) {
        balls[balls.length] = new Ball(balls.length);
        balls[balls.length - 1].x = canvas.width * (Math.min(0.8, Math.random()) + 0.1);
        balls[balls.length - 1].y = canvas.height * (Math.min(0.8, Math.random()) + 0.1);
        if (Math.random() > 0.5) {
            balls[balls.length - 1].dx = -globalBall.speed;
        } else {
            balls[balls.length - 1].dx = globalBall.speed;
        }
        if (Math.random() > 0.5) {
            balls[balls.length - 1].dy = -globalBall.speed;
        } else {
            balls[balls.length - 1].dy = globalBall.speed;
        }
    }
}
