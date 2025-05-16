# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length, InputRequired, EqualTo

class ResetRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])

class NewPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired()])

class ResetPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Update Password')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[InputRequired(), Email()])
    password = PasswordField('Password', validators=[InputRequired()])

class SignupForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password', message='Passwords must match.')])

class LogoutForm(FlaskForm):
    submit = SubmitField('Logout')  # Button to submit the logout request

class AddFriendForm(FlaskForm):
    email = StringField('Friend\'s Email', validators=[InputRequired(), Email()])
    submit = SubmitField('Add Friend')