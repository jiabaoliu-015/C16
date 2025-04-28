from flask import Flask, render_template, jsonify

app = Flask(__name__)

from sessions_data import sessions

@app.route('/test_sessions')
def test_sessions():
    return render_template('test_sessions.html')

@app.route('/api/sessions')
def api_sessions():
    return jsonify(sessions)

if __name__ == '__main__':
    app.run(debug=True)
