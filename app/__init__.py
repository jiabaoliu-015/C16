from flask import Flask
from app.extensions import db, migrate, csrf, login_manager, mail
from flask_cors import CORS
from instance.config import Config
from app.forms import LogoutForm
from app.routes import register_blueprints

def create_app(config_class=None):
    app = Flask(__name__, instance_relative_config=True)

    # Load config
    if config_class:
        app.config.from_object(config_class)
    else:
        app.config.from_object(Config)

    # Initialise extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    CORS(app)

    login_manager.login_view = "logged_out.login"
    from app.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return db.session.get(User, int(user_id))

    @app.context_processor
    def inject_logout_form():
        return dict(logout_form=LogoutForm())

    # Register blueprints
    register_blueprints(app)
    return app
