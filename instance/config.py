# instance/config.py: # Configuration file
import os
from dotenv import load_dotenv
load_dotenv()

# AT ALL COST REMOVE THESE DEFAULT VALUES FOR SUBMISSION
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')  # Use a default for development
    SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False