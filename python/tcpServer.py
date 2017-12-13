#!/usr/bin/python
import threading
import socket
import sys

###############################
### listener shutdown procedure
###############################
def doShutdown():
	print >>sys.stderr, 'shutdown in progress'
	global listenerEnabled
	listenerEnabled = False
	try:
		# Create a TCP/IP socket
		sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		# Connect the socket to the port where the server is listening
		server_address = ('localhost', 10000)
		print >>sys.stderr, 'connecting to %s port %s' % server_address
		sock.connect(server_address)
		sock.close()
	except:
		print >>sys.stderr, 'connecting to %s port %s failed !' % server_address


####################
### Client thread
####################
def client_thread(connection, client_address):
	eom = "\n"
	try:
		print >>sys.stderr, 'connection from', client_address
		# Receive the data in small chunks and retransmit it
		while True:
			data = ''
			while True:
				print >>sys.stderr, 'receive more "%s"' % data
				chunk = connection.recv(4096)
				if not chunk: break
				data += chunk
				if data[-1:] == eom:
					data = data.rstrip(eom)
					break
			print >>sys.stderr, 'received "%s"' % data
			if not data: break
			if data == 'shutdown':
				doShutdown()
				break
			else:
				print >>sys.stderr, 'sending data back to the client'
				connection.sendall(data + eom)
	finally:
		# Clean up the connection
		print >>sys.stderr, 'close client  connection'
		connection.close()

####################
### thread_data
####################
class thread_data():
	def __init__(self, thread, connection, client_address):
		self.thread=thread
		self.connection=connection
		self.client_address=client_address

####################
### Main
####################

global listenerEnabled
listenerEnabled = True
threads = []

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# Bind the socket to the port
server_address = ('localhost', 10000)
print >>sys.stderr, 'starting up on %s port %s' % server_address
sock.bind(server_address)
# Listen for incoming connections
sock.listen(5)

while listenerEnabled:
	# Wait for a connection
	print >>sys.stderr, 'waiting for a connection'
	connection, client_address = sock.accept()
	try:
		print >>sys.stderr, 'connection from', client_address
		t = threading.Thread(target=client_thread, args=(connection, client_address,))
		t.start()
		threads.append(thread_data(t,connection,client_address))
	except:
		print >>sys.stderr, 'failed to start client thread', client_address

print >>sys.stderr, 'Listener ended'
sock.close()
