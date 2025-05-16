import pytest
from app import create_app
from app.extensions import db
from instance.config import TestingConfig
import threading

@pytest.fixture(scope="session")
def live_server():
    app = create_app(TestingConfig)
    server = threading.Thread(target=app.run, kwargs={"port": 5000, "use_reloader": False})
    server.daemon = True
    with app.app_context():
        db.create_all()
    server.start()
    yield
    # Add teardown logic if needed