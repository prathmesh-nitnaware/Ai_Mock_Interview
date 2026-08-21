"""
load_balancer.py — Lightweight Python Load Balancer & Reverse Proxy for PrepAI
================================================================================
A self-contained development & testing load balancer.
Distributes incoming requests across multiple backend instances.

Features:
  1. Round-Robin & Least-Connections load balancing strategies
  2. Active periodic health checks & auto-failover
  3. Live status and metrics dashboard at /lb-status
  4. Fully cross-platform (works on Windows/Linux/macOS with zero dependencies)

Usage:
  python load_balancer.py --port 5000 --backends http://127.0.0.1:5001,http://127.0.0.1:5002
"""

import sys
import time
import json
import socket
import argparse
import threading
import urllib.request
import urllib.error
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse


class BackendNode:
    def __init__(self, url: str):
        self.url = url.rstrip('/')
        self.parsed = urlparse(self.url)
        self.host = self.parsed.hostname
        self.port = self.parsed.port or (443 if self.parsed.scheme == 'https' else 80)
        self.is_healthy = True
        self.active_requests = 0
        self.total_requests = 0
        self.total_errors = 0
        self.last_latency_ms = 0.0

    def check_health(self) -> bool:
        health_url = f"{self.url}/api/health"
        start = time.time()
        try:
            req = urllib.request.Request(health_url, headers={'User-Agent': 'PrepAI-LB-HealthCheck'})
            with urllib.request.urlopen(req, timeout=3) as resp:
                self.is_healthy = (resp.status == 200)
                self.last_latency_ms = round((time.time() - start) * 1000, 2)
        except Exception:
            self.is_healthy = False
            self.last_latency_ms = -1
        return self.is_healthy


class LoadBalancerState:
    def __init__(self, backend_urls: list[str], strategy: str = "least_conn"):
        self.nodes = [BackendNode(u) for u in backend_urls]
        self.strategy = strategy
        self._rr_index = 0
        self._lock = threading.Lock()

    def get_healthy_node(self) -> BackendNode | None:
        with self._lock:
            healthy_nodes = [n for n in self.nodes if n.is_healthy]
            if not healthy_nodes:
                # If all marked unhealthy, fallback to all to allow recovery
                healthy_nodes = self.nodes

            if not healthy_nodes:
                return None

            if self.strategy == "least_conn":
                # Route to node with fewest active requests
                node = min(healthy_nodes, key=lambda n: n.active_requests)
            else:
                # Round-Robin
                node = healthy_nodes[self._rr_index % len(healthy_nodes)]
                self._rr_index += 1

            node.active_requests += 1
            node.total_requests += 1
            return node

    def release_node(self, node: BackendNode, success: bool = True):
        with self._lock:
            node.active_requests = max(0, node.active_requests - 1)
            if not success:
                node.total_errors += 1


# Global state instance
lb_state: LoadBalancerState | None = None


class LoadBalancerHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def do_HEAD(self):
        self._forward_request("HEAD")

    def do_GET(self):
        if self.path == "/lb-status":
            self._serve_lb_status()
            return
        self._forward_request("GET")

    def do_POST(self):
        self._forward_request("POST")

    def do_PUT(self):
        self._forward_request("PUT")

    def do_DELETE(self):
        self._forward_request("DELETE")

    def do_OPTIONS(self):
        self._forward_request("OPTIONS")

    def _serve_lb_status(self):
        stats = {
            "load_balancer": "PrepAI Python Cluster Load Balancer",
            "strategy": lb_state.strategy,
            "backends": [
                {
                    "url": n.url,
                    "healthy": n.is_healthy,
                    "active_connections": n.active_requests,
                    "total_served": n.total_requests,
                    "errors": n.total_errors,
                    "latency_ms": n.last_latency_ms
                }
                for n in lb_state.nodes
            ]
        }
        body = json.dumps(stats, indent=2).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def _forward_request(self, method: str):
        node = lb_state.get_healthy_node()
        if not node:
            self.send_error(503, "Service Unavailable: No healthy backend nodes in cluster")
            return

        target_url = f"{node.url}{self.path}"
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Copy incoming headers
        headers = {}
        for key, val in self.headers.items():
            if key.lower() not in ['host', 'connection']:
                headers[key] = val

        headers['X-Forwarded-For'] = self.client_address[0]
        headers['X-Forwarded-Host'] = self.headers.get('Host', '')
        headers['X-Load-Balanced-By'] = 'PrepAI-LB'

        success = True
        try:
            req = urllib.request.Request(
                target_url,
                data=body,
                headers=headers,
                method=method
            )
            with urllib.request.urlopen(req, timeout=60) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                for header, value in resp.getheaders():
                    if header.lower() not in ['transfer-encoding']:
                        self.send_header(header, value)
                self.send_header('X-Backend-Node', node.url)
                self.end_headers()
                self.wfile.write(resp_body)
        except urllib.error.HTTPError as e:
            resp_body = e.read()
            self.send_response(e.code)
            for header, value in e.headers.items():
                if header.lower() not in ['transfer-encoding']:
                    self.send_header(header, value)
            self.send_header('X-Backend-Node', node.url)
            self.end_headers()
            self.wfile.write(resp_body)
        except Exception as e:
            success = False
            self.send_error(502, f"Bad Gateway: Error communicating with backend node {node.url}: {str(e)}")
        finally:
            lb_state.release_node(node, success=success)

    def log_message(self, format, *args):
        # Override to suppress default stdout noise, or customize
        pass


def health_checker_daemon(interval: int = 5):
    while True:
        for node in lb_state.nodes:
            node.check_health()
        time.sleep(interval)


def main():
    global lb_state
    parser = argparse.ArgumentParser(description="PrepAI Load Balancer")
    parser.add_argument("--port", type=int, default=5000, help="Port to listen on (default: 5000)")
    parser.add_argument("--backends", type=str, default="http://127.0.0.1:5001,http://127.0.0.1:5002",
                        help="Comma-separated list of backend URLs")
    parser.add_argument("--strategy", type=str, choices=["least_conn", "round_robin"], default="least_conn",
                        help="Load balancing algorithm (default: least_conn)")
    args = parser.parse_args()

    backend_list = [b.strip() for b in args.backends.split(",") if b.strip()]
    if not backend_list:
        print("[!] No backend servers provided.")
        sys.exit(1)

    lb_state = LoadBalancerState(backend_list, strategy=args.strategy)

    # Start background health checker thread
    t = threading.Thread(target=health_checker_daemon, daemon=True)
    t.start()

    server = HTTPServer(('0.0.0.0', args.port), LoadBalancerHandler)
    print(f"============================================================")
    print(f"[*] PrepAI Load Balancer running on http://0.0.0.0:{args.port}")
    print(f"[*] Algorithm: {args.strategy}")
    print(f"[*] Upstream Backends: {backend_list}")
    print(f"[*] Status endpoint:   http://localhost:{args.port}/lb-status")
    print(f"============================================================")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[!] Shutting down load balancer...")
        server.server_close()


if __name__ == "__main__":
    main()
