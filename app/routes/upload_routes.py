# app/routes/upload_routes.py: Routes for uploading data

from flask import Blueprint, render_template, request, redirect, url_for, flash

bp = Blueprint('upload', __name__, url_prefix='/upload')

@bp.route('/', methods=['GET', 'POST'])
def upload_data():
    if request.method == 'POST':
        if 'form_type' in request.form and request.form['form_type'] == 'manual_entry':
            # Handle manual entry form
            date = request.form.get('date')
            subject = request.form.get('subject')
            start_time = request.form.get('start_time')
            duration = request.form.get('duration')
            productivity = request.form.get('productivity')
            flash('Study session added successfully!', 'success')
            return redirect(url_for('upload.upload'))
        else:
            # Handle file upload form
            if 'data_file' not in request.files:
                flash('No file part', 'error')
                return redirect(request.url)
            file = request.files['data_file']
            if file.filename == '':
                flash('No selected file', 'error')
                return redirect(request.url)
            if file and file.filename.endswith('.csv'):
                default_subject = request.form.get('default_subject')
                overwrite = 'overwrite' in request.form
                flash('File uploaded and processed successfully!', 'success')
                return redirect(url_for('upload.upload'))
            else:
                flash('Only CSV files are allowed', 'error')
                return redirect(request.url)
    return render_template('upload.html')