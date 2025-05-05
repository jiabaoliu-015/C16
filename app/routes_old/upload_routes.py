# app/routes/upload_routes.py: Routes for uploading data

from flask import Blueprint, render_template, jsonify
from app.test.sessions_data import sessions
from flask_login import login_required

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

@upload_bp.route('/', methods=['GET', 'POST'])
@login_required
def upload_data():
    # Dynamically load sessions data
    return render_template('upload.html', sessions=sessions)

@upload_bp.route('/api/sessions')
@login_required
def api_sessions():
    return jsonify(sessions)