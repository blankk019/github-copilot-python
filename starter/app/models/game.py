"""Game state models."""
from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class GameState:
    """Represents the current game state.
    
    Attributes:
        puzzle: Current puzzle board
        solution: Complete solution board
        difficulty: Difficulty level of the puzzle
    """
    puzzle: List[List[int]]
    solution: List[List[int]]
    difficulty: str = 'medium'
    
    def to_dict(self) -> dict:
        """Convert game state to dictionary.
        
        Returns:
            Dictionary representation of game state
        """
        return {
            'puzzle': self.puzzle,
            'solution': self.solution,
            'difficulty': self.difficulty
        }


@dataclass
class ValidationResult:
    """Result of solution validation.
    
    Attributes:
        is_correct: Whether the solution is completely correct
        incorrect_cells: List of incorrect cell coordinates [row, col]
    """
    is_correct: bool
    incorrect_cells: List[List[int]] = field(default_factory=list)
    
    def to_dict(self) -> dict:
        """Convert validation result to dictionary.
        
        Returns:
            Dictionary representation of validation result
        """
        return {
            'incorrect': self.incorrect_cells
        }


@dataclass
class Hint:
    """Represents a hint for the game.
    
    Attributes:
        row: Row index of the hint cell
        col: Column index of the hint cell
        value: Correct value for the cell
    """
    row: int
    col: int
    value: int
    
    def to_dict(self) -> dict:
        """Convert hint to dictionary.
        
        Returns:
            Dictionary representation of hint
        """
        return {
            'row': self.row,
            'col': self.col,
            'value': self.value
        }
