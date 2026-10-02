import http.server
import socketserver
import webbrowser
import os
import sys

# Change directory to the script's folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8080
for p in range(8080, 8100):
    try:
        s = socketserver.TCPServer(("", p), http.server.SimpleHTTPRequestHandler)
        PORT = p
        break
    except OSError:
        continue

url = f"http://localhost:{PORT}/index.html"
print("=" * 60)
print(f" NEXUS 3.0 STUDY HUB IS RUNNING!")
print(f" URL: {url}")
print(" Press Ctrl+C in this window anytime to stop the server.")
print("=" * 60)

webbrowser.open(url)

try:
    s.serve_forever()
except KeyboardInterrupt:
    print("\nShutting down server...")
    s.server_close()
