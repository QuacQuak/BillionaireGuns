class Board {
    constructor(ctx) {
        this.ctx = ctx;
        this.grid = this.generateWhiteBoard();

        this.exchangeData = this.generateWhiteBoard();

        this.score = 0;
        this.gameOver = false;
        this.isPlaying = false;
        this.clearAudio = new Audio('pages/game/sounds/clear.wav');
        this.clearAudio.volume = 0.1;
        this.failAudio = new Audio('pages/game/sounds/fail.wav');
        //this.fallAudio = new Audio('./sounds/fall.wav');

        this.myAtk = 0;
        this.myGarbage = 0;
        this.myRealGarbage = 0;
        this.myLastAtk = 0;
        this.myLastReceiveAtk = 0;
        this.myReceiveAtk = -1;
    }

    reset() {
        this.myAtk = 0;
        this.myGarbage = 0;
        this.myRealGarbage = 0;
        this.myLastAtk = 0;
        this.myLastReceiveAtk = 0;
        this.myReceiveAtk = -1;

        this.score = 0;

        document.getElementById('score').innerHTML = 0;
        this.exchangeData = this.generateWhiteBoard();
        this.grid = this.generateWhiteBoard();
        this.gameOver = false;
        this.drawBoard();
    }

    generateWhiteBoard() {
        return Array.from({
            length: ROWS
        }, () => Array(COLS).fill(BLACK_COLOR_ID));
    }

    drawCell(xAxis, yAxis, colorId) {
        // xAxis => 1 yAxis => 1
        this.ctx.fillStyle =
            COLOR_MAPPING[colorId];

        this.ctx.fillRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        this.ctx.strokeStyle = 'black';
        // this.ctx.strokeStyle = 'white';
        this.ctx.strokeRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );

    }

    drawShadow(xAxis, yAxis, flag) {
        // xAxis => 1 yAxis => 1
        this.ctx.fillStyle = 'black';

        this.ctx.fillRect(
            xAxis * BLOCK_SIZE,
            yAxis * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        );
        // this.ctx.strokeStyle = 'black';
        if (flag == 1) {
            this.ctx.strokeStyle = 'white';
            this.ctx.strokeRect(
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        } else {
            this.ctx.strokeStyle = 'black';
            this.ctx.strokeRect(
                xAxis * BLOCK_SIZE,
                yAxis * BLOCK_SIZE,
                BLOCK_SIZE,
                BLOCK_SIZE
            );
        }
    }

    drawBoard(grid) {
        if (grid) {
            for (let row = 0; row < this.grid.length; row++) {
                for (let col = 0; col < this.grid[0].length; col++) {
                    this.drawCell(col, row, grid[row][col]);
                }
            }
        } else {
            for (let row = 0; row < this.grid.length; row++) {
                for (let col = 0; col < this.grid[0].length; col++) {
                    this.drawCell(col, row, this.grid[row][col]);
                }
            }
        }
    }

    handleCompleteRows() {
        const latestGrid = this.grid.filter((row) => { // row => []
            return row.some(col => (col === BLACK_COLOR_ID));
        });
        if (this.myGarbage !== 0) {
            for (let idx = 0; idx < this.myGarbage; idx++) {
                latestGrid.shift();
            }
        }
        const newScore = ROWS - (latestGrid.length + this.myRealGarbage) - this.myGarbage; // => newScore = tong cong hang da hoan thanh

        if (this.myGarbage + this.myRealGarbage > 0) {
            if ((this.myGarbage + this.myRealGarbage) - newScore >= 0) {
                this.myRealGarbage -= newScore;

                const newRows_1 = Array.from({
                    length: newScore * 2
                }, () => Array(COLS).fill(BLACK_COLOR_ID));

                const newRows_2 = Array.from({
                    length: this.myGarbage + this.myRealGarbage
                }, () => Array(COLS).fill(GREY_COLOR_ID));

                if (newScore) {
                    this.myAtk = 0;
                }
                this.grid = [...newRows_1, ...latestGrid, ...newRows_2];

                for (let row = 0; row < this.grid.length; row++) {
                    for (let col = 0; col < this.grid[0].length; col++) {
                        this.exchangeData[row][col] = this.grid[row][col];
                    }
                }
                this.myRealGarbage = newRows_2.length;
                this.myGarbage = 0;

                this.handleScore(newScore * 10);
                this.clearAudio.play();
            } else {

                const newRows = Array.from({
                    length: newScore + this.myGarbage + this.myRealGarbage
                }, () => Array(COLS).fill(BLACK_COLOR_ID));
                if (newScore) {
                    this.myAtk = newScore - this.myGarbage - this.myRealGarbage;
                    this.grid = [...newRows, ...latestGrid];
                    for (let row = 0; row < this.grid.length; row++) {
                        for (let col = 0; col < this.grid[0].length; col++) {
                            this.exchangeData[row][col] = this.grid[row][col]
                        }
                    }
                    this.myGarbage = 0;
                    this.myRealGarbage = 0;

                    this.handleScore(newScore * 10);
                    this.clearAudio.play();
                }
            }
        } else {
            const newRows = Array.from({
                length: newScore
            }, () => Array(COLS).fill(BLACK_COLOR_ID));

            if (newScore) {
                this.myAtk = newScore;
                this.grid = [...newRows, ...latestGrid];

                for (let row = 0; row < this.grid.length; row++) {
                    for (let col = 0; col < this.grid[0].length; col++) {
                        this.exchangeData[row][col] = this.grid[row][col]
                    }
                }

                this.handleScore(newScore * 10);
                this.clearAudio.play();
            }
        }
        if (newScore) {
            if (this.myLastAtk !== this.myAtk) {
                this.myLastAtk = this.myAtk;
            } else {
                this.myAtk = -this.myAtk;
                this.myLastAtk = this.myAtk;
            }
        }
    }

    handleScore(newScore) {
        this.score += newScore;
        document.getElementById('score').innerHTML = this.score;
    }

    handleGameOver() {
        //brick.draw();
        this.gameOver = true;
        this.isPlaying = false;
        BACKGROUND_AUDIO.pause();
        BACKGROUND_AUDIO.currentTime = 0;
        this.failAudio.play();
        // alert('GAME OVER!!!');
    }

    setMyGarbage(garbage) {
        if (this.myReceiveAtk != this.myLastReceiveAtk) {
            if (this.myReceiveAtk < 0) {
                this.myGarbage = this.myGarbage - garbage;
                console.log("My garbage: ")
                console.log(this.myGarbage);
            } else {
                this.myGarbage = this.myGarbage + garbage;
                console.log("My garbage: ")
                console.log(this.myGarbage);
            }
            this.myLastReceiveAtk = this.myReceiveAtk;
        }
    }
}