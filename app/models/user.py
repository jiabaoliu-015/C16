# app/models/user.py

from itsdangerous import URLSafeTimedSerializer as Serializer
from flask import current_app
from app.extensions import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)

    sessions = db.relationship('Session', back_populates='user', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'

    @staticmethod
    def get_user_by_email(email):
        return User.query.filter_by(email=email).first()

    def set_password(self, raw_password):
        self.password = generate_password_hash(raw_password)

    def check_password(self, raw_password):
        return check_password_hash(self.password, raw_password)

    def get_reset_token(self, expires_sec=1800):
        s = Serializer(current_app.config['SECRET_KEY'])
        return s.dumps({'user_id': self.id})

    @staticmethod
    def verify_reset_token(token):
        s = Serializer(current_app.config['SECRET_KEY'])
        try:
            user_id = s.loads(token, max_age=1800)['user_id']
        except Exception:
            return None
        return User.query.get(user_id)