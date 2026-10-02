import http.server
import socketserver
import subprocess
import threading
import webbrowser
import time
import os
import re
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
for p in range(8080, 8100):
    try:
        s = socketserver.TCPServer(("", p), http.server.SimpleHTTPRequestHandler)
        PORT = p
        break
    except OSError:
        continue

server_thread = threading.Thread(target=s.serve_forever)
server_thread.daemon = True
server_thread.start()

print("=" * 70)
print(f" [+] Local server running on http://localhost:{PORT}")
print(" [+] Connecting to Cloudflare's Global Edge Network...")
print("=" * 70)

cf_binary = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cloudflared.exe")
if not os.path.exists(cf_binary):
    cf_binary = "cloudflared"

cmd = [cf_binary, "tunnel", "--url", f"http://localhost:{PORT}"]

try:
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace"
    )

    public_url = None
    start_time = time.time()

    while time.time() - start_time < 25:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        m = re.search(r'(https://[a-zA-Z0-9\-]+\.trycloudflare\.com)', line)
        if m:
            public_url = m.group(1)
            break

    if public_url:
        print("\n" + "=" * 70)
        print(" [SUCCESS] YOUR WEBSITE IS LIVE ONLINE ON CLOUDFLARE!")
        print(f" [URL] DIRECT PUBLIC LINK: {public_url}")
        print(" [INFO] No passwords or verification needed - opens directly!")
        print("=" * 70 + "\n")

        with open("LIVE_ONLINE_URL.txt", "w", encoding="utf-8") as f:
            f.write(f"NEXUS Study Hub Cloudflare Public Link:\n{public_url}\n")

        try:
            webbrowser.open(public_url)
        except Exception:
            pass

        print(" [*] Website is active online. Keep this window open.")
        print(" [*] Press Ctrl+C anytime to stop.\n")

        while True:
            time.sleep(1)
    else:
        print("[-] Could not retrieve Cloudflare URL within 25 seconds.")

except KeyboardInterrupt:
    print("\nShutting down Cloudflare Tunnel and server...")
    if 'proc' in locals():
        proc.terminate()
    s.shutdown()
    sys.exit(0)
