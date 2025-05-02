from flask import Blueprint, render_template, redirect, url_for, request, flash
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from flask_login import login_user, logout_user
from app.models.user import User
from app.templates.auth.forms import LoginForm, SignupForm, LogoutForm
from app import db

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Login Route
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):  # Compare the hashed password
            login_user(user)  # Use Flask-Login's login_user to handle session management
            flash('Login successful!', 'success')
            return redirect(url_for('main.home_logged_in'))  # Redirect to the dashboard after login
        else:
            flash('Invalid credentials, please try again.', 'error')

    return render_template('auth/login.html', form=form)

# Signup Route
@auth_bp.route('/register', methods=['GET', 'POST'])
def signup():
    form = SignupForm()  # Create an instance of the form
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        confirm_password = form.confirm_password.data

        # Check if the passwords match
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('auth.signup'))

        # Check if the email already exists in the database
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email is already registered.', 'error')
            return redirect(url_for('auth.signup'))

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create a new user and add them to the database
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash('Signup successful! You can now log in.', 'success')
        return redirect(url_for('auth.login'))  # Redirect to the login page

    return render_template('auth/register.html', form=form)  # Pass the form to the template

# Forgot Password Route
@auth_bp.route('/reset-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        # Handle password reset logic (send email, etc.)
        flash('Password reset link sent!', 'info')
        return redirect(url_for('auth.login'))  # Correct
    return render_template('auth/reset_password.html')

# Logout Route
@auth_bp.route('/logout', methods=['POST'])
def logout():
    form = LogoutForm()
    if form.validate_on_submit():  # Flask-WTF automatically checks CSRF
        logout_user()  # Logout the user
        return redirect(url_for('main.home_not_logged_in'))
    return redirect(url_for('main.dashboard'))