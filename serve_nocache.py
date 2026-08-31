import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")

class NoCacheHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        # Never let the browser cache the game/portal assets — every load is fresh.
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, *args):
        pass

if __name__ == "__main__":
    port = 8093
    httpd = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"Serving {ROOT} on http://127.0.0.1:{port} (no-cache)")
    httpd.serve_forever()
