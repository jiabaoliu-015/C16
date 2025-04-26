from werkzeug.security import generate_password_hash

# Mock user for testing
mock_user = {
    'id': 1,
    'email': 'test@example.com',
    'password': generate_password_hash('password123')  # Store hashed passwords
}

def get_user_by_email(email):
    if email == mock_user['email']:
        return mock_user
    return None
