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
    
    return render_template('dashboard_2.html', form=form)  # Pass the form to the template

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
        # Handle different field names from form vs API
        date_field = session_data.get('date')
        
        # Check which field names are being used (form or API)
        if 'new_start' in session_data and 'new_end' in session_data:
            # Form submission field names
            start_field = session_data.get('new_start')
            end_field = session_data.get('new_end')
        elif 'start_time' in session_data and 'end_time' in session_data:
            # API submission field names
            start_field = session_data.get('start_time')
            end_field = session_data.get('end_time')
        else:
            return {'error': 'Required time fields are missing'}
            
        # Check if required fields exist
        if not date_field or not start_field or not end_field:
            return {'error': 'Required fields are missing'}

        # Parse date and times
        session_date = datetime.strptime(date_field, '%Y-%m-%d').date()
        start_time = datetime.strptime(start_field, '%H:%M').time()
        end_time = datetime.strptime(end_field, '%H:%M').time()

        # Check if end time is after start time
        if (datetime.combine(datetime.today(), end_time) <= datetime.combine(datetime.today(), start_time)):
            return {'error': 'End time must be after start time'}
        
        return {
            'date': session_date,
            'start_time': start_time,
            'end_time': end_time
        }
    except ValueError as e:
        return {'error': f'Invalid date or time format: {str(e)}'}
    except Exception as e:
        return {'error': f'Validation error: {str(e)}'}

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

@bp.route('/api/sessions', methods=['GET', 'POST'])
@login_required
def api_sessions():
    if request.method == 'GET':
        try:
            sessions = Session.query.filter_by(user_id=current_user.id).all()
            session_list = []
            
            for session in sessions:
                # Calculate duration from start and end time
                start = session.start_time
                end = session.end_time
                duration_minutes = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute)
                hours = duration_minutes // 60
                minutes = duration_minutes % 60
                duration = f"{hours}h {minutes}m"
                
                # Format time as "start_time - end_time"
                time_range = f"{start.strftime('%H:%M')} - {end.strftime('%H:%M')}"
                
                # Format date as DD/MM/YYYY to match frontend display
                formatted_date = session.date.strftime('%d/%m/%Y')
                
                session_list.append({
                    "id": session.session_id,
                    "date": formatted_date,
                    "time": time_range, 
                    "duration": duration,
                    "break_minutes": session.break_minutes,  # Changed from break_time
                    "course": session.course,
                    "productivity": session.productivity_rating,  # Changed from productivity_rating
                    "notes": session.notes  # Changed from activity
                })
                
            return jsonify(session_list), 200
        except Exception as e:
            print(f"Error fetching sessions: {e}")
            return jsonify({'error': 'Failed to fetch sessions'}), 500

    elif request.method == 'POST':
        session_data = request.get_json()
        
        if 'start_time' in session_data:
            session_data['new_start'] = session_data.pop('start_time')
        if 'end_time' in session_data:
            session_data['new_end'] = session_data.pop('end_time')
            
        validated_data = validate_session_data(session_data)
        if 'error' in validated_data:
            return jsonify(validated_data), 400

        try:
            new_session = Session(
                user_id=current_user.id,
                date=validated_data['date'],
                start_time=validated_data['start_time'],
                end_time=validated_data['end_time'],
                break_minutes=int(session_data['break_minutes']) if session_data.get('break_minutes') else None,
                course=session_data['course'],
                productivity_rating=int(session_data['productivity']),
                notes=session_data.get('notes')
            )

            db.session.add(new_session)
            db.session.commit()

            return jsonify({'message': 'Session added successfully'}), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

@bp.route('/api/sessions/<int:session_id>', methods=['DELETE'])
@login_required
def delete_session(session_id):
    try:
        session = Session.query.get_or_404(session_id)
        if session.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        db.session.delete(session)
        db.session.commit()
        return jsonify({'message': 'Session deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/api/sessions/bulk-delete', methods=['POST'])
@login_required
def bulk_delete_sessions():
    session_ids = request.get_json().get('ids', [])
    try:
        deleted = Session.query.filter(
            Session.session_id.in_(session_ids),
            Session.user_id == current_user.id
        ).delete(synchronize_session=False)
        
        db.session.commit()
        return jsonify({'message': f'{deleted} sessions deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

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
