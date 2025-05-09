# app\routes\logged_in.py: Stores all the routes that a logged in user can view
from . import *
from flask import flash, redirect, url_for
import csv
from io import TextIOWrapper

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
    
    return render_template('user/dashboard.html', form=form)  # Pass the form to the template

# Route for the user's profile page
@bp.route('/profile/')
@login_required
def profile():
    return render_template('user/profile.html')

# Route for the share page
@bp.route('/share/')
@login_required
def share():
    return render_template('user/share.html')

@bp.route('/api/sessions', methods=['GET', 'POST'])
@login_required
def api_sessions():
    """Get all sessions or create a new session"""
    if request.method == 'GET':
        try:
            sessions = Session.query.filter_by(user_id=current_user.id).all()
            session_list = []
            
            for session in sessions:
                # Calculate duration from start and end time
                start = session.start_time
                end = session.end_time
                duration_minutes = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute) - (session.break_minutes)
                hours = duration_minutes // 60
                minutes = duration_minutes % 60
                duration = f"{hours}h {minutes}m"
                
                # Format time as "start_time - end_time"
                time_range = f"{start.strftime('%H:%M')} - {end.strftime('%H:%M')}"
                
                # Format date as DD/MM/YYYY to match frontend display
                formatted_date = session.date.strftime('%d/%m/%Y')
                
                session_list.append({
                    "session_id": session.session_id,  # Standardized to session_id
                    "date": formatted_date,
                    "time": time_range, 
                    "duration": duration,
                    "break_minutes": session.break_minutes,
                    "course": session.course,
                    "productivity": session.productivity_rating,
                    "notes": session.notes
                })
                
            return jsonify(session_list), 200
        except Exception as e:
            print(f"Error fetching sessions: {e}")
            return jsonify({'error': 'Failed to fetch sessions'}), 500

    elif request.method == 'POST':
        session_data = request.get_json()
        
        # Validate the session data directly with standardized field names
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

            return jsonify({'message': 'Session added successfully', 'session_id': new_session.session_id}), 201
        
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400

@bp.route('/api/sessions/<int:session_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def session_detail(session_id):
    """Get, update or delete a specific session"""
    # First, get the session and check permissions
    session = Session.query.get_or_404(session_id)
    if session.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    if request.method == 'GET':
        # Return the session details
        start = session.start_time
        end = session.end_time
        duration_minutes = (end.hour * 60 + end.minute) - (start.hour * 60 + start.minute) - (session.break_minutes)
        hours = duration_minutes // 60
        minutes = duration_minutes % 60
        
        session_data = {
            "session_id": session.session_id,
            "date": session.date.strftime('%Y-%m-%d'),
            "start_time": start.strftime('%H:%M'),
            "end_time": end.strftime('%H:%M'),
            "duration": f"{hours}h {minutes}m",
            "break_minutes": session.break_minutes,
            "course": session.course,
            "productivity": session.productivity_rating,
            "notes": session.notes
        }
        
        return jsonify(session_data), 200
        
    elif request.method == 'PUT':
        # Update the session
        session_data = request.get_json()
        
        # Validate the session data
        validated_data = validate_session_data(session_data)
        if 'error' in validated_data:
            return jsonify(validated_data), 400
            
        try:
            # Update session fields
            session.date = validated_data['date']
            session.start_time = validated_data['start_time']
            session.end_time = validated_data['end_time']
            session.break_minutes = int(session_data['break_minutes']) if session_data.get('break_minutes') else None
            session.course = session_data['course']
            session.productivity_rating = int(session_data['productivity'])
            session.notes = session_data.get('notes')
            
            db.session.commit()
            return jsonify({'message': 'Session updated successfully'}), 200
            
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(session)
            db.session.commit()
            return jsonify({'message': 'Session deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

@bp.route('/api/sessions/bulk-delete', methods=['POST'])
@login_required
def bulk_delete_sessions():
    """Delete multiple sessions at once"""
    try:
        # Ensure the request is JSON
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        
        # Only accept session_ids as the parameter name
        if 'session_ids' not in data:
            return jsonify({'error': 'session_ids field is required'}), 400
            
        session_ids = data['session_ids']
        
        # Validate that session_ids is a list of integers
        if not isinstance(session_ids, list):
            return jsonify({'error': 'session_ids must be a list'}), 400
            
        # Convert any string IDs to integers
        try:
            session_ids = [int(id) for id in session_ids]
        except ValueError:
            return jsonify({'error': 'All session IDs must be integers'}), 400
            
        # Check if these sessions exist for this user
        existing_sessions = Session.query.filter(
            Session.session_id.in_(session_ids),
            Session.user_id == current_user.id
        ).all()
        
        existing_ids = [s.session_id for s in existing_sessions]
        
        if not existing_ids:
            return jsonify({'message': 'No matching sessions found to delete'}), 200
            
        # Delete the sessions
        deletion_count = 0
        for session in existing_sessions:
            db.session.delete(session)
            deletion_count += 1
        
        # Commit all successful deletions
        db.session.commit()
        return jsonify({'message': f'{deletion_count} sessions deleted successfully'}), 200
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

def validate_session_data(session_data):
    try:
        # Check for required fields using standardised names
        date_field = session_data.get('date')
        start_field = session_data.get('start_time')
        end_field = session_data.get('end_time')
        course = session_data.get('course')
        notes = session_data.get('notes')

        # Check if required fields exist
        if not date_field or not start_field or not end_field or not course or not notes:
            return {'error': 'Required fields (date, start_time, end_time, course, notes) are missing'}

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
            'end_time': end_time,
            'notes': notes,
            'course': course,
        }
    except ValueError as e:
        return {'error': f'Invalid date or time format: {str(e)}'}
    except Exception as e:
        return {'error': f'Validation error: {str(e)}'}

@bp.route('/upload/', methods=['GET', 'POST'])
@login_required
def upload_data():
    if request.method == 'POST':
        # Check if a CSV file was uploaded
        if 'data_file' in request.files and request.files['data_file'].filename != '':
            file = request.files['data_file']
            if not file.filename.endswith('.csv'):
                return render_template('user/upload.html', error="Please upload a CSV file.")

            try:
                # Read and decode the CSV file
                reader = csv.DictReader(TextIOWrapper(file, encoding='utf-8'))
                added, errors = 0, []
                for idx, row in enumerate(reader, start=1):
                    # Map CSV columns to standardized field names
                    session_data = {
                        'date': row.get('date'),
                        'start_time': row.get('start'),
                        'end_time': row.get('end'),
                        'break_minutes': row.get('break', 0),
                        'course': row.get('subject'),
                        'productivity': row.get('rating'),
                        'notes': row.get('activity')
                    }
                    validated = validate_session_data(session_data)
                    if 'error' in validated:
                        errors.append(f"Row {idx}: {validated['error']}")
                        continue

                    try:
                        new_session = Session(
                            user_id=current_user.id,
                            date=validated['date'],
                            start_time=validated['start_time'],
                            end_time=validated['end_time'],
                            break_minutes=int(session_data['break_minutes']) if session_data.get('break_minutes') else None,
                            course=session_data['course'],
                            productivity_rating=int(session_data['productivity']),
                            notes=session_data.get('notes')
                        )
                        db.session.add(new_session)
                        added += 1
                    except Exception as e:
                        errors.append(f"Row {idx}: {str(e)}")
                db.session.commit()
                msg = f"{added} sessions uploaded successfully."
                if errors:
                    msg += " Some rows failed: " + "; ".join(errors)
                flash(msg if added else "Error uploading sessions.", 'success' if added else 'error')
                return redirect(url_for('logged_in.upload_data'))

            except Exception as e:
                db.session.rollback()
                return render_template('user/upload.html', error=f"Error processing CSV: {str(e)}")
        else:
            # Manual form entry (existing logic)
            form_data = request.form.to_dict()
            session_data = {
                'date': form_data.get('date'),
                'start_time': form_data.get('start_time'),
                'end_time': form_data.get('end_time'),
                'break_minutes': form_data.get('break_minutes'),
                'course': form_data.get('course'),
                'productivity': form_data.get('productivity'),
                'notes': form_data.get('notes')
            }
            validated_data = validate_session_data(session_data)
            if 'error' in validated_data:
                return render_template('user/upload.html', error=validated_data['error'])

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
                return render_template('user/upload.html', success="Session successfully added!")
            except Exception as e:
                db.session.rollback()
                return render_template('user/upload.html', error=f"Error: {str(e)}")

    # GET Request - Retrieve all sessions for the current user
    sessions = Session.query.filter_by(user_id=current_user.id).all()

    # Pass the sessions to the template for display
    return render_template('user/upload.html', sessions=sessions)

@bp.route('/dashboard/')
@login_required
def dashboard():
    return render_template('user/dashboard.html')

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
    return render_template('user/leaderboard.html')