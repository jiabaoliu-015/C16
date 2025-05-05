from flask import Blueprint, render_template
from flask_login import login_required

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/')
@login_required
def profile():
    return render_template('profile.html')