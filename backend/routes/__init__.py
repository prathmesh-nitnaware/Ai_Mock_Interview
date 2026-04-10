from .auth import auth_bp
from .dashboard import dashboard_bp
from .interview import interview_bp
from .resume_score import resume_bp 
from .coding import coding_bp # Added for Coding Dojo

def register_routes(app):
    # Auth -> /api/auth/...
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # Dashboard -> /api/dashboard/...
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

    # Interview -> /api/interview/...
    app.register_blueprint(interview_bp, url_prefix="/api/interview")

    # Resume Scoring -> /api/resume/...
    app.register_blueprint(resume_bp, url_prefix="/api/resume")

    # Coding Dojo -> /api/coding/...
    app.register_blueprint(coding_bp, url_prefix="/api/coding")