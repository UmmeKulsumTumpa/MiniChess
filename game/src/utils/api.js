// src/utils/api.js

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/game';

export const startGame = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/start`);
    return response.data;
  } catch (error) {
    console.error('Error starting game:', error);
    throw error;
  }
};

export const makeMove = async (move, gameState) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/move`, {
      move,
      gameState,
    });
    return response.data;
  } catch (error) {
    console.error('Error making move:', error);
    throw error;
  }
};

export const getAIMove = async (gameState) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/ai-move`, {
      gameState,
    });
    return response.data;
  } catch (error) {
    console.error('Error getting AI move:', error);
    throw error;
  }
};
