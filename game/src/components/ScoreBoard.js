// src/components/ScoreBoard.js

import React from 'react';

function ScoreBoard({ moveLog }) {
  const pieceValue = { K: 0, Q: 10, R: 4, B: 4, N: 7, P: 1 };

  const calculateScore = (playerColor) => {
    return moveLog.reduce((total, move) => {
      if (move.pieceCaptured && move.pieceCaptured !== ' ') {
        const isCapturedByPlayer =
          (playerColor === 'white' && move.pieceMoved === move.pieceMoved.toUpperCase()) ||
          (playerColor === 'black' && move.pieceMoved === move.pieceMoved.toLowerCase());
        if (isCapturedByPlayer) {
          const piece = move.pieceCaptured.toUpperCase();
          return total + (pieceValue[piece] || 0);
        }
      }
      return total;
    }, 0);
  };

  const whiteScore = calculateScore('white');
  const blackScore = calculateScore('black');

  return (
    <div className="p-4 bg-gray-700 rounded shadow text-center">
      <h2 className="text-xl font-bold mb-2">Scores</h2>
      <p className="mb-2">White: {whiteScore}</p>
      <p>Black: {blackScore}</p>
    </div>
  );
}

export default ScoreBoard;
