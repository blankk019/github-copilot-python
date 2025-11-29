// Client-side rendering and interaction for the Flask-backed Sudoku
const SIZE = 9;
let puzzle = [];
let hintCount = 0;

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
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  const difficulty = document.getElementById("difficulty").value;
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
    msg.style.color = "#388e3c";
    msg.innerText = "Congratulations! You solved it!";
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
    msg.style.color = "#388e3c";
    msg.innerText = "🎉 Congratulations! You solved the puzzle! 🎉";

    // Add celebration animation to the board
    const boardDiv = document.getElementById("sudoku-board");
    boardDiv.classList.add("puzzle-complete");

    // Optional: Show confetti or other celebration effect
    celebratePuzzleCompletion();
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
      // Remove previous hint highlights
      document.querySelectorAll(".hint-cell").forEach((c) => c.classList.remove("hint-cell"));

      // Highlight the hint cell and fill value
      cell.classList.add("hint-cell");
      cell.value = value;

      hintCount++;
      document.getElementById("hint-counter").innerText = `Hints used: ${hintCount}`;

      msg.style.color = "#4CAF50";
      msg.innerText = "Hint applied!";

      // Remove highlight after 3 seconds
      setTimeout(() => {
        cell.classList.remove("hint-cell");
        if (msg.innerText === "Hint applied!") {
          msg.innerText = "";
        }
      }, 3000);
    }
  } else {
    msg.style.color = "#d32f2f";
    msg.innerText = data.message || "No hint available";
  }
}

// Wire buttons
window.addEventListener("load", () => {
  document.getElementById("new-game").addEventListener("click", newGame);
  document.getElementById("check-solution").addEventListener("click", checkSolution);
  document.getElementById("hints-button").addEventListener("click", getHint);

  // Theme toggle functionality
  const themeToggle = document.getElementById("theme-toggle");
  const sunIcon = document.getElementById("sun-icon");
  const moonIcon = document.getElementById("moon-icon");

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });
  sunIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    document.body.classList.remove("dark-mode");
  });
  moonIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    document.body.classList.add("dark-mode");
  });

  // initialize
  newGame();
});
