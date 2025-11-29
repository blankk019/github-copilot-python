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
    this.currentDifficulty = "medium";
    this.gameStarted = false;

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
    await this.loadInitialGame();
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
      if (e.key === "Enter") {
        this.submitScore();
      }
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

    // Remove non-digit characters
    val = val.replace(/[^1-9]/g, "");
    cell.value = val;

    if (val) {
      const num = parseInt(val);
      await this.validateMove(cell, num);
    } else {
      // Clear all highlights when cell is emptied
      cell.classList.remove("invalid-move");
      this.clearConflictHighlights();
      this.ui.clearMessage();
    }
  }

  /**
   * Render the puzzle on the board
   * @param {Array} puzzle - 2D array of puzzle values
   */
  renderPuzzle(puzzle) {
    this.puzzle = puzzle;
    this.createBoardElement();

    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");

    for (let i = 0; i < GAME_CONFIG.SIZE; i++) {
      for (let j = 0; j < GAME_CONFIG.SIZE; j++) {
        const idx = i * GAME_CONFIG.SIZE + j;
        const cell = inputs[idx];

        if (puzzle[i][j] !== GAME_CONFIG.EMPTY) {
          cell.value = puzzle[i][j];
          cell.disabled = true;
          cell.classList.add("prefilled");
        } else {
          cell.value = "";
          cell.disabled = !this.gameStarted;
        }
      }
    }
  }

  /**
   * Start a new game
   */
  async newGame() {
    const difficulty = document.getElementById("difficulty").value;
    this.currentDifficulty = difficulty;

    try {
      const response = await fetch(`${API_ENDPOINTS.NEW_GAME}?difficulty=${difficulty}`);
      const data = await response.json();

      this.renderPuzzle(data.puzzle);
      this.hintCount = 0;
      this.ui.updateHintCounter(0);
      this.ui.clearMessage();
      this.ui.removeCelebration();
      this.clearConflictHighlights();

      this.timer.reset();
      this.gameStarted = false;
      this.ui.showStartModal();
      this.ui.disableBoard();
    } catch (error) {
      this.ui.showMessage("Failed to start new game", "error");
      console.error("Error starting new game:", error);
    }
  }

  /**
   * Start the game from the modal
   */
  startGame() {
    this.gameStarted = true;
    this.ui.hideStartModal();
    this.ui.enableBoard();
    this.timer.start();
  }

  /**
   * Load initial game without starting timer
   * @private
   */
  async loadInitialGame() {
    const difficulty = document.getElementById("difficulty").value;
    this.currentDifficulty = difficulty;

    try {
      const response = await fetch(`${API_ENDPOINTS.NEW_GAME}?difficulty=${difficulty}`);
      const data = await response.json();

      this.renderPuzzle(data.puzzle);
      this.hintCount = 0;
      this.ui.updateHintCounter(0);
      this.ui.clearMessage();

      this.timer.reset();
      this.gameStarted = false;
    } catch (error) {
      this.ui.showMessage("Failed to load game", "error");
      console.error("Error loading game:", error);
    }
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
        this.handlePuzzleCompletion();
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
  handlePuzzleCompletion() {
    this.timer.stop();
    this.ui.showMessage("🎉 Congratulations! You solved it! 🎉", "success");

    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.classList.add("puzzle-complete");
    this.ui.celebratePuzzleCompletion();

    setTimeout(() => {
      this.ui.showCompletionModal(
        this.timer.getElapsedTime(),
        this.currentDifficulty,
        this.hintCount
      );
    }, GAME_CONFIG.COMPLETION_MODAL_DELAY);
  }

  /**
   * Check if puzzle is complete after a valid move
   * @private
   */
  async checkPuzzleCompletion() {
    const board = this.getCurrentBoard();

    // Check if board is completely filled
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
        this.handlePuzzleCompletion();
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
    // Place the tentative number logically for local conflict check
    board[row][col] = num;

    // Client-side conflict detection for instant feedback
    const localConflicts = this.getLocalConflicts(board, row, col, num);
    if (localConflicts.length > 0) {
      cellInput.classList.add("invalid-move");
      this.highlightConflicts(localConflicts, row, col, num);
      return; // Skip server validation; already invalid
    }

    try {
      const response = await fetch(API_ENDPOINTS.VALIDATE_MOVE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board, row, col, num }),
      });
      const data = await response.json();
      if (data.valid) {
        cellInput.classList.remove("invalid-move");
        this.clearConflictHighlights();
        await this.checkPuzzleCompletion();
      } else {
        cellInput.classList.add("invalid-move");
        this.highlightConflicts(data.conflicts, row, col, num);
      }
    } catch (error) {
      console.error("Error validating move:", error);
    }
  }

  /**
   * Compute local conflicts without server round-trip
   * @param {Array} board - Current board with tentative value placed
   * @param {number} row
   * @param {number} col
   * @param {number} num
   * @returns {Array} conflicts objects {row,col,type}
   * @private
   */
  getLocalConflicts(board, row, col, num) {
    const conflicts = [];
    // Row
    for (let c = 0; c < GAME_CONFIG.SIZE; c++) {
      if (c !== col && board[row][c] === num) {
        conflicts.push({ row, col: c, type: "row" });
      }
    }
    // Column
    for (let r = 0; r < GAME_CONFIG.SIZE; r++) {
      if (r !== row && board[r][col] === num) {
        conflicts.push({ row: r, col, type: "column" });
      }
    }
    // Box
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
    // Deduplicate (in rare edge cases)
    const seen = new Set();
    return conflicts.filter((c) => {
      const key = `${c.row}-${c.col}-${c.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Highlight conflicting cells
   * @param {Array} conflicts - Array of conflict objects with row, col, and type
   * @param {number} currentRow - Current cell row
   * @param {number} currentCol - Current cell column
   * @param {number} num - The conflicting number
   * @private
   */
  highlightConflicts(conflicts, currentRow, currentCol, num) {
    // Clear previous conflict highlights first
    this.clearConflictHighlights();

    if (!conflicts || conflicts.length === 0) return;

    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");

    // Group conflicts by type for the message
    const conflictTypes = new Set(conflicts.map((c) => c.type));
    const conflictMessages = [];

    if (conflictTypes.has("row")) conflictMessages.push("same row");
    if (conflictTypes.has("column")) conflictMessages.push("same column");
    if (conflictTypes.has("box")) conflictMessages.push("same 3×3 box");

    // Highlight each conflicting cell
    conflicts.forEach((conflict) => {
      const idx = conflict.row * GAME_CONFIG.SIZE + conflict.col;
      const conflictCell = inputs[idx];
      if (conflictCell) {
        conflictCell.classList.add("conflict-cell");
        conflictCell.dataset.conflictType = conflict.type;
      }
    });

    // Show message explaining the conflict
    const message = `${num} already exists in ${conflictMessages.join(", ")}`;
    this.ui.showMessage(message, "error");
  }

  /**
   * Clear all conflict highlights
   * @private
   */
  clearConflictHighlights() {
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");

    for (let input of inputs) {
      input.classList.remove("conflict-cell");
      delete input.dataset.conflictType;
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
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");
    const idx = row * GAME_CONFIG.SIZE + col;
    const cell = inputs[idx];

    if (cell && !cell.disabled) {
      cell.value = value;
      cell.classList.add("hint-cell");
      cell.disabled = true;

      this.hintCount++;
      this.ui.updateHintCounter(this.hintCount);
      this.ui.showMessage(`Hint applied: ${value} at row ${row + 1}, column ${col + 1}`, "success");

      setTimeout(() => {
        cell.classList.remove("hint-cell");
      }, 2000);
    }
  }

  /**
   * Submit score to leaderboard
   */
  submitScore() {
    const name = this.ui.getPlayerName();
    this.leaderboard.saveScore(
      name,
      this.timer.getElapsedTime(),
      this.currentDifficulty,
      this.hintCount
    );
    this.ui.hideCompletionModal();
  }
}
