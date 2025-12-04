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
    
    # Warm puzzle cache in background for common difficulties to reduce latency
    try:
        from app.services import game_manager
        import threading
        for diff in ('easy', 'medium', 'hard'):
            threading.Thread(target=game_manager._generate_and_fill_cache, args=(diff,), daemon=True).start()
    except Exception:
        # Cache warm-up is optional; ignore failures to avoid impacting app startup
        pass
    
    return app
