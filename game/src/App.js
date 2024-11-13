// src/App.js

import React, { useEffect, useState } from 'react';
import ChessBoard from './components/ChessBoard';
import Modal from './components/Modal';
import ErrorModal from './components/ErrorModal';
import CapturedPieces from './components/CapturedPieces';
import ScoreBoard from './components/ScoreBoard';
import { startGame } from './utils/api';

function App() {
  const [gameState, setGameState] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [gameResult, setGameResult] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeGame = async () => {
      try {
        const response = await startGame();
        setGameState(response.gameState);
      } catch (err) {
        setError('Failed to start the game. Please try again.');
      }
    };
    initializeGame();
  }, []);

  const handleGameStateUpdate = (newGameState) => {
    setGameState(newGameState);

    if (newGameState.checkMate) {
      setIsGameOver(true);
      setGameResult(
        'Checkmate! ' + (newGameState.whiteToMove ? 'Black' : 'White') + ' wins!'
      );
    } else if (newGameState.staleMate) {
      setIsGameOver(true);
      setGameResult("Stalemate! It's a draw.");
    }
  };

  const resetGame = async () => {
    try {
      const response = await startGame();
      setGameState(response.gameState);
      setIsGameOver(false);
      setGameResult('');
      setError(null);
    } catch (err) {
      setError('Failed to restart the game. Please try again.');
    }
  };

  const handleErrorClose = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-8">Mini Chess</h1>
      {gameState ? (
        <div className="w-full max-w-6xl">
          {/* ScoreBoard at the top centered */}
          <div className="flex justify-center mb-4">
            <ScoreBoard moveLog={gameState.moveLog} />
          </div>
          {/* Game board area */}
          <div className="flex">
            {/* Black's captured pieces on the left */}
            <div className="flex-1 flex justify-center">
              <CapturedPieces player="black" moveLog={gameState.moveLog} />
            </div>
            {/* ChessBoard in the center */}
            <div className="flex-1 flex justify-center">
              <ChessBoard
                gameState={gameState}
                onUpdateGameState={handleGameStateUpdate}
                onError={setError}
              />
            </div>
            {/* White's captured pieces on the right */}
            <div className="flex-1 flex justify-center">
              <CapturedPieces player="white" moveLog={gameState.moveLog} />
            </div>
          </div>
        </div>
      ) : (
        <p>Loading game...</p>
      )}
      {isGameOver && (
        <Modal isOpen={isGameOver} onClose={resetGame}>
          <h2 className="text-2xl font-bold mb-4">{gameResult}</h2>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-700 rounded"
          >
            Play Again
          </button>
        </Modal>
      )}
      {error && (
        <ErrorModal isOpen={!!error} onClose={handleErrorClose} message={error} />
      )}
    </div>
  );
}

export default App;
