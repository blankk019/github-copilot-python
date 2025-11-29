import pytest


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