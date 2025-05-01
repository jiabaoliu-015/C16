# app/models/session.py

from app import db

class Session(db.Model):
    # Primary key
    session_id = db.Column(db.Integer, primary_key=True)

    # Secondary key
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    break_minutes = db.Column(db.Integer, nullable=True)
    
    # Maybe remove
    duration = db.Column(db.String(50), nullable=False)
    
    course = db.Column(db.String(100), nullable=False)
    productivity_rating = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f'<Session {self.date} - {self.course}>'