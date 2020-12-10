/* Controls top layer canvas that draws UI and captures events */
import { score, lives, percent, gameOver, gamePaused, pauseGame, swapDirection, paddle, purple, timer, startGame } from './game.js';
import { createWall } from './wall.js';
import { px2grid, grid_size } from './grid.js';

let gamediv = document.getElementById("game");
let uicanvas = document.getElementById("ui-layer");
let uictx = uicanvas.getContext("2d");
export let mouseX = 0;
export let mouseY = 0;
let prevLives = -1;
let prevScore = -1;
let prevPercent = -1;
let gameOverDrawn = false;
let livesColour = "#000";

export function addUIEventListeners() {
    /* Connect onclick events to HTML "buttons" */
    let pause_button = document.getElementById("pause_button");
    pause_button.addEventListener('click', pauseGame, false);
    let swap_button = document.getElementById("swap_button");
    swap_button.addEventListener('click', swapDirection, false);

    /* Connect keyboard/mouse/touch events to canvas */
    uicanvas.addEventListener("touchstart", touchStartHandler, false);
    uicanvas.addEventListener("touchend", touchEndHandler, false);
    uicanvas.addEventListener("touchmove", touchMoveHandler, false);
    uicanvas.addEventListener("mousedown", mouseDownHandler, false);
    uicanvas.addEventListener("mousemove", mouseMoveHandler, false);
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, false);
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
        createWall()
    }
    e.preventDefault();
}

function touchMoveHandler(e) {
    // get relative (to canvas and scroll position) coords of touch
    let touch = e.changedTouches[0];
    let scroll_position = document.getScroll();
    mouseX = touch.pageX - gamediv.offsetLeft + scroll_position[0];
    mouseY = touch.pageY - gamediv.offsetTop + scroll_position[1];
    if (mouseX > 0 && mouseX < uicanvas.width) {
        paddle.x = mouseX <= grid_size ? 0 : mouseX - paddle.width / 2;
    }
    if (mouseY > 0 && mouseY < uicanvas.height) {
        paddle.y = mouseY <= grid_size ? 0 : mouseY - paddle.height / 2;
    };
    e.preventDefault();
}

document.getScroll = function () {
    // https://stackoverflow.com/revisions/2481776/3
    if (window.pageYOffset != undefined) {
        return [pageXOffset, pageYOffset];
    } else {
        let sx, sy, d = document,
            r = d.documentElement,
            b = d.body;
        sx = r.scrollLeft || b.scrollLeft || 0;
        sy = r.scrollTop || b.scrollTop || 0;
        return [sx, sy];
    }
}

function mouseMoveHandler(e) {
    // Get relative (to canvas and scroll position) coords of mouse
    let scroll_position = document.getScroll();
    mouseX = e.clientX - gamediv.offsetLeft + scroll_position[0];
    mouseY = e.clientY - gamediv.offsetTop + scroll_position[1];
    // Move paddle
    if (mouseX > 0 && mouseX < uicanvas.width) {
        paddle.x = mouseX <= grid_size ? 0 : mouseX - paddle.width / 2;
    };
    if (mouseY > 0 && mouseY < uicanvas.height) {
        paddle.y = mouseY <= grid_size ? 0 : mouseY - paddle.height / 2;
    };
}

function mouseDownHandler(e) {
    if (e.button == 0) {
        if (gameOver == true && gamePaused == false) {
            startGame();
        } else {
            createWall()
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
    e.preventDefault()
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
        return
    }
    if (force ||
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
    };
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
    uictx.font = "12pt Sans";
    uictx.fillStyle = "#000";
    uictx.fillText(`${percent}% Cleared`, grid_size, 20);
    uictx.fillText(`Score: ${score}`, grid_size * (px2grid(uicanvas.width) / 2) - 30, uicanvas.height - 10);
}

function drawLives() {
    uictx.font = "12pt Sans";
    if (timer.diedRecently > 0) {
        if (
            timer.diedRecently % 15 == 0 &&
            livesColour == "#000"
        ) {
            livesColour = "#ff0000";
        } else if (
            timer.diedRecently % 15 == 0 &&
            livesColour == "#ff0000" ||
            timer.diedRecently == 1) {
            livesColour = "#000";
        }
        timer.diedRecently--;
    }
    uictx.fillStyle = livesColour;
    if (lives == -1) {
        var livesText = "0";
    } else {
        var livesText = lives.toString();
    }
    uictx.fillText(`Lives: ${livesText}`, uicanvas.width - 72, 20);
}

function drawGameOver() {
    uictx.font = "36pt Sans";
    uictx.fillStyle = "#33aaff";
    uictx.fillText("Game Over", uicanvas.width / 2 - 132, uicanvas.height / 2 - 32);
    uictx.font = "12pt Sans";
    uictx.fillText("tap or click to restart", uicanvas.width / 2 - 86, uicanvas.height / 2 + 22);
    uictx.fillStyle = "black";
    uictx.fillText("(or play the large version", uicanvas.width / 2 - 102, uicanvas.height / 2 + 42);
    uictx.fillText("at <fun.tassaron.com/jezzball>)", uicanvas.width / 2 - 124, uicanvas.height / 2 + 62);
    //drawMuffin();
}

export function drawPauseScreen() {
    uictx.font = "36pt Sans";
    uictx.fillStyle = "#333";
    uictx.fillText("Paused", uicanvas.width / 2 - 90, uicanvas.height / 2);
}

function drawCountdown() {
    let num = Math.floor(timer.ballPause / 60) + 1;
    uictx.font = "32pt Sans";
    uictx.fillStyle = purple;
    if (num % 2 == 0) {
        uictx.fillStyle = "black";
    }
    uictx.fillText("JEZZBALL", uicanvas.width / 2 - 92, uicanvas.height / 2 - 64);
    uictx.fillStyle = purple;
    uictx.fillText(num, uicanvas.width / 2 - 8, uicanvas.height / 2 + 4);
}

function drawMuffin() {
    // this function was generated by canvg
    uictx.save();
    uictx.strokeStyle = "rgba(0,0,0,0)";
    uictx.miterLimit = 4;
    uictx.scale(0.31, 0.31);
    uictx.save();
    uictx.restore();
    uictx.save();
    uictx.translate(789.7776, 402.66194);
    uictx.save();
    let g = uictx.createLinearGradient(431.43823, 309.14993, 455.10641, 306.89993);
    g.addColorStop(0, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.25, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.5, "rgba(255, 77, 95, 1)");
    g.addColorStop(0.75, "rgba(255, 77, 95, 1)");
    g.addColorStop(1, "rgba(255, 92, 102, 1)");
    let canvas = document.createElement("canvas");
    canvas.width = 1044;
    canvas.height = 504;
    let uictx1 = canvas.getContext("2d");
    uictx1.fillStyle = g;
    uictx1.save();
    uictx1.strokeStyle = "rgba(0,0,0,0)";
    uictx1.miterLimit = 4;
    uictx1.beginPath();
    uictx1.moveTo(0, 0);
    uictx1.lineTo(1044, 0);
    uictx1.lineTo(1044, 504);
    uictx1.lineTo(0, 504);
    uictx1.closePath();
    uictx1.clip();
    uictx1.save();
    uictx1.translate(81, -208);
    uictx1.save();
    uictx1.beginPath();
    uictx1.moveTo(-10000, -10000);
    uictx1.lineTo(20000, -10000);
    uictx1.quadraticCurveTo(20000, -10000, 20000, -10000);
    uictx1.lineTo(20000, 20000);
    uictx1.quadraticCurveTo(20000, 20000, 20000, 20000);
    uictx1.lineTo(-10000, 20000);
    uictx1.quadraticCurveTo(-10000, 20000, -10000, 20000);
    uictx1.lineTo(-10000, -10000);
    uictx1.quadraticCurveTo(-10000, -10000, -10000, -10000);
    uictx1.closePath();
    uictx1.fill();
    uictx1.stroke();
    uictx1.restore();
    uictx1.restore();
    uictx1.restore();
    let p = uictx1.createPattern(uictx1.canvas, "no-repeat");
    uictx.fillStyle = p;
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.beginPath();
    uictx.moveTo(288.18821, 43.31544);
    uictx.lineTo(298.70770000000005, 169.54932);
    uictx.bezierCurveTo(411.67574, 184.59742, 478.46090000000004, 170.90475, 529.22173, 150.79719);
    uictx.bezierCurveTo(536.12483, 96.3052, 531.47084, -5.348219999999998, 524.19067, 28.679630000000003);
    uictx.closePath();
    uictx.fill("nonzero");
    uictx.stroke();
    uictx.restore();
    uictx.save();
    uictx.fillStyle = "#9e6432";
    uictx.fillStyle = "rgba(158, 100, 50, 1)";
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineCap = "round";
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.beginPath();
    uictx.moveTo(526.86343, -21.43929);
    uictx.bezierCurveTo(543.19005, -48.707570000000004, 513.40583, -69.40107, 465.71123, -78.02789);
    uictx.bezierCurveTo(190.31725999999998, -125.75193999999999, 231.11788, 108.26156999999999, 325.15244, 52.03463000000001);
    uictx.bezierCurveTo(343.09062, 64.98277, 368.36647, 66.92441000000001, 400.90815, 57.96730000000001);
    uictx.bezierCurveTo(416.24449, 65.65659000000001, 433.48974, 67.61916000000001, 452.47679, 64.35634);
    uictx.bezierCurveTo(474.88674, 65.60239, 496.49178, 63.830040000000004, 514.08535, 47.01467);
    uictx.bezierCurveTo(567.6820399999999, 42.80888, 556.14154, -3.9877599999999944, 526.86343, -21.439289999999993);
    uictx.closePath();
    uictx.fill();
    uictx.stroke();
    uictx.restore();
    uictx.save();
    uictx.fillStyle = "#f5ff22";
    uictx.fillStyle = "rgba(245, 255, 34, 1)";
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.beginPath();
    uictx.moveTo(244.37647, -143.28752);
    uictx.lineTo(274.00412, -24.177139999999994);
    uictx.lineTo(492.33707000000004, -53.38428999999999);
    uictx.lineTo(462.25362000000007, -169.30013);
    uictx.lineTo(421.23073000000005, -85.78594);
    uictx.lineTo(361.9754300000001, -161.54198);
    uictx.lineTo(329.6129200000001, -78.94055);
    uictx.closePath();
    uictx.fill();
    uictx.stroke();
    uictx.restore();
    uictx.restore();
    uictx.save();
    uictx.translate(789.7776, 402.66194);
    uictx.save();
    uictx.fillStyle = "rgba(0,0,0,0)";
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineCap = "round";
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.beginPath();
    uictx.moveTo(397.99094, 146.86723);
    uictx.bezierCurveTo(409.15273, 138.63389, 428.84109, 136.55501, 443.0638, 145.90707);
    uictx.fill();
    uictx.stroke();
    uictx.restore();
    uictx.save();
    uictx.fillStyle = "rgba(0, 0, 0, 1)";
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineCap = "round";
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.transform(0.84606142, 0, 0, 1, 123.64927, -204);
    uictx.beginPath();
    uictx.moveTo(274.711, 302.51621220000004);
    uictx.bezierCurveTo(279.59255366631373, 302.51621220000004, 283.5498348, 305.6820370890404, 283.5498348, 309.58728);
    uictx.bezierCurveTo(283.5498348, 313.4925229109596, 279.59255366631373, 316.6583478, 274.711, 316.6583478);
    uictx.bezierCurveTo(269.8294463336863, 316.6583478, 265.87216520000004, 313.4925229109596, 265.87216520000004, 309.58728);
    uictx.bezierCurveTo(265.87216520000004, 305.6820370890404, 269.8294463336863, 302.51621220000004, 274.711, 302.51621220000004);
    uictx.closePath();
    uictx.fill("nonzero");
    uictx.stroke();
    uictx.restore();
    uictx.save();
    uictx.fillStyle = "rgba(0, 0, 0, 1)";
    uictx.strokeStyle = "#000000";
    uictx.strokeStyle = "rgba(0, 0, 0, 1)";
    uictx.lineWidth = 7;
    uictx.lineCap = "round";
    uictx.lineJoin = "round";
    uictx.miterLimit = "4";
    uictx.transform(0.98343684, 0, 0, 1.0755093, 86.541108, -226.36949);
    uictx.beginPath();
    uictx.moveTo(394.91913, 297.5664491);
    uictx.bezierCurveTo(398.23858634729015, 297.5664491, 400.9295374, 299.9408177891661, 400.9295374, 302.86975);
    uictx.bezierCurveTo(400.9295374, 305.79868221083393, 398.23858634729015, 308.1730509, 394.91913, 308.1730509);
    uictx.bezierCurveTo(391.59967365270984, 308.1730509, 388.9087226, 305.79868221083393, 388.9087226, 302.86975);
    uictx.bezierCurveTo(388.9087226, 299.9408177891661, 391.59967365270984, 297.5664491, 394.91913, 297.5664491);
    uictx.closePath();
    uictx.fill("nonzero");
    uictx.stroke();
    uictx.restore();
    uictx.restore();
    uictx.restore();
    uictx.moveTo(80000, 80000)
}
