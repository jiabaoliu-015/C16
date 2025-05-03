# create_tables.py
from app import create_app, db
from app.models.user import User
from app.models.course import Course
from app.models.session import Session
from app.models.shared_data import SharedData

app = create_app()

with app.app_context():

    db.create_all()
    print("database is created")
