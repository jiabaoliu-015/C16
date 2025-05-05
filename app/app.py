from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

# Initialize SQLAlchemy and Migrate
db = SQLAlchemy()
migrate = Migrate()

app = Flask(__name__)
CORS(app)

# Database setup (make sure to update the URI for your environment)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///yourdatabase.db'  # or your actual database URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # optional, disables a warning

# Initialize the app with db and migrate
db.init_app(app)
migrate.init_app(app, db)

# Register blueprints
from app.routes.visualise_routes import visualise_bp
app.register_blueprint(visualise_bp)

if __name__ == '__main__':
    app.run(debug=True)