# app/models/user.py

from itsdangerous import URLSafeTimedSerializer as Serializer
from flask import current_app
from app.extensions import db
from flask_login import UserMixin
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

# Association table for the many-to-many relationship
friends = db.Table('friends',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True),
    db.Column('friend_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    google_id = db.Column(db.String(200), unique=True, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))  # Account creation date

    # Many-to-many relationship with the friends table
    friends = db.relationship('User', secondary=friends,
                              primaryjoin=(friends.c.user_id == id),
                              secondaryjoin=(friends.c.friend_id == id),
                              backref=db.backref('friends_of', lazy='dynamic'),
                              lazy='dynamic')

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