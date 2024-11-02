import { useState } from 'react';
import ChessBoard from './components/ChessBoard';

const initialBoard = [
  ['r', 'n', 'b', 'q', 'k'],
  ['p', 'p', 'p', 'p', 'p'],
  [' ', ' ', ' ', ' ', ' '],
  [' ', ' ', ' ', ' ', ' '],
  ['P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K']
];

function App() {
  const [board, setBoard] = useState(initialBoard);
  const [isRotated, setIsRotated] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('White');

  const handleTurnChange = () => {
    setIsRotated(!isRotated);
    setBoard(board.map(row => [...row]).reverse().map(row => row.reverse()));
    setCurrentPlayer(currentPlayer === 'White' ? 'Black' : 'White');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center text-white">Petty Chess</h1>
        <div className="mb-4 text-center text-gray-200">
          <span className="font-semibold">Current Player: {currentPlayer}</span>
        </div>
        <ChessBoard board={board} isRotated={isRotated} />
        <button
          onClick={handleTurnChange}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mt-4 font-semibold"
        >
          End Turn
        </button>
      </div>
    </div>
  );
}

export default App;