# app/routes/info_routes.py: Route for the info page

from flask import Blueprint, render_template

info_bp = Blueprint('info', __name__, url_prefix='/info')

@info_bp.route('/')
def info():
    return render_template('info.html')