from flask import Blueprint, render_template, request, jsonify
from flask_login import current_user, login_required
from app import db
from app.models import Session
from datetime import datetime

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

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
@upload_bp.route('/', methods=['GET', 'POST'])
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
@upload_bp.route('/api/sessions', methods=['GET', 'POST'])
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