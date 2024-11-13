// server/controllers/gameController.js

const GameRules = require('../utils/gameRules');
const minimax = require('../ai/minimax');
const evaluateBoard = require('../ai/evaluation');

// Define Move class
class Move {
  constructor(startRow, startCol, endRow, endCol, pieceMoved, pieceCaptured) {
    this.startRow = startRow;
    this.startCol = startCol;
    this.endRow = endRow;
    this.endCol = endCol;
    this.pieceMoved = pieceMoved;
    this.pieceCaptured = pieceCaptured;
    this.isPawnPromotion =
      (pieceMoved === 'P' && endRow === 0) ||
      (pieceMoved === 'p' && endRow === 5);
    this.moveID = startRow * 1000 + startCol * 100 + endRow * 10 + endCol;
  }

  equals(other) {
    return this.moveID === other.moveID;
  }

  getChessNotation() {
    return this.getRankFile(this.startRow, this.startCol) + ' >> ' + this.getRankFile(this.endRow, this.endCol);
  }

  getRankFile(r, c) {
    const rowsToRanks = {0: '6', 1: '5', 2: '4', 3: '3', 4: '2', 5: '1'};
    const colsToFiles = {0: 'a', 1: 'b', 2: 'c', 3: 'd', 4: 'e'};
    return colsToFiles[c] + rowsToRanks[r];
  }
}

// Define GameStateClass
class GameStateClass {
  constructor(board = null, whiteToMove = true, moveLog = [], whiteKingLocation = [5, 4], blackKingLocation = [0, 4], checkMate = false, staleMate = false) {
    if (board) {
      this.board = board;
    } else {
      this.board = [
        ['r', 'n', 'b', 'q', 'k'],
        ['p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K'],
      ];
    }

    this.whiteToMove = whiteToMove;
    this.moveLog = moveLog; // Array of Move objects
    this.whiteKingLocation = whiteKingLocation;
    this.blackKingLocation = blackKingLocation;
    this.checkMate = checkMate;
    this.staleMate = staleMate;
  }

  makeMove(move) {
    this.board[move.startRow][move.startCol] = ' ';
    this.board[move.endRow][move.endCol] = move.pieceMoved;
    this.moveLog.push(move);
    this.whiteToMove = !this.whiteToMove;

    // Update king location if moved
    if (move.pieceMoved === 'K') {
      this.whiteKingLocation = [move.endRow, move.endCol];
    } else if (move.pieceMoved === 'k') {
      this.blackKingLocation = [move.endRow, move.endCol];
    }

    // Pawn promotion
    if (move.isPawnPromotion) {
      const promotedPiece = move.pieceMoved === 'P' ? 'Q' : 'q'; // Promote to Queen
      this.board[move.endRow][move.endCol] = promotedPiece;
    }

    // Update checkMate and staleMate flags
    this.checkMate = false;
    this.staleMate = false;
    // These will be updated after getting valid moves
  }

  undoMove() {
    if (this.moveLog.length === 0) return null;
    const move = this.moveLog.pop();
    this.board[move.startRow][move.startCol] = move.pieceMoved;
    this.board[move.endRow][move.endCol] = move.pieceCaptured;
    this.whiteToMove = !this.whiteToMove;

    // Update king location if moved
    if (move.pieceMoved === 'K') {
      this.whiteKingLocation = [move.startRow, move.startCol];
    } else if (move.pieceMoved === 'k') {
      this.blackKingLocation = [move.startRow, move.startCol];
    }

    return move;
  }

  getValidMoves() {
    const gameRules = GameRules;
    const validMoves = [];

    for (let r = 0; r < this.board.length; r++) {
      for (let c = 0; c < this.board[r].length; c++) {
        const piece = this.board[r][c];
        if (piece === ' ') continue;
        const color = piece === piece.toUpperCase() ? 'white' : 'black';
        if ((color === 'white' && this.whiteToMove) || (color === 'black' && !this.whiteToMove)) {
          // Generate all possible moves for this piece
          const possibleDestinations = gameRules.getPossibleMoves(this.board, [r, c], color, this.getLastMove());

          for (let dest of possibleDestinations) {
            const [endRow, endCol] = dest;
            const pieceCaptured = this.board[endRow][endCol];
            const move = new Move(r, c, endRow, endCol, piece, pieceCaptured);
            validMoves.push(move);
          }
        }
      }
    }

    // After generating all possible moves, filter out those that leave the king in check
    const finalValidMoves = [];
    for (let move of validMoves) {
      this.makeMove(move);
      const color = move.pieceMoved === move.pieceMoved.toUpperCase() ? 'white' : 'black';
      const isInCheck = this.isInCheck(color);
      this.undoMove();
      if (!isInCheck) {
        finalValidMoves.push(move);
      }
    }

    // Check for checkmate or stalemate
    if (finalValidMoves.length === 0) {
      if (this.isInCheck(this.whiteToMove ? 'white' : 'black')) {
        this.checkMate = true;
      } else {
        this.staleMate = true;
      }
    } else {
      this.checkMate = false;
      this.staleMate = false;
    }

    return finalValidMoves;
  }

  getLastMove() {
    if (this.moveLog.length === 0) return null;
    const lastMove = this.moveLog[this.moveLog.length - 1];
    return [[lastMove.startRow, lastMove.startCol], [lastMove.endRow, lastMove.endCol]];
  }

  isInCheck(color) {
    const kingPos = color === 'white' ? this.whiteKingLocation : this.blackKingLocation;
    return GameRules.isPositionUnderAttack(this.board, kingPos, color);
  }
}

// Function to find the best move using minimax
function findBestMove(gameState, depth) {
  let bestMove = null;
  let bestScore = -Infinity;

  const validMoves = gameState.getValidMoves();

  for (let move of validMoves) {
    gameState.makeMove(move);
    const score = minimax(gameState, depth - 1, -Infinity, Infinity, false, Date.now(), 3000);
    gameState.undoMove();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// AI Move based on minimax
function getAIMove(gameState, depth = 10) {
  return findBestMove(gameState, depth);
}

// Controller methods
exports.startGame = (req, res) => {
  const gameState = new GameStateClass();
  res.json({ message: 'New game started', gameState: serializeGameState(gameState) });
};

exports.makeMove = (req, res) => {
  const { move, gameState: clientGameState } = req.body; // move: { startRow, startCol, endRow, endCol }

  if (!move || !clientGameState) {
    return res.status(400).json({ error: 'Invalid request format.' });
  }

  // Reconstruct GameStateClass from clientGameState
  const gameState = reconstructGameState(clientGameState);

  const { startRow, startCol, endRow, endCol } = move;

  const pieceMoved = gameState.board[startRow][startCol];
  const pieceCaptured = gameState.board[endRow][endCol];

  if (pieceMoved === ' ') {
    return res.status(400).json({ error: 'No piece at starting square.' });
  }

  const color = pieceMoved === pieceMoved.toUpperCase() ? 'white' : 'black';
  if ((color === 'white' && !gameState.whiteToMove) || (color === 'black' && gameState.whiteToMove)) {
    return res.status(400).json({ error: 'Not your turn.' });
  }

  const gameRules = GameRules;

  const possibleDestinations = gameRules.getPossibleMoves(gameState.board, [startRow, startCol], color, gameState.getLastMove());

  let moveMade = null;
  for (let dest of possibleDestinations) {
    const [endR, endC] = dest;
    if (endR === endRow && endC === endCol) {
      const moveObj = new Move(startRow, startCol, endRow, endCol, pieceMoved, pieceCaptured);
      moveMade = moveObj;
      break;
    }
  }

  if (moveMade) {
    gameState.makeMove(moveMade);

    // After making the move, check for checkmate or stalemate
    gameState.getValidMoves();

    res.json({ gameState: serializeGameState(gameState) });
  } else {
    res.status(400).json({ error: 'Invalid move.' });
  }
};

exports.getAIMove = (req, res) => {
  const { gameState: clientGameState } = req.body;

  if (!clientGameState) {
    return res.status(400).json({ error: 'Invalid request format.' });
  }

  const gameState = reconstructGameState(clientGameState);

  if (gameState.whiteToMove) {
    return res.status(400).json({ error: 'AI plays black.' });
  }

  if (gameState.checkMate || gameState.staleMate) {
    return res.status(400).json({ error: 'Game is over.' });
  }

  const aiMove = getAIMove(gameState, 4);
  if (aiMove) {
    gameState.makeMove(aiMove);
    // After AI move, check for checkmate or stalemate
    gameState.getValidMoves();
    res.json({ bestMove: serializeMove(aiMove), gameState: serializeGameState(gameState) });
  } else {
    res.json({ message: 'No valid moves available.' });
  }
};

// Helper functions

function serializeGameState(gameState) {
  return {
    board: gameState.board,
    whiteToMove: gameState.whiteToMove,
    moveLog: gameState.moveLog.map(move => ({
      startRow: move.startRow,
      startCol: move.startCol,
      endRow: move.endRow,
      endCol: move.endCol,
      pieceMoved: move.pieceMoved,
      pieceCaptured: move.pieceCaptured,
      isPawnPromotion: move.isPawnPromotion
    })),
    checkMate: gameState.checkMate,
    staleMate: gameState.staleMate,
    whiteKingLocation: gameState.whiteKingLocation,
    blackKingLocation: gameState.blackKingLocation
  };
}

function serializeMove(move) {
  return {
    startRow: move.startRow,
    startCol: move.startCol,
    endRow: move.endRow,
    endCol: move.endCol,
    pieceMoved: move.pieceMoved,
    pieceCaptured: move.pieceCaptured,
    isPawnPromotion: move.isPawnPromotion
  };
}

function reconstructGameState(clientGameState) {
  const { board, whiteToMove, moveLog, whiteKingLocation, blackKingLocation, checkMate, staleMate } = clientGameState;
  const gameState = new GameStateClass(board, whiteToMove, [], whiteKingLocation, blackKingLocation, checkMate, staleMate);
  // Reconstruct moveLog
  for (let move of moveLog) {
    const reconstructedMove = new Move(move.startRow, move.startCol, move.endRow, move.endCol, move.pieceMoved, move.pieceCaptured);
    reconstructedMove.isPawnPromotion = move.isPawnPromotion;
    gameState.moveLog.push(reconstructedMove);
  }
  return gameState;
}

module.exports = {
  startGame: exports.startGame,
  makeMove: exports.makeMove,
  getAIMove: exports.getAIMove
};
