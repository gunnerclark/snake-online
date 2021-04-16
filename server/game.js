const { gridSize } = require('./constants');

module.exports = {
    // createGameState,
    initGame,
    gameLoop,
    getUpdatedVelocity,
}
function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            // PLAYER 1
            // positon
            pos: {
                x: 3,
                y: 10,
            },
            // velocity
            vel: {
                x: 1, 
                y: 0,
            },
            // coordinates for every segment of the snake
            snake: [
                { x: 1, y: 10 },
                { x: 2, y: 10 },
                { x: 3, y: 10 },
            ], 
        },
        {
            // PLAYER 2
            // positon
            pos: {
                x: 18,
                y: 10,
            },
            // velocity
            vel: {
                x: 0, 
                y: 0,
            },
            // coordinates for every segment of the snake
            snake: [
                { x: 20, y: 10 },
                { x: 19, y: 10 },
                { x: 18, y: 10 },
            ], 
        }
    ],
        // coordinates of the food
        food: {},
        // game world's coordinate system (differs from screen pixels)
        gridSize: gridSize,
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    const playerOne = state.players[0];
    const playerTwo = state.players[1];
    
    // player 1 position
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    // player 2 position
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    // player 1 off screen
    if (playerOne.pos.x < 0 || playerOne.pos.x >= gridSize || playerOne.pos.y < 0 || playerOne.pos.y >= gridSize) {
        return 2;
    }
    // player 2 off screen
    if (playerTwo.pos.x < 0 || playerTwo.pos.x >= gridSize || playerTwo.pos.y < 0 || playerTwo.pos.y >= gridSize) {
        return 1;
    }

    // player 1 eat food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push( { ...playerOne.pos })
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        randomFood(state);
    }
    // player 2 eat food
    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        playerTwo.snake.push( { ...playerTwo.pos })
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        randomFood(state);
    }

    // player 1
    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }

        playerOne.snake.push({ ...playerOne.pos });
        playerOne.snake.shift();
    }
    // player 2
    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1;
            }
        }

        playerTwo.snake.push({ ...playerTwo.pos });
        playerTwo.snake.shift();
    }

    return false;
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
    }

    // player 1
    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
    // player 2
    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: {
            // left
            return { x: -1, y: 0 };
        }
        case 38: {
            // down
            return { x: 0, y: -1 };
        }
        case 39: {
            // right
            return { x: 1, y: 0 };
        }
        case 40: {
            // up
            return { x: 0, y: 1 };
        }
    }
}