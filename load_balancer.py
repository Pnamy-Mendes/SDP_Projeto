import sys
import socket
import select
from itertools import cycle

SERVER_POOL = [('localhost', 5000), ('localhost', 5001)]

class LoadBalancer:
    def __init__(self, ip, port, algorithm='round robin'):
        self.ip = ip
        self.port = port
        self.algorithm = algorithm
        self.server_iter = cycle(SERVER_POOL)  # Create an iterator for round-robin logic

        self.cs_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.cs_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.cs_socket.bind((self.ip, self.port))
        print('init client-side socket: %s' % (self.cs_socket.getsockname(),))
        self.cs_socket.listen(10)

        self.flow_table = {}
        self.sockets = [self.cs_socket]

    def start(self):
        while True:
            read_list, _, _ = select.select(self.sockets, [], [])
            for sock in read_list:
                if sock == self.cs_socket:
                    self.on_accept()
                else:
                    try:
                        data = sock.recv(4096)
                        if data:
                            self.on_recv(sock, data)
                        else:
                            self.on_close(sock)
                    except Exception as e:
                        print(f"Exception: {e}")
                        self.on_close(sock)

    def on_accept(self):
        client_socket, client_addr = self.cs_socket.accept()
        print('client connected: %s <==> %s' % (client_addr, self.cs_socket.getsockname()))

        # Select a server based on the load-balancing algorithm
        server_ip, server_port = self.select_server()

        ss_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            ss_socket.connect((server_ip, server_port))
            print('server connected: %s <==> %s' % (ss_socket.getsockname(), (server_ip, server_port)))
        except Exception as e:
            print(f"Can't establish connection with server: {e}")
            client_socket.close()
            return

        self.sockets.extend([client_socket, ss_socket])
        self.flow_table[client_socket] = ss_socket
        self.flow_table[ss_socket] = client_socket

    def on_recv(self, sock, data):
        remote_socket = self.flow_table[sock]
        remote_socket.send(data)

    def on_close(self, sock):
        print('connection closed: %s' % (sock.getpeername(),))

        remote_sock = self.flow_table[sock]
        self.sockets.remove(sock)
        self.sockets.remove(remote_sock)

        sock.close()
        remote_sock.close()

        del self.flow_table[sock]
        del self.flow_table[remote_sock]

    def select_server(self):
        # Round-robin server selection
        return next(self.server_iter)

if __name__ == '__main__':
    try:
        LoadBalancer('localhost', 6969).start()
    except KeyboardInterrupt:
        print("Stopping load balancer")
        sys.exit(1)
