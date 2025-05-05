# app/routes/visualise_routes.py: Routes for visualising data

from flask import Blueprint, render_template, jsonify

visualise_bp = Blueprint('visualise', __name__, url_prefix='/dashboard')

@visualise_bp.route('/')
def visualise():
    return render_template('dashboard_2.html')


@visualise_bp.route('/api/study-time-data')
def study_time_data():
    data = [
        {"date": "2025-04-01", "studyTime": 2},
        {"date": "2025-04-02", "studyTime": 3},
        {"date": "2025-04-03", "studyTime": 1.5},
    ]
    return jsonify(data)