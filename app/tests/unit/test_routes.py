"""
Test cases for the user routes.
Run with: python3 -m unittest discover -s app/tests/unit
"""

import unittest
from app import create_app, db
from app.models import User
from instance.config import TestingConfig

def seed_data():
    User.query.delete()
    db.session.commit()
    user = User(
        email="testuser@example.com",
        password="testpassword"  # Make sure the password is hashed as needed
    )
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
        self.assertIn(b'How StudyTrackr Works', response.data)

    def test_login_route(self):
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Login', response.data)

    def test_register_route(self):
        response = self.client.get('/register')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Sign up', response.data)

    def test_reset_password_route(self):
        response = self.client.get('/reset-password')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Reset Password', response.data)

    def test_login_post_valid(self):
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome', response.data)

    def test_login_post_invalid(self):
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="wrongpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Invalid credentials, please try again.', response.data)

    def test_logged_in_user_redirect_from_login(self):
        with self.client:
            self.client.post('/login', data=dict(
                email="testuser@example.com",
                password="testpassword"
            ))
            response = self.client.get('/login', follow_redirects=True)
            self.assertEqual(response.status_code, 200)

    def test_logged_in_user_redirect_from_register(self):
        with self.client:
            self.client.post('/login', data=dict(
                email="testuser@example.com",
                password="testpassword"
            ))
            response = self.client.get('/register', follow_redirects=True)
            self.assertEqual(response.status_code, 200)

    def test_register_post_existing_user(self):
        response = self.client.post('/register', data=dict(
            email="testuser@example.com",
            password="password123",
            confirm_password="password123"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Email is already registered.', response.data)
