# app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf import CSRFProtect
from flask_migrate import Migrate
from instance.config import Config  # Import the Config class

db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()
migrate = Migrate()

def create_app():
    app = Flask(__name__)

    # Load configuration from Config class
    app.config.from_object(Config)

    db.init_app(app)
    csrf.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    from app.models import User

    # Register blueprints
    from .routes.main_routes import main_bp
    from .routes.upload_routes import upload_bp
    from .routes.visualise_routes import visualise_bp
    from .routes.share_routes import share_bp
    from .routes.auth_routes import auth_bp
    from .routes.info_routes import info_bp
    from .routes.leaderboard_routes import leaderboard_bp
    from app.routes.profile_routes import profile_bp

    app.register_blueprint(main_bp, url_prefix='/')
    app.register_blueprint(upload_bp, url_prefix='/upload')
    app.register_blueprint(visualise_bp, url_prefix='/visualise')
    app.register_blueprint(share_bp, url_prefix='/share')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(info_bp, url_prefix='/info')
    app.register_blueprint(leaderboard_bp, url_prefix='/leaderboard')
    app.register_blueprint(profile_bp, url_prefix='/profile')

    return app
