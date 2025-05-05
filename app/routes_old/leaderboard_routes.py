from flask import Blueprint, render_template
from flask_login import login_required

leaderboard_bp = Blueprint('leaderboard', __name__, url_prefix='/leaderboard')

@leaderboard_bp.route('/')
@login_required
def leaderboard():
    return render_template('leaderboard.html')
