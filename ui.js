/* Controls top layer canvas that draws UI and captures events */
import {
    score,
    lives,
    percent,
    gameOver,
    gamePaused,
    pauseGame,
    swapDirection,
    paddle,
    purple,
    timer,
    startGame,
} from "./game.js";
import { createWall } from "./wall.js";
import { px2grid, grid_size } from "./grid.js";

let gamediv = document.getElementById("game");
let uicanvas = document.createElement("canvas");
uicanvas.width = gamediv.offsetWidth;
uicanvas.height = gamediv.offsetHeight;
uicanvas.setAttribute("id", "ui-layer");
gamediv.appendChild(uicanvas);
let uictx = uicanvas.getContext("2d");
export let mouseX = 0;
export let mouseY = 0;
let prevLives = -1;
let prevScore = -1;
let prevPercent = -1;
let gameOverDrawn = false;
let livesColour = "#000";
const fontStyleSm = "0.9rem var(--arcade-font)";
const fontStyleLg = "2.1rem var(--arcade-font)";

export function addUIEventListeners() {
    /* Connect onclick events to HTML "buttons" */
    let pause_button = document.getElementById("pause_button");
    pause_button.addEventListener("click", pauseGame, false);
    let swap_button = document.getElementById("swap_button");
    swap_button.addEventListener("click", swapDirection, false);

    /* Connect keyboard/mouse/touch events to canvas */
    uicanvas.addEventListener("touchstart", touchStartHandler, {passive: false, capture: false});
    uicanvas.addEventListener("touchend", touchEndHandler, false);
    uicanvas.addEventListener("touchmove", touchMoveHandler, {passive: false, capture: false});
    uicanvas.addEventListener("mousedown", mouseDownHandler, false);
    uicanvas.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener(
        "contextmenu",
        function (e) {
            if (gamediv.contains(e.target)) {
                e.preventDefault();
            }
        },
        false
    );
    document.addEventListener("keyup", keyUpHandler, false);
}

/*
 * CONTROL HANDLERS
 */
function touchStartHandler(e) {
    touchMoveHandler(e);
    e.preventDefault();
}

function touchEndHandler(e) {
    if (gameOver == true && gamePaused == false) {
        startGame();
    } else {
        createWall();
    }
    e.preventDefault();
}

function touchMoveHandler(e) {
    // get relative (to canvas) coords of touch
    let touch = e.changedTouches[0];
    mouseX = touch.pageX - gamediv.offsetLeft;
    mouseY = touch.pageY - gamediv.offsetTop;
    if (mouseX > 0 && mouseX < uicanvas.width) {
        paddle.x = mouseX <= grid_size ? 0 : mouseX - paddle.width / 2;
    }
    if (mouseY > 0 && mouseY < uicanvas.height) {
        paddle.y = mouseY <= grid_size ? 0 : mouseY - paddle.height / 2;
    }
    e.preventDefault();
}

document.getScroll = function () {
    // https://stackoverflow.com/revisions/2481776/3
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        let sx,
            sy,
            d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
};

function mouseMoveHandler(e) {
    // Get relative (to canvas and scroll position) coords of mouse
    let scroll_position = document.getScroll();
    mouseX = e.clientX - gamediv.offsetLeft + scroll_position[0];
    mouseY = e.clientY - gamediv.offsetTop + scroll_position[1];
    // Move paddle
    if (mouseX > 0 && mouseX < uicanvas.width) {
        paddle.x = mouseX <= grid_size ? 0 : mouseX - paddle.width / 2;
    }
    if (mouseY > 0 && mouseY < uicanvas.height) {
        paddle.y = mouseY <= grid_size ? 0 : mouseY - paddle.height / 2;
    }
}

function mouseDownHandler(e) {
    if (e.button == 0) {
        if (gameOver == true && gamePaused == false) {
            startGame();
        } else {
            createWall();
        }
    } else if (e.button > 0) {
        swapDirection();
    }
}

function keyUpHandler(e) {
    if (e.keyCode == 39 || e.keyCode == 37) {
        paddle.direction = 1;
    } else if (e.keyCode == 38 || e.keyCode == 40) {
        paddle.direction = 0;
    } else if (e.keyCode == 32 && gameOver == true && gamePaused == false) {
        startGame();
    } else if (e.keyCode == 80) {
        pauseGame();
    }
    e.preventDefault();
}

/*
 *  DRAWING FUNCTIONS
 */

export function drawUI(force = false) {
    if (gameOver == true) {
        if (gameOverDrawn == false) {
            clearUI();
            drawGameOver();
            drawScore();
            gameOverDrawn = true;
        }
        return;
    }
    if (
        force ||
        timer.diedRecently > 0 ||
        prevPercent != percent ||
        prevScore != score ||
        prevLives != lives ||
        timer.active == true
    ) {
        clearUI();
        drawScore();
        drawLives();
        prevPercent = percent;
        prevScore = score;
        prevLives = lives;
    }
    if (timer.ballPause > 0) {
        drawCountdown();
    } else if (timer.ballPause == 0 && timer.active == true) {
        timer.active = false;
    }
}

export function clearUI() {
    gameOverDrawn = false;
    uictx.clearRect(0, 0, uicanvas.width, uicanvas.height);
}

function drawScore() {
    uictx.font = fontStyleSm;
    uictx.fillStyle = "#000";
    uictx.fillText(`${percent}% Cleared`, grid_size, grid_size * 2);
    const scoreText = `Score: ${score}`;
    uictx.fillText(
        scoreText,
        grid_size * (px2grid(uicanvas.width) / 2) - (uictx.measureText(scoreText).width / 2),
        uicanvas.height - grid_size
    );
}

function drawLives() {
    uictx.font = fontStyleSm;
    if (timer.diedRecently > 0) {
        if (timer.diedRecently % 15 == 0 && livesColour == "#000") {
            livesColour = "#ff0000";
        } else if (
            (timer.diedRecently % 15 == 0 && livesColour == "#ff0000") ||
            timer.diedRecently == 1
        ) {
            livesColour = "#000";
        }
        timer.diedRecently--;
    }
    uictx.fillStyle = livesColour;
    let livesText;
    if (lives == -1) {
        livesText = "0";
    } else {
        livesText = lives.toString();
    }
    livesText = `Lives: ${livesText}`;
    const textWidth = uictx.measureText(livesText).width;
    uictx.fillText(livesText, uicanvas.width - textWidth - grid_size, grid_size * 2);
}

function drawGameOver() {
    const gameOverText = "Game Over";
    const restartText = "tap or click to restart";
    uictx.font = fontStyleLg;
    uictx.fillStyle = "#33aaff";
    uictx.fillText(
        gameOverText,
        (uicanvas.width / 2) - (uictx.measureText(gameOverText).width / 2),
        uicanvas.height / 2 - (grid_size * 3)
    );
    uictx.font = fontStyleSm;
    uictx.fillText(
        restartText,
        uicanvas.width / 2 - (uictx.measureText(restartText).width / 2),
        uicanvas.height / 2 + (grid_size * 2)
    );
}

export function drawPauseScreen() {
    uictx.font = fontStyleLg;
    uictx.fillStyle = "#333";
    uictx.fillText("Paused", uicanvas.width / 2 - (uictx.measureText("Paused").width / 2), uicanvas.height / 2);
}

function drawCountdown() {
    let num = Math.floor(timer.ballPause / 60) + 1;
    uictx.font = fontStyleLg;
    uictx.fillStyle = purple;
    if (num % 2 == 0) {
        uictx.fillStyle = "black";
    }
    uictx.fillText("JEZZBALL", uicanvas.width / 2 - (uictx.measureText("JEZZBALL").width / 2), uicanvas.height / 2 - (grid_size * 7));
    uictx.fillText(num, uicanvas.width / 2 - (uictx.measureText(num).width / 2), uicanvas.height / 2 + grid_size);
}
