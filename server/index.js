// index.js
const { iddfs } = require("./utils/search");
const gameRules = require("./utils/gameRules");

// Initial board setup
const initialBoard = [
  ["r", "n", "q", "k", "b"],
  ["p", "p", "p", "p", "p"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["P", "P", "P", "P", "P"],
  ["R", "N", "Q", "K", "B"],
];

// Helper function to clone the board
function cloneBoard(board) {
  return board.map(row => [...row]);
}

// Helper function to print the board in a readable format
function printBoard(board) {
  console.log("  0 1 2 3 4"); // Column indices
  board.forEach((row, index) => {
    const rowStr = row.map(cell => (cell ? cell : ".")).join(" ");
    console.log(`${index} ${rowStr}`);
  });
  console.log(""); // Empty line for better readability
}

// Function to perform a move on the board
function performMove(from, to, board) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const piece = board[x1][y1];

  board[x1][y1] = "";
  board[x2][y2] = piece;
}

// Example usage
function main() {
  let board = cloneBoard(initialBoard);
  let currentColor = gameRules.WHITE;
  let lastMove = null;

  console.log("Initial Board:");
  printBoard(board);

  // Find the best move for the current player
  const bestMove = iddfs(board, currentColor, lastMove, 4);

  if (bestMove) {
    console.log(`Best move for ${currentColor}:`);
    console.log(`From: (${bestMove.from[0]}, ${bestMove.from[1]})`);
    console.log(`To: (${bestMove.to[0]}, ${bestMove.to[1]})\n`);

    // Perform the move on the board
    performMove(bestMove.from, bestMove.to, board);

    console.log("Board After Move:");
    printBoard(board);
  } else {
    console.log(`No winning move found for ${currentColor}.`);
  }
}

main();
