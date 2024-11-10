// server/routes/gameRoutes.js

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start', gameController.startGame);
router.post('/move', gameController.makeMove);
router.post('/ai-move', gameController.getAIMove);

module.exports = router;
