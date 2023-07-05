const socket = io(SOCKET_URL);

const roomField = document.querySelector(".room-field");
const inputCode = document.querySelector(".code");
const btnSubmit = document.querySelector(".submit-btn");
const btnCreate = document.querySelector(".create-btn");
const gameField = document.querySelector(".game-container");
const codeDisplay = document.querySelector("#gameCodeDisplay");
const endGameDisplay = document.querySelector(".end-game");
const endGameTextDisplay = document.querySelector(".end-text");

const initPlayerName = localStorage.getItem("name");

//handle play again or outgame
const btnAgain = document.querySelector(".again-btn");
const btnOut = document.querySelector(".close-btn");

const player = new Player(document);
let playerLocal = player.createPlayer();

let myselfId;
let partnerIdList = [];

let roomCode;
let isReady = false;
let refresh;
let over = false;

let myselfName;
let partnerName;
let partnerNameList = [];
let partnerStateObject = {};

document.querySelector(".player-name").value = initPlayerName;

btnAgain.addEventListener("click", () => {
  endGameDisplay.style.display = "none";
  document.querySelector(".btn.myself").style.display = "block";
});

// fetch(NODEJS_URL + `/render/name`)
//   .then((res) => res.json())
//   .then((result) => {
//     myselfName = result.name;
//   })
//   .catch((error) => console.log("error:", error));

playerLocal.element.querySelectorAll("canvas")[0].style.border =
  "solid 5px orange";

const client = new Map();

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

//Create room
btnCreate.addEventListener("click", () => {
  const playerName = document.querySelector(".player-name").value;
  if (!playerName) {
    return alert("Xin quy vi va cac ban vui long nhap ten vo gium");
  }
  if (initPlayerName || initPlayerName !== playerName) {
    localStorage.setItem("name", playerName);
  }
  myselfName = document.querySelector(".player-name").value;
  playerLocal.element.querySelector(".username").textContent = myselfName;
  console.log(inputCode.value);
  socket.emit("createRoom", myselfName, inputCode.value);

  socket.on("roomName", (roomName) => {
    handleDisplayCode(roomName);
    roomCode = roomName;
  });
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
socket.on("initJoin", (id, roomInfo) => {
  if (!myselfId) {
    myselfId = id;
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

  handleDisplayCode(roomCode);
});

//Update game
socket.on("updateState", (data, changeplayerId) => {
  if (!partnerIdList.includes(data.userName)) {
    partnerNameList.push(data.userName);
  }

  partnerStateObject[changeplayerId] = data;
});

function handleUpdateState(code) {
  const state = {
    userName: myselfName,
    isReady: isReady,
    isOver: over,
    matrix: playerLocal.board.exchangeData,
    nextBrick: [playerLocal.brick.layout[0], playerLocal.brick.id],
    score: playerLocal.board.score,
    atk: playerLocal.board.myAtk,
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

//Handle some event
socket.on("deleteButton", (playerReadyId) => {
  client
    .get(playerReadyId)
    .element.querySelectorAll("button")[0].style.display = "none";
  client.get(playerReadyId).element.querySelectorAll("span")[2].textContent =
    "READY...";
});

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

document.querySelector(".play-btn").addEventListener("click", () => {
  isReady = true;

  document.querySelector(".myself").style.display = "none";
  handleUpdateState(roomCode);

  socket.emit("ready", roomCode);
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

  refresh = setInterval(() => {
    if (!playerLocal.board.gameOver) {
      playerLocal.nextBrick.moveDown();
      handleUpdateState(roomCode);
    } else {
      clearInterval(refresh);

      isReady = false;
      endGameDisplay.style.display = "flex";
      endGameTextDisplay.textContent = "LOSE";
      over = true;
      handleUpdateState(roomCode);
      socket.emit("gameOver", roomCode);
      playerLocal.board.reset();
    }
  }, 500);

  //Handle end game
  socket.on("informOver", () => {
    if (!over) {
      clearInterval(refresh);
      isReady = false;
      endGameDisplay.style.display = "flex";
      endGameTextDisplay.textContent = "WIN";
      playerLocal.board.reset();
    }

    //call API
    // const request = async () => {
    //   await fetch(NODEJS_URL + `/render/name`)
    //     .then((res) => res.json())
    //     .then((result) => {
    //       fetch(`${NODEJS_URL}/auth/score`, {
    //         method: "PUT",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Accept: "application/json",
    //         },
    //       })
    //         .then(() => console.log("Hello"))
    //         .catch((error) => console.log("error:", error));
    //     })
    //     .catch((error) => console.log("error:", error));
    // };

    // if (over && !partnerNameList.includes(myselfName)) {
    //   request();
    // }
    handleUpdateState(roomCode);
  });
}

document.addEventListener("keydown", (e) => {
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
