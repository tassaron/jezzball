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

    this.distanceFromBall = (x, y) => {
        return Math.sqrt(Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2));
    }

    this.draw = function (x, y) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, globalBall.radius, 0, Math.PI * 2);
        ctx.fillStyle = globalBall.colour;
        ctx.fill();
        ctx.closePath();
    };

    this.move = function (delta) {
        if (timer.ballPause > 0) {
            timer.ballPause--;
            return;
        }
        /* Bounce off canvas edges */
        if (
            this.x + this.dx > canvas.width - globalBall.radius ||
            this.x + this.dx < globalBall.radius
        ) {
            this.dx = this.bounce(this.dx);
        }
        if (
            this.y + this.dy < globalBall.radius ||
            this.y + this.dy > canvas.height - globalBall.radius
        ) {
            this.dy = this.bounce(this.dy);
        }

        for (let ball of balls) {
            if (ball.i == this.i) { continue }
            if (this.distanceFromBall(ball.x, ball.y) < globalBall.radius) {
                if (randomChoice([0, 1]) == 0) {
                    this.dx = this.bounce(this.dx);
                } else {
                    this.dy = this.bounce(this.dy);
                }
            }
        }

        this.x += this.dx * fps_ratio(delta);
        this.y += this.dy * fps_ratio(delta);
    }

    this.bounce = speed => {
        // reverse ball direction and add some random angle
        speed = -speed;
        if ((globalBall.speed - (speed * 1)) > 0.5) {
            if (speed < 0) {
                speed = globalBall.speed * -1;
            } else {
                speed = globalBall.speed;
            }
        }
        if (speed < 0) {
            speed += Math.random() / 4;
        } else {
            speed -= Math.random() / 4;
        }
        return speed;
    }

    this.collideWithWalls = function () {
        for (let i = 0; i < walls.length; i++) {
            if (walls[i].dir == 0) {
                if (
                    this.x + globalBall.radius > walls[i].x && this.x - globalBall.radius < walls[i].x + walls[i].width &&
                    walls[i].y + walls[i].height > this.y && walls[i].y < this.y + globalBall.radius
                ) {
                    this.dx = this.bounce(this.dx);
                }
            } else {
                if (
                    this.y + globalBall.radius > walls[i].y && this.y - globalBall.radius < walls[i].y + walls[i].height &&
                    walls[i].x + walls[i].width > this.x && walls[i].x < this.x + globalBall.radius
                ) {
                    this.dy = this.bounce(this.dy);
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
