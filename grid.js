/* Grid class
 * Represents canvas as a grid of 10px*10px cells, so we can decide what cells to fill in
 * If 75% of the grid is filled by walls, the grid is cleared and next level starts
 */

const arrayOfLength = len => Array.apply(null, Array(len));
const grid_size = 10;
const px2grid = px => Math.floor(px / grid_size);
const grid2px = grid_coord => grid_coord * grid_size;
const gridsafe = px => grid2px(px2grid(px));

class Grid {
    constructor() {
        let slowcanvas = document.getElementById("slow-layer");
        this.ctx = slowcanvas.getContext("2d");
        this.ctx.fillStyle = purple;
        let i = 0;
        // Create 2-dimensional array of cells, outer array being the y axis
        this.grid = arrayOfLength(px2grid(slowcanvas.height)).map(
            () => {
                return arrayOfLength(px2grid(slowcanvas.width)).map(
                    () => { return false }
                )
            }
        )
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
        this.ctx.fillRect(x, y, grid_size, grid_size);
    }

    //fill(x, y) {
    //    /* Set corresponding boolean in the 2d array to true */
    //    this.grid[y][x] = true;
    //}

    fill(xpos, ypos, width, height) {
        for (let x = xpos; x < xpos + width; x++) {
            for (let y = ypos; y < ypos + height; y++) {
                this.grid[y][x] = true;
            }
        }
    }

    clear() {
        this.grid.forEach(() => { return false });
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
