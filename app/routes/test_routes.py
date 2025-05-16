from flask import Blueprint, redirect, url_for
from flask_login import login_user
from app import db
from app.models.user import User
from app.models.session import Session
from werkzeug.security import generate_password_hash
from app.models.reflection import Reflection
from app.models.shared_data import SharedData

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

@bp.route("/test-reset")
def test_reset():
    # Get the test user first
    test_user = User.query.filter_by(email="testuser@example.com").first()
    
    if test_user:
        # Delete all reflections for the test user
        Reflection.query.filter_by(user_id=test_user.id).delete()
        
        # Delete all shared data where test user is either sender or recipient
        SharedData.query.filter(
            (SharedData.shared_by_user_id == test_user.id) |
            (SharedData.shared_with_user_id == test_user.id)
        ).delete()
        
        # Delete all sessions for the test user
        Session.query.filter_by(user_id=test_user.id).delete()
        
        # Finally delete the test user
        db.session.delete(test_user)
        
        db.session.commit()
    
    return "Test DB cleared", 200