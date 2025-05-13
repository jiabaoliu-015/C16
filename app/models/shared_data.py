from app import db
from datetime import datetime
from sqlalchemy import Enum

class StatusEnum(Enum):
    PENDING = 'pending'
    ACCEPTED = 'accepted'

class SharedData(db.Model):
    __tablename__ = 'shared_data'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(
        db.Integer,
        db.ForeignKey('session.session_id', name='fk_shared_data_session_id'),  # Corrected table name
        nullable=False
    )
    shared_with_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_by_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_content = db.Column(db.Integer,default=20)  # Update type if necessary
    shared_content3 = db.Column(db.String(100), default='YOU RECEIVE A SHARE') 
    status = db.Column(Enum(StatusEnum.PENDING, StatusEnum.ACCEPTED), default=StatusEnum.PENDING)  # Pass enum values
    shared_on = db.Column(db.DateTime, default=db.func.now())
    
    shared_with_user = db.relationship('User', foreign_keys=[shared_with_user_id], backref='received_shared_data')
    shared_by_user = db.relationship('User', foreign_keys=[shared_by_user_id], backref='given_shared_data')

    def __repr__(self):
        return f'<SharedData Session {self.session_id} from User {self.shared_by_user_id} to User {self.shared_with_user_id}>'

    __table_args__ = (
        db.Index('idx_shared_data_session_id', 'session_id'),
        db.Index('idx_shared_data_shared_with_user_id', 'shared_with_user_id'),
        db.Index('idx_shared_data_shared_by_user_id', 'shared_by_user_id'),
    )
