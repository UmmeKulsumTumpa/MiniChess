import { 
  FaChessKing, 
  FaChessQueen, 
  FaChessBishop, 
  FaChessKnight, 
  FaChessRook, 
  FaChessPawn 
} from 'react-icons/fa';

const pieceMap = {
  'k': FaChessKing,
  'q': FaChessQueen,
  'b': FaChessBishop,
  'n': FaChessKnight,
  'r': FaChessRook,
  'p': FaChessPawn
};

function ChessSquare({ piece, isLight }) {
  const PieceComponent = piece !== ' ' ? pieceMap[piece.toLowerCase()] : null;
  const isWhite = piece === piece.toUpperCase();

  return (
    <div 
      className={`w-16 h-16 flex items-center justify-center ${
        isLight ? 'bg-[#F0D9B5]' : 'bg-[#B58863]'
      }`}
    >
      {PieceComponent && (
        <PieceComponent 
          className={`w-12 h-12 ${isWhite ? 'text-white' : 'text-black'}`}
        />
      )}
    </div>
  );
}

export default ChessSquare;