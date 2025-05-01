# instance/config.py: # Configuration file
import os

from dotenv import load_dotenv
load_dotenv()

# AT ALL COST REMOVE THESE DEFAULT VALUES FOR SUBMISSION
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')  # Use a default for development
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///studytrackr.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False