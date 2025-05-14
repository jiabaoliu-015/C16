from flask import Flask
from app.extensions import db, migrate, csrf, login_manager, mail

import os
from flask_cors import CORS
from instance.config import Config
from app.templates.auth.forms import LogoutForm
from app.routes import register_blueprints
# from flask_dance.contrib.google import make_google_blueprint, google
from app.routes.test_routes import bp

def create_app(testing=False):
    app = Flask(__name__, instance_relative_config=True)

    # Load default config
    app.config.from_object(Config)

    if testing:
        # Override config for testing
        app.config.update({
            "TESTING": True,
            "WTF_CSRF_ENABLED": False,
            "SQLALCHEMY_DATABASE_URI": "sqlite://",  # In-memory DB
            "LOGIN_DISABLED": False,  # Set True to skip login during some tests
        })

    # google_bp = make_google_blueprint(
    #     client_id=app.config['GOOGLE_OAUTH_CLIENT_ID'],
    #     client_secret=app.config['GOOGLE_OAUTH_CLIENT_SECRET'],
    #         scope=[
    #             "https://www.googleapis.com/auth/userinfo.profile",
    #             "https://www.googleapis.com/auth/userinfo.email",
    #             "openid"
    #         ],
    #     redirect_to="logged_in.home_logged_in"
    # )
    # app.register_blueprint(google_bp, url_prefix="/login")

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    CORS(app)

    if os.getenv("ENV") == "development":
        app.register_blueprint(bp)

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

if __name__ == '__main__':
    app.run(ssl_context=('cert.pem', 'private_key.pem'))
