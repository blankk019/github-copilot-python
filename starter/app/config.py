"""Application configuration."""
import os
from dataclasses import dataclass


@dataclass
class Config:
    """Base configuration class."""
    DEBUG: bool = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
    JSON_SORT_KEYS: bool = False
    
    # Sudoku game settings
    DEFAULT_DIFFICULTY: str = 'medium'
    DIFFICULTY_LEVELS: dict = None
    
    def __post_init__(self):
        """Initialize difficulty levels after dataclass initialization."""
        if self.DIFFICULTY_LEVELS is None:
            self.DIFFICULTY_LEVELS = {
                'easy': {'clues': 45, 'label': 'Easy'},
                'medium': {'clues': 35, 'label': 'Medium'},
                'hard': {'clues': 25, 'label': 'Hard'}
            }


@dataclass
class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG: bool = True


@dataclass
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG: bool = False
    SECRET_KEY: str = os.environ.get('SECRET_KEY', 'change-this-in-production')
