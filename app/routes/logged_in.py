# app\routes\logged_in.py: Stores all the routes that a logged in user can view
from . import *

# Define blueprint for main routes
bp = Blueprint('logged_in', __name__)

# Route for the dashboard page when the user is logged in
@bp.route('/visualise/', methods=['GET', 'POST'])
@login_required
def home_logged_in():
    if not current_user.is_authenticated:
        return redirect(url_for('logged_out.login'))  # Redirect to login if not logged in
    
    form = LogoutForm()  # Create an instance of the form
    if form.validate_on_submit():
        logout_user()  # Call Flask-Login's logout function to log out the user
        return redirect(url_for('logged_out.home_not_logged_in'))  # Redirect to the home page
    
    return render_template('dashboard.html', form=form)  # Pass the form to the template

# Route for the user's profile page
@bp.route('/profile/')
@login_required
def profile():
    return render_template('profile.html')

# Route for the share page
@bp.route('/share/')
@login_required
def share():
    return render_template('share.html')

# Route for uploading data
@bp.route('/upload/', methods=['GET', 'POST'])
@login_required
def upload_data():
    # Dynamically load sessions data
    return render_template('upload.html', sessions=sessions)

# API route to return session data as JSON
@bp.route('/api/sessions')
@login_required
def api_sessions():
    return jsonify(sessions)

# Route for the dashboard visualization page
@bp.route('/dashboard/')
@login_required
def dashboard():
    return render_template('visualise.html')

# API route to return study time data as JSON
@bp.route('/api/study-time-data')
@login_required
def study_time_data():
    data = [
        {"date": "2025-04-01", "studyTime": 2},
        {"date": "2025-04-02", "studyTime": 3},
        {"date": "2025-04-03", "studyTime": 1.5},
    ]
    return jsonify(data)

# Route for the leaderboard page
@bp.route('/leaderboard/')
@login_required
def leaderboard():
    return render_template('leaderboard.html')
