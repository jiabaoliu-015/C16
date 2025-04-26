from flask import Blueprint, render_template

leaderboard_bp = Blueprint('leaderboard', __name__, url_prefix='/leaderboard')

@leaderboard_bp.route('/')
def leaderboard():
    return render_template('leaderboard.html')
