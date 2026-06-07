console.log("JS is running");

const COLS = 28;
const TICK_MS = 500;
const INITIAL_PLAYER_POS = {row: 12, col: 9};

const originalGhosts = [
    {name: "blinky", row: 14, col: 12, color: "red", behavior: "chase"},
    {name: "pinky", row: 14, col: 15, color: "pink", behavior: "ambush"},
    {name: "inky", row: 15, col: 12, color: "cyan", behavior: "flank"},
    {name: "clyde", row: 15, col: 15, color: "orange", behavior: "scatter"}
];
let ghosts = structuredClone(originalGhosts);
let ghostMode = "chase";
let modeTimer = 0;
let ghostTimerId = null;

let score = 0;
let totalDots = 0;
let playerDirection = {r: 0, c: 1};
let playerPos = {...INITIAL_PLAYER_POS};

//there can be "playing", "gameover", "win", "paused"
let gameState = "playing";

//this array maps out the whole map, 1 being a wall, 0 being a dot and 2 being empty space
let layout = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 2, 2, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
];

const originalLayout = [...layout];
const ROWS = layout.length / COLS;

const gameBoard = document.getElementById("game-board"); 
const scoreDisplay = document.getElementById("score");
const cells = [];

function getIndex(row, col) {
    return row * COLS + col;
}

originalLayout[getIndex(INITIAL_PLAYER_POS.row, INITIAL_PLAYER_POS.col)] = 2;
layout = [...originalLayout];

//the whole game is scanned and the total number of dots is recorded
totalDots = layout.filter(tile => tile === 0).length;

function isInBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function isWall(row, col) {
    return !isInBounds(row, col) || layout[getIndex(row, col)] === 1;
}

function getNeighbors(row, col) {
    return [
        {row: row - 1, col, move: {r: -1, c: 0}},
        {row: row + 1, col, move: {r: 1, c: 0}},
        {row, col: col - 1, move: {r: 0, c: -1}},
        {row, col: col + 1, move: {r: 0, c: 1}}
    ].filter(space => !isWall(space.row, space.col));
}

function createBoard() {
    gameBoard.innerHTML = "";
    cells.length = 0;

    for (let i = 0; i < layout.length; i++) {
        const tile = document.createElement("div");
        cells.push(tile);
        gameBoard.appendChild(tile);
    }
}

function render() {
    const ghostPositions = new Map();

    for (const ghost of ghosts) {
        ghostPositions.set(
            `${ghost.row},${ghost.col}`,
            ghost
        );
    }

    for (let i = 0; i < layout.length; i++) {
        const tile = cells[i];
        const row = Math.floor(i / COLS);
        const col = i % COLS;
        const ghostHere = ghostPositions.get(`${row},${col}`);

        tile.className = "";

        if (row === playerPos.row && col === playerPos.col) {
            tile.classList.add("player");
        }
        else if (ghostHere) {
            tile.classList.add(ghostHere.name);
        }
        else if (layout[i] === 1) {
            tile.classList.add("wall");
        }
        else if (layout[i] === 0) {
            tile.classList.add("dot");
        }
        else {
            tile.classList.add("empty");
        }

        gameBoard.appendChild(tile);
    }
}

document.addEventListener("keydown", function(event) {
    if (!event.key.startsWith("Arrow")) return;

    event.preventDefault();

    if (event.key === "ArrowUp") {
        playerDirection = {r: -1, c: 0};
        movePlayer(-1, 0);
    }

    else if (event.key === "ArrowDown") {
        playerDirection = {r: 1, c: 0};
        movePlayer(1, 0);
    }

    else if (event.key === "ArrowLeft") {
        playerDirection = {r: 0, c: -1};
        movePlayer(0, -1);
    }

    else if (event.key === "ArrowRight") {
        playerDirection = {r: 0, c: 1};
        movePlayer(0, 1);
    }
});

function movePlayer(rowChange, colChange) {
    if (gameState !== "playing") return;

    let newRow = playerPos.row + rowChange;
    let newCol = playerPos.col + colChange;
    let newIndex = getIndex(newRow, newCol);

    if (isWall(newRow, newCol)) return;

    // move player
    playerPos.row = newRow;
    playerPos.col = newCol;

    // eat dot
    if (layout[newIndex] === 0) {
        score += 10;
        totalDots--;
        layout[newIndex] = 2; // dot disappears permanently
        updateScore();
    }

    // win condition
    if (totalDots === 0) {
        gameState = "win";
        setTimeout(() => alert("You Win!"), 100);
    }

    checkCollision();
    render();
}

//one AI system that all ghosts use, the common movement
function getBestMove(ghost, targetRow, targetCol) {
    if (gameState !== "playing") return;

    const target = {
        row: Math.max(0, Math.min(ROWS - 1, targetRow)),
        col: Math.max(0, Math.min(COLS - 1, targetCol))
    };
    const startKey = `${ghost.row},${ghost.col}`;
    const queue = [{row: ghost.row, col: ghost.col, firstMove: null}];
    const visited = new Set([startKey]);
    let closest = null;
    let closestDistance = Infinity;

    for (let head = 0; head < queue.length; head++) {
        const current = queue[head];
        const distance = Math.abs(current.row - target.row) + Math.abs(current.col - target.col);

        if (distance < closestDistance) {
            closestDistance = distance;
            closest = current;
        }

        if (current.row === target.row && current.col === target.col) {
            return current.firstMove;
        }

        for (const next of getNeighbors(current.row, current.col)) {
            const key = `${next.row},${next.col}`;

            if (visited.has(key)) continue;

            visited.add(key);
            queue.push({
                row: next.row,
                col: next.col,
                firstMove: current.firstMove || next.move
            });
        }
    }

    return closest ? closest.firstMove : null;
}

function getChaseTarget(ghost) {
    if (ghost.name === "blinky") {
        return {row: playerPos.row, col: playerPos.col};
    }

    if (ghost.name === "pinky") {
        return {
            row: playerPos.row + playerDirection.r * 4,
            col: playerPos.col + playerDirection.c * 4
        };
    }

    if (ghost.name === "inky") {
        const blinky = ghosts.find(g => g.name === "blinky");

        const aheadRow = playerPos.row + playerDirection.r * 2;
        const aheadCol = playerPos.col + playerDirection.c * 2;

        const vectorRow = aheadRow - blinky.row;
        const vectorCol = aheadCol - blinky.col;

        return {
            row: aheadRow + vectorRow,
            col: aheadCol + vectorCol
        };
    }

    if (ghost.name === "clyde") {
        let dist = Math.abs(ghost.row - playerPos.row) + Math.abs(ghost.col - playerPos.col);

        if (dist > 6) {
            return {row: playerPos.row, col: playerPos.col};
        }

        return {row: 29, col: 0};
    }
}

//the method that moves ALL ghosts ehehe
function moveGhosts() {
    if (gameState !== "playing") return;

    for (let ghost of ghosts) {
        let target;

        // MODE AFFECTS BEHAVIOR
        if (ghostMode === "scatter") {
            target = getScatterTarget(ghost);
        } else {
            target = getChaseTarget(ghost);
        }

        let move = getBestMove(ghost, target.row, target.col);

        if (move) {
            ghost.row += move.r;
            ghost.col += move.c;
        }

        checkCollision();

        if (gameState !== "playing") break;
    }

    render();
}

function checkCollision() {
    if (gameState !== "playing") return;

    const hitGhost = ghosts.some(ghost =>
        ghost.row === playerPos.row && ghost.col === playerPos.col
    );

    if (hitGhost) {
        gameState = "gameover";
        setTimeout(() => alert("Game Over!"), 100);
    }
}

function getScatterTarget(ghost) {
    switch (ghost.name) {
        case "blinky":
            return {row: 0, col: 27}; // top-right
        case "pinky":
            return {row: 0, col: 0}; // top-left
        case "inky":
            return {row: 29, col: 27}; // bottom-right
        case "clyde":
            return {row: 29, col: 0}; // bottom-left
    }
}

function updateGhostMode() {
    if (gameState !== "playing") return;

    modeTimer++;

    // scatter → chase → scatter loop
    if (modeTimer === 14)
    {
        ghostMode = "scatter";
    }

    if (modeTimer === 21)
    {
        ghostMode = "chase";
        modeTimer = 0;
    }
}

function updateScore() {
    scoreDisplay.innerText = "Score: " + score;
}
updateScore();

document.getElementById("reset-btn").addEventListener("click", resetGame);

function resetGame() {
    gameState = "playing";
    ghostMode = "chase";
    modeTimer = 0;

    score = 0;

    playerPos = {...INITIAL_PLAYER_POS};
    playerDirection = {r: 0, c: 1};

    layout = [...originalLayout];

    ghosts = structuredClone(originalGhosts);

    totalDots = layout.filter(tile => tile === 0).length;

    updateScore();
    render();
}

function startGameLoop() {
    if (ghostTimerId) {
        clearInterval(ghostTimerId);
    }

    ghostTimerId = setInterval(() => {
        updateGhostMode();
        moveGhosts();
    }, TICK_MS);
}

createBoard();
startGameLoop();
render(); //initialize the game screen