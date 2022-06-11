const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
require("dotenv").config();

const {
    makeid
} = require('./utils/makeid');

const io = require("socket.io")(8900, {
    cors: {
        origin: "*"
    },
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        maxAge: 60 * 60 * 24 * 7 * 1000
    }
}));

const authRouter = require("./app/routes/auth");
const siteRouter = require("./app/routes/site");
const renderRouter = require("./app/routes/render");

mongoose.connect(process.env.DB_URL)
    .then(() => console.log("connected database"))
    .catch(e => console.log(e))

app.use(express.static("src"));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

function createState() {
    return {
        userName: null,
        isReady: false,
        matrix: [],
        nextBrick: [],
        score: 0,
        atk: 0
    }
}

const clientRooms = new Map;
const state = new Map;
global.room = [];


io.on('connection', client => {

    client.on('createRoom', handleCreate);
    client.on('joinRoom', handleJoin);
    client.on('playGame', handlePlayGame);
    client.on('ready', handleReady);
    client.on('gameOver', handleGameOver);

    function handleGameOver(code) {
        client.to(code).emit('informOver');
    }

    function handleReady(code) {
        client.to(code).emit('deleteButton');

        let numReady = 0;
        const array = state.get(code);
        if (array) {
            array.forEach(data => {
                if (data.state.isReady === true) {
                    numReady += 1;
                }
            })
        }

        if (numReady === 2) {
            io.to(code).emit('allUserReady');
        }
    }

    function handlePlayGame(data) {
        if (state.has(data.roomName)) {
            state.get(data.roomName).forEach(array => {
                if (array.id === data.id) {
                    array.state = data.state;
                    client.to(data.roomName).emit('updateState', array.state);
                }
            })
        }

    }

    function handleJoin(roomName) {
        const room = io.sockets.adapter.rooms;

        const numClients = room.get(roomName) ? room.get(roomName).size : 0;

        if (!numClients || numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms.set(roomName, [client.id, ...clientRooms.get(roomName)]);

        // console.log(clientRooms);

        state.set(roomName, [{
            id: client.id,
            state: createState()
        }, ...state.get(roomName)])

        // console.log(state);

        client.join(roomName);
        client.number = 2;
        io.to(roomName).emit('initJoin', client.id, clientRooms.get(roomName));
    }

    function handleCreate() {
        let roomName = makeid(5);

        global.room.push(roomName);

        clientRooms.set(roomName, [client.id]);
        client.emit('gameCode', roomName);

        state.set(roomName, [{
            id: client.id,
            state: createState()
        }])

        client.join(roomName);
        client.number = 1;
        client.emit('init', client.id);

        client.emit('roomName', roomName);
    }

    client.conn.on('close', () => {
        const roomName = getRoomName(state, client.id);

        global.room = global.room.filter(room => room != roomName);

        client.to(roomName).emit("playerOut", client.id);

        if (roomName) {
            if (state.get(roomName)) {
                if (state.get(roomName).length > 1) {
                    state.set(roomName, state.get(roomName).filter(data => data.id !== client.id));
                    clientRooms.set(roomName, clientRooms.get(roomName).filter(data => data !== client.id));
                } else {
                    state.delete(roomName);
                    clientRooms.delete(roomName);
                }
            }
        }

    })

    function getRoomName(map) {
        for (let [key, value] of state.entries()) {
            for (item of value) {
                if (item.id === client.id) {
                    return key;
                }
            }
        }
    }
})

app.use("/", siteRouter);
app.use("/auth", authRouter);
app.use("/render", renderRouter);

app.listen(3000, () => {
    console.log("Backend already!")
})