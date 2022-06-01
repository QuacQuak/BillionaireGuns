class Game {
    constructor(element) {
        this.element = element;

        this.canvas = element.querySelectorAll('canvas')[0];
        this.canvas2 = element.querySelectorAll('canvas')[1];
        this.ctx = this.canvas.getContext('2d');
        this.ctx2 = this.canvas2.getContext('2d');

        this.generateArea();

        this.data = [null, null, null, null];
        this.brick = null;
        // this.nextBrick = null;

        this.board = new Board(this.ctx);
        this.board.drawBoard();
        this.nextUp = new NextUp(this.ctx2);

        this.generateNewBrick();
        this.nextBrick = this.brick;
        this.nextUp.draw(this.brick);
    }

    generateNewBrick() {
        while (1) {
            let r = Math.floor(Math.random() * BRICK_LAYOUT.length);
            if (this.data.indexOf(r) == -1) {
                this.data.shift();
                this.data.push(r);
                this.brick = new Brick(r, this.board, this);
                break;
            }
        }
    }

    generateArea() {
        this.ctx.canvas.width = COLS * BLOCK_SIZE;
        this.ctx.canvas.height = ROWS * BLOCK_SIZE;

        this.ctx2.canvas.width = NEXT_COLS * BLOCK_SIZE;
        this.ctx2.canvas.height = NEXT_ROWS * BLOCK_SIZE;
    }
}