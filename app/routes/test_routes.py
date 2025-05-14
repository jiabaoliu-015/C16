from flask import Blueprint
from werkzeug.security import generate_password_hash
from app import db
from app.models.user import User  # Use the correct import path

test_seed = Blueprint('test_seed', __name__)

@test_seed.route('/test-seed')
def seed():
    if not User.query.filter_by(email='testuser@example.com').first():
        user = User(email='testuser@example.com', password=generate_password_hash('password123'))
        db.session.add(user)
        db.session.commit()
    return "Seeded"
