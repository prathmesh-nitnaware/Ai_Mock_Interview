import os
import certifi
from pymongo import MongoClient
from config import Config

mongo_uri = Config.MONGO_URI

# Use certifi to provide Mozilla's CA Bundle
client = MongoClient(mongo_uri, tlsCAFile=certifi.where())

db = client[Config.DB_NAME]

users_collection = db["users"]
interviews_collection = db["interviews"]
resumes_collection = db["resumes"]
coding_collection = db["coding_submissions"]

print(f"MongoDB connected successfully to {Config.DB_NAME}")