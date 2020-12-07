import { Wall } from './wall.js';
import { px2grid } from './grid.js';
import { updateScore, grid } from './game.js';

export class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.drawn = false;
    }

    draw() {
        if (this.drawn) { return }
        if (px2grid(this.width) == 1) {
            // Vertical
            for (let y = px2grid(this.y); y < px2grid(this.height + this.y); y++) {
                grid.fill_cell(px2grid(this.x), y);
            }
        } else if (px2grid(this.height) == 1) {
            // Horizontal
            for (let x = px2grid(this.x); x < px2grid(this.width + this.x); x++) {
                grid.fill_cell(x, px2grid(this.y));
            }
        } else {
            console.error("Wall size isn't divisible into the grid??")
        }

        grid.flood_fill();
        grid.draw();
        this.drawn = true;
        updateScore();
        Wall.count -= 1;
    }
}
