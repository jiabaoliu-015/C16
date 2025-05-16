import unittest
from app.forms import (
    ResetRequestForm, NewPasswordForm, ResetPasswordForm,
    LoginForm, SignupForm, LogoutForm, AddFriendForm
)
from flask import Flask
from werkzeug.datastructures import MultiDict

class TestForms(unittest.TestCase):
    def setUp(self):
        # Flask-WTF requires an app context for CSRF
        self.app = Flask(__name__)
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.ctx = self.app.app_context()
        self.ctx.push()

    def tearDown(self):
        self.ctx.pop()

    def test_reset_request_form_valid(self):
        form = ResetRequestForm(data={'email': 'test@example.com'})
        self.assertTrue(form.validate())

    def test_reset_request_form_invalid_email(self):
        form = ResetRequestForm(data={'email': 'not-an-email'})
        self.assertFalse(form.validate())

    def test_new_password_form_valid(self):
        form = NewPasswordForm(data={'password': 'strongpassword'})
        self.assertTrue(form.validate())

    def test_new_password_form_empty(self):
        form = NewPasswordForm(data={'password': ''})
        self.assertFalse(form.validate())

    def test_reset_password_form_valid(self):
        form = ResetPasswordForm(data={'password': 'abcdef'})
        self.assertTrue(form.validate())

    def test_reset_password_form_short(self):
        form = ResetPasswordForm(data={'password': 'abc'})
        self.assertFalse(form.validate())

    def test_login_form_valid(self):
        form = LoginForm(formdata=MultiDict({
            'email': 'user@example.com',
            'password': 'pw',
            'submit': True
        }))
        self.assertTrue(form.validate())

    def test_login_form_invalid_email(self):
        form = LoginForm(data={'email': 'bad', 'password': 'pw'})
        self.assertFalse(form.validate())

    def test_signup_form_valid(self):
        form = SignupForm(data={
            'email': 'user@example.com',
            'password': 'pw123456',
            'confirm_password': 'pw123456'
        })
        self.assertTrue(form.validate())

    def test_signup_form_mismatched_passwords(self):
        form = SignupForm(data={
            'email': 'user@example.com',
            'password': 'pw123456',
            'confirm_password': 'different'
        })
        self.assertFalse(form.validate())

    def test_signup_form_invalid_email(self):
        form = SignupForm(data={
            'email': 'bad',
            'password': 'pw123456',
            'confirm_password': 'pw123456'
        })
        self.assertFalse(form.validate())

    def test_logout_form(self):
        form = LogoutForm()
        self.assertTrue(form.validate())

    def test_add_friend_form_valid(self):
        form = AddFriendForm(formdata=MultiDict({
            'email': 'friend@example.com',
            'submit': True
        }))
        self.assertTrue(form.validate())

    def test_add_friend_form_invalid_email(self):
        form = AddFriendForm(data={'email': 'bad'})
        self.assertFalse(form.validate())

if __name__ == '__main__':
    unittest.main()