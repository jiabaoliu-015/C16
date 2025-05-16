# instance/config.py: # Configuration file
import os
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# AT ALL COST REMOVE THESE DEFAULT VALUES FOR SUBMISSION
class Config:
    # Secret Key for Flask sessions
    SECRET_KEY = os.getenv('SECRET_KEY')
    TESTING = False

    # Database configuration
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Mail server configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER')

    GOOGLE_OAUTH_CLIENT_ID=os.getenv('GOOGLE_OAUTH_CLIENT_ID')
    GOOGLE_OAUTH_CLIENT_SECRET=os.getenv('GOOGLE_OAUTH_CLIENT_SECRET')

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    WTF_CSRF_ENABLED = False
    LOGIN_DISABLED = False
    MAIL_SUPPRESS_SEND = True
    # Use dummy secrets for tests
    SECRET_KEY = "test"
    MAIL_USERNAME = "test@example.com"
    MAIL_PASSWORD = "test"
    MAIL_DEFAULT_SENDER = "test@example.com"
    GOOGLE_OAUTH_CLIENT_ID = "test"
    GOOGLE_OAUTH_CLIENT_SECRET = "test"