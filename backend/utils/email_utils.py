import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config
import threading

def send_email_async(app_config, to_email, subject, body):
    """Sends an email asynchronously."""
    try:
        # Check if email is configured
        if not app_config.MAIL_USERNAME or not app_config.MAIL_PASSWORD:
            print(f"Email configuration missing. Would have sent email to {to_email} with subject: {subject}")
            print(f"Body: {body}")
            return False

        msg = MIMEMultipart()
        msg['From'] = app_config.MAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'html'))

        server = smtplib.SMTP(app_config.MAIL_SERVER, app_config.MAIL_PORT)
        if app_config.MAIL_USE_TLS:
            server.starttls()
            
        server.login(app_config.MAIL_USERNAME, app_config.MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False

def send_verification_email(to_email, token):
    """
    Sends a verification email if EMAIL_VERIFICATION_ENABLED is True in Config.
    In the current general deployment, EMAIL_VERIFICATION_ENABLED defaults to False.
    """
    if not getattr(Config, "EMAIL_VERIFICATION_ENABLED", False):
        return False

    verify_url = f"{Config.FRONTEND_URL}/verify-email?token={token}"
    subject = "Verify Your Prep AI Account"
    body = f"""
    <html>
        <body>
            <h2>Welcome to Prep AI!</h2>
            <p>Please click the link below to verify your email address and activate your account:</p>
            <p><a href="{verify_url}">{verify_url}</a></p>
            <p>If you did not sign up for this account, please ignore this email.</p>
        </body>
    </html>
    """
    thread = threading.Thread(target=send_email_async, args=(Config, to_email, subject, body))
    thread.start()
    return True

def send_password_reset_email(to_email, token):
    """Sends an email with a password reset link."""
    reset_url = f"{Config.FRONTEND_URL}/reset-password?token={token}"
    subject = "Prep AI - Password Reset Request"
    body = f"""
    <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>You recently requested to reset your password for your Prep AI account.</p>
            <p>Click the link below to reset it:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next 15 minutes.</p>
        </body>
    </html>
    """
    
    # Run in a separate thread so it doesn't block the request
    thread = threading.Thread(target=send_email_async, args=(Config, to_email, subject, body))
    thread.start()
