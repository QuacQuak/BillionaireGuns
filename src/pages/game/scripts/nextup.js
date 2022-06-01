class NextUp {
    constructor(ctx) {
        this.grid = this.generateWhiteGrid();
        this.ctx = ctx;
    }

    reset() {
        this.grid = this.generateWhiteGrid();
        this.drawGrid();
    }

    generateWhiteGrid() {
        return Array.from({
            length: NEXT_ROWS
        }, () => Array(NEXT_COLS).fill(BLACK_COLOR_ID));
    }

    drawCell(xAxis, yAxis, colorId) {
        // xAxis => 1 yAxis => 1
        this.ctx.fillStyle = COLOR_MAPPING[colorId];
        this.ctx.fillRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        // this.ctx.fillStyle = 'black';
        // this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
    }

    draw(brick) {
        for (let row = 0; row < brick.layout[brick.activeIndex].length; row++) {
            for (let col = 0; col < brick.layout[brick.activeIndex][0].length; col++) {
                if (brick.layout[brick.activeIndex][row][col] !== BLACK_COLOR_ID) {
                    this.drawCell(col + 1, row + 1, brick.id);
                }
            }
        }
    }

    clear() {
        this.ctx.fillStyle = '#e6e6e6';
        this.ctx.fillRect(0, 0, NEXT_COLS * BLOCK_SIZE, NEXT_ROWS * BLOCK_SIZE);
    }

}