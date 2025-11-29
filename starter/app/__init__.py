"""Flask application factory."""
from flask import Flask
from app.config import Config


def create_app(config_class=Config):
    """Create and configure the Flask application.
    
    Args:
        config_class: Configuration class to use
        
    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')
    app.config.from_object(config_class)
    
    # Register blueprints
    from app.routes import sudoku_bp
    app.register_blueprint(sudoku_bp)
    
    return app
