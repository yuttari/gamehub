import http.server
import os
import socketserver

PORT = 8091
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "out")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def translate_path(self, path):
        # Strip query string / fragment
        path = path.split("?", 1)[0].split("#", 1)[0]
        local = super().translate_path(path)
        # Already a file -> serve as-is
        if os.path.isfile(local):
            return local
        # Next.js static export produces `slug.html` files;
        # allow accessing them without the extension (`/game/match3` -> `match3.html`)
        cand = local + ".html"
        if os.path.isfile(cand):
            return cand
        # Directory index fallback
        if os.path.isdir(local):
            idx = os.path.join(local, "index.html")
            if os.path.isfile(idx):
                return idx
        return local

    def end_headers(self):
        # No caching so rebuilt output shows immediately
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving {ROOT} at http://localhost:{PORT}")
        httpd.serve_forever()
