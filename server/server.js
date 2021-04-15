// imports function
const io = require('socket.io')({
    cors: {
        origin: "http://localhost:3000",
    }
});
const { createGameState, gameLoop, getUpdatedVelocity } = require('./game');
const { frameRate } = require('./constants');

// client object to communicate back to the client that has connected
io.on('connection', client => {
    const state = createGameState();

    client.on('keydown', handleKeydown);

    function handleKeydown(keyCode) {
        try {
            keyCode = parseInt(keyCode);
        } catch(e) {
            console.error(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state.player.vel = vel;
        }
    }

    startGameInterval(client, state);
});

function startGameInterval(client, state) {
    const intervalId = setInterval(() => {
        // 0 continue playing, 1 player 1 wins, 2 player 2 wins
        const winner = gameLoop(state);
        if (!winner) {
            client.emit('gameState', JSON.stringify(state));
        } else {
            client.emit('gameOver');
            clearInterval(intervalId);
        }
    }, 1000 / frameRate)
}

io.listen(8080);