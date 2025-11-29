import copy
import random

SIZE = 9
EMPTY = 0

def deep_copy(board):
    return copy.deepcopy(board)

def create_empty_board():
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board, row, col, num):
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False
    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board):
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def count_solutions(board, limit=2):
    """
    Count the number of solutions for a Sudoku puzzle.
    Stop counting after reaching the limit to optimize performance.
    Returns count (up to limit).
    """
    board_copy = deep_copy(board)
    
    def solve(count_holder):
        if count_holder[0] >= limit:
            return
        
        for row in range(SIZE):
            for col in range(SIZE):
                if board_copy[row][col] == EMPTY:
                    for num in range(1, SIZE + 1):
                        if is_safe(board_copy, row, col, num):
                            board_copy[row][col] = num
                            solve(count_holder)
                            board_copy[row][col] = EMPTY
                    return
        
        count_holder[0] += 1
    
    count_holder = [0]
    solve(count_holder)
    return count_holder[0]

def has_unique_solution(board):
    """Check if a Sudoku puzzle has exactly one unique solution."""
    return count_solutions(board, limit=2) == 1

def remove_cells(board, clues):
    """
    Remove cells from a complete board to create a puzzle with unique solution.
    Uses backtracking to ensure the puzzle maintains uniqueness.
    """
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)
    
    cells_to_remove = SIZE * SIZE - clues
    removed = 0
    
    for row, col in cells:
        if removed >= cells_to_remove:
            break
        
        # Store the value before removing
        backup = board[row][col]
        board[row][col] = EMPTY
        
        # Check if puzzle still has unique solution
        if has_unique_solution(board):
            removed += 1
        else:
            # Restore the cell if uniqueness is lost
            board[row][col] = backup

def get_clues_for_difficulty(difficulty='medium'):
    """
    Map difficulty levels to number of clues (prefilled cells).
    Easy: 45-50 clues, Medium: 30-35 clues, Hard: 20-25 clues
    """
    difficulty_settings = {
        'easy': 45,      # 45 prefilled cells
        'medium': 35,    # 35 prefilled cells
        'hard': 25       # 25 prefilled cells
    }
    return difficulty_settings.get(difficulty.lower(), 35)

def generate_puzzle(clues=35, difficulty=None):
    """
    Generate a Sudoku puzzle.
    If difficulty is provided, it overrides the clues parameter.
    """
    if difficulty:
        clues = get_clues_for_difficulty(difficulty)
    
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution

def get_hint_for_board(board, solution):
    """
    Find an empty cell and suggest the correct value for it.
    Returns a tuple (row, col, value) or None if no hint available.
    """
    # Find the first empty cell in the current board
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == 0 or board[row][col] == EMPTY:
                return (row, col, solution[row][col])
    
    return None
