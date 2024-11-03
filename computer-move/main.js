const { generateBestMove } = require('./generateBestMove');

function printBoard(board) {
    console.log("Current Board:");
    board.forEach(row => {
        console.log(row.map(piece => piece ? `${piece.color[0]}${piece.type === 'knight' ? 'n' : piece.type[0]}` : "--").join(" "));
    });
}

function applyMove(board, move) {
    const newBoard = JSON.parse(JSON.stringify(board));
    const { from, to } = move;
    const piece = newBoard[from.row][from.col];
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;

    // Pawn promotion
    if (piece.type === 'pawn') {
        const promotionRow = piece.color === 'white' ? 0 : board.length - 1;
        if (to.row === promotionRow) {
            // For simplicity, automatically promote to queen
            piece.type = 'queen';
            console.log(`${piece.color} pawn promoted to queen at (${to.row}, ${to.col})`);
        }
    }

    return newBoard;
}

// **New Function to Promote Pawns Already on Promotion Rank**
function promotePawns(board) {
    const promotionRow = {
        'white': 0,
        'black': board.length - 1
    };
    for (let col = 0; col < board[0].length; col++) {
        for (let color of ['white', 'black']) {
            const row = promotionRow[color];
            const piece = board[row][col];
            if (piece && piece.type === 'pawn' && piece.color === color) {
                piece.type = 'queen'; // Automatically promote to queen
                console.log(`${color} pawn promoted to queen at (${row}, ${col})`);
            }
        }
    }
}

function playMove(board, color) {
    // **Promote pawns before generating moves**
    promotePawns(board);

    console.log("Board before move:");
    printBoard(board);

    const bestMove = generateBestMove(board, color);

    if (bestMove) {
        console.log(`Best move for ${color}: from (${bestMove.from.row}, ${bestMove.from.col}) to (${bestMove.to.row}, ${bestMove.to.col})`);
        const newBoard = applyMove(board, bestMove);

        console.log("Board after move:");
        printBoard(newBoard);

        // Check if game is over
        const opponentColor = switchColor(color);
        if (isGameOver(newBoard, opponentColor)) {
            if (isKingInCheck(newBoard, opponentColor)) {
                console.log(`${color} wins by checkmate!`);
            } else {
                console.log(`Game is a stalemate!`);
            }
        } else if (generatePossibleMoves(newBoard, opponentColor).length === 0) {
            console.log(`No valid moves available for ${opponentColor}.`);
        } else {
            // Continue the game
            console.log(`Next turn: ${opponentColor}`);
        }

    } else {
        // No valid moves for current player
        console.log(`No valid moves available for ${color}.`);
        if (isKingInCheck(board, color)) {
            console.log(`${switchColor(color)} wins by checkmate!`);
        } else {
            console.log(`Game is a stalemate!`);
        }
    }
}

function isGameOver(board, color) {
    const opponentColor = switchColor(color);
    if (isKingInCheck(board, opponentColor) && generatePossibleMoves(board, opponentColor).length === 0) {
        // Checkmate
        return true;
    }
    if (!isKingInCheck(board, opponentColor) && generatePossibleMoves(board, opponentColor).length === 0) {
        // Stalemate
        return true;
    }
    return false;
}

function isKingInCheck(board, color) {
    let kingPosition = null;

    // Find the king's position
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                kingPosition = { row, col };
                break;
            }
        }
    }

    if (!kingPosition) {
        // King is captured
        return true;
    }

    // Check if any opponent's piece can capture the king
    const opponentColor = switchColor(color);
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];
            if (piece && piece.color === opponentColor) {
                const moves = getMovesForPiece(piece, { row, col }, board);
                for (const move of moves) {
                    if (move.to.row === kingPosition.row && move.to.col === kingPosition.col) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

function generatePossibleMoves(board, color) {
    const moves = [];
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            const piece = board[row][col];
            if (piece && piece.color === color) {
                moves.push(...getMovesForPiece(piece, { row, col }, board));
            }
        }
    }
    return moves;
}

function getMovesForPiece(piece, position, board) {
    const moves = [];
    const directions = {
        'pawn': piece.color === 'white' ? [[-1, 0]] : [[1, 0]], // Forward movement
        'rook': [[1, 0], [-1, 0], [0, 1], [0, -1]],
        'knight': [[-2, -1], [-2, 1], [2, -1], [2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2]],
        'bishop': [[1, 1], [1, -1], [-1, 1], [-1, -1]],
        'queen': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]],
        'king': [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]
    };

    const pieceDirections = directions[piece.type];

    if (piece.type === 'pawn') {
        const forward = pieceDirections[0];
        const newRow = position.row + forward[0];
        const newCol = position.col + forward[1];
        // Forward move
        if (isOnBoard(newRow, newCol, board) && !board[newRow][newCol]) {
            moves.push({ from: position, to: { row: newRow, col: newCol } });
        }
        // Captures
        const captures = piece.color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        for (const [dx, dy] of captures) {
            const captureRow = position.row + dx;
            const captureCol = position.col + dy;
            if (isOnBoard(captureRow, captureCol, board)) {
                const target = board[captureRow][captureCol];
                if (target && target.color !== piece.color) {
                    moves.push({ from: position, to: { row: captureRow, col: captureCol } });
                }
            }
        }
    } else if (piece.type === 'knight') {
        for (const [dx, dy] of pieceDirections) {
            const newRow = position.row + dx;
            const newCol = position.col + dy;
            if (isOnBoard(newRow, newCol, board)) {
                const target = board[newRow][newCol];
                if (!target || target.color !== piece.color) {
                    moves.push({ from: position, to: { row: newRow, col: newCol } });
                }
            }
        }
    } else {
        for (const [dx, dy] of pieceDirections) {
            let newRow = position.row + dx;
            let newCol = position.col + dy;
            while (isOnBoard(newRow, newCol, board)) {
                const target = board[newRow][newCol];
                if (!target) {
                    moves.push({ from: position, to: { row: newRow, col: newCol } });
                } else {
                    if (target.color !== piece.color) {
                        moves.push({ from: position, to: { row: newRow, col: newCol } });
                    }
                    break; // Can't move past occupied square
                }
                if (piece.type === 'king') {
                    break; // King moves only one square
                }
                newRow += dx;
                newCol += dy;
            }
        }
    }

    return moves;
}

function isOnBoard(row, col, board) {
    return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

function switchColor(color) {
    return color === 'white' ? 'black' : 'white';
}

// MinitChess 5x6 Threat Avoidance Scenario
const board = [
    // Row 0
    [null, null, null, { color: 'black', type: 'queen' }, { color: 'black', type: 'king' }],
    // Row 1
    [null, null, null, null, null],
    // Row 2
    [null, null, { color: 'white', type: 'rook' }, null, null],
    // Row 3
    [null, null, null, null, null],
    // Row 4
    [null, null, null, null, null],
    // Row 5
    [{ color: 'white', type: 'king' }, null, null, null, null]
];

const color = 'black';

playMove(board, color);
