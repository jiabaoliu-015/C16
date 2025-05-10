from app.extensions import db
from flask_login import current_user
from datetime import datetime
from zoneinfo import ZoneInfo

class Reflection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    mood = db.Column(db.String(20), nullable=True)  # e.g., "😊", "😐", "😔"
    tags = db.Column(db.String(100), nullable=True)  # comma-separated tags
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(ZoneInfo("Australia/Perth"))
    )

    user = db.relationship('User', backref=db.backref('reflections', lazy='dynamic'))