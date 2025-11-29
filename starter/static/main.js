// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let hintCount = 0;
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let currentDifficulty = "medium";
let gameStarted = false;

function createBoardElement() {
  const boardDiv = document.getElementById("sudoku-board");
  boardDiv.innerHTML = "";
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement("div");
    rowDiv.className = "sudoku-row";
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.className = "sudoku-cell";
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener("input", async (e) => {
        const val = e.target.value.replace(/[^1-9]/g, "");
        e.target.value = val;

        // Validate the move immediately
        if (val) {
          await validateMove(e.target, parseInt(val));
        } else {
          // Clear validation styling when cell is empty
          e.target.classList.remove("invalid-move");
        }
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = document.getElementById("sudoku-board");
  const inputs = boardDiv.getElementsByTagName("input");
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.className += " prefilled";
      } else {
        inp.value = "";
        // Disable input if game hasn't started
        inp.disabled = !gameStarted;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById("difficulty").value;
  currentDifficulty = difficulty;
  const res = await fetch(`/new?difficulty=${difficulty}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  hintCount = 0;
  document.getElementById("hint-counter").innerText = "Hints used: 0";
  document.getElementById("message").innerText = "";

  // Remove celebration classes from previous game
  const boardDiv = document.getElementById("sudoku-board");
  boardDiv.classList.remove("puzzle-complete");
  document.querySelectorAll(".sudoku-cell").forEach((cell) => {
    cell.classList.remove("celebrate");
  });

  // Reset game state and show start modal
  resetTimer();
  gameStarted = false;

  // Show start modal
  const startModal = document.getElementById("start-modal");
  startModal.classList.remove("hidden");

  // Disable all editable cells until game starts
  disableBoard();
}

async function checkSolution() {
  const boardDiv = document.getElementById("sudoku-board");
  const inputs = boardDiv.getElementsByTagName("input");
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  const res = await fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board }),
  });
  const data = await res.json();
  const msg = document.getElementById("message");
  if (data.error) {
    msg.style.color = "#d32f2f";
    msg.innerText = data.error;
    return;
  }
  const incorrect = new Set(data.incorrect.map((x) => x[0] * SIZE + x[1]));
  for (let idx = 0; idx < inputs.length; idx++) {
    const inp = inputs[idx];
    if (inp.disabled) continue;
    inp.className = "sudoku-cell";
    if (incorrect.has(idx)) {
      inp.className = "sudoku-cell incorrect";
    }
  }
  if (incorrect.size === 0) {
    // Stop the timer
    stopTimer();

    msg.style.color = "#388e3c";
    msg.innerText = "🎉 Congratulations! You solved it! 🎉";

    // Add celebration animation
    boardDiv.classList.add("puzzle-complete");
    celebratePuzzleCompletion();

    // Show modal for name input
    showNameModal();
  } else {
    msg.style.color = "#d32f2f";
    msg.innerText = "Some cells are incorrect.";
  }
}

function getCurrentBoard() {
  const boardDiv = document.getElementById("sudoku-board");
  const inputs = boardDiv.getElementsByTagName("input");
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = inputs[idx].value;
      board[i][j] = val ? parseInt(val, 10) : 0;
    }
  }
  return board;
}

async function checkPuzzleCompletion() {
  const board = getCurrentBoard();

  // Check if board is completely filled
  let isFilled = true;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) {
        isFilled = false;
        break;
      }
    }
    if (!isFilled) break;
  }

  if (!isFilled) return;

  // If filled, check if solution is correct
  const res = await fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board }),
  });
  const data = await res.json();
  const msg = document.getElementById("message");

  if (data.incorrect && data.incorrect.length === 0) {
    // Puzzle is solved correctly!
    stopTimer();
    msg.style.color = "#388e3c";
    msg.innerText = "🎉 Congratulations! You solved the puzzle! 🎉";

    // Add celebration animation to the board
    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.classList.add("puzzle-complete");

    // Optional: Show confetti or other celebration effect
    celebratePuzzleCompletion();

    // Show modal for name input
    setTimeout(() => {
      showNameModal();
    }, 500);
  }
}

function celebratePuzzleCompletion() {
  // Add a subtle celebration effect
  const inputs = document.querySelectorAll(".sudoku-cell");
  inputs.forEach((input, index) => {
    setTimeout(() => {
      input.classList.add("celebrate");
    }, index * 10);
  });
}

async function validateMove(cellInput, num) {
  const row = parseInt(cellInput.dataset.row);
  const col = parseInt(cellInput.dataset.col);
  const board = getCurrentBoard();

  // Temporarily set the cell to 0 to check if the number can be placed there
  board[row][col] = 0;

  const res = await fetch("/validate_move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board, row, col, num }),
  });
  const data = await res.json();

  // Add or remove invalid class based on validation
  if (data.valid) {
    cellInput.classList.remove("invalid-move");

    // Check if puzzle is complete after valid move
    await checkPuzzleCompletion();
  } else {
    cellInput.classList.add("invalid-move");
  }
}

async function getHint() {
  const board = getCurrentBoard();
  const res = await fetch("/get_hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ board }),
  });
  const data = await res.json();
  const msg = document.getElementById("message");

  if (data.success) {
    const { row, col, value } = data.hint;
    const boardDiv = document.getElementById("sudoku-board");
    const inputs = boardDiv.getElementsByTagName("input");
    const idx = row * SIZE + col;
    const cell = inputs[idx];

    if (cell && !cell.disabled) {
      // Highlight the hint cell and fill value
      cell.classList.add("hint-cell");
      cell.value = value;
      cell.disabled = true; // Lock the cell so user can't modify it

      hintCount++;
      document.getElementById("hint-counter").innerText = `Hints used: ${hintCount}`;

      msg.style.color = "#4CAF50";
      msg.innerText = "Hint applied!";

      // Clear message after 2 seconds (but keep cell green and locked)
      setTimeout(() => {
        if (msg.innerText === "Hint applied!") {
          msg.innerText = "";
        }
      }, 2000);
    }
  } else {
    msg.style.color = "#d32f2f";
    msg.innerText = data.message || "No hint available";
  }
}

// Modal functions
function showNameModal() {
  const modal = new bootstrap.Modal(document.getElementById("name-modal"));
  const statsElement = document.getElementById("completion-stats");
  const nameInput = document.getElementById("player-name");

  // Display completion statistics
  statsElement.innerHTML = `
    <i class="bi bi-stopwatch me-2"></i><strong>Time:</strong> ${getFormattedTime(elapsedTime)} | 
    <i class="bi bi-speedometer2 me-2"></i><strong>Difficulty:</strong> ${
      currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)
    } | 
    <i class="bi bi-lightbulb me-2"></i><strong>Hints:</strong> ${hintCount}
  `;

  // Clear previous input and show modal
  nameInput.value = "";
  modal.show();

  // Focus on input after modal animation
  setTimeout(() => nameInput.focus(), 400);
}

function hideNameModal() {
  const modal = bootstrap.Modal.getInstance(document.getElementById("name-modal"));
  if (modal) {
    modal.hide();
  }
}

function submitScore() {
  const nameInput = document.getElementById("player-name");
  const name = nameInput.value.trim() || "Anonymous";

  saveScore(name, elapsedTime, currentDifficulty, hintCount);
  hideNameModal();
}

// Timer functions
function startTimer() {
  if (timerInterval) return; // Already running
  startTime = Date.now() - elapsedTime;
  timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetTimer() {
  stopTimer();
  elapsedTime = 0;
  updateTimerDisplay(0);
}

function updateTimer() {
  elapsedTime = Date.now() - startTime;
  updateTimerDisplay(elapsedTime);
}

function updateTimerDisplay(time) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  document.getElementById("timer").textContent = `${String(minutes).padStart(2, "0")}:${String(
    displaySeconds
  ).padStart(2, "0")}`;
}

function getFormattedTime(time) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const displaySeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(displaySeconds).padStart(2, "0")}`;
}

// Leaderboard functions
function saveScore(name, time, difficulty, hints) {
  let leaderboard = JSON.parse(localStorage.getItem("sudokuLeaderboard") || "[]");

  leaderboard.push({
    name: name,
    time: time,
    difficulty: difficulty,
    hints: hints,
    timestamp: Date.now(),
  });

  // Sort by time (ascending) and keep top 10
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 10);

  localStorage.setItem("sudokuLeaderboard", JSON.stringify(leaderboard));
  displayLeaderboard();
}

function displayLeaderboard() {
  const leaderboard = JSON.parse(localStorage.getItem("sudokuLeaderboard") || "[]");
  const tbody = document.getElementById("leaderboard-body");

  if (leaderboard.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-4">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No scores yet. Be the first!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = leaderboard
    .map(
      (entry, index) => `
    <tr>
      <td class="text-center fw-bold">${index + 1}</td>
      <td class="fw-semibold">${entry.name}</td>
      <td><span class="badge bg-primary">${getFormattedTime(entry.time)}</span></td>
      <td><span class="badge ${getDifficultyBadge(entry.difficulty)}">${
        entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)
      }</span></td>
      <td class="text-center">${entry.hints}</td>
    </tr>
  `
    )
    .join("");
}

function getDifficultyBadge(difficulty) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-success";
    case "medium":
      return "bg-warning text-dark";
    case "hard":
      return "bg-danger";
    default:
      return "bg-secondary";
  }
}

function promptForName() {
  const name = prompt("🎉 Congratulations! Enter your name for the leaderboard:");
  return name && name.trim() ? name.trim() : "Anonymous";
}

function disableBoard() {
  const boardDiv = document.getElementById("sudoku-board");
  const inputs = boardDiv.getElementsByTagName("input");
  for (let input of inputs) {
    if (!input.classList.contains("prefilled")) {
      input.disabled = true;
    }
  }
}

function enableBoard() {
  const boardDiv = document.getElementById("sudoku-board");
  const inputs = boardDiv.getElementsByTagName("input");
  for (let input of inputs) {
    if (!input.classList.contains("prefilled")) {
      input.disabled = false;
    }
  }
}

function startGameFromModal() {
  gameStarted = true;
  const startModal = document.getElementById("start-modal");
  startModal.classList.add("hidden");

  // Enable the board
  enableBoard();

  // Start the timer
  startTimer();
}

async function loadInitialGame() {
  const difficulty = document.getElementById("difficulty").value;
  currentDifficulty = difficulty;
  const res = await fetch(`/new?difficulty=${difficulty}`);
  const data = await res.json();
  renderPuzzle(data.puzzle);
  hintCount = 0;
  document.getElementById("hint-counter").innerText = "Hints used: 0";
  document.getElementById("message").innerText = "";

  // Don't start timer, wait for user to click START
  resetTimer();
  gameStarted = false;
}

// Wire buttons
window.addEventListener("load", () => {
  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("check-solution").addEventListener("click", checkSolution);
  document.getElementById("hints-button").addEventListener("click", getHint);

  // Modal button listeners
  document.getElementById("submit-score").addEventListener("click", submitScore);
  document.getElementById("skip-score").addEventListener("click", hideNameModal);

  // Allow Enter key to submit name
  document.getElementById("player-name").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submitScore();
    }
  });

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    // Save preference to localStorage
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  });

  // Load saved theme preference
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode === "true") {
    document.body.classList.add("dark-mode");
  }

  // Start game button listener
  document.getElementById("start-game-btn").addEventListener("click", startGameFromModal);

  // initialize
  displayLeaderboard();

  // Load initial game without starting timer
  loadInitialGame();
});
