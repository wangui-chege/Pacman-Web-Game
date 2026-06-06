console.log("JS is running");

const originalGhosts = [
    {name: "blinky", row: 14, col: 12, color: "red", behavior: "chase"},
    {name: "pinky", row: 14, col: 15, color: "pink", behavior: "ambush"},
    {name: "inky", row: 15, col: 12, color: "cyan", behavior: "flank"},
    {name: "clyde", row: 15, col: 15, color: "orange", behavior: "scatter"}
];
let ghosts = structuredClone(originalGhosts);
let score = 0;
let gameOver = false;
let totalDots = 0;
let playerDirection = {r: 0, c: 1};

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

//the whole game is scanned and the total number of dots is recorded
totalDots = layout.filter(tile => tile === 0).length;

const gameBoard = document.getElementById("game-board"); 

function render() {
    gameBoard.innerHTML = "";

    for (let i = 0; i < layout.length; i++) {
        const tile = document.createElement("div");

        let row = Math.floor(i / 28);
        let col = i % 28;
        let ghostHere = ghosts.find(
            g => g.row === row && g.col === col
        );

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

let playerPos = {
    row: 12,
    col: 9
};

document.addEventListener("keydown", function(event) {

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
    if (gameOver) return;

    let newRow = playerPos.row + rowChange;
    let newCol = playerPos.col + colChange;
    let newIndex = newRow * 28 + newCol;

    if (
        newRow < 0 ||
        newRow >= 30 ||
        newCol < 0 ||
        newCol >= 28
    ) return;

    // wall check
    if (layout[newIndex] === 1) return;

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
        gameOver = true;
        setTimeout(() => alert("You Win!"), 100);
    }

    render();
}

//one AI system that all ghosts use, the common movement
function getBestMove(ghost, targetRow, targetCol) {
    let moves = [
        {r: -1, c: 0},
        {r: 1, c: 0},
        {r: 0, c: -1},
        {r: 0, c: 1}
    ];

    let bestMove = null;
    let bestDistance = Infinity;

    for (let move of moves) {
        let newRow = ghost.row + move.r;
        let newCol = ghost.col + move.c;
        let index = newRow * 28 + newCol;

        if (layout[index] === 1) continue;
        if (
            newRow < 0 ||
            newRow >= 30 ||
            newCol < 0 ||
            newCol >= 28
        ) continue;

        let distance = Math.abs(newRow - targetRow) + Math.abs(newCol - targetCol);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestMove = move;
        }
    }

    return bestMove;
}

//blinky's movement is that she chases pacdot 
//for that, blinky is supposed to move to where pacdot is
function blinkyTarget() {
    return {
        row: playerPos.row, 
        col: playerPos.col
    };
}

//wants to cut poor pacdot off
//targets space 4 tiles ahead of pacdot
function pinkyTarget() {
    return {
        row: playerPos.row + playerDirection.r * 4,
        col: playerPos.col + playerDirection.c * 4
    };
}

//movements are unpredictable
//calculated using both blinky's and pacdot's positions
function inkyTarget() {
    let aheadRow = playerPos.row + playerDirection.r * 2;
    let aheadCol = playerPos.col + playerDirection.c * 2;

    let blinky = ghosts.find(g => g.name === "blinky");

    return {
        row: aheadRow + (aheadRow - blinky.row),
        col: aheadCol + (aheadCol - blinky.col)
    };
}

//chases pacdot till he gets close
//goes back to bottom left corner after that
function clydeTarget(clyde) {
    let distance = Math.abs(clyde.row - playerPos.row) + Math.abs(clyde.col - playerPos.col);

    if (distance > 6) {
        return {row: playerPos.row, col: playerPos.col };
    }
    else {
        return {row: 29, col: 1}; //bottom left corner
    }
}

//the method that moves ALL ghosts ehehe
function moveGhosts() {
    for (let ghost of ghosts) {
        if (gameOver) return;
        let target;

        if (ghost.name === "blinky") target = blinkyTarget();
        if (ghost.name === "pinky") target = pinkyTarget();
        if (ghost.name === "inky") target = inkyTarget();
        if (ghost.name === "clyde") target = clydeTarget(ghost);

        let move = getBestMove(ghost, target.row, target.col);

        if (move) {
            ghost.row += move.r;
            ghost.col += move.c;
        }

        //collision with player results in player losing
        if (ghost.row === playerPos.row && ghost.col === playerPos.col) {
            gameOver = true;
            alert("Game Over!");
        }
    }

    render();
}

function updateScore() {
    document.getElementById("score").innerText = "Score: " + score;
}
updateScore();

document.getElementById("reset-btn").addEventListener("click", resetGame);

function resetGame() {

    score = 0;
    gameOver = false;

    playerPos = {
        row: 12,
        col: 9
    };

    layout = [...originalLayout];

    ghosts = structuredClone(originalGhosts);

    totalDots = layout.filter(tile => tile === 0).length;

    playerDirection = {r: 0, c: 1};

    updateScore();
    render();
}

setInterval(moveGhosts, 500);

render(); //initialize the game screen