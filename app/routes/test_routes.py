from flask import Blueprint, redirect, url_for
from flask_login import login_user
from app import db
from app.models.user import User
from werkzeug.security import generate_password_hash

bp = Blueprint('test_seed', __name__)

@bp.route('/test-seed')
def seed():
    if not User.query.filter_by(email='testuser@example.com').first():
        user = User(email='testuser@example.com', password=generate_password_hash('password123'))
        db.session.add(user)
        db.session.commit()
    return "Seeded"

@bp.route('/test-login')
def test_login():
    user = User.query.filter_by(email='testuser@example.com').first()
    if user:
        login_user(user)
        return redirect(url_for('logged_in.home_logged_in'))
    return "User not found", 404
