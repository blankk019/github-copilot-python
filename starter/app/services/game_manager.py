"""Game state management service."""
from typing import Optional
from app.models import GameState
from app.services.sudoku_service import SudokuService


class GameManager:
    """Manages game state and provides game operations."""
    
    def __init__(self):
        """Initialize the game manager."""
        self._current_game: Optional[GameState] = None
    
    @property
    def current_game(self) -> Optional[GameState]:
        """Get the current game state.
        
        Returns:
            Current game state or None
        """
        return self._current_game
    
    def new_game(self, difficulty: str = 'medium') -> GameState:
        """Start a new game with the specified difficulty.
        
        Args:
            difficulty: Difficulty level
            
        Returns:
            New game state
        """
        puzzle, solution = SudokuService.generate_puzzle(difficulty)
        self._current_game = GameState(
            puzzle=puzzle,
            solution=solution,
            difficulty=difficulty
        )
        return self._current_game
    
    def validate_solution(self, board) -> list:
        """Validate the player's solution.
        
        Args:
            board: Player's current board
            
        Returns:
            List of incorrect cell coordinates
            
        Raises:
            ValueError: If no game is in progress
        """
        if self._current_game is None:
            raise ValueError('No game in progress')
        
        return SudokuService.validate_solution(board, self._current_game.solution)
    
    def get_hint(self, board) -> Optional[tuple]:
        """Get a hint for the current board.
        
        Args:
            board: Current board state
            
        Returns:
            Hint tuple (row, col, value) or None
            
        Raises:
            ValueError: If no game is in progress
        """
        if self._current_game is None:
            raise ValueError('No game in progress')
        
        return SudokuService.get_hint(board, self._current_game.solution)
    
    def validate_move(self, board, row: int, col: int, num: int) -> bool:
        """Validate if a move is legal according to Sudoku rules.
        
        Args:
            board: Current board state
            row: Row index
            col: Column index
            num: Number to place
            
        Returns:
            True if move is valid, False otherwise
        """
        return SudokuService.is_safe(board, row, col, num)


# Global game manager instance
game_manager = GameManager()
