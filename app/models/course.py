# app/models/course.py

from app import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    sessions = db.relationship('Session', backref='course', lazy=True)

    def __repr__(self):
        return f'<Course {self.name}>'