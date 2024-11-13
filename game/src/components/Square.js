// src/components/Square.js

import React from 'react';
import Piece from './Piece';

function Square({ piece, row, col, isSelected, onClick }) {
  const isDark = (row + col) % 2 === 1;
  const baseColor = isDark ? 'bg-gray-600' : 'bg-gray-200';
  const selectedStyle = isSelected ? 'ring-4 ring-yellow-400' : '';
  const hoverStyle = 'hover:ring-2 hover:ring-yellow-300';

  return (
    <div
      className={`${baseColor} ${selectedStyle} ${hoverStyle} aspect-square flex items-center justify-center`}
      onClick={onClick}
    >
      <Piece piece={piece} />
    </div>
  );
}

export default Square;
