/*
Ball class
*/
globalBall = {
    speed: 4,
    radius: 12,
    sq_radius: Math.pow(15, 2),
    colours: [
        "purple",
        "blue",
        "green",
        "#f4a32e",
        "#ff4c00",
        "#9a0200",
        "#da482e",
        "#0a827c",
        "#043836",
        "black",
    ]
};

class Ball {
    constructor(i, x = canvas.width / 2, y = canvas.height - 64) {
        this.i = i; // index in ball array
        this.x = x;
        this.y = y;
        this.dx = globalBall.speed;
        this.dy = -globalBall.speed;
        this.colour = globalBall.colours[i];
        // left is 0, right is 1
    }

    collideWithBall(x, y) {
        return globalBall.sq_radius > Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2);
    }

    draw(x, y) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, globalBall.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }

    move(delta) {
        if (timer.ballPause > 0) {
            timer.ballPause--;
            return;
        }
        /* Bounce off canvas edges */
        let hit = false;
        if (
            this.x + (this.dx * fps_ratio(delta)) > canvas.width - globalBall.radius ||
            this.x + (this.dx * fps_ratio(delta)) < globalBall.radius
        ) {
            hit = true;
            this.dx = this.bounce(this.dx);
        }
        if (
            this.y + (this.dy * fps_ratio(delta)) < globalBall.radius ||
            this.y + (this.dy * fps_ratio(delta)) > canvas.height - globalBall.radius
        ) {
            hit = true;
            this.dy = this.bounce(this.dy);
        }

        for (let ball of balls) {
            if (ball.i == this.i) { continue }
            if (this.collideWithBall(ball.x, ball.y)) {
                if (Math.random() > 0.5) {
                    this.dx = this.bounce(this.dx);
                } else {
                    this.dy = this.bounce(this.dy);
                }
            }
        }

        this.x += this.dx * fps_ratio(delta);
        this.y += this.dy * fps_ratio(delta);
        return hit;
    }

    bounce(speed) {
        /* Reverse ball direction and add some random angle */
        speed = -speed;
        if ((globalBall.speed - (Math.abs(speed))) > 0.5) {
            if (speed < 0) {
                speed = -globalBall.speed;
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

    intersectsX(x, wall) {
        /* Returns true if the hypothesized x-coord would intersect a wall */
        let y = gridsafe(this.y - globalBall.radius);
        return (
            x + globalBall.radius > wall.x && x - globalBall.radius < wall.x + wall.width &&
            wall.y + wall.height > y - globalBall.radius && wall.y < y + globalBall.radius &&
            x < canvas.width - globalBall.radius && x > globalBall.radius
        )
    }

    intersectsY(y, wall) {
        /* Returns true if the hypothesized y-coord would intersect a wall */
        let x = gridsafe(this.x - globalBall.radius);
        return (
            y + globalBall.radius > wall.y && y - globalBall.radius < wall.y + wall.height &&
            wall.x + wall.width > x - globalBall.radius && wall.x < x + globalBall.radius &&
            y > globalBall.radius && y < canvas.height - globalBall.radius
        )
    }

    collideWithWalls(delta, hit = false) {
        let new_hit = false;
        let grid_aligned_boundary_coord;
        for (let i = 0; i < walls.length; i++) {
            if (walls[i].dir == 0) {
                if (this.dx < 0) {
                    grid_aligned_boundary_coord = gridsafe(this.x - globalBall.radius)
                } else {
                    grid_aligned_boundary_coord = gridsafe(this.x + globalBall.radius)
                }
                if (this.intersectsX(grid_aligned_boundary_coord + this.dx * fps_ratio(delta), walls[i])) {
                    if (!hit) {
                        new_hit = true;
                        if (this.intersectsX(grid_aligned_boundary_coord + this.bounce(this.dx) * fps_ratio(delta), walls[i])) {
                            this.x = this.dx > 0 ? grid_aligned_boundary_coord - grid_size : grid_aligned_boundary_coord + grid_size
                        }
                        this.dx = this.bounce(this.dx);
                    }
                }
            } else {
                if (this.dy < 0) {
                    grid_aligned_boundary_coord = gridsafe(this.y - globalBall.radius)
                } else {
                    grid_aligned_boundary_coord = gridsafe(this.y + globalBall.radius)
                }
                if (this.intersectsY(grid_aligned_boundary_coord + this.dy * fps_ratio(delta), walls[i])) {
                    if (!hit) {
                        new_hit = true;
                        if (this.intersectsY(grid_aligned_boundary_coord + this.bounce(this.dy) * fps_ratio(delta), walls[i])) {
                            this.y = this.dy > 0 ? grid_aligned_boundary_coord - grid_size : grid_aligned_boundary_coord + grid_size
                        }
                        this.dy = this.bounce(this.dy);
                    }
                }
            }
            if (new_hit) {
                if (walls[i].building === null) {
                    // If this wall isn't a building yet, return its index to destroy it
                    return i;
                } else {
                    return -1;
                }
            }
        }
    }
}
