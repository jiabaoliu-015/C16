# app/routes/visualise_routes.py: Routes for visualising data

from flask import Blueprint, render_template, jsonify
from flask_login import login_required


visualise_bp = Blueprint('visualise', __name__, url_prefix='/visualise')

@visualise_bp.route('/')
@login_required
def visualise():
    return render_template('visualise.html')


@visualise_bp.route('/api/study-time-data')
def study_time_data():
    data = [
        {"date": "2025-04-01", "studyTime": 2},
        {"date": "2025-04-02", "studyTime": 3},
        {"date": "2025-04-03", "studyTime": 1.5},
    ]
    return jsonify(data)