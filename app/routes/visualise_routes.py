# app/routes/visualise_routes.py: Routes for visualising data

from flask import Blueprint, render_template

visualise_bp = Blueprint('visualise', __name__, url_prefix='/visualise')

@visualise_bp.route('/')
def visualise():
    return render_template('visualise.html')