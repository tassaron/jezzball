class Building {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.drawn = false;
        console.log(`building of x${x}+w${width}, y${y}+h${height}`)
    }

    draw() {
        if (this.drawn) { return }
        if (px2grid(this.width) == 1) {
            // Vertical
            for (let y = px2grid(this.y); y < px2grid(this.height + this.y); y++) {
                //console.log(`x${this.x}, y${y}`)
                grid.fill(px2grid(this.x), y);
                grid.draw_cell(this.x, grid2px(y));
            }
        } else if (px2grid(this.height) == 1) {
            // Horizontal
            for (let x = px2grid(this.x); x < px2grid(this.width + this.x); x++) {
                //console.log(`x${x}, y${this.y}`)
                grid.fill(x, px2grid(this.y));
                grid.draw_cell(grid2px(x), this.y);
            }
        } else {
            console.error("Wall size isn't divisible into the grid??")
        }
        this.drawn = true;
    }
}
