# instance/config.py: # Configuration file
import os
from dotenv import load_dotenv
load_dotenv()

# AT ALL COST REMOVE THESE DEFAULT VALUES FOR SUBMISSION
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False