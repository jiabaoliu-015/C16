from app import db
from datetime import datetime

class SharedData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, nullable=False)  # session_id of the session being shared
    shared_with_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_content = db.Column(db.Integer, default=20)  #
    status = db.Column(db.String(20), default='pending')  # pending/accepted
    shared_on = db.Column(db.DateTime, default=db.func.now())

    
    shared_with_user = db.relationship('User', foreign_keys=[shared_with_user_id])
    shared_by_user = db.relationship('User', foreign_keys=[shared_by_user_id])
   

    def __repr__(self):
        return f'<SharedData Session {self.session_id} from User {self.shared_by_user_id} to User {self.shared_with_user_id}>'
