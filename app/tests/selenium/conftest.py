import pytest
from app import create_app
from app.extensions import db
from instance.config import TestingConfig
import threading
import time
import socket

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

@pytest.fixture(scope="session")
def live_server():
    port = 5000
    if is_port_in_use(port):
        raise RuntimeError(f"Port {port} is already in use. Stop all Flask servers before running tests.")

    app = create_app(TestingConfig)
    server = threading.Thread(target=app.run, kwargs={"port": port, "use_reloader": False})
    server.daemon = True
    with app.app_context():
        db.create_all()
    server.start()
    time.sleep(1)  # Give the server time to start
    yield
    # Optionally: shutdown logic