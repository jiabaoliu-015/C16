"""
Test cases for the user logged out routes.
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
    db.session.add(user)
    db.session.commit()

class LoggedOutRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()
        with self.app.app_context():
            db.create_all()
            seed_data()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
        self.ctx.pop()

    def test_home_route(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'home', response.data.lower())

    def test_info_route(self):
        response = self.client.get('/info')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'how studytrackr works', response.data.lower())

    def test_login_route(self):
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'login', response.data.lower())

    def test_register_route(self):
        response = self.client.get('/register')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'sign up', response.data.lower())

    def test_reset_password_route(self):
        response = self.client.get('/reset-password')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'reset password', response.data.lower())

    def test_login_post_valid(self):
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login successful!', response.data)

    def test_login_post_invalid(self):
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="wrongpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Invalid credentials', response.data)

    def test_logged_in_user_redirect_from_login(self):
        # Log in first
        self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)
        # Try to access login page again
        response = self.client.get('/login', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'dashboard', response.data.lower())

    def test_logged_in_user_redirect_from_register(self):
        # Log in first
        self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)
        # Try to access register page again
        response = self.client.get('/register', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'dashboard', response.data.lower())

    def test_register_post_existing_user(self):
        response = self.client.post('/register', data=dict(
            email="testuser@example.com",
            password="password123",
            confirm_password="password123"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Email is already registered', response.data)