#!/usr/bin/env python3

from flask import Flask, render_template, redirect, url_for, request

# PLACEHOLDER CODE

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
def upload():
    return render_template('upload.html')

@app.route('/visualise')
def visualise():
    return render_template('visualise.html')

@app.route('/share')
def share():
    return render_template('share.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return redirect(url_for('visualise'))
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)
