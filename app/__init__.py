from flask import Flask
from app.extensions import db, migrate, csrf, login_manager


from flask_cors import CORS
from instance.config import Config
from app.templates.auth.forms import LogoutForm
from app.routes import register_blueprints


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)
    login_manager.init_app(app)
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

if __name__ == '__main__':
    create_app().run(debug=True)