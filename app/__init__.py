from flask import Flask
from app.extensions import db, migrate, csrf, login_manager, mail

import os
from flask_cors import CORS
from instance.config import Config
from app.forms import LogoutForm
from app.routes import register_blueprints
# from flask_dance.contrib.google import make_google_blueprint, google
from app.routes.test_routes import bp

def create_app(config_class=None, testing=False):
    app = Flask(__name__, instance_relative_config=True)

    # Load default config
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

    # User loader for Flask-Login
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Inject logout form into templates
    @app.context_processor
    def inject_logout_form():
        return dict(logout_form=LogoutForm())

    # Register blueprints
    register_blueprints(app)
    return app
