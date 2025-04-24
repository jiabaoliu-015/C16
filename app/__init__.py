from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf import CSRFProtect

db = SQLAlchemy()
migrate = Migrate()
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    app.config.from_object('instance.config.Config')  # Load configuration

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    csrf.init_app(app)

    # Register blueprints
    from .routes import main_routes, upload_routes, visualise_routes, share_routes
    app.register_blueprint(main_routes.bp)
    app.register_blueprint(upload_routes.bp)
    app.register_blueprint(visualise_routes.bp)
    app.register_blueprint(share_routes.bp)

    return app