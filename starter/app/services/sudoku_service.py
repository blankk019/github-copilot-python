"""Sudoku game logic service."""
import copy
import random
from typing import List, Tuple, Optional

SIZE = 9
EMPTY = 0


class SudokuService:
    """Service class for Sudoku game logic."""
    
    @staticmethod
    def create_empty_board() -> List[List[int]]:
        """Create an empty Sudoku board.
        
        Returns:
            9x9 board filled with zeros
        """
        return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]
    
    @staticmethod
    def is_safe(board: List[List[int]], row: int, col: int, num: int) -> bool:
        """Check if placing a number at a position is valid.
        
        Args:
            board: Current board state
            row: Row index
            col: Column index
            num: Number to place
            
        Returns:
            True if the placement is valid, False otherwise
        """
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
    
    @classmethod
    def fill_board(cls, board: List[List[int]]) -> bool:
        """Fill the board with valid numbers using backtracking.
        
        Args:
            board: Board to fill
            
        Returns:
            True if board was successfully filled, False otherwise
        """
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] == EMPTY:
                    possible = list(range(1, SIZE + 1))
                    random.shuffle(possible)
                    for candidate in possible:
                        if cls.is_safe(board, row, col, candidate):
                            board[row][col] = candidate
                            if cls.fill_board(board):
                                return True
                            board[row][col] = EMPTY
                    return False
        return True
    
    @classmethod
    def count_solutions(cls, board: List[List[int]], limit: int = 2) -> int:
        """Count the number of solutions for a puzzle.
        
        Args:
            board: Puzzle board
            limit: Maximum number of solutions to count
            
        Returns:
            Number of solutions (up to limit)
        """
        board_copy = copy.deepcopy(board)
        
        def solve(count_holder: List[int]) -> None:
            if count_holder[0] >= limit:
                return
            
            for row in range(SIZE):
                for col in range(SIZE):
                    if board_copy[row][col] == EMPTY:
                        for num in range(1, SIZE + 1):
                            if cls.is_safe(board_copy, row, col, num):
                                board_copy[row][col] = num
                                solve(count_holder)
                                board_copy[row][col] = EMPTY
                        return
            
            count_holder[0] += 1
        
        count_holder = [0]
        solve(count_holder)
        return count_holder[0]
    
    @classmethod
    def has_unique_solution(cls, board: List[List[int]]) -> bool:
        """Check if a puzzle has exactly one unique solution.
        
        Args:
            board: Puzzle board
            
        Returns:
            True if puzzle has unique solution, False otherwise
        """
        return cls.count_solutions(board, limit=2) == 1
    
    @classmethod
    def remove_cells(cls, board: List[List[int]], clues: int) -> None:
        """Remove cells from a complete board to create a puzzle.
        
        Args:
            board: Complete board to modify
            clues: Number of cells to keep filled
        """
        cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
        random.shuffle(cells)
        
        cells_to_remove = SIZE * SIZE - clues
        removed = 0
        
        for row, col in cells:
            if removed >= cells_to_remove:
                break
            
            backup = board[row][col]
            board[row][col] = EMPTY
            
            if cls.has_unique_solution(board):
                removed += 1
            else:
                board[row][col] = backup
    
    @classmethod
    def generate_puzzle(cls, difficulty: str = 'medium') -> Tuple[List[List[int]], List[List[int]]]:
        """Generate a new Sudoku puzzle.
        
        Args:
            difficulty: Difficulty level ('easy', 'medium', 'hard')
            
        Returns:
            Tuple of (puzzle, solution) boards
        """
        difficulty_settings = {
            'easy': 45,
            'medium': 35,
            'hard': 25
        }
        clues = difficulty_settings.get(difficulty.lower(), 35)
        
        board = cls.create_empty_board()
        cls.fill_board(board)
        solution = copy.deepcopy(board)
        cls.remove_cells(board, clues)
        puzzle = copy.deepcopy(board)
        
        return puzzle, solution
    
    @staticmethod
    def validate_solution(board: List[List[int]], solution: List[List[int]]) -> List[List[int]]:
        """Validate a player's solution against the correct solution.
        
        Args:
            board: Player's current board
            solution: Correct solution
            
        Returns:
            List of incorrect cell coordinates [row, col]
        """
        incorrect = []
        for i in range(SIZE):
            for j in range(SIZE):
                if board[i][j] != solution[i][j]:
                    incorrect.append([i, j])
        return incorrect
    
    @staticmethod
    def get_hint(board: List[List[int]], solution: List[List[int]]) -> Optional[Tuple[int, int, int]]:
        """Get a hint for an empty cell.
        
        Args:
            board: Current board state
            solution: Complete solution
            
        Returns:
            Tuple of (row, col, value) or None if no hint available
        """
        for row in range(SIZE):
            for col in range(SIZE):
                if board[row][col] in (0, EMPTY):
                    return (row, col, solution[row][col])
        return None
