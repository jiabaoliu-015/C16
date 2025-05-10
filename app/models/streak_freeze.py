from app import db

class StreakFreeze(db.Model):
    __tablename__ = 'streak_freeze'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    used_on = db.Column(db.Date, nullable=False)