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

def validate_session_data(session_data):
    try:
        # Check for the expected keys first
        if 'date' not in session_data or 'new_start' not in session_data or 'new_end' not in session_data:
            return {'error': 'Required fields are missing'}

        session_date = datetime.strptime(session_data['date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(session_data['new_start'], '%H:%M').time()
        end_time = datetime.strptime(session_data['new_end'], '%H:%M').time()

        # Check if end time is after start time (basic check)
        if (datetime.combine(datetime.today(), end_time) <= datetime.combine(datetime.today(), start_time)):
            return {'error': 'End time must be after start time'}
        
        return {
            'date': session_date,
            'start_time': start_time,
            'end_time': end_time
        }
    except ValueError:
        return {'error': 'Invalid date or time format'}

# Route to render the upload form page
@bp.route('/upload/', methods=['GET', 'POST'])
@login_required
def upload_data():
    if request.method == 'POST':
        session_data = request.form.to_dict()

        # Validate the session data
        validated_data = validate_session_data(session_data)
        if 'error' in validated_data:
            return render_template('upload.html', error=validated_data['error'])

        try:
            # Create a new session
            new_session = Session(
                user_id=current_user.id,
                date=validated_data['date'],
                start_time=validated_data['start_time'],
                end_time=validated_data['end_time'],
                break_minutes=int(session_data['new_break']) if session_data.get('new_break') else None,
                course=session_data['new_course'],
                productivity_rating=int(session_data['new_productivity']),
                notes=session_data.get('new_activity')
            )

            # Save to the database
            db.session.add(new_session)
            db.session.commit()

            # Render the template with a success message
            return render_template('upload.html', success="Session successfully added!")

        except Exception as e:
            db.session.rollback()
            return render_template('upload.html', error=f"Error: {str(e)}")

    # GET Request - Retrieve all sessions for the current user
    sessions = Session.query.filter_by(user_id=current_user.id).all()

    # Pass the sessions to the template for display
    return render_template('upload.html', sessions=sessions)

# API route for handling GET and POST requests for sessions
@bp.route('/api/sessions', methods=['GET', 'POST'])
@login_required
def api_sessions():
    if request.method == 'GET':
        try:
            sessions = Session.query.filter_by(user_id=current_user.id).all()
            session_list = [{
                "id": session.session_id,
                "date": session.date.strftime('%Y-%m-%d'),
                "start_time": session.start_time.strftime('%H:%M'),
                "end_time": session.end_time.strftime('%H:%M'),
                "break_time": session.break_minutes,
                "course": session.course,
                "activity": session.notes,
                "productivity": session.productivity_rating
            } for session in sessions]
            return jsonify(session_list), 200
        except Exception as e:
            print(f"Error fetching sessions: {e}")
            return jsonify({'error': 'Failed to fetch sessions'}), 500

    elif request.method == 'POST':
        session_data = request.get_json()
        validated_data = validate_session_data(session_data)
        if 'error' in validated_data:
            return jsonify(validated_data), 400

        try:
            new_session = Session(
                user_id=current_user.id,
                date=validated_data['date'],
                start_time=validated_data['start_time'],
                end_time=validated_data['end_time'],
                break_minutes=int(session_data['new_break']) if session_data.get('new_break') else None,
                course=session_data['new_course'],
                productivity_rating=int(session_data['new_productivity']),
                notes=session_data.get('new_activity')
            )

            db.session.add(new_session)
            db.session.commit()

            return jsonify({'message': 'Session added successfully'}), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

# Route for the dashboard visualization page
@bp.route('/dashboard/')
@login_required
def dashboard():
    return render_template('dashboard_2.html')

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
