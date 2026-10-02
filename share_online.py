import http.server
import socketserver
import subprocess
import threading
import webbrowser
import time
import os
import re
import sys

# Change directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Ensure utf-8 stdout on Windows
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
print(" [+] Connecting to secure cloud tunnel to generate your public online URL...")
print("=" * 70)

ssh_cmd = [
    "ssh",
    "-o", "StrictHostKeyChecking=no",
    "-o", "ServerAliveInterval=30",
    "-R", f"80:localhost:{PORT}",
    "nokey@localhost.run"
]

try:
    proc = subprocess.Popen(
        ssh_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding='utf-8',
        errors='replace'
    )

    public_url = None
    start_time = time.time()
    buffer = ""

    while time.time() - start_time < 15:
        line = proc.stdout.readline()
        if not line:
            time.sleep(0.1)
            continue
        buffer += line
        match = re.search(r'(https://[a-zA-Z0-9\-_]+\.lhr\.life)', line)
        if match:
            public_url = match.group(1)
            break
        elif "lhr.life" in line:
            match2 = re.search(r'([a-zA-Z0-9\-_]+\.lhr\.life)', line)
            if match2:
                public_url = f"https://{match2.group(1)}"
                break

    if public_url:
        print("\n" + "=" * 70)
        print(" [SUCCESS] YOUR WEBSITE IS NOW LIVE ONLINE!")
        print(f" [URL] PUBLIC ONLINE LINK: {public_url}")
        print(" [INFO] Open this link on your phone, tablet, or send it to friends!")
        print("=" * 70 + "\n")

        with open("LIVE_ONLINE_URL.txt", "w", encoding="utf-8") as f:
            f.write(f"NEXUS Study Hub Live Online Link:\n{public_url}\n")

        try:
            webbrowser.open(public_url)
        except Exception:
            pass

        print(" [*] Keep this terminal window open while you want the website online.")
        print(" [*] Press Ctrl+C anytime to stop.\n")

        while True:
            time.sleep(1)
    else:
        print("[-] Could not retrieve URL automatically. Raw tunnel output:")
        print(buffer[:500])

except KeyboardInterrupt:
    print("\nShutting down online tunnel and server...")
    if 'proc' in locals():
        proc.terminate()
    s.shutdown()
    sys.exit(0)
