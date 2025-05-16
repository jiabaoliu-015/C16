# run.py: Entry point to run the application

from app import create_app
import os
from instance.config import TestingConfig

def is_testing():
    return os.environ.get("APP_TESTING") == "1"

if is_testing():
    app = create_app(config_class=TestingConfig)
else:
    app = create_app()

if __name__ == '__main__':
    app.run(debug=True)