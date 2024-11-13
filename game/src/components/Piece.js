// src/components/Piece.js

import React from 'react';
import {
  FaChessKing,
  FaChessQueen,
  FaChessBishop,
  FaChessKnight,
  FaChessRook,
  FaChessPawn,
} from 'react-icons/fa';

function Piece({ piece }) {
  const pieceMap = {
    K: FaChessKing,
    Q: FaChessQueen,
    R: FaChessRook,
    B: FaChessBishop,
    N: FaChessKnight,
    P: FaChessPawn,
    k: FaChessKing,
    q: FaChessQueen,
    r: FaChessRook,
    b: FaChessBishop,
    n: FaChessKnight,
    p: FaChessPawn,
  };

  const PieceIcon = pieceMap[piece];

  if (!PieceIcon) {
    return null;
  }

  const pieceColor = piece === piece.toUpperCase() ? 'text-white' : 'text-black';

  return <PieceIcon className={`text-4xl ${pieceColor}`} />;
}

export default Piece;
