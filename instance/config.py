# instance/config.py: # Configuration file

class Config:
    SECRET_KEY = 'your_secret_key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///studytrackr.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False