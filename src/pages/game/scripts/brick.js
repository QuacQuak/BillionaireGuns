class Brick {
    constructor(id, board, game) {
        this.id = id;
        this.layout = BRICK_LAYOUT[id];
        this.activeIndex = 0;
        this.colPos = 3;
        this.rowPos = -3;
        this.board = board;
        this.game = game;
    }

    draw() {
        for (let row = 0; row < this.layout[this.activeIndex].length; row++) {
            for (let col = 0; col < this.layout[this.activeIndex][0].length; col++) {
                if (this.layout[this.activeIndex][row][col] !== BLACK_COLOR_ID) { //&& row + this.rowPos >= 0) {
                    this.board.drawShadow(col + this.colPos, row + this.getShadow(), 1);
                    this.board.drawCell(col + this.colPos, row + this.rowPos, this.id);

                    if (row + this.rowPos >= 0) {
                        this.board.exchangeData[row + this.rowPos][col + this.colPos] = this.id;
                    }
                }
            }
        }
    }

    clear() {
        for (let row = 0; row < this.layout[this.activeIndex].length; row++) {
            for (let col = 0; col < this.layout[this.activeIndex][0].length; col++) {
                if (this.layout[this.activeIndex][row][col] !== BLACK_COLOR_ID) {
                    this.board.drawCell(col + this.colPos, row + this.rowPos, BLACK_COLOR_ID);
                    this.board.drawShadow(col + this.colPos, row + this.getShadow(), 2);
                    this.board.drawShadow(col + this.colPos, row + this.getShadow(), 2);
                    this.board.drawShadow(col + this.colPos, row + this.getShadow(), 2);

                    if (row + this.rowPos >= 0) {
                        this.board.exchangeData[row + this.rowPos][col + this.colPos] = BLACK_COLOR_ID;
                    }
                }
            }
        }
    }

    getShadow() {

        let rowShadow = 0;
        while (!this.checkCollision(rowShadow,
                this.colPos,
                this.layout[this.activeIndex])) {
            rowShadow++;
        }

        if (rowShadow == 0) return rowShadow - 4;
        return rowShadow - 1;
    }

    moveLeft() {
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos - 1,
                this.layout[this.activeIndex]
            )
        ) {
            this.clear();
            this.colPos--;
            this.draw();
        }
    }

    moveRight() {
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos + 1,
                this.layout[this.activeIndex]
            )
        ) {
            this.clear();
            this.colPos++;
            this.draw();
        }
    }

    moveDown() {

        if (
            !this.checkCollision(
                this.rowPos + 1,
                this.colPos,
                this.layout[this.activeIndex]
            )
        ) {
            this.clear();
            this.rowPos++;
            this.draw();
            return;
        }

        this.handleLanded();
        this.game.nextBrick = this.game.brick;
        this.game.generateNewBrick();
        this.game.nextUp.clear();
        this.game.nextUp.draw(this.game.brick);
    }

    fall() {
        while (!this.checkCollision(
                this.rowPos + 1,
                this.colPos,
                this.layout[this.activeIndex])) {
            // this.moveDown();
            this.rowPos++;
        }
        this.handleLanded();
        this.game.nextBrick = this.game.brick;
        this.game.generateNewBrick();
        this.game.nextUp.clear();
        this.game.nextUp.draw(this.game.brick);
        FALL_AUDIO.play();
    }

    rotate() {
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos,
                this.layout[(this.activeIndex + 1) % 4]
            )
        ) {
            this.clear();
            this.activeIndex = (this.activeIndex + 1) % 4;
            /**
             * activeindex = 0
             * 0 + 1 = 1 % 4 ==> 1
             *
             * activeIndex = 3
             * 3 + 1 = 4 % 4 ==> 0
             *
             * **/
            this.draw();
            return;
        }
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos + 1,
                this.layout[(this.activeIndex + 1) % 4]
            )
        ) {
            this.clear();
            this.activeIndex = (this.activeIndex + 1) % 4;
            /**
             * activeindex = 0
             * 0 + 1 = 1 % 4 ==> 1
             *
             * activeIndex = 3
             * 3 + 1 = 4 % 4 ==> 0
             *
             * **/
            this.colPos++;
            this.draw();
            return;
        }
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos - 1,
                this.layout[(this.activeIndex + 1) % 4]
            )
        ) {
            this.clear();
            this.activeIndex = (this.activeIndex + 1) % 4;
            /**
             * activeindex = 0
             * 0 + 1 = 1 % 4 ==> 1
             *
             * activeIndex = 3
             * 3 + 1 = 4 % 4 ==> 0
             *
             * **/
            this.colPos--;
            this.draw();
            return;
        }
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos - 2,
                this.layout[(this.activeIndex + 1) % 4]
            )
        ) {
            this.clear();
            this.activeIndex = (this.activeIndex + 1) % 4;
            /**
             * activeindex = 0
             * 0 + 1 = 1 % 4 ==> 1
             *
             * activeIndex = 3
             * 3 + 1 = 4 % 4 ==> 0
             *
             * **/
            this.colPos -= 2;
            this.draw();
            return;
        }
        if (
            !this.checkCollision(
                this.rowPos,
                this.colPos + 2,
                this.layout[(this.activeIndex + 1) % 4]
            )
        ) {
            this.clear();
            this.activeIndex = (this.activeIndex + 1) % 4;
            /**
             * activeindex = 0
             * 0 + 1 = 1 % 4 ==> 1
             *
             * activeIndex = 3
             * 3 + 1 = 4 % 4 ==> 0
             *
             * **/
            this.colPos += 2;
            this.draw();
            return;
        }
    }

    checkCollision(nextRow, nextCol, nextLayout) {
        // if (nextCol < 0) return true;

        for (let row = 0; row < nextLayout.length; row++) {
            for (let col = 0; col < nextLayout[0].length; col++) {
                if (nextLayout[row][col] !== BLACK_COLOR_ID) { //&& (row + nextRow) >= 0) {
                    if (
                        col + nextCol < 0 ||
                        col + nextCol >= COLS ||
                        row + nextRow >= ROWS ||
                        this.checkGrid(row, col, nextRow, nextCol)
                    )
                        return true;
                }
            }
        }

        return false;
    }

    checkGrid(row, col, nextRow, nextCol) {
        if (row + nextRow >= 0)
            return this.board.grid[row + nextRow][col + nextCol] !== BLACK_COLOR_ID;
        return false;
    }

    getFirstRow(arr) {
        for (let row = 0; row < arr.length; row++) {
            for (let col = 0; col < arr[0].length; col++) {
                if (arr[row][col] !== BLACK_COLOR_ID)
                    return row;
            }
        }
    }

    handleLanded() {
        // console.log("Hello")
        if (this.rowPos + this.getFirstRow(this.layout[this.activeIndex]) <= 0) {
            this.board.handleGameOver();
            return;
        }

        for (let row = 0; row < this.layout[this.activeIndex].length; row++) {
            for (let col = 0; col < this.layout[this.activeIndex][0].length; col++) {
                if (this.layout[this.activeIndex][row][col] !== BLACK_COLOR_ID) {
                    this.board.grid[row + this.rowPos][col + this.colPos] = this.id;
                    this.board.exchangeData[row + this.rowPos][col + this.colPos] = this.id;
                }
            }
        }
        this.board.handleCompleteRows();
        this.board.drawBoard();
    }
}