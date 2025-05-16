"""
FOR TESTING PURPOSES ONLY
This file contains routes for testing and seeding the database.
These routes should not be used in production.
Ensure routes are only accessible in testing mode.
"""

from . import *
bp = Blueprint('test_seed', __name__)

@bp.route('/test-seed')
def seed():
    # Create first test user
    if not User.query.filter_by(email='testuser@example.com').first():
        user = User(email='testuser@example.com', password=generate_password_hash('password123'))
        db.session.add(user)
    # Create second test user for sharing/friend tests
    if not User.query.filter_by(email='testuser2@example.com').first():
        user2 = User(email='testuser2@example.com', password=generate_password_hash('password123'))
        db.session.add(user2)
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