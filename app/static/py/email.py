from flask_mail import Message
from flask import current_app
from app import mail

def send_email(to, subject, body):
    msg = Message(subject, recipients=[to], body=body,
                  sender=current_app.config.get('MAIL_DEFAULT_SENDER'))
    mail.send(msg)
