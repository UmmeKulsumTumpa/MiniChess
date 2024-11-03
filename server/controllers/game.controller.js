const { func } = require("prop-types");
const WebSocket = require("ws");
const gameRules = require("../utils/game_reules");

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

function performMove(from, to, board) {
  if (!gameRules.isValidMoveWithKingSafety()) return [false, board];

  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  board[x1][y1] = "";
  board[x2][y2] = piece;

  return [true, board]
}