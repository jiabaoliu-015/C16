from flask import Blueprint, render_template

bp = Blueprint('share', __name__, url_prefix='/share')

@bp.route('/')
def share():
    return render_template('share.html')