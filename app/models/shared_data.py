from app import db

class SharedData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('session.session_id'), nullable=False)
    shared_with_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    shared_on = db.Column(db.DateTime, default=db.func.now())

    def __repr__(self):
        return f'<SharedData Session {self.session_id} with User {self.shared_with_user_id}>'
