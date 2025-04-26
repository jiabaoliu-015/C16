from flask import Blueprint, render_template, redirect, url_for, request, session, flash
from app.templates.auth.forms import LoginForm

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

dummy_user = {
    'email': 'test@example.com',
    'password': 'password123'
}

# Login Route
@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        # Check if the email and password match the dummy user
        if email == dummy_user['email'] and password == dummy_user['password']:
            session['user_id'] = dummy_user['email']  # Store email in session
            session['logged_in'] = True  # Mark the user as logged in
            flash('Login successful!', 'success')
            return redirect(url_for('main.home_logged_in'))  # Redirect to dashboard after login
        else:
            flash('Invalid credentials, please try again.', 'error')  # Use flash for error messages

    return render_template('auth/login.html', form=form)  # Pass form to the template

# Signup Route
@auth_bp.route('/register', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        # Handle signup logic (save user to the database, etc.)
        flash('Signup successful! You can now log in.', 'success')
        return redirect(url_for('user.login'))  # Redirect to login after signup
    return render_template('auth/register.html')

# Forgot Password Route
@auth_bp.route('/reset-password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        # Handle password reset logic (send email, etc.)
        flash('Password reset link sent!', 'info')
        return redirect(url_for('user.login'))  # Redirect to login after requesting password reset
    return render_template('auth/reset_password.html')

# Logout Route
@auth_bp.route('/logout', methods=['POST'])
def logout():
    # Remove the 'user_id' from session to log out
    session.pop('user_id', None)
    session.pop('logged_in', None)  # Optionally remove any other session-related data

    return redirect(url_for('main.home_not_logged_in'))  # Redirect to home or login page