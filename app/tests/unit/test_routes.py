"""
Test cases for the user routes.
python3 -m unittest discover -s app/tests/unit
"""

import unittest
from flask import url_for
from app import create_app  # adjust if your factory function is named differently
from flask_login import current_user
from app import db
from app.models import User
import pytest
from app.extensions import db
from app.models import User

@pytest.fixture
def seed_user(app):
    user = User(email="testuser@example.com", password="testpassword")
    db.session.add(user)
    db.session.commit()
    return user

def seed_data():
    user = User(
        email="testuser@example.com",
        password="testpassword"  # Make sure the password is hashed as needed
    )
    db.session.add(user)
    db.session.commit()

class LoggedOutRoutesTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(testing=True)  # Pass test config if needed
        self.client = self.app.test_client()
        self.ctx = self.app.app_context()
        self.ctx.push()

        # Create the database and tables
        with self.app.app_context():
            db.create_all()  # This will create all the tables defined in models
            seed_data()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()  # Remove any session
            db.drop_all()  # Drop all the tables to clean up
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
        # Simulate POST request for valid login
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="testpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Welcome', response.data)

    def test_login_post_invalid(self):
        # Simulate POST request for invalid login (wrong password)
        response = self.client.post('/login', data=dict(
            email="testuser@example.com",
            password="wrongpassword"
        ), follow_redirects=True)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Invalid credentials, please try again.', response.data)

    def test_logged_in_user_redirect_from_login(self):
        with self.client:
            # Log the user in first
            self.client.post('/login', data=dict(
                email="testuser@example.com",
                password="testpassword"
            ))

            # Try accessing the login page while logged in
            response = self.client.get('/login', follow_redirects=True)
            self.assertEqual(response.status_code, 200)

    def test_logged_in_user_redirect_from_register(self):
        with self.client:
            # Log the user in first
            self.client.post('/login', data=dict(
                email="testuser@example.com",
                password="testpassword"
            ))

            # Try accessing the register page while logged in
            response = self.client.get('/register', follow_redirects=True)
            self.assertEqual(response.status_code, 200)

    def test_register_post_existing_user(self):
        # Simulate POST request for existing user
        response = self.client.post('/register', data=dict(
            email="testuser@example.com",
            password="password123",
            confirm_password="password123"
        ), follow_redirects=True)
        
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Email is already registered.', response.data)

def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'home' in response.data.lower()

def test_login_post_valid(client, seed_user):
    response = client.post('/login', data={
        "email": "testuser@example.com",
        "password": "testpassword"
    }, follow_redirects=True)
    assert response.status_code == 200
    assert b'Welcome' in response.data
