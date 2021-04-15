const bgColor = '#231f20';
const snakeColor = '#c2c2c2';
const foodColor = '#e66916';

const socket = io('http://localhost:8080');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);

const gameScreen = document.getElementById('gameScreen');

let canvas, ctx;
let prevKeyCode = 39;

function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
}

function keydown(e) {
    const keyCode = parseInt(e.keyCode);
    // prevents snake from going back on itself
    if (prevKeyCode !== (keyCode + 2)) {
        if (prevKeyCode !== (keyCode -2)) {
            socket.emit('keydown', e.keyCode);
            prevKeyCode = keyCode;

        }
    }
}

init();

function paintGame(state) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize;

    ctx.fillStyle = foodColor;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    paintPlayer(state.player, size, snakeColor);
}

function paintPlayer(playerState, size, color) {
    const snake = playerState.snake;

    ctx.fillStyle = color;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);
    }
}

function handleInit(msg) {
    console.log(msg);
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver() {
    alert('You Lose!');
}