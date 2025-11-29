# Sudoku Game - Refactored Application

A modern, modular Sudoku game built with Flask and vanilla JavaScript ES6 modules.

## Project Structure

````
starter/
├── app/                      # Backend application
│   ├── __init__.py          # Application factory
│   ├── config.py            # Configuration classes
│   ├── models/              # Data models
│   │   ├── __init__.py
│   │   └── game.py          # Game state models
│   ├── routes/              # API routes
│   │   └── __init__.py      # Blueprint with all routes
│   └── services/            # Business logic
│       ├── __init__.py
│       ├── sudoku_service.py    # Sudoku game logic
│       └── game_manager.py      # Game state management
├── static/                   # Frontend assets
│   ├── css/
│   │   └── styles.css       # All styles
│   └── js/                  # JavaScript modules
│       ├── config.js        # Configuration and constants
│       ├── game.js          # Main game logic
│       ├── timer.js         # Timer functionality
│       ├── leaderboard.js   # Leaderboard management
│       ├── ui.js            # UI interactions
│       └── main.js          # Application entry point
├── templates/
│   └── index.html           # Main HTML template
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
└── pytest.ini              # Test configuration

## Modern Features

### Backend (Python)
- **Modular Architecture**: Separated into models, services, and routes
- **Type Hints**: Full type annotations for better IDE support
- **Dataclasses**: Using `@dataclass` for clean data models
- **Flask Blueprints**: Organized routes with blueprints
- **Application Factory Pattern**: `create_app()` for flexible configuration
- **Configuration Management**: Separate config classes for different environments
- **Error Handling**: Proper exception handling and HTTP status codes
- **Service Layer**: Business logic separated from routes

### Frontend (JavaScript)
- **ES6 Modules**: Code split into logical, reusable modules
- **Classes**: Object-oriented approach with ES6 classes
- **Async/Await**: Modern promise handling
- **Module Organization**:
  - `config.js`: Constants and configuration
  - `game.js`: Main game logic and state management
  - `timer.js`: Timer functionality
  - `leaderboard.js`: Leaderboard operations
  - `ui.js`: UI interactions and DOM manipulation
  - `main.js`: Application initialization

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
````

## Running the Application

### Development Mode

```bash
python run.py
```

### Production Mode

```bash
# Set environment variables
$env:FLASK_ENV = "production"
$env:SECRET_KEY = "your-secret-key-here"

python run.py
```

## API Endpoints

### GET /

Returns the main game page.

### GET /new?difficulty={level}

Generate a new puzzle.

- **Parameters**: `difficulty` (easy/medium/hard)
- **Returns**: JSON with puzzle board

### POST /check

Check the current solution.

- **Request Body**: `{ "board": [[...]] }`
- **Returns**: JSON with incorrect cell positions

### POST /get_hint

Get a hint for an empty cell.

- **Request Body**: `{ "board": [[...]] }`
- **Returns**: JSON with hint (row, col, value)

### POST /validate_move

Validate if a move follows Sudoku rules.

- **Request Body**: `{ "board": [[...]], "row": int, "col": int, "num": int }`
- **Returns**: JSON with validation result

## Code Organization

### Backend Patterns

**Application Factory**:

```python
from app import create_app

app = create_app()
```

**Service Layer**:

```python
class SudokuService:
    @staticmethod
    def generate_puzzle(difficulty: str) -> Tuple[List, List]:
        # Business logic here
```

**Models with Dataclasses**:

```python
@dataclass
class GameState:
    puzzle: List[List[int]]
    solution: List[List[int]]
    difficulty: str = 'medium'
```

### Frontend Patterns

**Module Imports**:

```javascript
import { SudokuGame } from "./game.js";
import { Timer } from "./timer.js";
```

**Class-based Components**:

```javascript
export class Timer {
  constructor() {
    this.interval = null;
    this.startTime = null;
  }

  start() {
    /* ... */
  }
  stop() {
    /* ... */
  }
}
```

## Configuration

Configuration is managed through classes in `app/config.py`:

- `Config`: Base configuration
- `DevelopmentConfig`: Development settings
- `ProductionConfig`: Production settings

Environment variables:

- `FLASK_DEBUG`: Enable debug mode (default: True)
- `SECRET_KEY`: Secret key for sessions
- `FLASK_ENV`: Environment (development/production)

## Testing

Run tests with pytest:

```bash
pytest -v
```

## Development Guidelines

### Backend

1. Keep business logic in services
2. Use type hints for all functions
3. Follow single responsibility principle
4. Use dataclasses for data models
5. Handle errors gracefully with proper HTTP codes

### Frontend

1. Use ES6 modules for code organization
2. Keep modules focused and single-purpose
3. Use async/await for asynchronous operations
4. Maintain separation of concerns (UI, logic, data)
5. Document public methods with JSDoc comments

## Browser Support

Modern browsers with ES6 module support:

- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

## License

See LICENSE.txt
