console.log("JS is running");

// Board and speed settings live at the top so game timing is easy to tune later.
const COLS = 28;
const GHOST_TICK_MS = 500;
const PLAYER_TICK_MS = 180;
const INITIAL_PLAYER_POS = {row: 12, col: 9};
const DIRECTIONS = {
    up: {r: -1, c: 0},
    down: {r: 1, c: 0},
    left: {r: 0, c: -1},
    right: {r: 0, c: 1}
};
const STOPPED = {r: 0, c: 0};

// Each ghost keeps a name because the name doubles as its CSS class.
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
let playerTimerId = null;

let score = 0;
let totalDots = 0;
let playerPos = {...INITIAL_PLAYER_POS};
let playerDirection = {...STOPPED};
let queuedDirection = {...STOPPED};
let lastFacingDirection = {...DIRECTIONS.right};
let hasPlayerStarted = false;

// Possible values: "playing", "gameover", "win", and later "paused".
let gameState = "playing";

// The layout is a 1D map of the maze. 1 = wall, 0 = dot, 2 = empty path.
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
const touchControls = document.getElementById("touch-controls");

// -----------------------------
// Grid helpers
// -----------------------------

function getIndex(row, col) {
    return row * COLS + col;
}

// Pac-Man starts on an empty tile, not on a dot that reappears after he moves.
originalLayout[getIndex(INITIAL_PLAYER_POS.row, INITIAL_PLAYER_POS.col)] = 2;
layout = [...originalLayout];

// Count dots from the current layout so the win condition knows when the board is clear.
totalDots = layout.filter(tile => tile === 0).length;

function isInBounds(row, col) {
    return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function isWall(row, col) {
    return !isInBounds(row, col) || layout[getIndex(row, col)] === 1;
}

function canMoveFrom(position, direction) {
    const nextRow = position.row + direction.r;
    const nextCol = position.col + direction.c;

    return !isWall(nextRow, nextCol);
}

function getNeighbors(row, col) {
    return [
        {row: row - 1, col, move: {r: -1, c: 0}},
        {row: row + 1, col, move: {r: 1, c: 0}},
        {row, col: col - 1, move: {r: 0, c: -1}},
        {row, col: col + 1, move: {r: 0, c: 1}}
    ].filter(space => !isWall(space.row, space.col));
}

// -----------------------------
// Rendering
// -----------------------------

function createBoard() {
    gameBoard.innerHTML = "";
    cells.length = 0;

    // The DOM cells are created once. render() only changes classes after this.
    for (let i = 0; i < layout.length; i++) {
        const tile = document.createElement("div");
        cells.push(tile);
        gameBoard.appendChild(tile);
    }
}

function render() {
    const ghostPositions = new Map();

    // Map lookup is faster and cleaner than scanning every ghost for every cell.
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
    }
}

// -----------------------------
// Player input and movement
// -----------------------------

document.addEventListener("keydown", function(event) {
    if (!event.key.startsWith("Arrow")) return;

    event.preventDefault();

    if (event.key === "ArrowUp") {
        setPlayerDirection("up");
    }

    else if (event.key === "ArrowDown") {
        setPlayerDirection("down");
    }

    else if (event.key === "ArrowLeft") {
        setPlayerDirection("left");
    }

    else if (event.key === "ArrowRight") {
        setPlayerDirection("right");
    }
});

// Phone/tablet controls use the same direction system as the keyboard.
touchControls.addEventListener("pointerdown", function(event) {
    const button = event.target.closest("[data-direction]");

    if (!button) return;

    event.preventDefault();
    setPlayerDirection(button.dataset.direction);
});

function setPlayerDirection(directionName) {
    if (gameState !== "playing") return;

    const nextDirection = DIRECTIONS[directionName];

    if (!nextDirection) return;

    hasPlayerStarted = true;
    queuedDirection = {...nextDirection};
    lastFacingDirection = {...nextDirection};

    // If the turn is available right now, take it immediately.
    // Otherwise keep it queued, so Pac-Man turns when he reaches the opening.
    if (canMoveFrom(playerPos, queuedDirection)) {
        playerDirection = {...queuedDirection};
    }
}

function updatePlayerMovement() {
    if (gameState !== "playing") return;
    if (!hasPlayerStarted) return;

    // This lets a player press a direction slightly before reaching a corner.
    if (canMoveFrom(playerPos, queuedDirection)) {
        playerDirection = {...queuedDirection};
    }

    if (!canMoveFrom(playerPos, playerDirection)) return;

    movePlayer(playerDirection);
}

function movePlayer(direction) {
    if (gameState !== "playing") return;

    let newRow = playerPos.row + direction.r;
    let newCol = playerPos.col + direction.c;
    let newIndex = getIndex(newRow, newCol);

    if (isWall(newRow, newCol)) return;

    // Move first, then resolve dots/collisions on the new tile.
    playerPos.row = newRow;
    playerPos.col = newCol;

    if (layout[newIndex] === 0) {
        score += 10;
        totalDots--;
        layout[newIndex] = 2;
        updateScore();
    }

    if (totalDots === 0) {
        gameState = "win";
        setTimeout(() => alert("You Win!"), 100);
    }

    checkCollision();
    render();
}

// -----------------------------
// Ghost pathfinding and AI
// -----------------------------

// Shared pathfinder used by all ghosts, no matter which personality target they choose.
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

    // Breadth-first search checks reachable paths instead of guessing by distance.
    // If the exact target is outside a wall/path, the closest reachable tile is used.
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
    // Blinky: direct pressure, always targets Pac-Man's current tile.
    if (ghost.name === "blinky") {
        return {row: playerPos.row, col: playerPos.col};
    }

    // Pinky: ambushes by aiming ahead of Pac-Man's current facing direction.
    if (ghost.name === "pinky") {
        return {
            row: playerPos.row + lastFacingDirection.r * 4,
            col: playerPos.col + lastFacingDirection.c * 4
        };
    }

    // Inky: uses Blinky plus a point ahead of Pac-Man to create flanking behavior.
    if (ghost.name === "inky") {
        const blinky = ghosts.find(g => g.name === "blinky");

        const aheadRow = playerPos.row + lastFacingDirection.r * 2;
        const aheadCol = playerPos.col + lastFacingDirection.c * 2;

        const vectorRow = aheadRow - blinky.row;
        const vectorCol = aheadCol - blinky.col;

        return {
            row: aheadRow + vectorRow,
            col: aheadCol + vectorCol
        };
    }

    // Clyde: chases from far away, then retreats toward his corner when close.
    if (ghost.name === "clyde") {
        let dist = Math.abs(ghost.row - playerPos.row) + Math.abs(ghost.col - playerPos.col);

        if (dist > 6) {
            return {row: playerPos.row, col: playerPos.col};
        }

        return {row: 29, col: 0};
    }
}

// -----------------------------
// Collisions, modes, score, reset
// -----------------------------

// Move all ghosts once per ghost tick. Their targets depend on the current mode.
function moveGhosts() {
    if (gameState !== "playing") return;
    if (!hasPlayerStarted) return;

    for (let ghost of ghosts) {
        let target;

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

    // For now, touching any ghost ends the round.
    const hitGhost = ghosts.some(ghost =>
        ghost.row === playerPos.row && ghost.col === playerPos.col
    );

    if (hitGhost) {
        gameState = "gameover";
        setTimeout(() => alert("Game Over!"), 100);
    }
}

function getScatterTarget(ghost) {
    // Scatter mode gives every ghost a different corner target.
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

    // Simple scatter -> chase -> scatter loop. Power pellets can override this later.
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
    // Reset returns the board to a clean pre-start state.
    gameState = "playing";
    ghostMode = "chase";
    modeTimer = 0;

    score = 0;

    playerPos = {...INITIAL_PLAYER_POS};
    playerDirection = {...STOPPED};
    queuedDirection = {...STOPPED};
    lastFacingDirection = {...DIRECTIONS.right};
    hasPlayerStarted = false;

    layout = [...originalLayout];

    ghosts = structuredClone(originalGhosts);

    totalDots = layout.filter(tile => tile === 0).length;

    updateScore();
    render();
}

// -----------------------------
// Game loops
// -----------------------------

function startGameLoop() {
    if (ghostTimerId) {
        clearInterval(ghostTimerId);
    }
    if (playerTimerId) {
        clearInterval(playerTimerId);
    }

    playerTimerId = setInterval(updatePlayerMovement, PLAYER_TICK_MS);
    ghostTimerId = setInterval(() => {
        updateGhostMode();
        moveGhosts();
    }, GHOST_TICK_MS);
}

createBoard();
startGameLoop();
render(); //initialize the game screen
