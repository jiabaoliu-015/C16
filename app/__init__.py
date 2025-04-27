#!/usr/bin/env python3
# app/__init__.py: Application factory

from .routes.main_routes import main_bp
from .routes.upload_routes import upload_bp
from .routes.visualise_routes import visualise_bp
from .routes.share_routes import share_bp
from .routes.auth_routes import auth_bp
from .routes.info_routes import info_bp
from .routes.leaderboard_routes import leaderboard_bp
from app.routes.profile_routes import profile_bp

from flask import Flask
from flask_wtf import CSRFProtect
from app.views.auth import auth

csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)
    app.secret_key = 'secret_key'
    app.config['WTF_CSRF_SECRET_KEY'] = 'secret_key'

    # Enable CSRF protection
    csrf.init_app(app)

    # Register blueprints
    app.register_blueprint(main_bp, url_prefix='/')
    app.register_blueprint(upload_bp, url_prefix='/upload')
    app.register_blueprint(visualise_bp, url_prefix='/visualise')
    app.register_blueprint(share_bp, url_prefix='/share')
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(info_bp, url_prefix='/info')
    app.register_blueprint(leaderboard_bp, url_prefix='/leaderboard')
    app.register_blueprint(profile_bp, url_prefix='/profile')

    return app