import requests
import time
import base64

class JudgeService:
    """
    Submits code to Judge0 for secure execution.
    """
    JUDGE0_URL = "https://judge0-ce.p.rapidapi.com"
    API_KEY = "REPLACE_WITH_YOUR_KEY" # Should be in .env

    LANGUAGE_IDS = {
        "python": 71,
        "javascript": 63,
        "java": 62,
        "cpp": 54
    }

    @classmethod
    def execute(cls, code: str, language: str = "python", stdin: str = ""):
        payload = {
            "source_code": base64.b64encode(code.encode()).decode(),
            "language_id": cls.LANGUAGE_IDS.get(language, 71),
            "stdin": base64.b64encode(stdin.encode()).decode()
        }
        
        headers = {
            "content-type": "application/json",
            "X-RapidAPI-Key": cls.API_KEY,
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
        }

        # Submit
        response = requests.post(f"{cls.JUDGE0_URL}/submissions?base64_encoded=true&wait=true", 
                                 json=payload, headers=headers)
        
        if response.status_code == 201:
            result = response.json()
            return {
                "stdout": base64.b64decode(result.get("stdout", "")).decode() if result.get("stdout") else "",
                "stderr": base64.b64decode(result.get("stderr", "")).decode() if result.get("stderr") else "",
                "compile_output": base64.b64decode(result.get("compile_output", "")).decode() if result.get("compile_output") else "",
                "time": result.get("time"),
                "memory": result.get("memory"),
                "status": result.get("status", {}).get("description")
            }
        
        return {"error": "Submission failed"}
