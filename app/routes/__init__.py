# app/routes/__init__.py: Blueprint registration + package denominator

from flask import Blueprint, render_template, redirect, url_for, request, flash, Flask, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, current_user, login_required
from flask_wtf import FlaskForm
from wtforms import SubmitField
from functools import wraps

from app.templates.auth.forms import LoginForm, SignupForm, LogoutForm
from app.test import sessions_data
from app.models import *
from datetime import datetime
from flask_dance.contrib.google import make_google_blueprint, google

# Sample data
from app.test.sessions_data import sessions
from app import db

# Optional: inline form class definition (if used elsewhere)
class LogoutForm(FlaskForm):
    submit = SubmitField('Logout')

# Register all blueprints used in the app
def register_blueprints(app: Flask):
    from app.routes.logged_out import bp as logged_out_bp
    from app.routes.logged_in import bp as logged_in_bp
    app.register_blueprint(logged_out_bp)
    app.register_blueprint(logged_in_bp)
