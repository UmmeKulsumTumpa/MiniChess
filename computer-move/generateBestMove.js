const MAX_DEPTH = 3; // Depth limit for IDDFS, increase as needed

function generateBestMove(board, color) {
    let bestMove = null;

    // **Promote pawns before generating moves**
    promotePawns(board);

    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
        bestMove = iterativeDeepening(board, color, depth);
    }

    return bestMove;
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
            }
        }
    }
}

function iterativeDeepening(board, color, maxDepth) {
    let bestMove = null;
    let bestScore = color === 'white' ? -Infinity : Infinity;

    const moves = generatePossibleMoves(board, color);
    if (moves.length === 0) {
        return null;
    }

    for (const move of moves) {
        const newBoard = applyMove(board, move);
        const score = depthLimitedSearch(newBoard, switchColor(color), 1, maxDepth, -Infinity, Infinity);

        if (color === 'white' && score > bestScore) {
            bestScore = score;
            bestMove = move;
        } else if (color === 'black' && score < bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

function depthLimitedSearch(board, color, depth, maxDepth, alpha, beta) {
    if (isGameOver(board, switchColor(color))) {
        // Game is over
        if (isKingInCheck(board, color)) {
            // The current player is in checkmate
            return color === 'white' ? -Infinity : Infinity;
        } else {
            // Stalemate
            return 0;
        }
    }

    if (depth === maxDepth) {
        return evaluateBoard(board, color);
    }

    const moves = generatePossibleMoves(board, color);
    if (moves.length === 0) {
        // No moves available
        if (isKingInCheck(board, color)) {
            // Checkmate
            return color === 'white' ? -Infinity : Infinity;
        } else {
            // Stalemate
            return 0;
        }
    }

    let bestScore = color === 'white' ? -Infinity : Infinity;

    for (const move of moves) {
        const newBoard = applyMove(board, move);
        const score = depthLimitedSearch(newBoard, switchColor(color), depth + 1, maxDepth, alpha, beta);

        if (color === 'white') {
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);
        } else {
            bestScore = Math.min(bestScore, score);
            beta = Math.min(beta, bestScore);
        }

        if (beta <= alpha) {
            break; // Alpha-beta pruning
        }
    }

    return bestScore;
}

// Basic board evaluation based on material count
function evaluateBoard(board, color) {
    let score = 0;
    const pieceValues = { 'pawn': 1, 'rook': 5, 'knight': 3, 'bishop': 3, 'queen': 9, 'king': 1000 };

    for (const row of board) {
        for (const piece of row) {
            if (piece) {
                const value = pieceValues[piece.type];
                score += piece.color === color ? value : -value;
            }
        }
    }
    return score;
}

// Generate possible moves for each piece on the board
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

// Get possible moves for a specific piece
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

// Apply a move to generate a new board
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
            // Automatically promote to queen
            piece.type = 'queen';
        }
    }

    return newBoard;
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

function switchColor(color) {
    return color === 'white' ? 'black' : 'white';
}

module.exports = { generateBestMove };
