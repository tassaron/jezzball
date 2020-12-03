/*
Game Loop
*/
"use strict";
let canvas = document.getElementById("game-layer");
let ctx = canvas.getContext("2d", { alpha: false });
let purple = "#993f70";
let score = 0;
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

function resetBall() {
    // change ball colour
    let prevBallColour = globalBall.colour;
    while (globalBall.colour == prevBallColour) {
        globalBall.colour = randomChoice([
            "#043836",
            "#fa482e",
            "#0a827c",
            "#f4a32e",
        ]);
    }

    // remove all balls but the first two, and replace them to center of screen
    while (balls.length > 2) {
        balls.pop();
    }
    timer.ballPause = 90;
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
    swapDirection();
    balls[0] = new Ball(0);
    balls[1] = new Ball(1);
    balls[0].x = canvas.width / 2;
    balls[0].y = canvas.height - 96;
    balls[0].dy = -globalBall.speed;
    balls[0].dx = -globalBall.speed;
    balls[1].dy = globalBall.speed;
    balls[1].dx = globalBall.speed;

    /* Add event listeners */
    addUIEventListeners();

    /* Start loop and draw first frame */
    score = 0;
    lives = 3;
    gameOver = false;
    resetBall();
    draw();
}

function randomChoice(arr) {
    return arr[Math.floor(arr.length * Math.random())];
}

/*
*  MAIN GAME LOOP
*/

function draw() {
    let now = Date.now()
    let delta = now - then;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (gamePaused == true) {
        drawPauseScreen();
        requestAnimationFrame(draw);
        return;
    }
    let wall;
    for (wall of walls.filter(wall => { if (wall.building === null) { return wall } })) {
        wall.expand(delta);
    }
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
    } else {
        gamePaused = true;
    }
}

function nextLevel() {
    score = 0;
    level.ballCount += 1;
    resetBall()
    while (walls.length > 0) {
        walls.pop();
    }
    grid.clear();
    for (let i = 2; i < level.ballCount; i++) {
        balls[balls.length] = new Ball(balls.length);
        balls[balls.length - 1].x = canvas.width * Math.random();
        balls[balls.length - 1].y = canvas.height * Math.random();
        let ch = randomChoice([0, 1]);
        if (ch == 0) {
            balls[balls.length - 1].dx = -globalBall.speed;
        } else {
            balls[balls.length - 1].dx = globalBall.speed;
        }
        ch = randomChoice([0, 1]);
        if (ch == 0) {
            balls[balls.length - 1].dy = -globalBall.speed;
        } else {
            balls[balls.length - 1].dy = globalBall.speed;
        }
    }
}
