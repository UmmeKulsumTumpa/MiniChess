import ChessSquare from './ChessSquare';

function ChessBoard({ board, isRotated }) {
  return (
    <div className="grid grid-cols-5 gap-1 mb-4">
      {board.map((row, i) => (
        row.map((piece, j) => (
          <ChessSquare 
            key={`${i}-${j}`}
            piece={piece}
            isLight={(i + j) % 2 === 0}
          />
        ))
      ))}
    </div>
  );
}

export default ChessBoard;