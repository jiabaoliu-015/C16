# app/routes/share_routes.py: Routes for sharing data

from flask import Blueprint, render_template
from flask_login import login_required

share_bp = Blueprint('share', __name__, url_prefix='/share')

@share_bp.route('/')
@login_required
def share():
    return render_template('share.html')
