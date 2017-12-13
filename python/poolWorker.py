#!/usr/bin/python
# Author.: Henrik Cornelius Christensen 
# Purpose: Educational - Try multiprocessing.pool()
#          Notice initialization of "current_thread().name" in "setProcName"
#          Without it, the thread name for pool processes will be "MainThread".
#
import multiprocessing as mp
from threading import Thread, current_thread
import time, os
from time import gmtime, strftime

def log(pMsg):
	print strftime('%H:%M:%S'), os.getpid(), current_thread().name, mp.current_process().name, ":", pMsg

def setProcName():
	current_thread().name = mp.current_process().name

def doSleep(pMsg):
	log(pMsg)
	time.sleep(2)
	return pMsg+' has been done'

log( "Main thread started")
workers = mp.Pool(processes=3, initializer=setProcName)
log("workers started")

for i in range(1,5,1):
	workers.apply_async( doSleep, args=('Task'+str(i),),  callback = log)

log("wait for threads to complete")

workers.close() # No more tasks
workers.join() 	# Wait for tasks to complete

log("end of script")
