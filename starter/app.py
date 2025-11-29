from flask import Flask, render_template, jsonify, request
import sudoku_logic

app = Flask(__name__)

# Keep a simple in-memory store for current puzzle and solution
CURRENT = {
    'puzzle': None,
    'solution': None
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/new')
def new_game():
    difficulty = request.args.get('difficulty', 'medium')
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty=difficulty)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/check', methods=['POST'])
def check_solution():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    if solution is None:
        return jsonify({'error': 'No game in progress'}), 400
    incorrect = []
    for i in range(sudoku_logic.SIZE):
        for j in range(sudoku_logic.SIZE):
            if board[i][j] != solution[i][j]:
                incorrect.append([i, j])
    return jsonify({'incorrect': incorrect})

@app.route('/get_hint', methods=['POST'])
def get_hint():
    data = request.json
    board = data.get('board')
    solution = CURRENT.get('solution')
    
    if solution is None:
        return jsonify({'success': False, 'message': 'No game in progress'}), 400
    
    hint = sudoku_logic.get_hint_for_board(board, solution)
    
    if hint:
        return jsonify({
            'success': True,
            'hint': {
                'row': hint[0],
                'col': hint[1],
                'value': hint[2]
            }
        })
    else:
        return jsonify({'success': False, 'message': 'No empty cells remaining or board is complete'})

@app.route('/validate_move', methods=['POST'])
def validate_move():
    data = request.json
    board = data.get('board')
    row = data.get('row')
    col = data.get('col')
    num = data.get('num')
    
    if board is None or row is None or col is None or num is None:
        return jsonify({'valid': False, 'error': 'Missing parameters'}), 400
    
    # Check if the move is valid according to Sudoku rules
    is_valid = sudoku_logic.is_safe(board, row, col, num)
    
    return jsonify({'valid': is_valid})

if __name__ == '__main__':
    app.run(debug=True)