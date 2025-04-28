# app/routes/upload_routes.py: Routes for uploading data

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
from importlib import import_module
from app.test.sessions_data import sessions

upload_bp = Blueprint('upload', __name__, url_prefix='/upload')

@upload_bp.route('/', methods=['GET', 'POST'])
def upload_data():
    # Dynamically load sessions data
    return render_template('upload.html', sessions=sessions)

@upload_bp.route('/api/sessions')
def api_sessions():
    return jsonify(sessions)