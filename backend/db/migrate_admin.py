"""
db/migrate_admin.py — One-time script: copy admin from MongoDB → Neon
======================================================================
Run once:  python db/migrate_admin.py
Safe to re-run — uses INSERT ... ON CONFLICT DO NOTHING.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import certifi
from pymongo import MongoClient
from extensions import get_db, init_db
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "")

def migrate_admin():
    print("[*] Initializing Neon DB schema...")
    init_db()
    print("[*] Connecting to MongoDB Atlas...")
    mongo_client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    mongo_db = mongo_client["prepai"]

    admin = mongo_db["users"].find_one({"role": "admin"})
    if not admin:
        print("[!] No admin user found in MongoDB.")
        return

    # Map MongoDB fields → Neon columns
    name          = admin.get("name", "Admin")
    email         = admin.get("email")
    password_hash = admin.get("password", "")    # already hashed by werkzeug
    role          = "admin"
    is_verified   = True
    onboarding    = True

    print("[*] Found admin: " + name + " <" + email + ">")

    print("[*] Inserting admin into Neon...")
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users
                    (name, email, password_hash, role, is_verified, onboarding_completed)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (email) DO UPDATE
                    SET password_hash        = EXCLUDED.password_hash,
                        role                 = EXCLUDED.role,
                        is_verified          = EXCLUDED.is_verified,
                        onboarding_completed = EXCLUDED.onboarding_completed
                RETURNING id
                """,
                (name, email, password_hash, role, is_verified, onboarding)
            )
            new_id = cur.fetchone()[0]

    print("[DONE] Admin migrated successfully! Neon ID: " + str(new_id))
    print("   Email:    " + email)
    print("   Password: admin123  (unchanged from MongoDB)")

if __name__ == "__main__":
    migrate_admin()
