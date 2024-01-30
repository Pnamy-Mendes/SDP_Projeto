import requests
from http.server import BaseHTTPRequestHandler, HTTPServer
import socketserver
import shutil
import logging 

class RoundRobinLoadBalancer:
    def __init__(self, targets):
        self.targets = targets
        self.index = 0

    def get_target(self):
        target = self.targets[self.index]
        self.index = (self.index + 1) % len(self.targets)
        return target

class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):


    """ # Add this line to configure logging
    logging.basicConfig(level=logging.DEBUG)

    # Add these lines to log request details and target URL
    logging.debug(f"Received {method} request for URL: {url}")
    logging.debug(f"Request Headers: {headers}")

    # Add these lines to log response details
    logging.debug(f"Received response: {response.status_code}")
    logging.debug(f"Response Headers: {response.headers}") """


    protocol_version = 'HTTP/1.0'
    load_balancer = RoundRobinLoadBalancer(["http://localhost:5000", "http://localhost:5001"])

    def do_OPTIONS(self):
        self.send_response(200)
        # Get the origin from the request headers
        origin = self.headers.get('Origin')
        if origin:
            self.send_header('Access-Control-Allow-Origin', origin)
        else:
            self.send_header('Access-Control-Allow-Origin', '*')  # Fallback to a wildcard if origin is not present
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Credentials', 'true')  # To allow credentials
        self.end_headers()


    def do_GET(self):
        target_url = self.load_balancer.get_target() + self.path
        self.proxy_request(target_url)

    def do_POST(self):
        target_url = self.load_balancer.get_target() + self.path
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        self.proxy_request(target_url, method='POST', data=post_data)


    def proxy_request(self, url, method='GET', data=None):
        try:
            headers = {key: val for key, val in self.headers.items()}
            
            # Ensure 'Host' header is adjusted to target URL
            headers['Host'] = url.split('//')[1].split('/')[0]
            
            response = requests.request(method, url, headers=headers, data=data, allow_redirects=False, stream=True)

            self.send_response(response.status_code)
            
            # Forward headers from the Flask response to the client, filtering out problematic headers
            excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
            for key, value in response.headers.items():
                if key.lower() not in excluded_headers:
                    self.send_header(key, value)
            
            # 'Access-Control-Allow-Origin' header adjustment for CORS
            origin = self.headers.get('Origin')
            self.send_header('Access-Control-Allow-Origin', origin if origin else '*')
            self.send_header('Access-Control-Allow-Credentials', 'true')
            
            self.end_headers()

            # Forward the response body
            shutil.copyfileobj(response.raw, self.wfile)
        except Exception as e:
            print(f"Error forwarding request: {e}")
            self.send_error(500, f"Internal Server Error: {e}")



def run(server_class=HTTPServer, handler_class=ProxyHTTPRequestHandler, port=6969):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting load balancer on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
