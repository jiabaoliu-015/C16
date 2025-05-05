# This is for all the pages an unlogged in user can visit
from . import *

bp = Blueprint('logged_out', __name__)

# Decorator to prevent logged-in users from accessing anonymous-only views
def anonymous_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if current_user.is_authenticated:
            return redirect(url_for('logged_in.home_logged_in'))
        return view_func(*args, **kwargs)
    return wrapper

# Route for the home page when the user is not logged in
@bp.route('/')
def home_not_logged_in():
    if current_user.is_authenticated:  # Checks if the user is logged in with Flask-Login
        return redirect(url_for('logged_in.home_logged_in'))  # Redirect to dashboard if logged in
    return render_template('home.html')  # Regular home page for non-logged-in users

# Route for the info page
@bp.route('/info')
def info():
    return render_template('info.html')

# Login Route
@bp.route('/login', methods=['GET', 'POST'])
@anonymous_required
def login():
    form = LoginForm()
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):  # Compare the hashed password
            login_user(user)  # Use Flask-Login's login_user to handle session management
            flash('Login successful!', 'success')
            return redirect(url_for('logged_in.home_logged_in'))  # Redirect to the dashboard after login
        else:
            flash('Invalid credentials, please try again.', 'error')

    return render_template('auth/login.html', form=form)

# Logout Route
@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    form = LogoutForm()
    if form.validate_on_submit():  # Flask-WTF automatically checks CSRF
        logout_user()  # Logout the user
        return redirect(url_for('logged_out.home_not_logged_in'))
    return redirect(url_for('logged_in.home_logged_in'))

# Signup Route
@bp.route('/register', methods=['GET', 'POST'])
@anonymous_required
def signup():
    form = SignupForm()  # Create an instance of the form
    if form.validate_on_submit():
        email = form.email.data
        password = form.password.data
        confirm_password = form.confirm_password.data

        # Check if the passwords match
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return redirect(url_for('logged_out.signup'))

        # Check if the email already exists in the database
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            flash('Email is already registered.', 'error')
            return redirect(url_for('logged_out.signup'))

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create a new user and add them to the database
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash('Signup successful! You can now log in.', 'success')
        return redirect(url_for('logged_out.login'))  # Redirect to the login page

    return render_template('auth/register.html', form=form)  # Pass the form to the template

# Forgot Password Route
@bp.route('/reset-password', methods=['GET', 'POST'])
@anonymous_required
def forgot_password():
    if request.method == 'POST':
        # Handle password reset logic (send email, etc.)
        flash('Password reset link sent!', 'info')
        return redirect(url_for('logged_out.login'))  # Correct
    return render_template('auth/reset_password.html')