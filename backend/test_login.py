import sys
import os

# Add backend to path so imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import create_app

app = create_app()
client = app.test_client()

response = client.post('/api/auth/login', json={"email": "test@example.com", "password": "password"})
print("Status Code:", response.status_code)
print("Response Data:", response.get_data(as_text=True))
