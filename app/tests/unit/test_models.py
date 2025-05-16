import unittest
from app import create_app, db
from app.models import User, Session, Reflection, SharedData, StreakFreeze
from instance.config import TestingConfig
from datetime import datetime, date, time

class UserModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_user_creation(self):
        user = User(email="foo@bar.com", password="pw")
        db.session.add(user)
        db.session.commit()
        self.assertIsNotNone(User.query.filter_by(email="foo@bar.com").first())

    def test_user_password_hashing(self):
        user = User(email="bar@foo.com")
        user.set_password("securepw")
        db.session.add(user)
        db.session.commit()
        self.assertTrue(user.check_password("securepw"))
        self.assertFalse(user.check_password("wrongpw"))

    def test_user_unique_email(self):
        user1 = User(email="unique@bar.com", password="pw1")
        user2 = User(email="unique@bar.com", password="pw2")
        db.session.add(user1)
        db.session.commit()
        db.session.add(user2)
        with self.assertRaises(Exception):
            db.session.commit()

class SessionModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.user = User(email="session@user.com", password="pw")
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_session_creation_and_relationship(self):
        session = Session(
            user_id=self.user.id,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 30),
            break_minutes=10,
            course="Math",
            productivity_rating=5,
            notes="Good session"
        )
        db.session.add(session)
        db.session.commit()
        self.assertEqual(self.user.sessions[0].course, "Math")

    def test_session_duration_property(self):
        session = Session(
            user_id=self.user.id,
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 30),
            break_minutes=0,
            course="Science",
            productivity_rating=4,
            notes=""
        )
        db.session.add(session)
        db.session.commit()
        self.assertIn("1h 30m", session.duration)

class ReflectionModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.user = User(email="reflect@user.com", password="pw")
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_reflection_creation(self):
        reflection = Reflection(
            user_id=self.user.id,
            content="Today was productive.",
            mood="😊",
            tags="productive,focus"
        )
        db.session.add(reflection)
        db.session.commit()
        self.assertEqual(self.user.reflections.first().content, "Today was productive.")

class SharedDataModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.user1 = User(email="sharer@user.com", password="pw")
        self.user2 = User(email="receiver@user.com", password="pw")
        db.session.add(self.user1)
        db.session.add(self.user2)
        db.session.commit()
        self.session = Session(
            user_id=self.user1.id,
            date=date.today(),
            start_time=time(8, 0),
            end_time=time(9, 0),
            break_minutes=0,
            course="English",
            productivity_rating=3,
            notes=""
        )
        db.session.add(self.session)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_shared_data_creation_and_relationships(self):
        shared = SharedData(
            session_id=self.session.session_id,
            shared_with_user_id=self.user2.id,
            shared_by_user_id=self.user1.id,
            shared_content=42,
            shared_content3="Test share"
        )
        db.session.add(shared)
        db.session.commit()
        self.assertEqual(self.user2.received_shared_data[0].shared_content, 42)
        self.assertEqual(self.user1.given_shared_data[0].shared_content3, "Test share")

class StreakFreezeModelTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestingConfig)
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()
        self.user = User(email="freeze@user.com", password="pw")
        db.session.add(self.user)
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.ctx.pop()

    def test_streak_freeze_creation(self):
        freeze = StreakFreeze(
            user_id=self.user.id,
            month=5,
            year=2025,
            used_on=date.today()
        )
        db.session.add(freeze)
        db.session.commit()
        self.assertEqual(StreakFreeze.query.first().user_id, self.user.id)