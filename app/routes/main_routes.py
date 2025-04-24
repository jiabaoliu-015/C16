# app/routes/main_routes.py: Routes for index and login

from flask import Blueprint, render_template, redirect, url_for, request, flash

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return redirect(url_for('visualise.visualise'))
    return render_template('login.html')