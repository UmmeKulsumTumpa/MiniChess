// src/components/ChessBoard.js

import React, { useState, useEffect } from 'react';
import Square from './Square';
import { makeMove, getAIMove } from '../utils/api';

function ChessBoard({ gameState, onUpdateGameState, onError }) {
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [board, setBoard] = useState(gameState.board);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);

  useEffect(() => {
    setBoard(gameState.board);
  }, [gameState.board]);

  const handleSquareClick = async (row, col) => {
    if (isWaitingForAI || gameState.checkMate || gameState.staleMate) return;

    const piece = board[row][col];
    const pieceColor = piece === piece.toUpperCase() ? 'white' : 'black';

    if (!selectedSquare) {
      // First click: select a piece
      if (piece !== ' ' && pieceColor === 'white' && gameState.whiteToMove) {
        setSelectedSquare({ row, col });
      }
    } else {
      // Second click: attempt to move
      const move = {
        startRow: selectedSquare.row,
        startCol: selectedSquare.col,
        endRow: row,
        endCol: col,
      };

      try {
        const response = await makeMove(move, gameState);
        onUpdateGameState(response.gameState);
        setSelectedSquare(null);

        // After player's move, request AI move
        setIsWaitingForAI(true);
        const aiResponse = await getAIMove(response.gameState);
        onUpdateGameState(aiResponse.gameState);
        setIsWaitingForAI(false);
      } catch (error) {
        const errorMessage =
          (error.response && error.response.data.error) ||
          'An error occurred.';
        onError(errorMessage);
        setSelectedSquare(null);
      }
    }
  };

  return (
    <div
      className="grid grid-cols-5 grid-rows-6 border-4 border-gray-700"
      style={{ width: '500px',
        height: '600px',
       }}
    >
      {board.map((row, rowIndex) =>
        row.map((square, colIndex) => (
          <Square
            key={`${rowIndex}-${colIndex}`}
            piece={square}
            row={rowIndex}
            col={colIndex}
            isSelected={
              selectedSquare &&
              selectedSquare.row === rowIndex &&
              selectedSquare.col === colIndex
            }
            onClick={() => handleSquareClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}

export default ChessBoard;
