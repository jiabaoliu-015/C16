from flask import Flask
from flask_cors import CORS

from app.routes.visualise_routes import visualise_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(visualise_bp)

if __name__ == '__main__':
    app.run(debug=True)