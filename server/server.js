// imports function
const io = require('socket.io')({
    cors: {
        origin: "*",
    }
});
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { frameRate } = require('./constants');
const { makeId } = require('./utils');

// global state object to hold the state of all possible rooms
const state = {};
// look-up table for looking up the room name of a particular id { 'client.id': 'roomName' }
const clientRooms = {};

// client object to communicate back to the client that has connected
io.on('connection', client => {
    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        //console.log(roomName);
        // find room with room name
        const room = io.sockets.adapter.rooms.get(roomName);

        let allUsers;
        if (room) {
            // object of all current users in the room
            allUsers = io.sockets.adapter.rooms.get(roomName).size;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = allUsers;
            console.log('client number: ' + numClients);
        }

        if (numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 1) {
            client.emit('tooManyPlayers');
            return;
        }

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);

        startGameInterval(roomName);
    }

    function handleNewGame() {
        // generate socket.io room for players to join in
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        console.log('client.id: ');
        console.log(client.id);
        
        // generate room name and send it back to client
        state[roomName] = initGame();
        
        // client connect to room
        client.join(roomName);
        // player 1, created the room
        client.number = 1;
        // send back the current player so the front-end knows who the player is
        client.emit('init', 1);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        // 0 continue playing, 1 player 1 wins, 2 player 2 wins
        const winner = gameLoop(state[roomName]);
        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / frameRate)
}

function emitGameState(room, gameState) {
    // emit to all clients in roomName
    io.sockets.in(room).emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
    // emit to all clients in roomName
    io.sockets.in(room).emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 8080);