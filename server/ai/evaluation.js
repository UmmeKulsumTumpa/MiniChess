// server/ai/evaluation.js

// Basic piece values
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

// Dictionary of positional scores for each piece
const piecePositionalScores = {
  N: knightGoodPositions,
  n: knightGoodPositions.slice().reverse(),
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

// Center squares to encourage center control
const centerSquares = [[2, 1], [2, 2], [2, 3], [3, 1], [3, 2], [3, 3]];

// Function to calculate mobility for a piece at a given position
function countPieceMobility(board, row, col) {
  let mobility = 0;
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1], // Cardinal directions
    [-1, -1], [1, 1], [1, -1], [-1, 1] // Diagonals
  ];

  directions.forEach(([dx, dy]) => {
    const [newRow, newCol] = [row + dx, col + dy];
    if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
      if (board[newRow][newCol] === ' ' || board[newRow][newCol].toLowerCase() !== board[row][col].toLowerCase()) {
        mobility++;
      }
    }
  });

  return mobility;
}

// Main function to evaluate the board
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

        // Exclude king from positional score
        if (pieceType !== 'K') {
          let pieceKey = pieceType === 'P' ? (pieceColor === 'w' ? 'P' : 'p') : pieceType;

          if (piecePositionalScores[pieceKey]) {
            piecePositionalScore = piecePositionalScores[pieceKey][row][col] * 0.1;
          }
        }

        // Base score based on piece value and positional score
        let pieceScore = (pieceValue[pieceType] || 0) + piecePositionalScore;

        // King Safety Heuristic
        if (pieceType === 'K') {
          if ((pieceColor === 'w' && row !== board.length - 1) || (pieceColor === 'b' && row !== 0)) {
            pieceScore -= 0.5;
          }
        }

        // Center Control Heuristic
        if (centerSquares.some(([cRow, cCol]) => cRow === row && cCol === col)) {
          pieceScore += 0.2;
        }

        // Piece Mobility Heuristic
        const mobilityScore = countPieceMobility(board, row, col) * 0.1;
        pieceScore += mobilityScore;

        // Add or subtract score based on piece color
        if (pieceColor === 'w') {
          score += pieceScore;
        } else if (pieceColor === 'b') {
          score -= pieceScore;
        }
      }
    }
  }

  return isWhiteTurn ? score : -score;
}

module.exports = scoreBoard;
