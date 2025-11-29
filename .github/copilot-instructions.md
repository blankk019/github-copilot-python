# GitHub Copilot Instructions - Sudoku Flask App

## Project Architecture

This is a **Flask-based Sudoku web application** with a Python backend and vanilla JavaScript frontend. The architecture follows a simple request-response pattern:

- **Backend (`starter/app.py`)**: Flask server with in-memory game state stored in `CURRENT` dict
- **Game Logic (`starter/sudoku_logic.py`)**: Puzzle generation using backtracking algorithm with randomized candidates
- **Frontend (`starter/static/main.js`)**: Client-side board rendering with fetch API for `/new` and `/check` endpoints
- **Templates (`starter/templates/index.html`)**: Single-page app with dynamically generated board

### Critical Data Flow

1. User clicks "New Game" → `/new` endpoint generates puzzle via `sudoku_logic.generate_puzzle(clues)` → stores both `puzzle` and `solution` in `CURRENT` dict → returns puzzle to client
2. Client renders 9x9 grid with prefilled cells (disabled inputs) and empty cells (editable inputs)
3. User clicks "Check Solution" → POST to `/check` with board state → backend compares against stored `solution` → returns list of incorrect `[row, col]` positions

## Key Conventions

### Testing Pattern

- **Test file location**: `starter/test_sudoku_logic.py` (pytest discovers via `pytest.ini`)
- **Test naming**: Use `test_` prefix for all test functions
- **Board representation**: 2D lists with `0` or `'.'` for empty cells, integers 1-9 for filled cells
- **Helper functions in tests**:
  - `is_valid_sudoku(board)` - Validates board structure and Sudoku rules
  - `is_valid_unit(unit)` - Checks row/column/box for duplicates
  - `is_safe_placement(board, row, col, num)` - Validates if number can be placed
  - `count_solutions(board, limit=2)` - Counts solutions with early termination at limit
  - `has_unique_solution(board)` - Returns True if puzzle has exactly one solution
- **Solution uniqueness testing**: Use `count_solutions()` with limit=2 to efficiently detect multiple solutions without exhaustive search

### Sudoku Constants

```python
SIZE = 9      # Used in both sudoku_logic.py and main.js
EMPTY = 0     # Python representation of empty cell
```

### Frontend State Management

- Global `puzzle` array stores original puzzle state
- Board uses `dataset.row` and `dataset.col` attributes for cell indexing
- Input validation: regex `/[^1-9]/g` restricts to digits 1-9
- Cell classes: `.prefilled` (disabled), `.incorrect` (validation error)

## Development Workflows

### Running the App

```bash
cd starter
python app.py  # Runs on http://127.0.0.1:5000
```

### Running Tests

```bash
pytest              # Run all tests from project root
pytest -v           # Verbose output
pytest starter/test_sudoku_logic.py  # Specific test file
```

### Environment Setup

```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
pip install -r starter/requirements.txt
```

## Project-Specific Patterns

### Puzzle Generation Algorithm

- Uses **backtracking with randomized candidate selection** (`random.shuffle(possible)`)
- Always generates a **complete valid board first**, then removes cells to create puzzle
- `clues` parameter controls difficulty (default 35, fewer = harder)
- **Uniqueness guarantee**: `remove_cells()` validates each cell removal using `has_unique_solution()` - restores cell if uniqueness is lost
- **Solution verification**: Uses `count_solutions(puzzle, limit=2)` with early termination to efficiently validate puzzle uniqueness

### Backend Session Management

- **In-memory state only** - `CURRENT` dict resets on server restart
- **No user sessions** - single shared game state for all clients
- Solution checking requires active game (returns 400 if `CURRENT['solution']` is None)

### Frontend Rendering

- Board is **completely rebuilt** on each new game (`boardDiv.innerHTML = ''`)
- Uses **event delegation** pattern - individual input listeners for validation
- Error feedback via CSS classes (`.incorrect`) applied temporarily during check
- Message display uses inline color styles (`msg.style.color`) instead of CSS classes

## Known Limitations

- **Type hints not yet implemented** - `sudoku_logic.py`, `app.py`, and test files lack type annotations (see Python Code Standards for guidance)
- Server restart loses active game
- Concurrent players share same puzzle state
- No difficulty validation (can request 0-81 clues)

## Test Suite Capabilities

### Validation Tests

- Board structure validation (dimensions, valid values 1-9)
- Sudoku rule checking (row/column/box duplicates)
- Empty cell representations (both `0` and `'.'`)
- Edge cases (None boards, invalid dimensions, out-of-range values)

### Solution Uniqueness Tests

- **`test_puzzle_with_unique_solution()`**: Verifies well-formed puzzles have exactly one solution
- **`test_puzzle_with_multiple_solutions()`**: Detects under-constrained puzzles
- **`test_count_solutions_stops_at_limit()`**: Validates early termination optimization
- **Pattern**: Solution counting uses backtracking with limit parameter to avoid exhaustive search on puzzles with many solutions

## Planned Features Roadmap

The following features are planned for implementation. When adding these, maintain the existing architecture patterns:

### Core Gameplay Enhancements - Future features

- **Timer**: Track solve duration, display on UI, include in completion message
- **Difficulty selector**: UI control for easy/medium/hard (affects `clues` param: ~45/35/25)
- **Hint system**: Provide single-cell clues, mark with unique color, track hint count
- **Check puzzle button**: Validate current board state without full solution (partial checking)
- **Real-time validation**: Highlight invalid entries immediately on input (check row/col/box rules)

### User Experience

- **Top 10 leaderboard**: Local storage persistence with user name, time, hints used, difficulty level
- **Congratulations modal**: Display on solve with stats (time, hints) and name prompt for leaderboard
- **Responsive design**: Mobile-friendly layout, touch-optimized cell inputs
- **Accessible colors**: WCAG-compliant contrast ratios for all UI elements
- **Error handling**: Graceful error messages for all edge cases (network failures, invalid input)

### Implementation Guidelines

- **Local storage**: Use `localStorage.setItem/getItem` for leaderboard persistence (JSON serialization)
- **Timer**: Use `setInterval` in JS, store start time, calculate elapsed on check/solve
- **Hints**: Backend should track puzzle state, validate hint requests, return single valid cell
- **Validation**: Client-side immediate feedback, server-side authoritative checking

## Testing Requirements

- **All new features must pass existing test suite** before merging
- Write tests for new functionality following patterns in `test_sudoku_logic.py`
- Test both valid inputs and edge cases (empty boards, invalid values, boundary conditions)
- **When testing puzzle generation**: Use `count_solutions(puzzle, limit=2)` to verify uniqueness
- **Test structure pattern**: Helper functions at top of file, test cases below with descriptive docstrings
- Backend logic tests go in `test_sudoku_logic.py`, add new test files for additional modules as needed

## When Extending Features

- Add new routes in `app.py` following REST pattern (`/route` for GET, `/route` with POST for mutations)
- Frontend interactions should use `async/await` fetch pattern (see `newGame()`, `checkSolution()`)
- Maintain separation: logic in `sudoku_logic.py`, Flask routes in `app.py`, DOM manipulation in `main.js`
- Update test suite when adding backend logic - feature is not complete without passing tests

## Python Code Standards

### Style Guidelines

- **Follow PEP 8 conventions**:
  - `snake_case` for variables and functions
  - `PascalCase` for class names (e.g., `SudokuBoard`, `PuzzleGenerator`)
  - `UPPER_CASE_WITH_UNDERSCORES` for constants (e.g., `SIZE`, `EMPTY`, `MAX_CLUES`)
  - Consistent indentation (4 spaces)
- **Write clean, readable, minimal Python code**:
  - Avoid unnecessary complexity
  - Use descriptive variable names
  - Keep functions focused on single responsibility
- **Prefer dependency injection patterns**:
  - Pass dependencies as function parameters instead of creating objects inside functions
  - Makes code more testable and maintainable
- **Use async only when appropriate**:
  - Follow normal Flask request flow for synchronous operations
  - Only use async/await for I/O-bound operations that benefit from concurrency
- **Use type hints for clarity and maintainability**:
  - Add type annotations to function parameters and return values
  - Use `from typing import List, Dict, Optional, Tuple` as needed
  - Example: `def generate_puzzle(clues: int = 35) -> List[List[int]]:`

### Example Type-Hinted Function

```python
from typing import List, Optional

def is_safe_placement(board: List[List[int]], row: int, col: int, num: int) -> bool:
    """Check if placing num at (row, col) is valid."""
    # Implementation...
    return True
```
