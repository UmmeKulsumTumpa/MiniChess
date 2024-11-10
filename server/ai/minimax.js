// server/ai/minimax.js

const evaluateBoard = require('./evaluation');

function minimax(gameState, depth, alpha, beta, maximizingPlayer, startTime, timeLimit) {
  if (depth === 0 || gameState.checkMate || gameState.staleMate) {
    return evaluateBoard(gameState.board, gameState.whiteToMove);
  }

  // Early Stopping Mechanism
  if (Date.now() - startTime > timeLimit) {
    return evaluateBoard(gameState.board, gameState.whiteToMove);
  }

  const validMoves = gameState.getValidMoves();

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (let move of validMoves) {
      gameState.makeMove(move);
      const evalScore = minimax(gameState, depth - 1, alpha, beta, false, startTime, timeLimit);
      gameState.undoMove();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let move of validMoves) {
      gameState.makeMove(move);
      const evalScore = minimax(gameState, depth - 1, alpha, beta, true, startTime, timeLimit);
      gameState.undoMove();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

module.exports = minimax;
