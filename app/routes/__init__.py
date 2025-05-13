# app/routes/__init__.py: Blueprint registration + package denominator

from flask import Blueprint, render_template, redirect, url_for, request, flash, Flask, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, logout_user, current_user, login_required
from flask_wtf import FlaskForm
from wtforms import SubmitField
from functools import wraps
from app.static.py.email import send_email

from app.templates.auth.forms import LoginForm, SignupForm, LogoutForm
from app.tests import sessions_data
from app.models import *
from datetime import datetime
from app.forms import ResetRequestForm, ResetPasswordForm
from flask_mail import Message
from app import db, mail
from flask_dance.contrib.google import make_google_blueprint, google
from sqlalchemy import func, extract, and_
from datetime import datetime, timedelta

# Sample data
from app.tests.sessions_data import sessions
from app import db

# Optional: inline form class definition (if used elsewhere)
class LogoutForm(FlaskForm):
    submit = SubmitField('Logout')

def send_reset_email(user_email, reset_link):
    subject = "Password Reset Request"
    current_year = datetime.now().year

    # Modern HTML email template
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {{
                font-family: Arial, sans-serif;
                color: #333;
                background-color: #f4f7fc;
                margin: 0;
                padding: 0;
            }}
            .email-container {{
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }}
            .email-header {{
                text-align: center;
                padding-bottom: 20px;
                border-bottom: 1px solid #e1e1e1;
            }}
            .email-header h1 {{
                color: #5c6bc0;
                font-size: 28px;
            }}
            .email-body {{
                padding: 20px;
                text-align: center;
            }}
            .email-body p {{
                font-size: 16px;
                line-height: 1.5;
            }}
            .reset-button {{
                display: inline-block;
                padding: 14px 40px;
                font-size: 16px;
                font-weight: bold;
                font-color: white;
                background: linear-gradient(90deg, #5c6bc0, #3f51b5);
                text-decoration: none;
                border-radius: 25px;
                margin-top: 20px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }}
            .reset-button:hover {{
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
            }}
            .footer {{
                text-align: center;
                padding-top: 20px;
                font-size: 12px;
                color: #777;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="email-body">
                <p>Hi there,</p>
                <p>We received a request to reset the password for your StudyTrackr account. To reset your password, click the button below:</p>
                <a href="{reset_link}" 
                    style="display: inline-block; padding: 15px 25px; font-size: 18px; font-weight: bold; color: white; background-color: #1d4ed8; text-decoration: none; border-radius: 5px;">
                    Reset My Password
                </a>
                <p>If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; {current_year} StudyTrackr. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = Message(subject, recipients=[user_email])
    msg.html = html_content

    mail.send(msg)


# Register all blueprints used in the app
def register_blueprints(app: Flask):
    from app.routes.logged_out import bp as logged_out_bp
    from app.routes.logged_in import bp as logged_in_bp
    app.register_blueprint(logged_out_bp)
    app.register_blueprint(logged_in_bp)
