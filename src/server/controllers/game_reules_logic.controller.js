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

function isValidMove(board, from, to, color) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  if (!board[x1][y1] || getPieceColor(board[x1][y1]) != color) return false;
  if (!isInBounds(x2, y2)) return false; 
  if (getPieceColor(board[x2][y2]) === color) return false;

  switch (piece.toLowerCase()) {
    case "p": // Pawn
      return validatePawnMove(from, to, color, board);
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

function validatePawnMove([x1, y1], [x2, y2], color, board) {
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
