/* Controls top layer canvas that draws UI and captures events */
let gamediv = document.getElementById("game");
let uicanvas = document.getElementById("ui-layer");
let uictx = uicanvas.getContext("2d");
let mouseX = 0;
let mouseY = 0;
let prevLives = -1;
let prevScore = -1;
let prevPercent = -1;

function addUIEventListeners() {
    uicanvas.addEventListener("touchstart", touchStartHandler, false);
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
    if (gameOver == true && gamePaused == false) {
        startGame();
    } else {
        createWall()
    }
    e.preventDefault();
}

function touchMoveHandler(e) {
    // get relative (to canvas) coords of touch
    touch = e.changedTouches[0];
    let mouseX = touch.pageX - canvas.offsetLeft;
    let mouseY = touch.pageY - canvas.offsetTop;
    if (mouseX > 0 && mouseX < canvas.width) {
        paddle.x = mouseX - paddle.width / 2;
    }
    if (mouseY > 0 && mouseY < canvas.height) {
        paddle.y = mouseY - paddle.height / 2;
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
    scroll_position = document.getScroll();
    mouseX = e.clientX - gamediv.offsetLeft + scroll_position[0];
    mouseY = e.clientY - gamediv.offsetTop + scroll_position[1];
    // Move paddle
    if (mouseX > 0 && mouseX < canvas.width) {
        paddle.x = mouseX - paddle.width / 2;
    };
    if (mouseY > 0 && mouseY < canvas.height) {
        paddle.y = mouseY - paddle.height / 2;
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

function drawUI(force = false) {
    if (gameOver == true) {
        clearUI();
        drawGameOver();
        drawScore();
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

function clearUI() {
    uictx.clearRect(0, 0, uicanvas.width, uicanvas.height);
}

function drawScore() {
    uictx.font = "16pt Verdana";
    uictx.fillStyle = "#000";
    uictx.fillText(`${percent}% Cleared`, grid_size, 20);
    uictx.fillText(`Score: ${score}`, grid_size * (px2grid(canvas.width) / 2) - 48, 20);
}

function drawLives() {
    uictx.font = "16pt Verdana";
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
    uictx.fillText(`Lives: ${livesText}`, canvas.width - 96, 20);
}

function drawGameOver() {
    uictx.font = "36pt Verdana";
    uictx.fillStyle = "#ff0000";
    uictx.fillText("Game Over", canvas.width / 2 - 132, canvas.height / 2 - 32);
    uictx.font = "16pt Verdana";
    uictx.fillText("tap or click to restart", canvas.width / 2 - 92, canvas.height / 2 + 22);
    drawMuffin();
}

function drawPauseScreen() {
    uictx.font = "36pt Verdana";
    uictx.fillStyle = "#333";
    uictx.fillText("Paused", canvas.width / 2 - 90, canvas.height / 2);
}

function drawCountdown() {
    num = Math.floor(timer.ballPause / 30) + 1;
    uictx.font = "36pt Verdana";
    uictx.fillStyle = purple;
    uictx.fillText(num, canvas.width / 2 - 4, canvas.height / 2 + 8);
}

function drawMuffin() {
    // this function was generated by canvg
    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.miterLimit = 4;
    ctx.scale(0.26666666666666666, 0.26666666666666666);
    ctx.save();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776, 402.66194);
    ctx.save();
    let g = ctx.createLinearGradient(431.43823, 309.14993, 455.10641, 306.89993);
    g.addColorStop(0, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.25, "rgba(255, 92, 102, 1)");
    g.addColorStop(0.5, "rgba(255, 77, 95, 1)");
    g.addColorStop(0.75, "rgba(255, 77, 95, 1)");
    g.addColorStop(1, "rgba(255, 92, 102, 1)");
    let canvas = document.createElement("canvas");
    canvas.width = 1044;
    canvas.height = 504;
    let ctx1 = canvas.getContext("2d");
    ctx1.fillStyle = g;
    ctx1.save();
    ctx1.strokeStyle = "rgba(0,0,0,0)";
    ctx1.miterLimit = 4;
    ctx1.beginPath();
    ctx1.moveTo(0, 0);
    ctx1.lineTo(1044, 0);
    ctx1.lineTo(1044, 504);
    ctx1.lineTo(0, 504);
    ctx1.closePath();
    ctx1.clip();
    ctx1.save();
    ctx1.translate(81, -208);
    ctx1.save();
    ctx1.beginPath();
    ctx1.moveTo(-10000, -10000);
    ctx1.lineTo(20000, -10000);
    ctx1.quadraticCurveTo(20000, -10000, 20000, -10000);
    ctx1.lineTo(20000, 20000);
    ctx1.quadraticCurveTo(20000, 20000, 20000, 20000);
    ctx1.lineTo(-10000, 20000);
    ctx1.quadraticCurveTo(-10000, 20000, -10000, 20000);
    ctx1.lineTo(-10000, -10000);
    ctx1.quadraticCurveTo(-10000, -10000, -10000, -10000);
    ctx1.closePath();
    ctx1.fill();
    ctx1.stroke();
    ctx1.restore();
    ctx1.restore();
    ctx1.restore();
    let p = ctx1.createPattern(ctx1.canvas, "no-repeat");
    ctx.fillStyle = p;
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(288.18821, 43.31544);
    ctx.lineTo(298.70770000000005, 169.54932);
    ctx.bezierCurveTo(411.67574, 184.59742, 478.46090000000004, 170.90475, 529.22173, 150.79719);
    ctx.bezierCurveTo(536.12483, 96.3052, 531.47084, -5.348219999999998, 524.19067, 28.679630000000003);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#9e6432";
    ctx.fillStyle = "rgba(158, 100, 50, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(526.86343, -21.43929);
    ctx.bezierCurveTo(543.19005, -48.707570000000004, 513.40583, -69.40107, 465.71123, -78.02789);
    ctx.bezierCurveTo(190.31725999999998, -125.75193999999999, 231.11788, 108.26156999999999, 325.15244, 52.03463000000001);
    ctx.bezierCurveTo(343.09062, 64.98277, 368.36647, 66.92441000000001, 400.90815, 57.96730000000001);
    ctx.bezierCurveTo(416.24449, 65.65659000000001, 433.48974, 67.61916000000001, 452.47679, 64.35634);
    ctx.bezierCurveTo(474.88674, 65.60239, 496.49178, 63.830040000000004, 514.08535, 47.01467);
    ctx.bezierCurveTo(567.6820399999999, 42.80888, 556.14154, -3.9877599999999944, 526.86343, -21.439289999999993);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "#f5ff22";
    ctx.fillStyle = "rgba(245, 255, 34, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(244.37647, -143.28752);
    ctx.lineTo(274.00412, -24.177139999999994);
    ctx.lineTo(492.33707000000004, -53.38428999999999);
    ctx.lineTo(462.25362000000007, -169.30013);
    ctx.lineTo(421.23073000000005, -85.78594);
    ctx.lineTo(361.9754300000001, -161.54198);
    ctx.lineTo(329.6129200000001, -78.94055);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.save();
    ctx.translate(789.7776, 402.66194);
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.beginPath();
    ctx.moveTo(397.99094, 146.86723);
    ctx.bezierCurveTo(409.15273, 138.63389, 428.84109, 136.55501, 443.0638, 145.90707);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.transform(0.84606142, 0, 0, 1, 123.64927, -204);
    ctx.beginPath();
    ctx.moveTo(274.711, 302.51621220000004);
    ctx.bezierCurveTo(279.59255366631373, 302.51621220000004, 283.5498348, 305.6820370890404, 283.5498348, 309.58728);
    ctx.bezierCurveTo(283.5498348, 313.4925229109596, 279.59255366631373, 316.6583478, 274.711, 316.6583478);
    ctx.bezierCurveTo(269.8294463336863, 316.6583478, 265.87216520000004, 313.4925229109596, 265.87216520000004, 309.58728);
    ctx.bezierCurveTo(265.87216520000004, 305.6820370890404, 269.8294463336863, 302.51621220000004, 274.711, 302.51621220000004);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.strokeStyle = "#000000";
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.miterLimit = "4";
    ctx.transform(0.98343684, 0, 0, 1.0755093, 86.541108, -226.36949);
    ctx.beginPath();
    ctx.moveTo(394.91913, 297.5664491);
    ctx.bezierCurveTo(398.23858634729015, 297.5664491, 400.9295374, 299.9408177891661, 400.9295374, 302.86975);
    ctx.bezierCurveTo(400.9295374, 305.79868221083393, 398.23858634729015, 308.1730509, 394.91913, 308.1730509);
    ctx.bezierCurveTo(391.59967365270984, 308.1730509, 388.9087226, 305.79868221083393, 388.9087226, 302.86975);
    ctx.bezierCurveTo(388.9087226, 299.9408177891661, 391.59967365270984, 297.5664491, 394.91913, 297.5664491);
    ctx.closePath();
    ctx.fill("nonzero");
    ctx.stroke();
    ctx.restore();
    ctx.restore();
    ctx.restore();
    ctx.moveTo(80000, 80000)
}
