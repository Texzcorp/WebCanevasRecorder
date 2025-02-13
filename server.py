from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

port = 8000
print(f"Serveur démarré sur http://localhost:{port}")
print("Ouvrez votre navigateur et accédez à http://localhost:8000/demo/")
print("Appuyez sur Ctrl+C pour arrêter le serveur")

httpd = HTTPServer(('localhost', port), CORSRequestHandler)
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServeur arrêté")
    sys.exit(0)
