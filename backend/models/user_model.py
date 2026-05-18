from extensions import users_collection
from werkzeug.security import generate_password_hash

def create_user(name, email, password):

    user = {
        "name": name,
        "email": email,
        "password": generate_password_hash(password),
        "role": "candidate",
        "onboarding_completed": False,
        "is_verified": False
    }

    users_collection.insert_one(user)

    return user


def get_user_by_email(email):

    return users_collection.find_one({
        "email": email
    })

def verify_user(email):
    users_collection.update_one(
        {"email": email},
        {"$set": {"is_verified": True}}
    )

def update_password(email, new_password):
    users_collection.update_one(
        {"email": email},
        {"$set": {"password": generate_password_hash(new_password)}}
    )