import { ctx, purple } from "./game.js";
import { gridsafe, grid_size } from "./grid.js";
import { mouseX, mouseY } from "./ui.js";
import { canvas } from "./game.js";

export class Paddle {
    constructor() {
        this.colour = purple;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.direction = 0;
    }

    get x() {
        return this._x;
    }

    set x(new_val) {
        this._x = gridsafe(new_val);
    }

    get y() {
        return this._y;
    }

    set y(new_val) {
        this._y = gridsafe(new_val);
    }

    get direction() {
        // 0 is vertical, 1 is horizontal
        return this._dir;
    }

    set direction(new_value) {
        if (new_value == 0) {
            this.height = grid_size * 2;
            this.width = grid_size;
        } else {
            this.height = grid_size;
            this.width = grid_size * 2;
        }
        this.x = mouseX - this.width / 2;
        this.y = mouseY - this.height / 2;
        this._dir = new_value;
    }

    draw() {
        ctx.fillStyle = this.colour;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
