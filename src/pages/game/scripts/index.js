const socket = io(SOCKET_URL);

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
// let player2;
let playerLocal2;
let myselfId;
let partnerId;
let roomCode;
let isReady = false;
let refresh;
let over = false;

playerLocal.element.querySelectorAll('canvas')[0].style.border = "solid 5px orange";

const client = new Map;

if (window.location.hash) {
    socket.emit('joinRoom', window.location.hash.split("#")[1]);

    //Check error
    socket.on('unknownCode', () => {
        alert("Wrong code!");
    })
    socket.on('tooManyPlayers', () => {
        alert("Full!");
        inputCode.value = '';
    })

    roomCode = window.location.hash.split("#")[1];
}

//Join room
btnSubmit.addEventListener('click', () => {
    socket.emit('joinRoom', inputCode.value);

    //Check error
    socket.on('unknownCode', () => {
        alert("Wrong code!");
    })
    socket.on('tooManyPlayers', () => {
        alert("Full!");
        inputCode.value = '';
    })

    roomCode = inputCode.value;
})

//Create room
btnCreate.addEventListener('click', () => {
    socket.emit('createRoom');

    socket.on('roomName', roomName => {
        handleDisplayCode(roomName);
        roomCode = roomName;
    })
})

//Remove partner
socket.on('playerOut', id => {
    player.removePlayer(playerLocal2);
    clearInterval(refresh);

    btnAgain.style.display = 'none';
    endGameDisplay.style.display = 'flex';
    endGameTextDisplay.textContent = 'WIN';
})

//Set id
socket.on('init', id => {
    myselfId = id;
    client.set(id, playerLocal);
})

//Handle joining
socket.on('initJoin', (id, ids) => {
    if (!myselfId) {
        myselfId = id;
        partnerId = ids[1];
    } else {
        partnerId = ids[0];
    }

    ids.forEach(id => {

        if (myselfId !== id) {
            // player2 = new Player(document);
            playerLocal2 = player.createPlayer();

            if (!client.has(id)) {
                client.set(id, playerLocal2);
            }
        }
    })

    document.getElementById('play').style.display = 'block';

    handleDisplayCode(roomCode);
    handlePlay(roomCode);
})

//Update game
socket.on('updateState', data => {

    client.get(partnerId).board.drawBoard(data.matrix);
    client.get(partnerId).element.querySelectorAll('span')[0].innerHTML = data.score;

    playerLocal.board.myReceiveAtk = data.atk;
    playerLocal.board.setMyGarbage(data.atk);

    displayNextUp(data.nextBrick);
})

//Handle some event
socket.on('deleteButton', () => {
    client.get(partnerId).element.querySelectorAll('button')[0].style.display = 'none';
    client.get(partnerId).element.querySelectorAll('span')[1].textContent = 'READY...';
})

//Draw nextup brick
function displayNextUp(nextBrick) {
    const matrixBrick = nextBrick[0];
    const id = nextBrick[1];
    const ctx = client.get(partnerId).ctx2;

    //clear
    ctx.fillStyle = '#e6e6e6';
    ctx.fillRect(0, 0, NEXT_COLS * BLOCK_SIZE, NEXT_ROWS * BLOCK_SIZE);

    //draw next brick
    for (let row = 0; row < matrixBrick.length; row++) {
        for (let col = 0; col < matrixBrick[0].length; col++) {
            if (matrixBrick[row][col] !== BLACK_COLOR_ID) {
                // drawCell(col + 1, row + 1, brick.id);
                ctx.fillStyle = COLOR_MAPPING[id];
                ctx.fillRect(
                    (col + 1) * BLOCK_SIZE,
                    (row + 1) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
                // ctx.fillStyle = 'black';
                // ctx.strokeStyle = 'white';
                ctx.strokeRect(
                    (col + 1) * BLOCK_SIZE,
                    (row + 1) * BLOCK_SIZE,
                    BLOCK_SIZE,
                    BLOCK_SIZE
                );
            }
        }
    }
}

function handleDisplayCode(code) {
    if (code) {
        roomField.style.display = 'none';
        gameField.style.display = 'block';

        codeDisplay.textContent = code;
    }
}

function handleUpdateState(code) {
    const state = {
        isReady: isReady,
        matrix: playerLocal.board.exchangeData,
        nextBrick: [playerLocal.brick.layout[0], playerLocal.brick.id],
        score: playerLocal.board.score,
        atk: playerLocal.board.myAtk
    }

    socket.emit('playGame', {
        roomName: code,
        id: myselfId,
        state
    });
}

function handlePlay(code) {

    document.getElementById('play').addEventListener('click', () => {
        isReady = true;

        document.getElementById('play').style.display = 'none';
        handleUpdateState(code);

        socket.emit('ready', code);
    })

    socket.on('allUserReady', () => {
        client.get(partnerId).element.querySelectorAll('span')[1].textContent = '';
        over = true;
        handleStart();
    })

    function handleStart() {

        document.getElementById('play').style.display = 'none';
        BACKGROUND_AUDIO.play();
        BACKGROUND_AUDIO.loop = true;

        // console.log(playerLocal.board.exchangeData);

        playerLocal.board.reset();
        playerLocal.board.isPlaying = true;
        playerLocal.generateNewBrick();

        playerLocal.nextUp.clear();
        playerLocal.nextUp.draw(playerLocal.brick);

        handleUpdateState(roomCode);

        refresh = setInterval(() => {

            if (!playerLocal.board.gameOver) {
                playerLocal.nextBrick.moveDown();
                handleUpdateState(code);
            } else {
                clearInterval(refresh);

                isReady = false;
                endGameDisplay.style.display = 'flex';
                endGameTextDisplay.textContent = 'LOSE';

                console.log("Helloooo")
                socket.emit('gameOver', roomCode);
                playerLocal.board.reset();
                handleUpdateState(code);
            }

            //Handle end game
            socket.on('informOver', () => {
                clearInterval(refresh);

                isReady = false;
                endGameDisplay.style.display = 'flex';
                endGameTextDisplay.textContent = 'WIN';
                console.log("hi")

                //call API
                const request = async () => {
                    await fetch(NGROK_URL + `/render/name`)
                        .then(res => res.json())
                        .then(result => {
                            fetch(`${NGROK_URL}/auth/score`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Accept': 'application/json'
                                    }
                                })
                                .then(() => console.log("Hello"))
                                .catch(error => console.log('error:', error));
                        })
                        .catch(error => console.log('error:', error));
                }

                if (over) request();
                over = false;

                playerLocal.board.reset();
                handleUpdateState(code);
            })
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
}