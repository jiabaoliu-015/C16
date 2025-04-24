from flask import Blueprint, render_template

bp = Blueprint('visualise', __name__, url_prefix='/visualise')

@bp.route('/')
def visualise():
    return render_template('visualise.html')