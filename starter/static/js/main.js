/**
 * Main application entry point
 */

import { SudokuGame } from "./game.js";

// Initialize game when DOM is loaded
window.addEventListener("load", () => {
  const game = new SudokuGame();
  game.init();
});
