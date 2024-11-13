// src/components/CapturedPieces.js

import React from 'react';
import Piece from './Piece';

function CapturedPieces({ player, moveLog }) {
  const capturedPieces = [];

  moveLog.forEach((move) => {
    if (move.pieceCaptured && move.pieceCaptured !== ' ') {
      const capturedPiece = move.pieceCaptured;
      const capturedByOpponent = player === 'white'
        ? move.pieceMoved === move.pieceMoved.toLowerCase()
        : move.pieceMoved === move.pieceMoved.toUpperCase();

      if (capturedByOpponent) {
        capturedPieces.push(capturedPiece);
      }
    }
  });

  return (
    <div className="p-2 bg-gray-700 rounded shadow mb-4">
      <h2 className="text-xl font-bold mb-2">
        {player.charAt(0).toUpperCase() + player.slice(1)}'s Captures
      </h2>
      <div className="flex flex-wrap">
        {capturedPieces.length > 0 ? (
          capturedPieces.map((piece, index) => (
            <Piece key={index} piece={piece} />
          ))
        ) : (
          <p>No captures yet.</p>
        )}
      </div>
    </div>
  );
}

export default CapturedPieces;
