#!/usr/bin/python
# https://pymotw.com/2/socket/tcp.html

import socket
import sys

try:
	# Create a TCP/IP socket
	sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	# Connect the socket to the port where the server is listening
	server_address = ('localhost', 10000)
	print >>sys.stderr, 'connecting to %s port %s' % server_address
	sock.connect(server_address)
except:
	print >>sys.stderr, 'connecting to %s port %s failed !' % server_address
	exit()

try:
	eom = "\n"
	msgs = ['The first message', 'The second message', 'shutdown']
	for vMsg in msgs:
		print >>sys.stderr, 'Sending: "%s"' % vMsg
		sock.sendall(vMsg + eom)
		data = ''
		while True:
			chunk = sock.recv(4096)
			if not chunk: break
			data += chunk
			if data[-1:] == eom:
				data = data.rstrip(eom)
				break
		print >>sys.stderr, 'Received: "%s"' % data
finally:
	print >>sys.stderr, 'closing socket'
	sock.close()
