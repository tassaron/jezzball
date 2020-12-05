/* Grid class
 * Represents canvas as a grid_size*grid_size grid of cells, so we can decide what cells to fill in
 * If 75% of the grid is filled by walls, the grid is cleared and next level starts
 */

const arrayOfLength = len => Array.apply(null, Array(len));
const grid_size = 10;
const px2grid = px => Math.floor(px / grid_size)
const grid2px = grid_coord => grid_coord * grid_size;
const gridsafe = px => grid2px(px2grid(px));
const newGridArray = (filled) => arrayOfLength(px2grid(canvas.height)).map(
    () => {
        return arrayOfLength(px2grid(canvas.width)).map(
            () => { return filled }
        )
    }
)
let grid_length;

class Grid {
    constructor() {
        let slowcanvas = document.getElementById("slow-layer");
        this.ctx = slowcanvas.getContext("2d");
        this.ctx.fillStyle = purple;
        let i = 0;
        // Create 2-dimensional array of cells, outer array being the y axis
        this.grid = newGridArray(false);
        grid_length = px2grid(canvas.width) * px2grid(canvas.height)
    }

    draw() {
        for (let y = 0; y < this.grid.length; y++) {
            let x = 0;
            for (let cell of this.grid[y]) {
                x++;
                if (cell) {
                    this.draw_cell(grid2px(x), grid2px(y));
                }
            }
        }
    }

    draw_cell(x, y) {
        this.ctx.fillRect(x - grid_size, y, grid_size, grid_size);
    }

    fill_cell(x, y) {
        this.grid[y][x] = true;
    }

    /* Wrote this before I realized I didn't need it
    fill(xpos, ypos, w, h) {
        let width = 1 + Math.abs(w - xpos);
        let height = 1 + Math.abs(h - ypos);
        for (let y = Math.min(ypos, height); y < Math.max(ypos, height); y++) {
            for (let x = Math.min(xpos, width); x < Math.max(xpos, width); x++) {
                this.grid[y][x] = true;
            }
        }
    }*/

    clear() {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < px2grid(canvas.width); x++) {
                // I tried to do this in a more elegant way but it never worked for some reason??
                this.grid[y][x] = false;
            }
        }
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    recursive_fill(hypothetical_grid, x, y) {
        if (x >= 0 && x < px2grid(canvas.width) && y >= 0 && y < px2grid(canvas.height)) {
            if (this.grid[y][x] === false && hypothetical_grid[y][x] === true) {
                hypothetical_grid[y][x] = false;
                hypothetical_grid = this.recursive_fill(hypothetical_grid, x - 1, y);
                hypothetical_grid = this.recursive_fill(hypothetical_grid, x + 1, y);
                hypothetical_grid = this.recursive_fill(hypothetical_grid, x, y - 1);
                hypothetical_grid = this.recursive_fill(hypothetical_grid, x, y + 1);
            }
        }
        return hypothetical_grid
    }

    flood_fill() {
        let hypothetical_grid = newGridArray(true);
        for (let ball of balls) {
            let x = px2grid(ball.x - globalBall.radius);
            let y = px2grid(ball.y - globalBall.radius);
            hypothetical_grid = this.recursive_fill(hypothetical_grid, x, y);
        }
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < px2grid(canvas.width); x++) {
                this.grid[y][x] = hypothetical_grid[y][x]
            }
        }
    }

    percentFilled() {
        let accumulated = 0;
        let whats_complete = this.grid.map(
            (y) => {
                return y.filter(
                    ((cell) => { if (cell === true) { return cell } })
                )
            }
        )
        for (let i = 0; i < whats_complete.length; i++) {
            accumulated += whats_complete[i].length
        }
        return accumulated / grid_length * 100
    }
}
