'''
This module contains the models for the application.
The models are used to interact with the database and define the structure of the data.
The models are defined using SQLAlchemy ORM.

Database Relationships:
    User ↔ Session: One-to-Many (A user can have multiple sessions).
    Session ↔ Course: Many-to-One (Optional, if courses are normalized).
    Session ↔ SharedData: One-to-Many (Optional, for sharing functionality).
    User ↔ Reflection: One-to-Many (A user can have multiple reflections).
    User ↔ StreakFreeze: One-to-Many (A user can have multiple streak freezes).
'''

from .user import User
from .session import Session
from .streak_freeze import StreakFreeze
from .shared_data import SharedData
from .reflection import Reflection
