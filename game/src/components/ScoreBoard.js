// src/components/ScoreBoard.js

import React from 'react';
import { FaChessKing, FaChessQueen } from 'react-icons/fa';

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
    <div className="p-6 bg-gray-700 rounded-lg shadow-lg text-center text-white">
      <h2 className="text-2xl font-bold mb-4">Score Board</h2>
      <div className="flex justify-around items-center">
        <div className="flex flex-col items-center">
          <FaChessKing className="text-5xl mb-2 text-white" />
          <h3 className="text-xl font-semibold">White</h3>
          <p className="text-lg mt-1">Score: {whiteScore}</p>
        </div>
        <div className="w-px bg-gray-500 h-24"></div>
        <div className="flex flex-col items-center">
          <FaChessQueen className="text-5xl mb-2 text-white" />
          <h3 className="text-xl font-semibold">Black</h3>
          <p className="text-lg mt-1">Score: {blackScore}</p>
        </div>
      </div>
    </div>
  );
}

export default ScoreBoard;
