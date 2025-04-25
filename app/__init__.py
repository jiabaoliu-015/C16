#!/usr/bin/env python3
# app/__init__.py: Application factory

from flask import Flask
from flask_wtf import CSRFProtect

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    app.config.from_object('instance.config.Config')  # Load configuration

    # Initialise extensions
    csrf.init_app(app)

    # Register blueprints
    from .routes import main_routes, upload_routes, visualise_routes, share_routes
    app.register_blueprint(main_routes.bp)
    app.register_blueprint(upload_routes.bp)
    app.register_blueprint(visualise_routes.bp)
    app.register_blueprint(share_routes.bp)

    return app