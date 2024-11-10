// utils/game_rules.js
const WHITE = "white";
const BLACK = "black";

class GameRules {
  constructor() {
    this.WHITE = WHITE;
    this.BLACK = BLACK;
    this.ROWS = 6;
    this.COLUMNS = 5;

    this.directions = {
      pawn: [
        [1, 0],
        [2, 0],
      ],
      knight: [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [1, -2],
        [-1, 2],
        [-1, -2],
      ],
      bishop: [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      rook: [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ],
      queen: [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
      king: [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ],
    };
  }

  isInBounds(x, y) {
    return x >= 0 && x < this.ROWS && y >= 0 && y < this.COLUMNS;
  }

  getPieceColor(piece) {
    return piece === piece.toUpperCase() ? this.WHITE : this.BLACK;
  }

  isValidMove(board, from, to, color, lastMove) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const piece = board[x1][y1];

    if (!piece || this.getPieceColor(piece) !== color) return false;
    if (!this.isInBounds(x2, y2)) return false;
    if (board[x2][y2] && this.getPieceColor(board[x2][y2]) === color) return false;

    switch (piece.toLowerCase()) {
      case "p": // Pawn
        return this.validatePawnMove(from, to, color, board, lastMove);
      case "n": // Knight
        return this.validatePieceMove(from, to, this.directions.knight, true, board);
      case "b": // Bishop
        return this.validatePieceMove(from, to, this.directions.bishop, false, board);
      case "r": // Rook
        return this.validatePieceMove(from, to, this.directions.rook, false, board);
      case "q": // Queen
        return this.validatePieceMove(from, to, this.directions.queen, false, board);
      case "k": // King
        return this.validatePieceMove(from, to, this.directions.king, true, board);
      default:
        return false;
    }
  }

  validatePawnMove(from, to, color, board, lastMove) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const direction = color === this.WHITE ? -1 : 1;

    // Move forward
    if (y1 === y2 && x2 - x1 === direction && !board[x2][y2]) return true;
    // Move two squares from starting position
    // if (
    //   y1 === y2 &&
    //   x2 - x1 === 2 * direction &&
    //   x1 === (color === this.WHITE ? 4 : 1) &&
    //   !board[x2][y2] &&
    //   !board[x1 + direction][y1]
    // )
    //   return true;
    // Capture diagonally
    if (
      Math.abs(y2 - y1) === 1 &&
      x2 - x1 === direction &&
      board[x2][y2] &&
      this.getPieceColor(board[x2][y2]) !== color
    )
      return true;

    // En passant
    // if (lastMove) {
    //   const [lastFrom, lastTo] = lastMove;
    //   const lastPiece = board[lastTo[0]][lastTo[1]];

    //   if (
    //     Math.abs(lastFrom[0] - lastTo[0]) === 2 &&
    //     lastPiece.toLowerCase() === "p"
    //   ) {
    //     if (
    //       y2 === lastTo[1] &&
    //       x2 - x1 === direction &&
    //       x1 === lastTo[0] + direction
    //     ) {
    //       return true;
    //     }
    //   }
    // }

    return false;
  }

  validatePieceMove(from, to, moveDirections, singleStep, board) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const dx = x2 - x1;
    const dy = y2 - y1;

    for (const [mx, my] of moveDirections) {
      let stepX = x1;
      let stepY = y1;

      while (true) {
        stepX += mx;
        stepY += my;

        if (stepX === x2 && stepY === y2) return true;
        if (!this.isInBounds(stepX, stepY) || board[stepX][stepY]) break;
        if (singleStep) break;
      }
    }
    return false;
  }

  findKingPosition(board, color) {
    const kingSymbol = color === this.WHITE ? "K" : "k";
    for (let i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLUMNS; j++) {
        if (board[i][j] === kingSymbol) {
          return [i, j];
        }
      }
    }
    return null;
  }

  isPositionUnderAttack(board, position, color) {
    const [x, y] = position;
    const opponentColor = color === this.WHITE ? this.BLACK : this.WHITE;

    for (let i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLUMNS; j++) {
        const piece = board[i][j];
        if (piece && this.getPieceColor(piece) === opponentColor) {
          if (this.isValidMove(board, [i, j], position, opponentColor)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isValidMoveWithKingSafety(board, from, to, color, lastMove) {
    const [x1, y1] = from;
    const [x2, y2] = to;
    const piece = board[x1][y1];

    const originalPieceAtDestination = board[x2][y2];
    board[x1][y1] = "";
    board[x2][y2] = piece;

    let kingPosition;
    if (piece.toLowerCase() === "k") {
      kingPosition = [x2, y2];
    } else {
      kingPosition = this.findKingPosition(board, color);
    }

    const isKingSafe = kingPosition && !this.isPositionUnderAttack(board, kingPosition, color);

    // Undo the move
    board[x1][y1] = piece;
    board[x2][y2] = originalPieceAtDestination;

    return isKingSafe && this.isValidMove(board, from, to, color, lastMove);
  }

  isOpponentKingInCheckAfterMove(board, from, to, color, lastMove) {
    const opponentColor = color === this.WHITE ? this.BLACK : this.WHITE;

    const [x1, y1] = from;
    const [x2, y2] = to;
    const piece = board[x1][y1];
    const originalPieceAtDestination = board[x2][y2];
    board[x1][y1] = "";
    board[x2][y2] = piece;

    const opponentKingPosition = this.findKingPosition(board, opponentColor);
    const isInCheck =
      opponentKingPosition &&
      this.isPositionUnderAttack(board, opponentKingPosition, color);

    // Undo the move
    board[x1][y1] = piece;
    board[x2][y2] = originalPieceAtDestination;

    return isInCheck;
  }

  getPossibleMoves(board, from, color, lastMove) {
    const [x, y] = from;
    const possibleMoves = [];

    for (let i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLUMNS; j++) {
        const to = [i, j];
        if (this.isValidMoveWithKingSafety(board, from, to, color, lastMove)) {
          possibleMoves.push(to);
        }
      }
    }
    return possibleMoves;
  }

  isCheckmate(board, color, lastMove) {
    const kingPosition = this.findKingPosition(board, color);
    const isKingInCheck = kingPosition
      ? this.isPositionUnderAttack(board, kingPosition, color === this.WHITE ? this.BLACK : this.WHITE)
      : false;

    if (!isKingInCheck) {
      return false;
    }

    for (let i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLUMNS; j++) {
        const piece = board[i][j];
        if (piece && this.getPieceColor(piece) === color) {
          const possibleMoves = this.getPossibleMoves(board, [i, j], color, lastMove);

          for (const move of possibleMoves) {
            const [toX, toY] = move;

            const originalPieceAtDestination = board[toX][toY];
            board[i][j] = "";
            board[toX][toY] = piece;

            const kingPositionAfterMove =
              piece.toLowerCase() === "k" ? move : kingPosition;
            const kingSafeAfterMove =
              !this.isPositionUnderAttack(
                board,
                kingPositionAfterMove,
                color === this.WHITE ? this.BLACK : this.WHITE
              );

            // Undo the move
            board[i][j] = piece;
            board[toX][toY] = originalPieceAtDestination;

            if (kingSafeAfterMove) {
              return false;
            }
          }
        }
      }
    }

    return true;
  }

  isStalemate(board, color, lastMove) {
    const kingPosition = this.findKingPosition(board, color);

    const isKingInCheck = kingPosition
      ? this.isPositionUnderAttack(
          board,
          kingPosition,
          color === this.WHITE ? this.BLACK : this.WHITE
        )
      : false;

    if (isKingInCheck) {
      return false;
    }

    for (let i = 0; i < this.ROWS; i++) {
      for (let j = 0; j < this.COLUMNS; j++) {
        const piece = board[i][j];
        if (piece && this.getPieceColor(piece) === color) {
          const possibleMoves = this.getPossibleMoves(board, [i, j], color, lastMove);

          if (possibleMoves.length > 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  isPawnPromotable(position, color) {
    const [x, y] = position;

    if (color === this.WHITE && x === 0) {
      return true;
    }

    if (color === this.BLACK && x === this.ROWS - 1) {
      return true;
    }

    return false;
  }
}

module.exports = new GameRules();
