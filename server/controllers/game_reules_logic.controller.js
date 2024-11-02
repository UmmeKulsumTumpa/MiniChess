const { func } = require("prop-types");
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let players = [];

const initialBoard = [
  ["r", "n", "q", "k", "b"],
  ["p", "p", "p", "p", "p"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["P", "P", "P", "P", "P"],
  ["R", "N", "Q", "K", "B"],
];

function broadcast(message) {
  players.forEach((player) => player.send(JSON.stringify(message)));
}

wss.on("connection", (ws) => {
  if (players.length >= 2) {
    ws.send(JSON.stringify({ type: "error", message: "Room full" }));
    ws.close();
    return;
  }

  const color = players.length === 0 ? "white" : "black";
  players.push(ws);

  ws.send(JSON.stringify({ type: "init", board: initialBoard, color }));

  if (players.length === 2) {
    broadcast({ type: "start", message: "Game start" });
  }

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "move") {
      broadcast({
        type: "move",
        from: data.from,
        to: data.to,
        piece: data.piece,
      });
    }
  });

  ws.on("close", () => {
    players = players.filter((player) => player !== ws);
    if (players.length < 2) {
      broadcast({ type: "end", message: "Opponent disconnected" });
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");

const WHITE = "white";
const BLACK = "black";
const ROWS = 6
const COLLUMNS = 5

const directions = {
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

function isInBounds(x, y) {
  return x >= 0 && x < 6 && y >= 0 && y < 5;
}

function getPieceColor(piece) {
  return piece === piece.toUpperCase() ? WHITE : BLACK;
}

function isValidMove(board, from, to, color, lastMove) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  if (!board[x1][y1] || getPieceColor(board[x1][y1]) != color) return false;
  if (!isInBounds(x2, y2)) return false;
  if (getPieceColor(board[x2][y2]) === color) return false;

  switch (piece.toLowerCase()) {
    case "p": // Pawn
      return validatePawnMove(from, to, color, board, lastMove);
    case "n": // Knight
      return validatePieceMove(from, to, directions.knight, true);
    case "b": // Bishop
      return validatePieceMove(from, to, directions.bishop);
    case "r": // Rook
      return validatePieceMove(from, to, directions.rook);
    case "q": // Queen
      return validatePieceMove(from, to, directions.queen);
    case "k": // King
      return validatePieceMove(from, to, directions.king, true);
    default:
      return false;
  }
}

function validatePawnMove([x1, y1], [x2, y2], color, board, lastMove) {
  const direction = color === WHITE ? 1 : -1;
  if (y1 === y2 && x2 - x1 === direction && !board[x2][y2]) return true;
  if (
    y1 === y2 &&
    x2 - x1 === 2 * direction &&
    x1 === (color === WHITE ? 4 : 1) &&
    !board[x2][y2]
  )
    return true;
  if (
    Math.abs(y2 - y1) === 1 &&
    x2 - x1 === direction &&
    board[x2][y2] &&
    getPieceColor(board[x2][y2]) !== color
  )
    return true;

  // En passant
  if (lastMove) {
    const [lastFrom, lastTo] = lastMove;
    const lastPiece = board[lastTo[0]][lastTo[1]];

    if (
      Math.abs(lastFrom[0] - lastTo[0]) === 2 &&
      lastPiece.toLowerCase() === "p"
    ) {
      if (
        y2 === lastTo[1] && 
        x2 - x1 === direction && 
        x2 === lastFrom[0] + direction && 
        y2 === lastTo[1]
      ) {
        return true; 
      }
    }
  }

  return false;
}

function validatePieceMove(
  [x1, y1],
  [x2, y2],
  moveDirections,
  singleStep = false
) {
  const dx = x2 - x1;
  const dy = y2 - y1;

  for (const [mx, my] of moveDirections) {
    let stepX = x1;
    let stepY = y1;

    while (true) {
      stepX += mx;
      stepY += my;
      if (stepX === x2 && stepY === y2) return true;
      if (!isInBounds(stepX, stepY) || board[stepX][stepY]) break;
      if (singleStep) break;
    }
  }
  return false;
}

function findKingPosition(board, color) {
  const kingSymbol = color === WHITE ? "K" : "k";
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLLUMNS; j++) {
      if (board[i][j] === kingSymbol) {
        return [i, j];
      }
    }
  }
  return null;
}

function isPositionUnderAttack(board, position, color) {
  const [x, y] = position;
  const opponentColor = color === WHITE ? BLACK : WHITE;

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLLUMNS; j++) {
      const piece = board[i][j];
      if (piece && getPieceColor(piece) === opponentColor) {
        if (isValidMove(board, [i, j], position, opponentColor)) {
          return true;
        }
      }
    }
  }
  return false;
}

function isValidMoveWithKingSafety(board, from, to, color, lastMove) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  const originalPieceAtDestination = board[x2][y2];
  board[x1][y1] = "";
  board[x2][y2] = piece;

  const kingPosition =
    piece.toLowerCase() === "k" ? to : findKingPosition(board, color);

  const isKingSafe = !isPositionUnderAttack(board, kingPosition, color);

  board[x1][y1] = piece;
  board[x2][y2] = originalPieceAtDestination;

  return isKingSafe && isValidMove(board, from, to, color, lastMove);
}

function isOpponentKingInCheckAfterMove(board, from, to, color, lastMove) {
  const opponentColor = color === WHITE ? BLACK : WHITE;

  const piece = board[from[0]][from[1]];
  const originalPieceAtDestination = board[to[0]][to[1]];
  board[from[0]][from[1]] = "";
  board[to[0]][to[1]] = piece;

  const opponentKingPosition = findKingPosition(board, opponentColor);
  const isInCheck = isPositionUnderAttack(board, opponentKingPosition, color);

  board[from[0]][from[1]] = piece;
  board[to[0]][to[1]] = originalPieceAtDestination;

  return isInCheck;
}

function getPossibleMoves(board, from, color, lastMove) {
  const [x, y] = from;
  const possibleMoves = [];

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLLUMNS; j++) {
      const to = [i, j];
      if (isValidMoveWithKingSafety(board, from, to, color, lastMove)) {
        possibleMoves.push(to);
      }
    }
  }
  return possibleMoves;
}

function isCheckmate(board, color, lastMove) {
  const kingPosition = findKingPosition(board, color);
  const isKingInCheck = isPositionUnderAttack(board, kingPosition, color === WHITE ? BLACK : WHITE);

  if (!isKingInCheck) {
    return false;
  }

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLLUMNS; j++) {
      const piece = board[i][j];
      if (piece && getPieceColor(piece) === color) {
        const possibleMoves = getPossibleMoves(board, [i, j], color, lastMove);

        for (const move of possibleMoves) {
          const [toX, toY] = move;

          const originalPieceAtDestination = board[toX][toY];
          board[i][j] = ""; 
          board[toX][toY] = piece; 

          const kingPositionAfterMove = piece.toLowerCase() === "k" ? move : kingPosition;
          const kingSafeAfterMove = !isPositionUnderAttack(board, kingPositionAfterMove, color === WHITE ? BLACK : WHITE);

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

function isStalemate(board, color, lastMove) {
  const kingPosition = findKingPosition(board, color);

  const isKingInCheck = isPositionUnderAttack(board, kingPosition, color === WHITE ? BLACK : WHITE);

  if (isKingInCheck) {
    return false;
  }

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLLUMNS; j++) {
      const piece = board[i][j];
      if (piece && getPieceColor(piece) === color) {
        const possibleMoves = getPossibleMoves(board, [i, j], piece, color, lastMove);

        if (possibleMoves.length > 0) {
          return false;
        }
      }
    }
  }

  return true;
}

function performMove(from, to, board) {
  if(!isValidMoveWithKingSafety()) return [false, board];

  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  board[x1][y1] = "";
  board[x2][y2] = piece;
}