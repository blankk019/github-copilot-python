"""Routes package."""
from flask import Blueprint, render_template, jsonify, request
from app.services import game_manager
from app.models import Hint

# Create blueprint
sudoku_bp = Blueprint('sudoku', __name__)


@sudoku_bp.route('/')
def index():
    """Render the main game page.
    
    Returns:
        Rendered HTML template
    """
    return render_template('index.html')


@sudoku_bp.route('/new')
def new_game():
    """Start a new game with the specified difficulty.
    
    Query Parameters:
        difficulty: Game difficulty level (easy/medium/hard)
        
    Returns:
        JSON response with puzzle board
    """
    difficulty = request.args.get('difficulty', 'medium')
    game_state = game_manager.new_game(difficulty)
    return jsonify({'puzzle': game_state.puzzle})


@sudoku_bp.route('/check', methods=['POST'])
def check_solution():
    """Check the player's solution.
    
    Request Body:
        board: Current board state
        
    Returns:
        JSON response with incorrect cell positions
    """
    data = request.json
    board = data.get('board')
    
    try:
        incorrect = game_manager.validate_solution(board)
        return jsonify({'incorrect': incorrect})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400


@sudoku_bp.route('/get_hint', methods=['POST'])
def get_hint():
    """Get a hint for an empty cell.
    
    Request Body:
        board: Current board state
        
    Returns:
        JSON response with hint information
    """
    data = request.json
    board = data.get('board')
    
    try:
        hint_data = game_manager.get_hint(board)
        
        if hint_data:
            hint = Hint(row=hint_data[0], col=hint_data[1], value=hint_data[2])
            return jsonify({
                'success': True,
                'hint': hint.to_dict()
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No empty cells remaining or board is complete'
            })
    except ValueError as e:
        return jsonify({'success': False, 'message': str(e)}), 400


@sudoku_bp.route('/validate_move', methods=['POST'])
def validate_move():
    """Validate if a move is legal according to Sudoku rules.
    
    Request Body:
        board: Current board state
        row: Row index
        col: Column index
        num: Number to place
        
    Returns:
        JSON response with validation result
    """
    data = request.json
    board = data.get('board')
    row = data.get('row')
    col = data.get('col')
    num = data.get('num')
    
    if board is None or row is None or col is None or num is None:
        return jsonify({'valid': False, 'error': 'Missing parameters'}), 400
    
    is_valid = game_manager.validate_move(board, row, col, num)
    return jsonify({'valid': is_valid})


@sudoku_bp.errorhandler(404)
def not_found(error):
    """Handle 404 errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Not found'}), 404


@sudoku_bp.errorhandler(500)
def internal_error(error):
    """Handle 500 errors.
    
    Returns:
        JSON error response
    """
    return jsonify({'error': 'Internal server error'}), 500
