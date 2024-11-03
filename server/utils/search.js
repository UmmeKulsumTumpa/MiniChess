// search.js
const gameRules = require("./gameRules");

function cloneBoard(board) {
  return board.map(row => [...row]);
}

function performMove(from, to, board) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  board[x1][y1] = "";
  board[x2][y2] = piece;

  return board;
}

function isTerminal(board, color, lastMove) {
  if (gameRules.isCheckmate(board, color, lastMove)) {
    return { terminal: true, winner: color === gameRules.WHITE ? gameRules.BLACK : gameRules.WHITE };
  }

  if (gameRules.isStalemate(board, color, lastMove)) {
    return { terminal: true, winner: null };
  }

  return { terminal: false };
}

function iddfs(board, color, lastMove, maxDepth = 4) {
  for (let depth = 1; depth <= maxDepth; depth++) {
    const result = dfs(board, color, lastMove, depth, new Set());
    if (result) {
      return result;
    }
  }
  return null;
}

function dfs(board, color, lastMove, depth, visited) {
  if (depth === 0) {
    return null;
  }

  const terminal = isTerminal(board, color, lastMove);
  if (terminal.terminal) {
    if (terminal.winner === color) {
      return null; // Current player has lost
    } else if (terminal.winner === null) {
      return null; // Stalemate
    }
  }

  const possibleMoves = getAllPossibleMoves(board, color, lastMove);

  for (const move of possibleMoves) {
    const newBoard = cloneBoard(board);
    performMove(move.from, move.to, newBoard);
    const newLastMove = [move.from, move.to];
    const opponentColor = color === gameRules.WHITE ? gameRules.BLACK : gameRules.WHITE;

    const result = dfs(newBoard, opponentColor, newLastMove, depth - 1, visited);
    if (!result) {
      // If opponent cannot win from this move, it's a good move
      return move;
    }
  }

  return null;
}

function getAllPossibleMoves(board, color, lastMove) {
  const moves = [];

  for (let i = 0; i < gameRules.ROWS; i++) {
    for (let j = 0; j < gameRules.COLUMNS; j++) {
      const piece = board[i][j];
      if (piece && gameRules.getPieceColor(piece) === color) {
        const from = [i, j];
        const possibleTo = gameRules.getPossibleMoves(board, from, color, lastMove);

        for (const to of possibleTo) {
          moves.push({ from, to, piece });
        }
      }
    }
  }

  return moves;
}

module.exports = {
  iddfs,
};
