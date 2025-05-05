from app import db
from datetime import datetime, timedelta

class Session(db.Model):
    session_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    break_minutes = db.Column(db.Integer, nullable=True)
    course = db.Column(db.String(100), nullable=False)
    productivity_rating = db.Column(db.Integer, nullable=False)
    notes = db.Column(db.String(500), nullable=True)

    user = db.relationship('User', back_populates='sessions')

    def __repr__(self):
        return f'<Session {self.date} - {self.course}>'

    @property
    def duration(self):
        """Calculate the duration dynamically."""
        start = datetime.combine(datetime.today(), self.start_time)
        end = datetime.combine(datetime.today(), self.end_time)
        duration = end - start

        # If the duration goes negative (crossing midnight), adjust it
        if duration.days < 0:
            duration = duration + timedelta(days=1)

        # Return duration in hours and minutes format
        hours = duration.seconds // 3600
        minutes = (duration.seconds % 3600) // 60
        return f'{hours}h {minutes}m'