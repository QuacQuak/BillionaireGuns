const socket = io(SOCKET_URL);

const roomField = document.querySelector(".room-field");
const inputCode = document.querySelector(".code");
const btnSubmit = document.querySelector(".submit-btn");
const btnCreate = document.querySelector(".create-btn");
const gameField = document.querySelector(".game-container");
const codeDisplay = document.querySelector("#gameCodeDisplay");
const endGameDisplay = document.querySelector(".end-game");
const endGameTextDisplay = document.querySelector(".end-text");
const modeButton = document.querySelector("#switch-mode");
const modeSelect = document.querySelector("#mode-select");
const pauseButton = document.querySelector("#pause");
const continueButton = document.querySelector("#continue");
const backButton = document.querySelector("#continue");
const btnAgain = document.querySelector(".again-btn");
const btnOut = document.querySelector(".close-btn");

const initPlayerName = localStorage.getItem("name");

const client = new Map();
const player = new Player(document);
let playerLocal = player.createPlayer();
let myselfName;
let partnerName;
let partnerNameList = [];
let partnerStateObject = {};

let myselfId;
let partnerIdList = [];

let fps = 500;
let mode = modeStatus.SURVIVAL;
let roomCode;
let isReady = false;
let refresh;
let over = false;

document.querySelector(".player-name").value = initPlayerName;

playerLocal.element.querySelectorAll("canvas")[0].style.border =
  "solid 5px orange";

if (window.location.hash) {
  socket.emit("joinRoom", window.location.hash.split("#")[1]);

  //Check error
  socket.on("unknownCode", () => {
    alert("Wrong code!");
  });
  socket.on("tooManyPlayers", () => {
    alert("Full!");
    inputCode.value = "";
  });

  roomCode = window.location.hash.split("#")[1];
}

modeButton.addEventListener("change", () => {
  if (mode === modeStatus.SURVIVAL) {
    mode = modeStatus.SPEED;
    modeSelect.textContent = "Speed";
  } else {
    mode = modeStatus.SURVIVAL;
    modeSelect.textContent = "Survival";
  }
});

btnAgain.addEventListener("click", () => {
  endGameDisplay.style.display = "none";
  document.querySelector(".btn.myself").style.display = "block";
});

document.querySelector(".play-btn").addEventListener("click", () => {
  isReady = true;

  document.querySelector(".myself").style.display = "none";
  handleUpdateState(roomCode);

  socket.emit("ready", roomCode);
});

//Create room
btnCreate.addEventListener("click", () => {
  const playerName = document.querySelector(".player-name").value;
  if (!playerName) {
    return alert("Xin quy vi va cac ban vui long nhap ten vo gium");
  }
  if (initPlayerName || initPlayerName !== playerName) {
    localStorage.setItem("name", playerName);
  }

  handleDisplayButton("flex");
  modeSelect.textContent = mode === modeStatus.SURVIVAL ? "Survival" : "Speed";

  myselfName = document.querySelector(".player-name").value;
  playerLocal.element.querySelector(".username").textContent = myselfName;
  socket.emit("createRoom", myselfName, inputCode.value, mode);

  socket.on("roomName", (roomName) => {
    handleDisplayCode(roomName);
    roomCode = roomName;
  });
});

//Join room
btnSubmit.addEventListener("click", () => {
  if (!inputCode.value) {
    return alert("Muon vo thi nhap code vo chu");
  }
  const playerName = document.querySelector(".player-name").value;
  if (!playerName) {
    return alert("Xin quy vi va cac ban vui long nhap ten vo gium");
  }
  if (initPlayerName || initPlayerName !== playerName) {
    localStorage.setItem("name", playerName);
  }

  myselfName = playerName;
  playerLocal.element.querySelector(".username").textContent = myselfName;
  socket.emit("joinRoom", inputCode.value, myselfName);

  //Check error
  socket.on("unknownCode", () => {
    alert("Wrong code!");
  });
  socket.on("tooManyPlayers", () => {
    alert("Full!");
    inputCode.value = "";
  });

  roomCode = inputCode.value;
});

//Remove partner
socket.on("playerOut", (id) => {
  partnerIdList = partnerIdList.filter((playerid) => playerid !== id);
  delete partnerStateObject[id];

  player.removePlayer(client.get(id));
  clearInterval(refresh);

  btnAgain.style.display = "none";
  endGameDisplay.style.display = "flex";
  endGameTextDisplay.textContent = "WIN";
});

//Set id
socket.on("init", (id) => {
  myselfId = id;
  client.set(id, playerLocal);
});

//Handle joining
socket.on("initJoin", (id, roomInfo, gameMode) => {
  if (!myselfId) {
    myselfId = id;
  }

  if (gameMode === modeStatus.SPEED) {
    mode = gameMode;
    modeSelect.textContent = "Speed";
  }

  roomInfo.map((room) => {
    const id = room.id;
    if (!partnerIdList.includes(id) && id !== myselfId) {
      const newPLayer = player.createPlayer(id);
      partnerIdList.push(id);
      partnerStateObject[id] = [];
      newPLayer.element.querySelector(".username").textContent = room.name;
      if (!client.has(id)) {
        client.set(id, newPLayer);
      }
    }
  });

  handleDisplayButton("none");
  handleDisplayCode(roomCode);
});

//Update game
socket.on("updateState", (data, changeplayerId) => {
  if (!partnerIdList.includes(data.userName)) {
    partnerNameList.push(data.userName);
  }

  partnerStateObject[changeplayerId] = data;
});

//Handle some event
socket.on("deleteButton", (playerReadyId) => {
  client
    .get(playerReadyId)
    .element.querySelectorAll("button")[0].style.display = "none";
  client.get(playerReadyId).element.querySelectorAll("span")[2].textContent =
    "READY...";
});

socket.on("allUserReady", () => {
  partnerIdList.map((id) => {
    client.get(id).element.querySelectorAll("span")[2].textContent = "";
    over = false;
    playerLocal.element.querySelectorAll("span")[0].textContent = myselfName;
  });
  handleStart();
});

function handleStart() {
  document.querySelector(".play-btn").style.display = "none";
  BACKGROUND_AUDIO.play();
  BACKGROUND_AUDIO.loop = true;

  playerLocal.board.reset();
  playerLocal.board.isPlaying = true;
  playerLocal.generateNewBrick();

  playerLocal.nextUp.clear();
  playerLocal.nextUp.draw(playerLocal.brick);

  handleUpdateState(roomCode);

  function startGame() {
    refresh = setInterval(() => {
      if (!playerLocal.board.gameOver) {
        if (
          mode === modeStatus.SPEED &&
          Math.ceil(playerLocal.board.score / 200) ===
            Math.floor(playerLocal.board.score / 200) &&
          Math.floor(playerLocal.board.score / 200) < 4
        ) {
          fps = 500 - playerLocal.board.score / 2;
          clearInterval(refresh);
          startGame();
        }
        playerLocal.nextBrick.moveDown();
        handleUpdateState(roomCode);
      } else {
        clearInterval(refresh);

        isReady = false;
        endGameDisplay.style.display = "flex";
        endGameTextDisplay.textContent = "LOSE";
        over = true;
        handleUpdateState(roomCode);
        socket.emit("gameOver", roomCode, mode);
        playerLocal.board.reset();
      }
    }, fps);
  }

  startGame();

  pauseButton.addEventListener("click", () => {
    clearInterval(refresh);
    document.removeEventListener("keydown", enableKey);
  });

  continueButton.addEventListener("click", () => {
    startGame();
    document.addEventListener("keydown", enableKey);
  });

  //Handle end game
  socket.on("informOver", () => {
    if (!over) {
      clearInterval(refresh);
      isReady = false;
      endGameDisplay.style.display = "flex";
      endGameTextDisplay.textContent = "WIN";
      playerLocal.board.reset();
    }
    handleUpdateState(roomCode);
  });
}

document.addEventListener("keydown", enableKey);

function enableKey(e) {
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
}

function handleUpdateState(code) {
  const state = {
    userName: myselfName,
    isReady: isReady,
    isOver: over,
    matrix: playerLocal.board.exchangeData,
    nextBrick: [playerLocal.brick.layout[0], playerLocal.brick.id],
    score: playerLocal.board.score,
    atk: mode === modeStatus.SURVIVAL ? playerLocal.board.myAtk : 0,
  };

  updateState();
  socket.emit("playGame", {
    roomName: code,
    id: myselfId,
    state,
  });
}

function updateState() {
  let atkReceive = 0;
  partnerIdList.map((id) => {
    const dataReceive = partnerStateObject[id];
    client.get(id).element.querySelector(".username").textContent =
      dataReceive.userName;
    client.get(id).board.drawBoard(dataReceive.matrix);
    client.get(id).element.querySelector(".score").innerHTML =
      dataReceive.score;
    atkReceive += dataReceive.atk;

    displayNextUp(dataReceive.nextBrick, id);
  });
  playerLocal.board.setMyGarbage(atkReceive);
  playerLocal.board.myReceiveAtk = atkReceive;
}

//Draw nextup brick
function displayNextUp(nextBrick, id) {
  if (nextBrick && id) {
    const matrixBrick = nextBrick[0];
    const idBrick = nextBrick[1];
    const ctx = client.get(id).ctx2;

    //clear
    ctx.fillStyle = "#e6e6e6";
    ctx.fillRect(0, 0, NEXT_COLS * BLOCK_SIZE, NEXT_ROWS * BLOCK_SIZE);

    //draw next brick
    for (let row = 0; row < matrixBrick.length; row++) {
      for (let col = 0; col < matrixBrick[0].length; col++) {
        if (matrixBrick[row][col] !== BLACK_COLOR_ID) {
          ctx.fillStyle = COLOR_MAPPING[idBrick];
          ctx.fillRect(
            (col + 1) * BLOCK_SIZE,
            (row + 1) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
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
}

function handleDisplayCode(code) {
  if (code) {
    roomField.style.display = "none";
    gameField.style.display = "block";

    codeDisplay.textContent = code;
  }
}

const handleDisplayButton = (display) => {
  backButton.style.display = display;
  pauseButton.style.display = display;
  continueButton.style.display = display;
};
