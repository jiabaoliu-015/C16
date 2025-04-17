#!/usr/bin/env python3

from flask import Flask, render_template, redirect, url_for, request, flash

app = Flask(__name__)
app.secret_key = 'your_secret_key'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        # Check which form was submitted
        if 'form_type' in request.form and request.form['form_type'] == 'manual_entry':
            # Handle manual entry form
            date = request.form.get('date')
            subject = request.form.get('subject')
            start_time = request.form.get('start_time')
            duration = request.form.get('duration')
            productivity = request.form.get('productivity')
            
            # Process the manual entry data here
            flash('Study session added successfully!', 'success')
            return redirect(url_for('upload'))
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
                # Process the uploaded CSV file here
                default_subject = request.form.get('default_subject')
                overwrite = 'overwrite' in request.form
                
                flash('File uploaded and processed successfully!', 'success')
                return redirect(url_for('upload'))
            else:
                flash('Only CSV files are allowed', 'error')
                return redirect(request.url)
    
    # GET request
    return render_template('upload.html')

@app.route('/visualise')
def visualise():
    return render_template('visualise.html')

@app.route('/share')
def share():
    return render_template('share.html')

@app.route('/login')
def login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
