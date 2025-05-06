# app/forms.py
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length

class ResetRequestForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])

class NewPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired()])

class ResetPasswordForm(FlaskForm):
    password = PasswordField('New Password', validators=[DataRequired(), Length(min=6)])
    submit = SubmitField('Update Password')