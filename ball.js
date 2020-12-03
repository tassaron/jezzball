/*
Ball class
*/
globalBall = {
    speed: 4,
    radius: 12,
    colour: "#000"
};

function Ball(i, x = canvas.width / 2, y = canvas.height - 64) {
    this.i = i; // index in ball array
    this.x = x;
    this.y = y;
    this.dx = globalBall.speed;
    this.dy = -globalBall.speed;
    // left is 0, right is 1

    this.draw = function (x, y) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, globalBall.radius, 0, Math.PI * 2);
        ctx.fillStyle = globalBall.colour;
        ctx.fill();
        ctx.closePath();
    };

    this.move = function () {
        if (timer.ballPause > 0) {
            timer.ballPause--;
            return;
        }
        this.x += this.dx;
        this.y += this.dy;

        if ( // ball collides with horizontal walls
            this.x + this.dx > canvas.width - globalBall.radius ||
            this.x + this.dx < globalBall.radius
        ) {
            // reverse ball direction and add some random angle
            this.dx = -this.dx
            /*while (this.x + this.dx > canvas.width - globalBall.radius ||
                this.x + this.dx < globalBall.radius) {
                this.x += this.dx
            }
            if ((globalBall.speed - (this.dx * 1)) > 0.5) {
                if (this.dx < 0) {
                    this.dx = globalBall.speed * -1;
                } else {
                    this.dx = globalBall.speed;
                }
            }
            if (this.dx < 0) {
                this.dx += Math.random() / 4;
            } else {
                this.dx -= Math.random() / 4;
            }*/
        }
        if (
            this.y + this.dy < globalBall.radius ||
            this.y + this.dy > canvas.height - globalBall.radius
        ) {
            // reverse ball direction and add some random angle
            this.dy = -this.dy
            /*while (this.y + this.dy < globalBall.radius ||
                this.y + this.dy > canvas.height - globalBall.radius) {
                this.y += this.dy
            }
            if ((globalBall.speed - (this.dy * 1)) > 0.5) {
                if (this.dy < 0) {
                    this.dy = globalBall.speed * -1;
                } else {
                    this.dy = globalBall.speed;
                }
            }
            if (this.dy < 0) {
                this.dy += Math.random() / 4;
            } else {
                this.dy -= Math.random() / 4;
            }*/
        };
    }

    this.collideWithWalls = function () {
        for (let i = 0; i < walls.length; i++) {
            if (walls[i].dir == 0) {
                if (
                    this.x + globalBall.radius > walls[i].x && this.x - globalBall.radius < walls[i].x + walls[i].width &&
                    walls[i].y + walls[i].height > this.y && walls[i].y < this.y + globalBall.radius
                ) {
                    this.dx = -this.dx;
                }
            } else {
                if (
                    this.y + globalBall.radius > walls[i].y && this.y - globalBall.radius < walls[i].y + walls[i].height &&
                    walls[i].x + walls[i].width > this.x && walls[i].x < this.x + globalBall.radius
                ) {
                    this.dy = -this.dy;
                }
            }
            if (
                this.x + globalBall.radius > walls[i].x && this.x - globalBall.radius < walls[i].x + walls[i].width &&
                this.y + globalBall.radius > walls[i].y && this.y - globalBall.radius < walls[i].y + walls[i].height
            ) {
                if (walls[i].building === null) {
                    return i;
                } else {
                    return -1;
                }
            }
        }
    }
}
