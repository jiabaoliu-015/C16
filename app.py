from flask import Flask, render_template, redirect, url_for

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

if __name__ == '__main__':
    app.run(debug=True)
