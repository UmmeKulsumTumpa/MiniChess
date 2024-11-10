// server/ai/evaluation.js

const pieceValue = { K: 0, Q: 10, R: 4, B: 4, N: 7, P: 1 };

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

const blackPawnGoodPositions = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [1, 2, 2, 2, 1],
  [2, 3, 3, 3, 2],
  [3, 4, 4, 4, 3],
  [5, 5, 5, 5, 5]
];

const piecePositionalScores = {
  N: knightGoodPositions,
  B: bishopGoodPositions,
  Q: queenGoodPositions,
  R: rookGoodPositions,
  'w_P': whitePawnGoodPositions,
  'b_P': blackPawnGoodPositions
};

const CHECKMATE = Infinity;
const STALEMATE = 0;

function scoreBoard(board, isWhiteTurn) {
  let score = 0;

  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const square = board[row][col];
      if (square !== '--') {
        let piecePositionalScore = 0;
        if (square[2].toUpperCase() !== 'K') { // king doesn't need positional score
          const pieceKey = square[2].toUpperCase() === 'P' ? (square[0] === 'w' ? 'w_P' : 'b_P') : square[2].toUpperCase();
          if (piecePositionalScores[pieceKey]) {
            piecePositionalScore = piecePositionalScores[pieceKey][row][col] * 0.1;
          }
        }

        if (square[0] === 'w') {
          score += (pieceValue[square[2].toUpperCase()] || 0) + piecePositionalScore;
        } else if (square[0] === 'b') {
          score -= (pieceValue[square[2].toUpperCase()] || 0) + piecePositionalScore;
        }
      }
    }
  }

  return isWhiteTurn ? score : -score;
}

module.exports = scoreBoard;
