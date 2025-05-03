# db_init.py
from app import create_app, db
from flask_migrate import Migrate
import flask_migrate

app = create_app()
migrate_instance = Migrate(app, db)

with app.app_context():
   
    flask_migrate.migrate(message="Initial migration")
    
 
    flask_migrate.upgrade()
    
    print("databse migrate success")
