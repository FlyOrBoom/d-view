# Single page app webserver
# https://gist.githubusercontent.com/tkgwy/45f95f2e77bd4b0602a57867677e5f50/raw/9b12678c1b105cbc715a1f35f4fe2910d0e9d4f2/serve-python3.py 


import os
import sys
from urllib.parse import urlparse
from http.server import SimpleHTTPRequestHandler
from http.server import HTTPServer

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        request_file_path = url.path.strip('/')

        if not os.path.exists(request_file_path):
            self.path = 'index.html'

        return SimpleHTTPRequestHandler.do_GET(self)


host = '0.0.0.0'
try:
    port = int(sys.argv[1])
except IndexError:
    port = 8000
httpd = HTTPServer((host, port), Handler)

print('Serving HTTP on %s port %d ...' % (host, port))
httpd.serve_forever()

