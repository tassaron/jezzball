/*
Ball class
*/
import { walls } from './wall.js';
import { fps_ratio, canvas, ctx, timer } from './game.js';
import { grid_size, gridsafe } from './grid.js';

export const balls = [];

export class Ball {
    static speed = 4;
    static radius = 12;
    static sq_radius = Math.pow(12, 2);
    static colours = [
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
    ];

    constructor(i, x, y) {
        this.i = i; // index in ball array
        this.x = x;
        this.y = y;
        this.dx = Ball.speed;
        this.dy = -Ball.speed;
        this.colour = Ball.colours[i];
        // left is 0, right is 1
    }

    collideWithBall(x, y) {
        return Ball.sq_radius > Math.pow(this.x - x, 2) + Math.pow(this.y - y, 2);
    }

    draw(x, y) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, Ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.closePath();
    }

    move(delta) {
        if (timer.ballPause > 0) {
            timer.ballPause--;
            return;
        }

        const calcPotentialX = () => this.x + (this.dx * fps_ratio(delta))
        const calcPotentialY = () => this.y + (this.dy * fps_ratio(delta))
        let potentialX = calcPotentialX();
        let potentialY = calcPotentialY();

        /* Bounce off canvas edges */
        let hit = false;
        if (
            potentialX > canvas.width - Ball.radius ||
            potentialX < Ball.radius
        ) {
            hit = true;
            this.dx = Ball.bounce(this.dx);
            potentialX = calcPotentialX();
        }
        if (
            potentialY < Ball.radius ||
            potentialY > canvas.height - Ball.radius
        ) {
            hit = true;
            this.dy = Ball.bounce(this.dy);
            potentialY = calcPotentialY();
        }

        this.x = potentialX;
        this.y = potentialY;

        if (!hit) {
            for (let ball of balls) {
                if (ball.i == this.i) { continue }
                if (this.collideWithBall(ball.x, ball.y)) {
                    hit = true;
                    if (Math.random() > 0.5) {
                        this.dx = Ball.bounce(this.dx);
                    } else {
                        this.dy = Ball.bounce(this.dy);
                    }
                }
            }
        }

        if (!hit) {
            hit = this.collideWithWalls(delta)
        } else {
            hit = -1;
        }
        return hit;
    }

    static bounce(speed) {
        /* Reverse ball direction and add some random angle */
        speed = -speed;
        if ((Ball.speed - (Math.abs(speed))) > 0.7) {
            if (speed < 0) {
                speed = -Ball.speed;
            } else {
                speed = Ball.speed;
            }
        }
        if (speed < 0) {
            speed += Math.random() / 4;
        } else {
            speed -= Math.random() / 4;
        }
        return speed;
    }

    /** Returns true if the hypothesized x-coord would intersect the given wall */
    intersectsX(x, wall) {
        let y = gridsafe(this.y - Ball.radius);
        return (
            x + Ball.radius > wall.x && x - Ball.radius < wall.x + wall.width &&
            wall.y + wall.height > y - Ball.radius && wall.y < y + Ball.radius &&
            x < canvas.width - Ball.radius && x > Ball.radius
        )
    }

    /** Returns true if the hypothesized y-coord would intersect the given wall */
    intersectsY(y, wall) {
        let x = gridsafe(this.x - Ball.radius);
        return (
            y + Ball.radius > wall.y && y - Ball.radius < wall.y + wall.height &&
            wall.x + wall.width > x - Ball.radius && wall.x < x + Ball.radius &&
            y > Ball.radius && y < canvas.height - Ball.radius
        )
    }

    collideWithWalls(delta) {
        let new_hit = false;
        let grid_aligned_boundary_coord;
        // Iterate over each wall
        // 0 is vertical, 1 is horizontal
        for (let i = 0; i < walls.length; i++) {
            if (walls[i].dir == 0) {
                // if wall is vertical
                if (this.dx < 0) {
                    // if ball is travelling left
                    grid_aligned_boundary_coord = gridsafe(this.x)
                } else {
                    // if ball is travelling right
                    grid_aligned_boundary_coord = gridsafe(this.x + Ball.radius)
                }
                // Ensure new X position does not continue to intersect the wall 
                if (this.intersectsX(grid_aligned_boundary_coord, walls[i])) {
                    new_hit = true;
                    if (this.intersectsX(grid_aligned_boundary_coord + Ball.bounce(this.dx) * fps_ratio(delta), walls[i])) {
                        this.x = this.dx > 0 ? grid_aligned_boundary_coord - grid_size : grid_aligned_boundary_coord + grid_size
                    }
                    this.dx = Ball.bounce(this.dx);
                }
            } else {
                // if wall is horizontal
                if (this.dy < 0) {
                    // if ball is travelling up
                    grid_aligned_boundary_coord = gridsafe(this.y)
                } else {
                    // if ball is travelling down
                    grid_aligned_boundary_coord = gridsafe(this.y + Ball.radius)
                }
                // Ensure new Y position does not continue to intersect the wall 
                if (this.intersectsY(grid_aligned_boundary_coord, walls[i])) {
                    new_hit = true;
                    if (this.intersectsY(grid_aligned_boundary_coord + Ball.bounce(this.dy) * fps_ratio(delta), walls[i])) {
                        this.y = this.dy > 0 ? grid_aligned_boundary_coord - grid_size : grid_aligned_boundary_coord + grid_size
                    }
                    this.dy = Ball.bounce(this.dy);
                }
            }

            // If a hit/collision occurred, return the index of the wall this ball collided with
            if (new_hit) {
                if (walls[i].building === null) {
                    // If this wall isn't a building yet, return its index to destroy it
                    return i;
                } else {
                    // If no hit/collision occurred, return -1
                    return -1;
                }
            }
        }
    }
}
