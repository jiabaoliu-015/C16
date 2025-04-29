# app/routes/main_routes.py
from flask import Blueprint, render_template, redirect, url_for
from flask_login import current_user
from flask_wtf import FlaskForm
from wtforms import SubmitField
from app.templates.auth.forms import LogoutForm

class LogoutForm(FlaskForm):
    submit = SubmitField('Logout')

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home_not_logged_in():
    if current_user.is_authenticated:  # Checks if the user is logged in with Flask-Login
        return redirect(url_for('main.home_logged_in'))  # Redirect to dashboard if logged in
    return render_template('home.html')  # Regular home page for non-logged-in users

# @bp.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         return redirect(url_for('visualise.visualise'))
#     return render_template('login.html')

# @bp.route('/register', methods=['GET', 'POST'])
# def register():
#     return render_template('register.html')

# @bp.route('/reset-password', methods=['GET', 'POST'])
# def reset_password():
#     return render_template('reset_password.html')

@main_bp.route('/dashboard', methods=['GET', 'POST'])
def home_logged_in():
    if not current_user.is_authenticated:
        return redirect(url_for('auth.login'))  # Redirect to login if not logged in
    
    form = LogoutForm()  # Create an instance of the form
    if form.validate_on_submit():
        logout_user()  # Call Flask-Login's logout function to log out the user
        return redirect(url_for('main.home_not_logged_in'))  # Redirect to the home page
    
    return render_template('dashboard.html', form=form)  # Pass the form to the template