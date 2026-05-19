import sys
import os

# Add parent directory to path so we can import from config, models, etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import users_collection
from werkzeug.security import generate_password_hash

def setup_admin():
    admin_email = "admin@gmail.com"
    admin_password = "admin123"
    
    # Check if admin already exists
    admin_user = users_collection.find_one({"email": admin_email})
    
    if admin_user:
        # Update password and role to be sure
        users_collection.update_one(
            {"email": admin_email},
            {"$set": {
                "password": generate_password_hash(admin_password),
                "role": "admin"
            }}
        )
        print("Admin user updated.")
    else:
        # Create new admin user
        new_admin = {
            "name": "Admin",
            "email": admin_email,
            "password": generate_password_hash(admin_password),
            "role": "admin",
            "onboarding_completed": True,
            "is_verified": True
        }
        users_collection.insert_one(new_admin)
        print("Admin user created.")

if __name__ == "__main__":
    setup_admin()
