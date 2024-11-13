// src/components/Square.js

import React from 'react';
import Piece from './Piece';

function Square({ piece, row, col, isSelected, onClick }) {
  // Determine if the square should be light or dark
  const isLightSquare = (row + col) % 2 === 0;

  // Adjusted square colors for better contrast
  const squareColor = isLightSquare ? 'bg-gray-400' : 'bg-gray-700';

  const selectedStyle = isSelected ? 'border-4 border-yellow-400' : '';

  return (
    <div
      className={`flex items-center justify-center w-full h-full cursor-pointer ${squareColor} ${selectedStyle}`}
      onClick={onClick}
    >
      {piece !== ' ' && <Piece piece={piece} />}
    </div>
  );
}

export default Square;
