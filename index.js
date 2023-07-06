var PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();
var http = require("http").createServer(app);
// const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const { makeid } = require("./utils/makeid");

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "webgame",
    resave: true,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 24 * 7 * 1000,
    },
  })
);

// const authRouter = require("./app/routes/auth");
const siteRouter = require("./app/routes/site");
const renderRouter = require("./app/routes/render");

// mongoose
//   .connect(process.env.DB_URL)
//   .then(() => console.log("connected database"))
//   .catch((e) => console.log(e));

app.use(express.static("src"));

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

function createState() {
  return {
    userName: null,
    isReady: false,
    matrix: [],
    nextBrick: [],
    score: 0,
    atk: 0,
  };
}

const clientRooms = new Map();
const state = new Map();
const modeMap = new Map();
global.room = [];

io.on("connection", (client) => {
  console.log("socket on");

  client.on("createRoom", handleCreate);
  client.on("joinRoom", handleJoin);
  client.on("playGame", handlePlayGame);
  client.on("ready", handleReady);
  client.on("gameOver", handleGameOver);

  function handleGameOver(code) {
    const room = io.sockets.adapter.rooms;
    const numClients = room.get(code) ? room.get(code).size : 0;
    let numOver = 0;
    const array = state.get(code);
    if (array) {
      array.forEach((data) => {
        if (data.state.isOver === true) {
          numOver += 1;
        }
      });
    }
    if (array && numOver === numClients - 1) {
      client.to(code).emit("informOver");
    }
  }

  function handleReady(code) {
    client.to(code).emit("deleteButton", client.id);

    let numReady = 0;
    const array = state.get(code);
    if (array) {
      array.forEach((data) => {
        if (data.state.isReady === true) {
          numReady += 1;
        }
      });
    }

    if (array && numReady === array.length) {
      io.to(code).emit("allUserReady");
    }
  }

  function handlePlayGame(data) {
    if (state.has(data.roomName)) {
      state.get(data.roomName).forEach((array) => {
        if (array.id === data.id) {
          array.state = data.state;
          client.to(data.roomName).emit("updateState", array.state, array.id);
        }
      });
    }
  }

  function handleJoin(roomName, playerName) {
    const room = io.sockets.adapter.rooms;

    const numClients = room.get(roomName) ? room.get(roomName).size : 0;

    if (!numClients || numClients === 0) {
      client.emit("unknownCode");
      return;
    }

    clientRooms.set(roomName, [client.id, ...clientRooms.get(roomName)]);

    state.set(roomName, [
      {
        id: client.id,
        name: playerName,
        state: createState(),
      },
      ...state.get(roomName),
    ]);

    client.join(roomName);
    client.number = numClients + 1;
    io.to(roomName).emit(
      "initJoin",
      client.id,
      state.get(roomName),
      modeMap.get(roomName)
    );
  }

  function handleCreate(playerName, code, mode) {
    let roomName = code ? code : makeid(5);

    global.room.push(roomName);

    clientRooms.set(roomName, [client.id]);
    client.emit("gameCode", roomName);

    state.set(roomName, [
      {
        id: client.id,
        name: playerName,
        state: createState(),
      },
    ]);

    modeMap.set(roomName, mode);

    client.join(roomName);
    client.number = 1;

    client.emit("init", client.id);

    client.emit("roomName", roomName);
  }

  client.conn.on("close", () => {
    const roomName = getRoomName(state, client.id);

    global.room = global.room.filter((room) => room != roomName);

    client.to(roomName).emit("playerOut", client.id);

    if (roomName) {
      if (state.get(roomName)) {
        if (state.get(roomName).length > 1) {
          state.set(
            roomName,
            state.get(roomName).filter((data) => data.id !== client.id)
          );
          clientRooms.set(
            roomName,
            clientRooms.get(roomName).filter((data) => data !== client.id)
          );
        } else {
          state.delete(roomName);
          clientRooms.delete(roomName);
        }
      }
    }
  });

  function getRoomName(map) {
    for (let [key, value] of state.entries()) {
      for (item of value) {
        if (item.id === client.id) {
          return key;
        }
      }
    }
  }
});

app.use("/", siteRouter);
// app.use("/auth", authRouter);
app.use("/render", renderRouter);

// app.listen(PORT, () => {
//     console.log("Backend already on port: " + PORT)
// })

http.listen(process.env.PORT || 3000, function () {
  var host = http.address().address;
  var port = http.address().port;
  console.log("App listening at http://%s:%s", host, port);
});
