# ============================================================
# GUNICORN CONFIGURATION — PrepAI Multi-Worker Load Balancing
# ============================================================
import multiprocessing
import os

# Server socket
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"
backlog = 2048

# Worker processes & threading model
# gthread worker class enables concurrent WebSocket handling via flask-sock
workers = int(os.getenv("GUNICORN_WORKERS", "2"))
worker_class = "gthread"
threads = int(os.getenv("GUNICORN_THREADS", "4"))
worker_connections = 1000
timeout = 120
keepalive = 5

# Worker Recycling (prevents memory leaks over long sessions)
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" (%(L)ss)'

# Process naming
proc_name = "prepai_api_cluster"
