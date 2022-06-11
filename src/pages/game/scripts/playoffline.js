// const socket = io('ws://localhost:8900');

const roomField = document.querySelector('.room-field');
const inputCode = document.querySelector('.code');
const btnSubmit = document.querySelector('.submit-btn');
const btnCreate = document.querySelector('.create-btn');
const gameField = document.querySelector('.game-container');
const codeDisplay = document.querySelector('#gameCodeDisplay');
const endGameDisplay = document.querySelector('.end-game');
const endGameTextDisplay = document.querySelector('.end-text');

//handle play again or outgame
const btnAgain = document.querySelector('.again-btn');
const btnOut = document.querySelector('.close-btn');

btnAgain.addEventListener('click', () => {
    endGameDisplay.style.display = 'none';
    document.getElementById('play').style.display = 'block';
})

const player = new Player(document);
let playerLocal = player.createPlayer();

playerLocal.element.querySelectorAll('canvas')[0].style.border = "solid 5px orange";

document.getElementById('play').addEventListener('click', () => {
    isReady = true;

    document.getElementById('play').style.display = 'none';
    handleStart();
})

function handleStart() {

    document.getElementById('play').style.display = 'none';
    // BACKGROUND_AUDIO.volume = 0.01;
    BACKGROUND_AUDIO.play();
    BACKGROUND_AUDIO.loop = true;

    // console.log(playerLocal.board.exchangeData);

    playerLocal.board.reset();
    playerLocal.board.isPlaying = true;
    playerLocal.generateNewBrick();

    playerLocal.nextUp.clear();
    playerLocal.nextUp.draw(playerLocal.brick);

    refresh = setInterval(() => {

        if (!playerLocal.board.gameOver) {
            playerLocal.nextBrick.moveDown();
            handleUpdateState(code);
        } else {
            clearInterval(refresh);


            endGameDisplay.style.display = 'flex';
            endGameTextDisplay.textContent = 'LOSE';
        }
    }, 500);
}

document.addEventListener('keydown', (e) => {
    if (!playerLocal.board.gameOver && playerLocal.board.isPlaying) {
        switch (e.code) {
            case KEY_CODES.LEFT:
                playerLocal.nextBrick.moveLeft();
                break;
            case KEY_CODES.RIGHT:
                playerLocal.nextBrick.moveRight();
                break;
            case KEY_CODES.DOWN:
                playerLocal.nextBrick.moveDown();
                break;
            case KEY_CODES.SPACE:
                playerLocal.nextBrick.fall();
                break;
            case KEY_CODES.UP:
                playerLocal.nextBrick.rotate();
                break;
            default:
                break;
        }
    }
});