"""
Test cases for the user logged in routes.
Run with: python3 -m unittest discover -s app/tests/unit
"""

import unittest
from app import create_app, db
from app.models import User
from instance.config import TestingConfig
from werkzeug.security import generate_password_hash

def seed_data():
    User.query.delete()
    db.session.commit()
    user = User(email="testuser@example.com", password=generate_password_hash("testpassword"))
    friend = User(email="friend@example.com", password=generate_password_hash("friendpassword"))
    db.session.add(user)
    db.session.add(friend)
    db.session.commit()
    # Add each other as friends
    user.friends.append(friend)
    friend.friends.append(user)
    db.session.commit()
    # Add a session for the user
    from app.models.session import Session
    from datetime import date, time
    session = Session(
        user_id=user.id,
        date=date.today(),
        start_time=time(10, 0),
        end_time=time(11, 0),
        break_minutes=0,
        course="Math",
        productivity_rating=8,
        notes="Test session"
    )
    db.session.add(session)
    db.session.commit()
    return user

class LoggedInRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        with self.app.app_context():
            db.create_all()
            self.user = seed_data()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        self.ctx.pop()

    def login(self):
        self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)

    def test_dashboard_access(self):
        self.login()
        response = self.client.get('/visualise/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'dashboard', response.data.lower())

    def test_profile_access(self):
        self.login()
        response = self.client.get('/profile/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'profile', response.data.lower())

    def test_logout(self):
        self.login()
        response = self.client.post('/logout', data={}, follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'home', response.data.lower())

    def test_upload_page_access(self):
        self.login()
        response = self.client.get('/upload/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'upload', response.data.lower())

    def test_api_get_friends(self):
        self.login()
        response = self.client.get('/api/friends', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'email', response.data.lower())

    def test_api_sessions_get(self):
        self.login()
        response = self.client.get('/api/sessions', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'session_id', response.data.lower())

    def test_api_study_time(self):
        self.login()
        response = self.client.get('/api/total-study-time', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'hours', response.data.lower())