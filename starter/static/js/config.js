/**
 * Game configuration and constants
 */

export const GAME_CONFIG = {
  SIZE: 9,
  EMPTY: 0,
  STORAGE_KEY: "sudokuLeaderboard",
  DARK_MODE_KEY: "darkMode",
  CELL_ANIMATION_DELAY: 10,
  MODAL_FOCUS_DELAY: 400,
  COMPLETION_MODAL_DELAY: 500,
};

export const DIFFICULTY = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const DIFFICULTY_BADGES = {
  easy: "bg-success",
  medium: "bg-warning",
  hard: "bg-danger",
};

export const API_ENDPOINTS = {
  NEW_GAME: "/new",
  CHECK: "/check",
  GET_HINT: "/get_hint",
  VALIDATE_MOVE: "/validate_move",
};
