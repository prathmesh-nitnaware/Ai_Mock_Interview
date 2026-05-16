import os
import sys

# Add the parent directory to sys.path to allow importing from the parent dir
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from extensions import db, client
from config import Config

def init_db():
    print(f"Connecting to MongoDB database: {Config.DB_NAME}...")

    # Create collections explicitly (MongoDB does this lazily by default, 
    # but creating them explicitly allows us to set validation rules if needed)
    collections = ["users", "interviews", "resumes", "coding_submissions"]
    
    existing_collections = db.list_collection_names()
    
    for collection in collections:
        if collection not in existing_collections:
            db.create_collection(collection)
            print(f"Created collection: {collection}")
        else:
            print(f"Collection already exists: {collection}")

    # Set up Indexes
    print("Setting up indexes...")

    # Users Collection Indexes
    # Ensure email is unique
    db.users.create_index("email", unique=True)
    print("- Added unique index on users.email")

    # Interviews Collection Indexes
    # Index for fast lookup by user_id
    db.interviews.create_index("user_id")
    print("- Added index on interviews.user_id")

    # Resumes Collection Indexes
    db.resumes.create_index("user_id")
    print("- Added index on resumes.user_id")

    # Coding Submissions Indexes
    db.coding_submissions.create_index("user_id")
    print("- Added index on coding_submissions.user_id")

    print("\nDatabase initialization completed successfully!")
    
    # Close connection when done script
    client.close()

if __name__ == "__main__":
    init_db()
