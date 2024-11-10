// server/ai/evaluation.js

const pieceValue = { K: 0, Q: 10, R: 4, B: 4, N: 7, P: 1 };

// Positional scores for White pieces
const knightGoodPositions = [
  [1, 1, 1, 1, 1],
  [1, 2, 2, 2, 1],
  [1, 2, 3, 2, 1],
  [1, 2, 3, 2, 1],
  [1, 2, 2, 2, 1],
  [1, 1, 1, 1, 1]
];

const bishopGoodPositions = [
  [3, 2, 1, 2, 3],
  [3, 3, 2, 3, 3],
  [2, 3, 3, 3, 2],
  [2, 3, 3, 3, 2],
  [3, 3, 2, 3, 3],
  [3, 2, 1, 2, 3]
];

const queenGoodPositions = [
  [1, 2, 1, 2, 1],
  [1, 2, 2, 2, 1],
  [1, 2, 3, 2, 1],
  [1, 2, 3, 2, 1],
  [1, 2, 2, 2, 1],
  [1, 2, 1, 2, 1]
];

const rookGoodPositions = [
  [3, 3, 3, 3, 3],
  [3, 2, 2, 2, 3],
  [1, 2, 1, 2, 1],
  [1, 2, 1, 2, 1],
  [3, 2, 2, 2, 3],
  [3, 3, 3, 3, 3]
];

const whitePawnGoodPositions = [
  [5, 5, 5, 5, 5],
  [4, 4, 4, 4, 4],
  [3, 3, 3, 3, 3],
  [2, 2, 2, 2, 2],
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0]
];

// For black pawns, mirror the white pawn positions
const blackPawnGoodPositions = whitePawnGoodPositions.slice().reverse();

const piecePositionalScores = {
  N: knightGoodPositions,
  n: knightGoodPositions.slice().reverse(), // Mirror for black
  B: bishopGoodPositions,
  b: bishopGoodPositions.slice().reverse(),
  Q: queenGoodPositions,
  q: queenGoodPositions.slice().reverse(),
  R: rookGoodPositions,
  r: rookGoodPositions.slice().reverse(),
  P: whitePawnGoodPositions,
  p: blackPawnGoodPositions
};

const CHECKMATE = Infinity;
const STALEMATE = 0;

function scoreBoard(board, isWhiteTurn) {
  let score = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const square = board[row][col];
      if (square !== ' ') {
        let piecePositionalScore = 0;

        const piece = square;
        const pieceType = piece.toUpperCase(); // 'P', 'N', etc.
        const pieceColor = piece === piece.toUpperCase() ? 'w' : 'b'; // 'w' or 'b'

        if (pieceType !== 'K') { // King doesn't need positional score
          let pieceKey = '';
          if (pieceType === 'P') {
            pieceKey = pieceColor === 'w' ? 'P' : 'p';
          } else {
            pieceKey = pieceType;
          }

          if (piecePositionalScores[pieceKey]) {
            piecePositionalScore = piecePositionalScores[pieceKey][row][col] * 0.1;
          }
        }

        if (pieceColor === 'w') {
          score += (pieceValue[pieceType] || 0) + piecePositionalScore;
        } else if (pieceColor === 'b') {
          score -= (pieceValue[pieceType] || 0) + piecePositionalScore;
        }
      }
    }
  }

  return isWhiteTurn ? score : -score;
}

module.exports = scoreBoard;
