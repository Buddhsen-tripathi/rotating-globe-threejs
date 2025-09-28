#!/usr/bin/env python3
"""
Simple HTTP server to serve the rotating globe locally.
This avoids CORS issues when loading textures from the assets folder.

Usage: python3 serve.py
Then open: http://localhost:8000
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Change to the directory containing this script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"🌍 Starting rotating globe server...")
print(f"📂 Serving from: {os.getcwd()}")
print(f"🚀 Opening: http://localhost:{PORT}")
print(f"⏹️  Press Ctrl+C to stop")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        # Auto-open browser
        webbrowser.open(f"http://localhost:{PORT}")
        httpd.serve_forever()
except KeyboardInterrupt:
    print(f"\n✅ Server stopped!")