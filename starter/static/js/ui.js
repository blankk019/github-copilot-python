/**
 * UI management module
 */

import { GAME_CONFIG } from "./config.js";
import { Timer } from "./timer.js";

export class UIManager {
  constructor() {
    this.messageElement = document.getElementById("message");
    this.hintCounterElement = document.getElementById("hint-counter");
    this.startModal = document.getElementById("start-modal");
    this.nameModal = null;
    this.nameInput = document.getElementById("player-name");
    this.statsElement = document.getElementById("completion-stats");
    this.btnNewGame = document.getElementById("new-game");
    this.btnCheck = document.getElementById("check-solution");
    this.btnHint = document.getElementById("hints-button");
  }

  /**
   * Initialize Bootstrap modal
   */
  initNameModal() {
    this.nameModal = new bootstrap.Modal(document.getElementById("name-modal"));
  }

  /**
   * Display a message to the user
   * @param {string} message - Message text
   * @param {string} type - Message type (success, error, info)
   */
  showMessage(message, type = "info") {
    const colors = {
      success: "#388e3c",
      error: "#d32f2f",
      info: "#1976d2",
    };

    this.messageElement.style.color = colors[type] || colors.info;
    this.messageElement.innerText = message;
  }

  /**
   * Clear the message display
   */
  clearMessage() {
    this.messageElement.innerText = "";
  }

  /**
   * Update hint counter display
   * @param {number} count - Number of hints used
   */
  updateHintCounter(count) {
    this.hintCounterElement.innerText = `Hints used: ${count}`;
  }

  /**
   * Show the start game modal
   */
  showStartModal() {
    this.startModal.classList.remove("hidden");
  }

  /**
   * Hide the start game modal
   */
  hideStartModal() {
    this.startModal.classList.add("hidden");
  }

  /**
   * Show the completion modal with statistics
   * @param {number} elapsedTime - Time in milliseconds
   * @param {string} difficulty - Difficulty level
   * @param {number} hintCount - Number of hints used
   */
  showCompletionModal(elapsedTime, difficulty, hintCount) {
    if (!this.nameModal) {
      this.initNameModal();
    }

    const difficultyLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);

    this.statsElement.innerHTML = `
      <i class="bi bi-stopwatch me-2"></i><strong>Time:</strong> ${Timer.formatTime(elapsedTime)} | 
      <i class="bi bi-speedometer2 me-2"></i><strong>Difficulty:</strong> ${difficultyLabel} | 
      <i class="bi bi-lightbulb me-2"></i><strong>Hints:</strong> ${hintCount}
    `;

    this.nameInput.value = "";
    this.nameModal.show();

    setTimeout(() => this.nameInput.focus(), GAME_CONFIG.MODAL_FOCUS_DELAY);
  }

  /**
   * Hide the completion modal
   */
  hideCompletionModal() {
    if (this.nameModal) {
      this.nameModal.hide();
    }
  }

  /**
   * Get player name from input
   * @returns {string} Player name or 'Anonymous'
   */
  getPlayerName() {
    return this.nameInput.value.trim() || "Anonymous";
  }

  /**
   * Add celebration animation to cells
   */
  celebratePuzzleCompletion() {
    const inputs = document.querySelectorAll(".sudoku-cell");
    inputs.forEach((input, index) => {
      setTimeout(() => {
        input.classList.add("celebrate");
      }, index * GAME_CONFIG.CELL_ANIMATION_DELAY);
    });
  }

  /**
   * Remove all celebration classes
   */
  removeCelebration() {
    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.classList.remove("puzzle-complete");

    document.querySelectorAll(".sudoku-cell").forEach((cell) => {
      cell.classList.remove("celebrate");
    });
  }

  /**
   * Disable all editable cells
   */
  disableBoard() {
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");

    for (let input of inputs) {
      if (!input.classList.contains("prefilled")) {
        input.disabled = true;
      }
    }
  }

  /**
   * Enable all editable cells
   */
  enableBoard() {
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");

    for (let input of inputs) {
      if (!input.classList.contains("prefilled")) {
        input.disabled = false;
      }
    }
  }

  /**
   * Disable action buttons except New Game
   */
  disableActions() {
    if (this.btnCheck) this.btnCheck.disabled = true;
    if (this.btnHint) this.btnHint.disabled = true;
  }

  /**
   * Enable action buttons (used on new game/start)
   */
  enableActions() {
    if (this.btnCheck) this.btnCheck.disabled = false;
    if (this.btnHint) this.btnHint.disabled = false;
  }
}
