import http.server, socketserver, os

PORT = 8200
ROOT = os.path.join(os.path.dirname(__file__), "..", "game", "out")
ROOT = "D:/桌面/trae/game/out"
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)
    def translate_path(self, path):
        # strip query, normalize
        path = path.split('?',1)[0]
        norm = super().translate_path(path)
        # if not exists, try adding .html
        if not os.path.exists(norm):
            if os.path.exists(norm + '.html'):
                return norm + '.html'
            # try /index.html in folder
            if os.path.isdir(norm):
                idx = os.path.join(norm, 'index.html')
                if os.path.exists(idx):
                    return idx
        return norm
    def log_message(self, *a): pass

with socketserver.TCPServer(("", PORT), H) as httpd:
    print(f"serving {ROOT} on {PORT}")
    httpd.serve_forever()
