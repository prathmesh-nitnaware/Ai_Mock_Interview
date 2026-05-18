import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from extensions import users_collection

print("Updating all users to be verified...")
result = users_collection.update_many(
    {"is_verified": {"$ne": True}},
    {"$set": {"is_verified": True}}
)
print(f"Modified {result.modified_count} users to be verified.")
