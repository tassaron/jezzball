/* Wall class
 * A wall is created at the position of the paddle, with a direction (0 = vert; 1 = hori)
 * It expands in that direction until hitting the canvas bondaries or a ball
 * Hitting a canvas boundary creates a Building; hitting a ball loses a life
 */
const walls = [];


function createWall() {
    walls.push(new Wall());
}


class Wall {
    constructor() {
        /* DEBUG
        this.id = Math.round(Math.random() * 1000)
        console.log(`Wall ${this.id} created`)
        */

        this._x = gridsafe(paddle.x);
        this._y = gridsafe(paddle.y);
        this.dir = paddle.direction;
        this._width = paddle.width;
        this._height = paddle.height;
        this.building = null;
        this.lowpoint = 0;
        if (this.dir == 0) {
            this.highpoint = canvas.height;
        } else {
            this.highpoint = canvas.width;
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
        //this.highpoint = gridsafe(this.highpoint);
        //this.lowpoint = gridsafe(this.lowpoint);
    }

    expand(delta) {
        if (this.building !== null) {
            console.error("This wall finished expanding")
            return;
        }

        /* DEBUG OPTION: QUICK-DRAW WALLS INSTEAD OF ANIMATING EXPANSION
        if (this.dir == 0) {
            this.y = this.lowpoint;
            this.height = this.highpoint - this.lowpoint;
        } else {
            this.x = this.lowpoint;
            this.width = this.highpoint - this.lowpoint;
        }
        this.building = new Building(this.x, this.y, this.width, this.height);*/

        if (this.dir == 0) {
            if (this.height >= this.highpoint - this.lowpoint) {
                this.height = this.highpoint - this.lowpoint;
                this.y = this.lowpoint;
                console.log(`${this.id} created a Building`)
                this.building = new Building(this.x, this.y, this.width, this.height);
            } else {
                this.height += 16 * fps_ratio(delta);
                this.y -= 8 * fps_ratio(delta);
            }
        } else {
            if (this.width >= this.highpoint - this.lowpoint) {
                this.width = this.highpoint - this.lowpoint;
                this.x = this.lowpoint;
                console.log(`${this.id} created a Building`)
                this.building = new Building(this.x, this.y, this.width, this.height);
            } else {
                this.width += 16 * fps_ratio(delta);
                this.x -= 8 * fps_ratio(delta);
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