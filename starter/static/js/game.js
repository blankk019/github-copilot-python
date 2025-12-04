/**
 * Main game logic module
 */

import { GAME_CONFIG, API_ENDPOINTS } from "./config.js";
import { Timer } from "./timer.js";
import { Leaderboard } from "./leaderboard.js";
import { UIManager } from "./ui.js";

export class SudokuGame {
  constructor() {
    this.puzzle = [];
    this.hintCount = 0;
    this.difficulty = "medium";
    this.isPlaying = false;
    this.isComplete = false;

    // Initialize components
    this.timer = new Timer();
    this.leaderboard = new Leaderboard();
    this.ui = new UIManager();

    // Bind methods
    this.handleCellInput = this.handleCellInput.bind(this);
  }

  /**
   * Initialize the game
   */
  async init() {
    this.setupEventListeners();
    this.ui.showStartModal();
    this.leaderboard.display();
  }

  /**
   * Setup event listeners
   * @private
   */
  setupEventListeners() {
    document.getElementById("new-game").addEventListener("click", () => this.newGame());
    document.getElementById("check-solution").addEventListener("click", () => this.checkSolution());
    document.getElementById("hints-button").addEventListener("click", () => this.getHint());
    document.getElementById("start-game-btn").addEventListener("click", () => this.startGame());
    document.getElementById("submit-score").addEventListener("click", () => this.submitScore());
    document
      .getElementById("skip-score")
      .addEventListener("click", () => this.ui.hideCompletionModal());

    document.getElementById("player-name").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.submitScore();
    });

    this.setupThemeToggle();
  }

  /**
   * Setup theme toggle functionality
   * @private
   */
  setupThemeToggle() {
    const themeToggle = document.getElementById("theme-toggle");

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
      const isDark = document.body.classList.contains("dark-mode");
      localStorage.setItem(GAME_CONFIG.DARK_MODE_KEY, isDark);
    });

    // Load saved theme
    const savedDarkMode = localStorage.getItem(GAME_CONFIG.DARK_MODE_KEY);
    if (savedDarkMode === "true") {
      document.body.classList.add("dark-mode");
    }
  }

  /**
   * Create the game board element
   * @private
   */
  createBoardElement() {
    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.innerHTML = "";

    for (let i = 0; i < GAME_CONFIG.SIZE; i++) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "sudoku-row";

      for (let j = 0; j < GAME_CONFIG.SIZE; j++) {
        const cell = this.createCell(i, j);
        rowDiv.appendChild(cell);
      }

      boardDiv.appendChild(rowDiv);
    }
  }

  /**
   * Create a single cell element
   * @param {number} row - Row index
   * @param {number} col - Column index
   * @returns {HTMLInputElement} Cell element
   * @private
   */
  createCell(row, col) {
    const cell = document.createElement("input");
    cell.type = "text";
    cell.className = "sudoku-cell";
    cell.maxLength = 1;
    cell.dataset.row = row;
    cell.dataset.col = col;

    cell.addEventListener("input", this.handleCellInput);

    return cell;
  }

  /**
   * Handle cell input events
   * @param {Event} e - Input event
   * @private
   */
  async handleCellInput(e) {
    const cell = e.target;
    let val = cell.value;

    // Only keep the last digit if multiple are entered
    if (val.length > 1) {
      val = val.slice(-1);
    }

    // Remove non-digit characters
    val = val.replace(/[^1-9]/g, "");
    cell.value = val;

    // Clear previous error states for this cell
    cell.classList.remove("incorrect", "invalid-move");
    this.clearConflictHighlights();
    this.ui.clearMessage();

    if (val) {
      const num = parseInt(val);
      await this.validateMove(cell, num);
    }
  }

  /**
   * Render the puzzle on the board
   * @param {Array} puzzle - 2D array of puzzle values
   */
  renderPuzzle(puzzle) {
    this.puzzle = puzzle;
    this.createBoardElement();

    const inputs = document.getElementById("sudoku-board").getElementsByTagName("input");

    for (let i = 0; i < GAME_CONFIG.SIZE; i++) {
      for (let j = 0; j < GAME_CONFIG.SIZE; j++) {
        const idx = i * GAME_CONFIG.SIZE + j;
        const cell = inputs[idx];
        const value = puzzle[i][j];

        if (value !== GAME_CONFIG.EMPTY) {
          cell.value = value;
          cell.disabled = true;
          cell.classList.add("prefilled");
        } else {
          cell.value = "";
          cell.disabled = !this.isPlaying;
        }
      }
    }
  }

  /**
   * Start a new game - shows modal and resets state
   */
  newGame() {
    this.resetGameState();
    this.ui.showStartModal();
    this.renderPuzzle(this.createEmptyBoard());
    document.getElementById("difficulty").disabled = false;
  }

  /**
   * Start the game from the modal - fetches and displays puzzle
   */
  async startGame() {
    this.difficulty = document.getElementById("difficulty").value;

    try {
      const response = await fetch(`${API_ENDPOINTS.NEW_GAME}?difficulty=${this.difficulty}`);
      const data = await response.json();

      this.isPlaying = true;
      this.renderPuzzle(data.puzzle);
      this.ui.hideStartModal();
      this.ui.enableBoard();
      this.ui.enableActions();
      document.getElementById("difficulty").disabled = true;
      this.timer.start();
    } catch (error) {
      this.ui.showMessage("Failed to load puzzle", "error");
      console.error("Error loading puzzle:", error);
    }
  }

  /**
   * Reset game state
   * @private
   */
  resetGameState() {
    this.hintCount = 0;
    this.isPlaying = false;
    this.isComplete = false;
    this.ui.updateHintCounter(0);
    this.ui.clearMessage();
    this.ui.removeCelebration();
    this.clearConflictHighlights();
    this.timer.reset();
    this.ui.disableBoard();
    this.ui.enableActions();
  }

  /**
   * Create empty board
   * @private
   */
  createEmptyBoard() {
    return Array(9)
      .fill(null)
      .map(() => Array(9).fill(0));
  }

  /**
   * Get current board state
   * @returns {Array} 2D array of current board values
   * @private
   */
  getCurrentBoard() {
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");
    const board = [];

    for (let i = 0; i < GAME_CONFIG.SIZE; i++) {
      board[i] = [];
      for (let j = 0; j < GAME_CONFIG.SIZE; j++) {
        const idx = i * GAME_CONFIG.SIZE + j;
        const val = inputs[idx].value;
        board[i][j] = val ? parseInt(val) : GAME_CONFIG.EMPTY;
      }
    }

    return board;
  }

  /**
   * Check the player's solution
   */
  async checkSolution() {
    if (this.isComplete) return;

    const board = this.getCurrentBoard();

    try {
      const response = await fetch(API_ENDPOINTS.CHECK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      });

      const data = await response.json();

      if (data.error) {
        this.ui.showMessage(data.error, "error");
        return;
      }

      this.markIncorrectCells(data.incorrect);

      if (data.incorrect.length === 0) {
        this.completePuzzle();
      } else {
        this.ui.showMessage("Some cells are incorrect.", "error");
      }
    } catch (error) {
      this.ui.showMessage("Failed to check solution", "error");
      console.error("Error checking solution:", error);
    }
  }

  /**
   * Mark incorrect cells on the board
   * @param {Array} incorrectCells - Array of [row, col] coordinates
   * @private
   */
  markIncorrectCells(incorrectCells) {
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");
    const incorrectSet = new Set(incorrectCells.map(([r, c]) => r * GAME_CONFIG.SIZE + c));

    for (let idx = 0; idx < inputs.length; idx++) {
      const input = inputs[idx];
      if (input.disabled) continue;

      input.className = "sudoku-cell";
      if (incorrectSet.has(idx)) {
        input.classList.add("incorrect");
      }
    }
  }

  /**
   * Handle puzzle completion
   * @private
   */
  completePuzzle() {
    if (this.isComplete) return;

    this.isComplete = true;
    this.timer.stop();
    this.ui.showMessage("🎉 Congratulations! You solved it! 🎉", "success");
    this.ui.disableBoard();
    this.ui.disableActions();

    document.getElementById("sudoku-board").classList.add("puzzle-complete");
    this.ui.celebratePuzzleCompletion();

    setTimeout(() => {
      this.ui.showCompletionModal(this.timer.getElapsedTime(), this.difficulty, this.hintCount);
    }, GAME_CONFIG.COMPLETION_MODAL_DELAY);
  }

  /**
   * Check if puzzle is complete after a valid move
   * @private
   */
  async checkIfComplete() {
    const board = this.getCurrentBoard();
    const isFilled = board.every((row) => row.every((cell) => cell !== GAME_CONFIG.EMPTY));

    if (!isFilled) return;

    try {
      const response = await fetch(API_ENDPOINTS.CHECK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      });

      const data = await response.json();

      if (data.incorrect && data.incorrect.length === 0) {
        this.completePuzzle();
      }
    } catch (error) {
      console.error("Error checking completion:", error);
    }
  }

  /**
   * Validate a move
   * @param {HTMLInputElement} cellInput - Cell element
   * @param {number} num - Number to validate
   * @private
   */
  async validateMove(cellInput, num) {
    const row = parseInt(cellInput.dataset.row);
    const col = parseInt(cellInput.dataset.col);
    const board = this.getCurrentBoard();

    // Create board without current cell to avoid self-conflict
    const boardForCheck = board.map((r) => r.slice());
    boardForCheck[row][col] = GAME_CONFIG.EMPTY;

    // Client-side conflict detection for instant feedback
    const conflicts = this.getLocalConflicts(boardForCheck, row, col, num);

    if (conflicts.length > 0) {
      cellInput.classList.add("invalid-move");
      this.highlightConflicts(conflicts, num);
      return;
    }

    cellInput.classList.remove("invalid-move");
    this.clearConflictHighlights();

    // Check if puzzle is now complete
    await this.checkIfComplete();
  }

  /**
   * Compute local conflicts without server round-trip
   * @param {Array} board - Current board state
   * @param {number} row
   * @param {number} col
   * @param {number} num
   * @returns {Array} conflicts array with {row, col, type}
   * @private
   */
  getLocalConflicts(board, row, col, num) {
    const conflicts = [];

    // Check row
    for (let c = 0; c < GAME_CONFIG.SIZE; c++) {
      if (c !== col && board[row][c] === num) {
        conflicts.push({ row, col: c, type: "row" });
      }
    }

    // Check column
    for (let r = 0; r < GAME_CONFIG.SIZE; r++) {
      if (r !== row && board[r][col] === num) {
        conflicts.push({ row: r, col, type: "column" });
      }
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = startRow + i;
        const c = startCol + j;
        if ((r !== row || c !== col) && board[r][c] === num) {
          conflicts.push({ row: r, col: c, type: "box" });
        }
      }
    }

    return conflicts;
  }

  /**
   * Highlight conflicting cells
   * @param {Array} conflicts - Array of conflict objects
   * @param {number} num - The conflicting number
   * @private
   */
  highlightConflicts(conflicts, num) {
    this.clearConflictHighlights();

    if (!conflicts || conflicts.length === 0) return;

    const inputs = document.getElementById("sudoku-board").getElementsByTagName("input");
    const conflictTypes = new Set(conflicts.map((c) => c.type));
    const messages = [];

    if (conflictTypes.has("row")) messages.push("same row");
    if (conflictTypes.has("column")) messages.push("same column");
    if (conflictTypes.has("box")) messages.push("same 3×3 box");

    conflicts.forEach((conflict) => {
      const idx = conflict.row * GAME_CONFIG.SIZE + conflict.col;
      const cell = inputs[idx];
      if (cell) {
        cell.classList.add("conflict-cell");
      }
    });

    this.ui.showMessage(`${num} already exists in ${messages.join(", ")}`, "error");
  }

  /**
   * Clear all conflict highlights
   * @private
   */
  clearConflictHighlights() {
    const inputs = document.getElementById("sudoku-board").getElementsByTagName("input");
    for (let input of inputs) {
      input.classList.remove("conflict-cell");
    }
  }

  /**
   * Get a hint for an empty cell
   */
  async getHint() {
    const board = this.getCurrentBoard();

    try {
      const response = await fetch(API_ENDPOINTS.GET_HINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board }),
      });

      const data = await response.json();

      if (data.success) {
        this.applyHint(data.hint);
      } else {
        this.ui.showMessage(data.message || "No hint available", "error");
      }
    } catch (error) {
      this.ui.showMessage("Failed to get hint", "error");
      console.error("Error getting hint:", error);
    }
  }

  /**
   * Apply a hint to the board
   * @param {Object} hint - Hint object with row, col, value
   * @private
   */
  applyHint(hint) {
    const { row, col, value } = hint;
    const inputs = document.getElementById("sudoku-board").getElementsByTagName("input");
    const idx = row * GAME_CONFIG.SIZE + col;
    const cell = inputs[idx];

    if (cell && !cell.disabled) {
      cell.value = value;
      cell.classList.remove("incorrect", "invalid-move");
      this.clearConflictHighlights();
      this.ui.clearMessage();

      cell.classList.add("hint-cell");
      cell.disabled = true;

      this.hintCount++;
      this.ui.updateHintCounter(this.hintCount);
      this.ui.showMessage(`Hint applied: ${value} at row ${row + 1}, column ${col + 1}`, "success");

      setTimeout(() => cell.classList.remove("hint-cell"), 2000);

      this.checkIfComplete();
    }
  }

  /**
   * Submit score to leaderboard
   */
  submitScore() {
    const name = this.ui.getPlayerName();
    this.leaderboard.saveScore(name, this.timer.getElapsedTime(), this.difficulty, this.hintCount);
    this.ui.hideCompletionModal();
  }
}
