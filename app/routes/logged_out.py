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

        # Prevent password login for Google-only users
        if user and not user.password:
            flash('Please log in with Google.', 'error')
            return redirect(url_for('logged_out.login'))

        if user and check_password_hash(user.password, password):
            login_user(user)
            flash('Login successful!', 'success')
            return redirect(url_for('logged_in.home_logged_in'))
        else:
            flash('Invalid credentials, please try again.', 'error')

    return render_template('auth/login.html', form=form)

@bp.route("/login/google/authorized")
def google_login():
    try:
        if not google.authorized:
            return redirect(url_for("google.login"))
        resp = google.get("/oauth2/v2/userinfo")
        if not resp.ok:
            flash("Failed to fetch user info from Google.", "error")
            return redirect(url_for("logged_out.login"))
        info = resp.json()
        google_id = info["id"]
        email = info["email"]

        user = User.query.filter_by(google_id=google_id).first()
        if not user:
            # Check if a user with this email already exists
            user = User.query.filter_by(email=email).first()
            if user:
                user.google_id = google_id
            else:
                # If your User model requires a password, set a dummy one
                user = User(email=email, google_id=google_id, password="")
                db.session.add(user)
            db.session.commit()
        login_user(user)
        flash("Logged in with Google!", "success")
        return redirect(url_for("logged_in.home_logged_in"))
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        flash(f"Internal server error: {e}", "error")
        return redirect(url_for("logged_out.login"))

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

@bp.route('/reset-password', methods=['GET', 'POST'])
def forgot_password():
    form = ResetRequestForm()
    if form.validate_on_submit():
        email = form.email.data
        user = User.get_user_by_email(email)
        if user:
            token = user.get_reset_token()
            reset_link = url_for('logged_out.reset_token', token=token, _external=True)
            send_reset_email(user.email, reset_link)
        flash('If an account with that email exists, a reset link has been sent.', 'info')
        return redirect(url_for('logged_out.login'))

    return render_template('auth/reset_password.html', form=form)


@bp.route('/reset-password/<token>', methods=['GET', 'POST'])
def reset_token(token):
    user = User.verify_reset_token(token)
    if not user:
        flash('That reset link is invalid or has expired.', 'warning')
        return redirect(url_for('logged_out.forgot_password'))

    form = ResetPasswordForm()
    if form.validate_on_submit():
        user.set_password(form.password.data)
        db.session.commit()
        flash('Your password has been updated!', 'success')
        return redirect(url_for('logged_out.login'))

    return render_template('auth/reset_with_token.html', form=form)