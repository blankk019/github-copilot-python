import pytest
import time
import copy
from sudoku_logic import (
    generate_puzzle,
    create_empty_board,
    is_safe,
    deep_copy,
    remove_cells,
    fill_board,
    get_hint_for_board
)


def is_valid_sudoku(board):
    """
    Validates a 9x9 Sudoku board.
    Empty cells are represented by 0 or '.'.
    Returns True if valid, False otherwise.
    """
    if not board or len(board) != 9:
        return False
    
    for row in board:
        if len(row) != 9:
            return False
    
    # Check rows
    for row in board:
        if not is_valid_unit(row):
            return False
    
    # Check columns
    for col in range(9):
        column = [board[row][col] for row in range(9)]
        if not is_valid_unit(column):
            return False
    
    # Check 3x3 boxes
    for box_row in range(0, 9, 3):
        for box_col in range(0, 9, 3):
            box = []
            for i in range(3):
                for j in range(3):
                    box.append(board[box_row + i][box_col + j])
            if not is_valid_unit(box):
                return False
    
    return True


def is_valid_unit(unit):
    """Check if a unit (row/column/box) has no duplicate non-zero values."""
    seen = set()
    for val in unit:
        if val == 0 or val == '.':
            continue
        if not isinstance(val, int) or val < 1 or val > 9:
            return False
        if val in seen:
            return False
        seen.add(val)
    return True


def is_safe_placement(board, row, col, num):
    """Check if placing num at board[row][col] is valid."""
    # Check row
    if num in board[row]:
        return False
    
    # Check column
    for r in range(9):
        if board[r][col] == num:
            return False
    
    # Check 3x3 box
    box_row = (row // 3) * 3
    box_col = (col // 3) * 3
    for i in range(3):
        for j in range(3):
            if board[box_row + i][box_col + j] == num:
                return False
    
    return True


def count_solutions(board, limit=2):
    """
    Count the number of solutions for a Sudoku puzzle.
    Stop counting after reaching the limit to optimize performance.
    Returns count (up to limit).
    """
    # Make a copy to avoid modifying the original
    board_copy = copy.deepcopy(board)
    
    def solve(count_holder):
        # If we've already found enough solutions, stop
        if count_holder[0] >= limit:
            return
        
        # Find next empty cell
        for row in range(9):
            for col in range(9):
                if board_copy[row][col] == 0:
                    # Try each number 1-9
                    for num in range(1, 10):
                        if is_safe_placement(board_copy, row, col, num):
                            board_copy[row][col] = num
                            solve(count_holder)
                            board_copy[row][col] = 0
                    return
        
        # No empty cells found - we have a complete solution
        count_holder[0] += 1
    
    count_holder = [0]
    solve(count_holder)
    return count_holder[0]


def has_unique_solution(board):
    """Check if a Sudoku puzzle has exactly one unique solution."""
    return count_solutions(board, limit=2) == 1


# Test Cases

def test_empty_board():
    """Test that an empty board is valid."""
    board = [[0] * 9 for _ in range(9)]
    assert is_valid_sudoku(board) == True


def test_valid_partial_board():
    """Test a partially filled valid board."""
    board = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
    assert is_valid_sudoku(board) == True


def test_invalid_row_duplicate():
    """Test board with duplicate in a row."""
    board = [
        [5, 5, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    assert is_valid_sudoku(board) == False


def test_invalid_column_duplicate():
    """Test board with duplicate in a column."""
    board = [
        [5, 0, 0, 0, 0, 0, 0, 0, 0],
        [5, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    assert is_valid_sudoku(board) == False


def test_invalid_box_duplicate():
    """Test board with duplicate in a 3x3 box."""
    board = [
        [5, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 5, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    assert is_valid_sudoku(board) == False


def test_valid_complete_board():
    """Test a valid complete Sudoku solution."""
    board = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
    assert is_valid_sudoku(board) == True


def test_invalid_board_dimensions():
    """Test board with incorrect dimensions."""
    board = [[0] * 8 for _ in range(9)]
    assert is_valid_sudoku(board) == False


def test_none_board():
    """Test None as board input."""
    assert is_valid_sudoku(None) == False


def test_invalid_value_out_of_range():
    """Test board with value greater than 9."""
    board = [
        [10, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    assert is_valid_sudoku(board) == False


def test_board_with_dots_as_empty():
    """Test board using '.' for empty cells."""
    board = [
        [5, 3, '.', '.', 7, '.', '.', '.', '.'],
        [6, '.', '.', 1, 9, 5, '.', '.', '.'],
        ['.', 9, 8, '.', '.', '.', '.', 6, '.'],
        [8, '.', '.', '.', 6, '.', '.', '.', 3],
        [4, '.', '.', 8, '.', 3, '.', '.', 1],
        [7, '.', '.', '.', 2, '.', '.', '.', 6],
        ['.', 6, '.', '.', '.', '.', 2, 8, '.'],
        ['.', '.', '.', 4, 1, 9, '.', '.', 5],
        ['.', '.', '.', '.', 8, '.', '.', 7, 9]
    ]
    assert is_valid_sudoku(board) == True


def test_puzzle_with_unique_solution():
    """Test that a well-formed Sudoku puzzle has exactly one solution."""
    # This is a known puzzle with a unique solution
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
    assert has_unique_solution(puzzle) == True


def test_puzzle_with_multiple_solutions():
    """Test detection of puzzles with multiple solutions."""
    # Puzzle with minimal clues strategically placed to allow multiple solutions
    # This puzzle can be solved in multiple ways
    puzzle = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 2, 3, 4, 5, 6, 7, 8, 9]
    ]
    # An empty board with just one row filled has many solutions
    count = count_solutions(puzzle, limit=2)
    assert count == 2  # Should find at least 2 solutions quickly


def test_count_solutions_stops_at_limit():
    """Test that solution counting stops efficiently at the limit."""
    # Nearly empty board will have many solutions
    puzzle = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
    # Should find at least 2 solutions and stop
    count = count_solutions(puzzle, limit=2)
    assert count == 2


def test_generated_puzzles_have_unique_solutions():
    """Test that generated puzzles always have exactly one solution."""
    # Test multiple puzzle generations to ensure consistency
    for clues in [30, 40, 50]:  # Test different difficulty levels
        puzzle, solution = generate_puzzle(clues)
        assert has_unique_solution(puzzle) == True, f"Generated puzzle with {clues} clues has multiple solutions"


def test_generated_puzzles_are_valid():
    """Test that generated puzzles are valid Sudoku boards."""
    for clues in [30, 40, 50]:
        puzzle, solution = generate_puzzle(clues)
        assert is_valid_sudoku(puzzle) == True, f"Generated puzzle with {clues} clues is invalid"


def test_generated_solutions_are_complete():
    """Test that generated solutions are complete and valid."""
    for clues in [30, 40, 50]:
        puzzle, solution = generate_puzzle(clues)
        # Solution should have no empty cells
        for row in solution:
            assert 0 not in row, f"Solution for {clues} clues contains empty cells"
        # Solution should be valid
        assert is_valid_sudoku(solution) == True, f"Solution for {clues} clues is invalid"


# ===== DIFFICULTY SELECTOR TESTS =====

def test_easy_difficulty_generates_correct_clues():
    """Test that easy difficulty generates around 45 clues (40-50 range)."""
    puzzle, solution = generate_puzzle(difficulty='easy')
    clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
    assert 40 <= clue_count <= 50, f"Easy difficulty should have 40-50 clues, got {clue_count}"


def test_medium_difficulty_generates_correct_clues():
    """Test that medium difficulty generates around 35 clues (30-40 range)."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
    assert 30 <= clue_count <= 40, f"Medium difficulty should have 30-40 clues, got {clue_count}"


def test_hard_difficulty_generates_correct_clues():
    """Test that hard difficulty generates around 25 clues (20-30 range)."""
    puzzle, solution = generate_puzzle(difficulty='hard')
    clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
    assert 20 <= clue_count <= 30, f"Hard difficulty should have 20-30 clues, got {clue_count}"


def test_difficulty_case_insensitive():
    """Test that difficulty parameter is case-insensitive."""
    puzzle1, _ = generate_puzzle(difficulty='EASY')
    puzzle2, _ = generate_puzzle(difficulty='Easy')
    puzzle3, _ = generate_puzzle(difficulty='easy')
    
    clue_count1 = sum(1 for row in puzzle1 for cell in row if cell != 0)
    clue_count2 = sum(1 for row in puzzle2 for cell in row if cell != 0)
    clue_count3 = sum(1 for row in puzzle3 for cell in row if cell != 0)
    
    # All should be in easy range (40-50)
    assert 40 <= clue_count1 <= 50
    assert 40 <= clue_count2 <= 50
    assert 40 <= clue_count3 <= 50


def test_invalid_difficulty_defaults_to_medium():
    """Test that invalid difficulty defaults to medium (30-40 clues)."""
    puzzle, _ = generate_puzzle(difficulty='extreme')
    clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
    assert 30 <= clue_count <= 40, f"Invalid difficulty should default to medium (30-40 clues), got {clue_count}"


def test_difficulty_overrides_clues_parameter():
    """Test that difficulty parameter overrides explicit clues value."""
    puzzle, _ = generate_puzzle(clues=50, difficulty='hard')
    clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
    # Should be in hard range (20-30), not 50
    assert 20 <= clue_count <= 30, "Difficulty should override clues parameter"


def test_all_difficulty_levels_produce_valid_puzzles():
    """Test that all difficulty levels produce valid Sudoku puzzles."""
    for difficulty in ['easy', 'medium', 'hard']:
        puzzle, solution = generate_puzzle(difficulty=difficulty)
        assert is_valid_sudoku(puzzle), f"{difficulty} puzzle is not valid"
        assert is_valid_sudoku(solution), f"{difficulty} solution is not valid"


def test_all_difficulty_levels_have_unique_solutions():
    """Test that all difficulty levels generate puzzles with unique solutions."""
    for difficulty in ['easy', 'medium', 'hard']:
        puzzle, _ = generate_puzzle(difficulty=difficulty)
        assert has_unique_solution(puzzle), f"{difficulty} puzzle does not have unique solution"


# ===== POTENTIAL ISSUE TESTS =====

def test_puzzle_and_solution_consistency():
    """Test that puzzle is a subset of solution (all clues match)."""
    for difficulty in ['easy', 'medium', 'hard']:
        puzzle, solution = generate_puzzle(difficulty=difficulty)
        for row in range(9):
            for col in range(9):
                if puzzle[row][col] != 0:
                    assert puzzle[row][col] == solution[row][col], \
                        f"Puzzle clue at ({row},{col}) doesn't match solution"


def test_solution_has_no_empty_cells():
    """Test that solution boards have all cells filled."""
    for difficulty in ['easy', 'medium', 'hard']:
        _, solution = generate_puzzle(difficulty=difficulty)
        empty_count = sum(1 for row in solution for cell in row if cell == 0)
        assert empty_count == 0, f"Solution has {empty_count} empty cells"


def test_puzzle_has_correct_number_of_empty_cells():
    """Test that puzzles have approximately correct number of empty cells."""
    difficulty_clues = {
        'easy': 45,
        'medium': 35,
        'hard': 25
    }
    
    for difficulty, expected_clues in difficulty_clues.items():
        puzzle, _ = generate_puzzle(difficulty=difficulty)
        clue_count = sum(1 for row in puzzle for cell in row if cell != 0)
        # Allow some variation due to uniqueness constraint
        assert abs(clue_count - expected_clues) <= 5, \
            f"{difficulty} should have approximately {expected_clues} clues, got {clue_count}"


def test_multiple_generations_produce_different_puzzles():
    """Test that multiple puzzle generations produce different results."""
    puzzles = []
    for _ in range(3):
        puzzle, _ = generate_puzzle(difficulty='medium')
        puzzle_str = str(puzzle)
        puzzles.append(puzzle_str)
    
    # At least 2 of the 3 should be different (randomness check)
    unique_puzzles = len(set(puzzles))
    assert unique_puzzles >= 2, "Multiple generations should produce varied puzzles"


def test_is_safe_with_boundary_values():
    """Test is_safe function with edge cases."""
    board = create_empty_board()
    
    # Test placing in first cell
    assert is_safe(board, 0, 0, 1) == True
    
    # Test placing in last cell
    assert is_safe(board, 8, 8, 9) == True
    
    # Test after placing a number
    board[0][0] = 1
    assert is_safe(board, 0, 1, 1) == False  # Same row
    assert is_safe(board, 1, 0, 1) == False  # Same column
    assert is_safe(board, 1, 1, 1) == False  # Same box


def test_is_safe_with_box_conflicts():
    """Test is_safe detects conflicts within 3x3 boxes correctly."""
    board = create_empty_board()
    
    # Place number in top-left box
    board[0][0] = 5
    
    # All positions in same box should conflict
    for row in range(3):
        for col in range(3):
            if row == 0 and col == 0:
                continue
            assert is_safe(board, row, col, 5) == False, \
                f"Should detect conflict at ({row},{col}) in same box"
    
    # Positions in different boxes should not conflict with box constraint
    # (though row/column might still conflict)
    board[3][3] = 5  # Different box
    assert is_safe(board, 4, 5, 5) == False  # Same box as (3,3)


def test_deep_copy_independence():
    """Test that deep_copy creates independent copies."""
    original = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    copied = deep_copy(original)
    
    # Modify the copy
    copied[0][0] = 999
    
    # Original should be unchanged
    assert original[0][0] == 1, "Deep copy should not affect original"


def test_create_empty_board_structure():
    """Test that create_empty_board creates correct structure."""
    board = create_empty_board()
    
    assert len(board) == 9, "Board should have 9 rows"
    for row in board:
        assert len(row) == 9, "Each row should have 9 columns"
        for cell in row:
            assert cell == 0, "All cells should be empty (0)"


def test_count_solutions_performance():
    """Test that count_solutions stops efficiently at limit."""
    import time
    
    # Nearly empty board with many possible solutions
    board = create_empty_board()
    board[0][0] = 1
    
    start = time.time()
    count = count_solutions(board, limit=2)
    elapsed = time.time() - start
    
    assert count == 2, "Should find exactly 2 solutions (stopped at limit)"
    assert elapsed < 5.0, "Should stop quickly when reaching limit"


def test_has_unique_solution_with_complete_board():
    """Test that a complete valid board has a unique solution (itself)."""
    board = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
    assert has_unique_solution(board) == True


def test_generate_puzzle_returns_tuple():
    """Test that generate_puzzle returns both puzzle and solution."""
    result = generate_puzzle(clues=30)
    assert isinstance(result, tuple), "Should return a tuple"
    assert len(result) == 2, "Should return exactly 2 items"
    
    puzzle, solution = result
    assert puzzle is not None, "Puzzle should not be None"
    assert solution is not None, "Solution should not be None"


def test_clues_parameter_respects_bounds():
    """Test puzzle generation with various clue counts."""
    for clue_count in [20, 30, 40, 50]:
        puzzle, solution = generate_puzzle(clues=clue_count)
        actual_clues = sum(1 for row in puzzle for cell in row if cell != 0)
        # Due to uniqueness constraints, actual clues might be slightly different
        # but should be reasonably close
        assert actual_clues <= 81, f"Clue count {actual_clues} exceeds board size"
        assert actual_clues >= 17, f"Clue count {actual_clues} is too low for valid Sudoku"


def test_concurrent_puzzle_generation():
    """Test that multiple puzzles can be generated independently."""
    puzzles = []
    solutions = []
    
    for _ in range(3):
        puzzle, solution = generate_puzzle(difficulty='medium')
        puzzles.append(puzzle)
        solutions.append(solution)
    
    # Verify all are valid
    for i, (puzzle, solution) in enumerate(zip(puzzles, solutions)):
        assert is_valid_sudoku(puzzle), f"Puzzle {i} is invalid"
        assert is_valid_sudoku(solution), f"Solution {i} is invalid"


def test_remove_cells_maintains_uniqueness():
    """Test that cell removal process maintains puzzle uniqueness."""
    # Generate a complete board
    board = create_empty_board()
    fill_board(board)
    original = deep_copy(board)
    
    # Remove cells to create puzzle
    remove_cells(board, clues=30)
    
    # Verify uniqueness
    assert has_unique_solution(board), "Puzzle after cell removal should have unique solution"
    
    # Verify some cells were removed
    removed_count = sum(1 for row in range(9) for col in range(9) if board[row][col] == 0)
    assert removed_count > 0, "Some cells should be removed"


# ===== HINT FUNCTIONALITY TESTS =====

def test_get_hint_returns_valid_cell():
    """Test that hint returns a valid empty cell with correct value."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    hint = get_hint_for_board(puzzle, solution)
    
    assert hint is not None, "Hint should be available for incomplete puzzle"
    row, col, value = hint
    
    # Verify hint coordinates are valid
    assert 0 <= row < 9, f"Hint row {row} is out of bounds"
    assert 0 <= col < 9, f"Hint col {col} is out of bounds"
    
    # Verify hint value is valid
    assert 1 <= value <= 9, f"Hint value {value} is out of range"
    
    # Verify the cell is currently empty
    assert puzzle[row][col] == 0, "Hint should target an empty cell"
    
    # Verify the hint value matches the solution
    assert solution[row][col] == value, "Hint value should match solution"


def test_get_hint_on_complete_board_returns_none():
    """Test that hint returns None when board is complete."""
    puzzle, solution = generate_puzzle(difficulty='easy')
    
    # Use the complete solution
    hint = get_hint_for_board(solution, solution)
    
    assert hint is None, "Hint should be None for complete board"


def test_get_hint_on_partially_filled_board():
    """Test hint on a board that has been partially filled by user."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    
    # Fill some cells correctly
    filled_count = 0
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0 and filled_count < 5:
                puzzle[row][col] = solution[row][col]
                filled_count += 1
    
    # Get hint for remaining empty cells
    hint = get_hint_for_board(puzzle, solution)
    
    if hint:  # If there are still empty cells
        row, col, value = hint
        assert puzzle[row][col] == 0, "Hint should only suggest for empty cells"
        assert solution[row][col] == value, "Hint should match solution"


def test_get_hint_finds_first_empty_cell():
    """Test that hint finds the first empty cell (row-major order)."""
    puzzle, solution = generate_puzzle(difficulty='hard')
    
    # Find the first empty cell manually
    first_empty_row = None
    first_empty_col = None
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                first_empty_row = row
                first_empty_col = col
                break
        if first_empty_row is not None:
            break
    
    hint = get_hint_for_board(puzzle, solution)
    
    if first_empty_row is not None:
        assert hint is not None
        row, col, value = hint
        assert row == first_empty_row, "Hint should return first empty row"
        assert col == first_empty_col, "Hint should return first empty column"


def test_get_hint_with_one_empty_cell():
    """Test hint when only one cell remains empty."""
    puzzle, solution = generate_puzzle(difficulty='easy')
    
    # Fill all but one cell
    empty_row, empty_col = None, None
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                if empty_row is None:
                    # Keep the first empty cell
                    empty_row, empty_col = row, col
                else:
                    # Fill all other empty cells
                    puzzle[row][col] = solution[row][col]
    
    hint = get_hint_for_board(puzzle, solution)
    
    assert hint is not None
    row, col, value = hint
    assert row == empty_row
    assert col == empty_col
    assert value == solution[empty_row][empty_col]


def test_get_hint_multiple_times():
    """Test getting multiple hints sequentially."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    hints_received = []
    
    # Get up to 5 hints
    for _ in range(5):
        hint = get_hint_for_board(puzzle, solution)
        if hint is None:
            break
        
        row, col, value = hint
        hints_received.append((row, col, value))
        
        # Apply the hint
        puzzle[row][col] = value
    
    # Verify all hints were valid
    for row, col, value in hints_received:
        assert solution[row][col] == value, "All hints should match solution"


def test_get_hint_with_incorrect_user_input():
    """Test hint functionality when user has entered incorrect values."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    
    # Add some incorrect values (non-zero but wrong)
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                # Put a wrong value (not the solution)
                wrong_value = (solution[row][col] % 9) + 1
                if wrong_value != solution[row][col]:
                    puzzle[row][col] = wrong_value
                    break
        break
    
    # Hint should still find empty cells (0 values)
    hint = get_hint_for_board(puzzle, solution)
    
    # The hint will target a cell with 0, not the incorrect value
    if hint:
        row, col, value = hint
        assert puzzle[row][col] == 0, "Hint should target empty (0) cells"


def test_get_hint_consistency():
    """Test that same board state returns same hint."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    
    hint1 = get_hint_for_board(puzzle, solution)
    hint2 = get_hint_for_board(puzzle, solution)
    
    # Same board should give same hint
    assert hint1 == hint2, "Hint should be consistent for same board state"


def test_get_hint_with_empty_board():
    """Test hint on a completely empty board."""
    empty_board = create_empty_board()
    
    # Create a valid solution
    full_board = create_empty_board()
    fill_board(full_board)
    
    hint = get_hint_for_board(empty_board, full_board)
    
    assert hint is not None
    row, col, value = hint
    
    # Should suggest for position (0, 0) since it's first empty
    assert row == 0 and col == 0, "First hint on empty board should be (0, 0)"
    assert value == full_board[0][0], "Hint should match solution at (0, 0)"


def test_get_hint_return_type():
    """Test that hint returns correct data type."""
    puzzle, solution = generate_puzzle(difficulty='easy')
    hint = get_hint_for_board(puzzle, solution)
    
    if hint is not None:
        assert isinstance(hint, tuple), "Hint should be a tuple"
        assert len(hint) == 3, "Hint should contain 3 elements (row, col, value)"
        
        row, col, value = hint
        assert isinstance(row, int), "Row should be an integer"
        assert isinstance(col, int), "Column should be an integer"
        assert isinstance(value, int), "Value should be an integer"


def test_get_hint_does_not_modify_board():
    """Test that getting a hint doesn't modify the puzzle board."""
    puzzle, solution = generate_puzzle(difficulty='medium')
    puzzle_copy = deep_copy(puzzle)
    
    hint = get_hint_for_board(puzzle, solution)
    
    # Verify puzzle wasn't modified
    for row in range(9):
        for col in range(9):
            assert puzzle[row][col] == puzzle_copy[row][col], \
                "Getting hint should not modify the puzzle board"


def test_get_hint_all_difficulties():
    """Test hint functionality works for all difficulty levels."""
    for difficulty in ['easy', 'medium', 'hard']:
        puzzle, solution = generate_puzzle(difficulty=difficulty)
        hint = get_hint_for_board(puzzle, solution)
        
        assert hint is not None, f"Hint should be available for {difficulty} puzzle"
        row, col, value = hint
        
        assert puzzle[row][col] == 0, f"Hint cell should be empty for {difficulty}"
        assert solution[row][col] == value, f"Hint should match solution for {difficulty}"


def test_get_hint_with_none_solution():
    """Test hint behavior when solution is None."""
    puzzle, _ = generate_puzzle(difficulty='medium')
    
    # This should handle gracefully or raise an appropriate error
    try:
        hint = get_hint_for_board(puzzle, None)
        # If it doesn't raise error, it should return None or handle gracefully
    except (TypeError, AttributeError):
        # Expected behavior - can't get hint without solution
        pass


def test_get_hint_progressive_completion():
    """Test hints can guide to complete puzzle solution."""
    puzzle, solution = generate_puzzle(difficulty='easy')
    
    max_iterations = 81  # Maximum possible cells
    iterations = 0
    
    while iterations < max_iterations:
        hint = get_hint_for_board(puzzle, solution)
        
        if hint is None:
            # Board should be complete
            break
        
        row, col, value = hint
        puzzle[row][col] = value
        iterations += 1
    
    # Verify the puzzle is now complete and matches solution
    for row in range(9):
        for col in range(9):
            assert puzzle[row][col] == solution[row][col], \
                "Following all hints should complete the puzzle correctly"

# ===== TIMER TESTS =====

class Timer:
    """Timer class for tracking game duration."""
    
    def __init__(self):
        self.start_time = None
        self.elapsed_time = 0
        self.is_running = False
    
    def start(self):
        """Start the timer."""
        if not self.is_running:
            self.start_time = time.time()
            self.is_running = True
    
    def stop(self):
        """Stop the timer and record elapsed time."""
        if self.is_running:
            self.elapsed_time += time.time() - self.start_time
            self.is_running = False
    
    def reset(self):
        """Reset timer to zero."""
        self.start_time = None
        self.elapsed_time = 0
        self.is_running = False
    
    def get_time(self):
        """Get current elapsed time in seconds."""
        if self.is_running:
            return self.elapsed_time + (time.time() - self.start_time)
        return self.elapsed_time
    
    def format_time(self):
        """Format time as MM:SS."""
        total_seconds = int(self.get_time())
        minutes = total_seconds // 60
        seconds = total_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"


def test_timer_start_stop():
    """Test timer starts and stops correctly."""
    timer = Timer()
    timer.start()
    time.sleep(0.1)
    timer.stop()
    
    assert timer.get_time() >= 0.1
    assert not timer.is_running


def test_timer_reset():
    """Test timer resets to zero."""
    timer = Timer()
    timer.start()
    time.sleep(0.1)
    timer.reset()
    
    assert timer.get_time() == 0
    assert not timer.is_running


def test_timer_format():
    """Test time formatting as MM:SS."""
    timer = Timer()
    timer.elapsed_time = 125  # 2 minutes 5 seconds
    assert timer.format_time() == "02:05"


def test_timer_pause_resume():
    """Test timer accumulates time correctly."""
    timer = Timer()
    timer.start()
    time.sleep(0.1)
    timer.stop()
    first_time = timer.get_time()
    
    timer.start()
    time.sleep(0.1)
    timer.stop()
    
    assert timer.get_time() >= first_time + 0.1


# ===== LEADERBOARD TESTS =====

class Leaderboard:
    """Leaderboard manager for top scores."""
    
    def __init__(self, max_entries=10):
        self.max_entries = max_entries
        self.entries = []
    
    def add_entry(self, name, time_seconds, difficulty):
        """Add entry and maintain sorted order."""
        if not name or not name.strip():
            return False
        
        entry = {
            'name': name.strip(),
            'time': time_seconds,
            'difficulty': difficulty
        }
        self.entries.append(entry)
        self.entries.sort(key=lambda x: x['time'])
        self.entries = self.entries[:self.max_entries]
        return True
    
    def get_entries(self):
        """Get all leaderboard entries."""
        return self.entries.copy()
    
    def format_time(self, seconds):
        """Format seconds as MM:SS."""
        minutes = int(seconds) // 60
        secs = int(seconds) % 60
        return f"{minutes:02d}:{secs:02d}"
    
    def clear(self):
        """Clear all entries."""
        self.entries = []
    
    def get_rank(self, time_seconds):
        """Get rank for a given time (1-based)."""
        for i, entry in enumerate(self.entries):
            if time_seconds < entry['time']:
                return i + 1
        if len(self.entries) < self.max_entries:
            return len(self.entries) + 1
        return None


def test_leaderboard_add_entry():
    """Test adding valid entry to leaderboard."""
    lb = Leaderboard()
    result = lb.add_entry('Alice', 125, 'medium')
    
    assert result is True
    assert len(lb.entries) == 1
    assert lb.entries[0]['name'] == 'Alice'


def test_leaderboard_sort_by_time():
    """Test entries are sorted by fastest time."""
    lb = Leaderboard()
    lb.add_entry('Slow', 200, 'easy')
    lb.add_entry('Fast', 100, 'easy')
    lb.add_entry('Medium', 150, 'easy')
    
    assert lb.entries[0]['name'] == 'Fast'
    assert lb.entries[1]['name'] == 'Medium'
    assert lb.entries[2]['name'] == 'Slow'


def test_leaderboard_top_10_limit():
    """Test leaderboard keeps only top 10 scores."""
    lb = Leaderboard(max_entries=3)
    
    for i in range(5):
        lb.add_entry(f'Player{i}', 100 + i * 10, 'easy')
    
    assert len(lb.entries) == 3
    assert lb.entries[0]['name'] == 'Player0'


def test_leaderboard_format_time():
    """Test time formatting."""
    lb = Leaderboard()
    assert lb.format_time(125) == "02:05"
    assert lb.format_time(45) == "00:45"


def test_leaderboard_clear():
    """Test clearing all entries."""
    lb = Leaderboard()
    lb.add_entry('Alice', 100, 'easy')
    lb.clear()
    
    assert lb.entries == []


def test_leaderboard_get_rank():
    """Test rank calculation."""
    lb = Leaderboard()
    lb.add_entry('Alice', 100, 'easy')
    lb.add_entry('Bob', 150, 'easy')
    
    rank = lb.get_rank(125)  # Between Alice and Bob
    assert rank == 2