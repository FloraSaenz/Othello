// 2D array representing the game board state
let board = [];
// Tracks whose turn it currently is
let currentPlayer = "black";

// Runs automatically when the page finishes loading
window.onload = function() {
    createBoard();
    initializeGame();
};

// Creates the 8×8 board in the DOM and initializes the board array
function createBoard() {
    let boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    for (let row = 0; row < 8; row++) {
        board[row] = [];
        for (let col = 0; col < 8; col++) {

            board[row][col] = null;

            let square = document.createElement("div");
            square.classList.add("square");
            square.dataset.row = row;
            square.dataset.col = col;

            // CLICK EVENT (place a piece)
            square.addEventListener("click", handleMove);

            // MOUSEOVER EVENT (hover highlight for squares)
            square.addEventListener("mouseover", highlightSquare);

            boardDiv.appendChild(square);
        }
    }
}

// Places the four starting pieces in the center of the board
function initializeGame() {
    board[3][3] = "white";
    board[3][4] = "black";
    board[4][3] = "black";
    board[4][4] = "white";

    renderBoard();
}

// Updates the visual board to match the board array
function renderBoard() {
    let squares = document.getElementsByClassName("square");

    for (let square of squares) {
        square.innerHTML = "";

        let row = square.dataset.row;
        let col = square.dataset.col;

        if (board[row][col] !== null) {
            let piece = document.createElement("div");
            piece.classList.add("piece");
            piece.classList.add(board[row][col]);

            square.appendChild(piece);
        }
    }

    updateScore();
}

// Handles a player's move when they click a square
function handleMove(event) {
    let row = parseInt(event.target.dataset.row);
    let col = parseInt(event.target.dataset.col);

    if (!isValidMove(row, col, currentPlayer)) {
        return; // Not a legal move so it rejects it
    }

    board[row][col] = currentPlayer;
    flipPieces(row, col);
    switchPlayer();
    renderBoard();

    checkGameEnd();
}

// Determines whether a move is legal according to Othello rules
function isValidMove(row, col, player) {
    // Cannot play on an occupied square
    if (board[row][col] !== null) return false;

    let opponent = player === "black" ? "white" : "black";

    // All 8 directions to check for flippable pieces
    let directions = [
        [0, 1], [0, -1],
        [1, 0], [-1, 0],
        [1, 1], [1, -1],
        [-1, 1], [-1, -1]
    ];

    // Check each direction for a valid capture pattern
    for (let dir of directions) {
        let r = row + dir[0];
        let c = col + dir[1];
        let foundOpponent = false;

        // Move outward until hitting edge or invalid pattern
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === opponent) {
                foundOpponent = true;
            } else if (board[r][c] === player) {
                // Valid only if opponent pieces were sandwiched
                if (foundOpponent) return true;
                break;
            } else {
                break; // Empty square breaks the chain
            }

            r += dir[0];
            c += dir[1];
        }
    }

    return false; // No valid direction
}

// Flips opponent pieces in all valid directions after a move
function flipPieces(row, col) {
    let opponent = currentPlayer === "black" ? "white" : "black";

    let directions = [
        [0, 1], [0, -1],
        [1, 0], [-1, 0],
        [1, 1], [1, -1],
        [-1, 1], [-1, -1]
    ];

    for (let dir of directions) {
        let r = row + dir[0];
        let c = col + dir[1];
        let piecesToFlip = []; // Stores pieces that might be flipped

        // Collecting opponent pieces
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (board[r][c] === opponent) {
                piecesToFlip.push([r, c]);
            } else if (board[r][c] === currentPlayer) {
                for (let piece of piecesToFlip) {
                    board[piece[0]][piece[1]] = currentPlayer;
                }
                break;
            } else {
                break; // Empty square stops the chain
            }

            r += dir[0];
            c += dir[1];
        }
    }
}

// Switches the active player, skipping turns if needed
function switchPlayer() {
    currentPlayer = currentPlayer === "black" ? "white" : "black";

    // If the next player has no valid moves, skip their turn
    if (!hasValidMove(currentPlayer)) {
        currentPlayer = currentPlayer === "black" ? "white" : "black";
    }

    // Update the UI text showing whose turn it is
    document.getElementById("turnText").textContent =
        "Current Turn: " + currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
}

// Checks whether a player has at least one legal move
function hasValidMove(player) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isValidMove(row, col, player)) {
                return true;
            }
        }
    }
    return false;
}

// Counts pieces and updates the score display
function updateScore() {
    let black = 0;
    let white = 0;

    for (let row of board) {
        for (let cell of row) {
            if (cell === "black") black++;
            if (cell === "white") white++;
        }
    }

    document.getElementById("scoreText").textContent =
        "Black: " + black + " | White: " + white;
}

// Highlights a square when hovered
function highlightSquare(event) {
    event.target.style.backgroundColor = "#4B006E";

    setTimeout(() => {
        event.target.style.backgroundColor = "";
    }, 200);
}

// Checks if the game is over (no valid moves for either player)
function checkGameEnd() {
    let blackCanMove = hasValidMove("black");
    let whiteCanMove = hasValidMove("white");

    if (!blackCanMove && !whiteCanMove) {
        let black = 0;
        let white = 0;

        for (let row of board) {
            for (let cell of row) {
                if (cell === "black") black++;
                if (cell === "white") white++;
            }
        }

        let winnerText = "";

        if (black > white) winnerText = "Black Wins!";
        else if (white > black) winnerText = "White Wins!";
        else winnerText = "It's a Draw!";

        showGameOver(winnerText);
    }
}

// Displays the game-over modal with the final result
function showGameOver(message) {
    let modal = document.getElementById("gameOverModal");
    let winnerText = document.getElementById("winnerText");

    winnerText.textContent = "Game Over! " + message;
    modal.style.display = "block";
}

// Resets the game to its initial state
function resetGame() {
    currentPlayer = "black";
    createBoard();
    initializeGame();
     document.getElementById("gameOverModal").style.display = "none";
}