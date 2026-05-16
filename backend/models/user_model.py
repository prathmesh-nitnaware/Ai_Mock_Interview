from extensions import users_collection
from werkzeug.security import generate_password_hash

def create_user(name, email, password):

    user = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "role": "candidate",
        "onboarding_completed": False
    }

    users_collection.insert_one(user)

    return user


def get_user_by_email(email):

    return users_collection.find_one({
        "email": email
    })