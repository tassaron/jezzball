/* Wall class
 * A wall is created at the position of the paddle, with a direction (0 = vert; 1 = hori)
 * It expands in that direction until hitting the canvas bondaries or a ball
 * Hitting a canvas boundary creates a Building; hitting a ball loses a life
 */
import { Building } from './building.js';
import { fps_ratio, gameOver, gamePaused, timer, paddle, canvas, ctx, grid } from './game.js';
import { grid_size, px2grid, gridsafe } from './grid.js';
export const walls = [];


export function createWall() {
    if (
        gameOver === false && gamePaused === false &&
        Wall.count == 0 && timer.active === false
    ) {
        walls.push(new Wall());
    }
}


export class Wall {
    static count = 0;

    static remove(i) {
        walls.splice(i, 1);
        Wall.count -= 1;
    }

    constructor() {
        Wall.count += 1;
        this._x = gridsafe(paddle.x);
        this._y = gridsafe(paddle.y);
        this.dir = paddle.direction; // 0 is vertical, 1 is horizontal
        this._width = paddle.width;
        this._height = paddle.height;
        this.building = null;
        this.lowpoint = 0;
        this.highpoint = this.dir == 0 ? canvas.height : canvas.width

        // Check if inside a wall and eject if so
        if (this.dir == 0) {
            let x = px2grid(this.x);
            for (let y = px2grid(this.y); y <= px2grid(this.height + this.y) && y < px2grid(canvas.height); y++) {
                if (grid.get_cell(x, y) === true) {
                    if (y > px2grid(this.y)) {
                        this._y -= grid_size * (2 * (y - px2grid(this.y)));
                        break;
                    } else if (y == px2grid(this.y)) {
                        this._y += grid_size;
                        break;
                    }
                }
            }
        } else {
            let y = px2grid(this.y);
            for (let x = px2grid(this.x); x <= px2grid(this.width + this.x) && x < px2grid(canvas.width); x++) {
                if (grid.get_cell(x, y) === true) {
                    if (x > px2grid(this.x)) {
                        this._x -= grid_size * (2 * (x - px2grid(this.x)));
                        break;
                    } else if (x == px2grid(this.x)) {
                        this._x += grid_size;
                        break;
                    }
                }
            }
        }

        // Determine what the target lowpoint and highpoint of the wall is
        // Lowpoint for Y coord is at the TOP of the canvas (low numerically, not visually)
        for (let wall of walls) {
            if (this.dir == 0 && wall.dir == 1 && wall.x + wall.width > this.x && wall.x < this.x + this.width) {
                // Vertical wall seeking horizontal walls that intersect on the X axis
                if (wall.y + wall.height > this.lowpoint && wall.y + wall.height < this.y + this.height) {
                    // A horizontal wall is above this vertical wall
                    this.lowpoint = wall.y + wall.height;
                } else if (wall.y < this.highpoint && wall.y > this.y + this.height) {
                    // A horizontal wall is below this vertical wall
                    this.highpoint = wall.y;
                }
            } else if (this.dir == 1 && wall.dir == 0 && wall.y + wall.height > this.y && wall.y < this.y + this.height) {
                // Horizontal Wall looking for Vertical Walls that intersect on the Y axis
                if (wall.x + wall.width > this.lowpoint && wall.x < this.x) {
                    // A vertical wall is to left of this horizontal wall
                    this.lowpoint = wall.x + wall.width;
                } else if (wall.x < this.highpoint && wall.x > this.x + this.width) {
                    this.highpoint = wall.x;
                }
            }
        }
        this.highpoint = gridsafe(this.highpoint);
        this.lowpoint = gridsafe(this.lowpoint);
    }

    expand(delta) {
        if (this.building !== null) {
            throw "This wall finished expanding";
        }

        /* Expand until the difference is about the size of a grid square, then turn into a building */
        if (this.dir == 0) {
            if (Math.abs(this.height - (this.highpoint - this.lowpoint)) <= grid_size + 1) {
                this.height = this.highpoint - this.lowpoint;
                this.y = this.lowpoint;
                this.building = new Building(this.x, this.y, this.width, this.height);
            } else {
                if (this.y > this.lowpoint && this.y + this.height < this.highpoint) {
                    // Move up while expanding to give the illusion of expanding from both sides
                    this.height += 20 * fps_ratio(delta);
                    this.y -= 10 * fps_ratio(delta);
                } else if (this.y > this.lowpoint) {
                    this.y -= 10 * fps_ratio(delta);
                    this.height += 10 * fps_ratio(delta);
                } else {
                    this.y = this.lowpoint.valueOf();
                    this.height += 10 * fps_ratio(delta);
                }
            }
        } else {
            if (Math.abs(this.width - (this.highpoint - this.lowpoint)) <= grid_size + 1) {
                this.width = this.highpoint - this.lowpoint;
                this.x = this.lowpoint;
                this.building = new Building(this.x, this.y, this.width, this.height);
            } else {
                if (this.x > this.lowpoint && this.x + this.width < this.highpoint) {
                    // Move left while expanding to give the illusion of expanding from both sides
                    this.width += 20 * fps_ratio(delta);
                    this.x -= 10 * fps_ratio(delta);
                } else if (this.x > this.lowpoint) {
                    this.x -= 10 * fps_ratio(delta);
                    this.width += 10 * fps_ratio(delta);
                } else {
                    this.x = this.lowpoint.valueOf();
                    this.width += 10 * fps_ratio(delta);
                }
            }
        }
    }

    draw() {
        if (!this.building) {
            ctx.fillStyle = "black";
            ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.width, this.height);
        } else {
            this.building.draw();
        }
    }

    get x() {
        if (!this.building) {
            return this._x;
        }
        return this.building.x;
    }

    get y() {
        if (!this.building) {
            return this._y;
        }
        return this.building.y;
    }

    set x(new_value) {
        this._x = new_value;
    }

    set y(new_value) {
        this._y = new_value;
    }

    set width(new_value) {
        this._width = new_value;
    }

    set height(new_value) {
        this._height = new_value;
    }

    get width() {
        if (!this.building) {
            return this._width;
        }
        return this.building.width;
    }

    get height() {
        if (!this.building) {
            return this._height;
        }
        return this.building.height;
    }

}
