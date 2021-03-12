# -*- coding: utf-8 -*-
#!/usr/bin/python

import sys
import socket
import json
import time
import subprocess
import os
#import sqlite3

FIFO_FILE_NAME = 'fifofile'
FIFO_FILE_MAX_REGS = 1000
SOCKET_PORT = 5700
SOCKET_ADDRESS = '127.0.0.1'
SOCKET_BUF_SIZE = 1024
MAIN_LOOP_WAIT_TIME = 5

def sendMailbox(msg):
    m = {'command':'raw'}
    m['data'] = str(msg)
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((SOCKET_ADDRESS, SOCKET_PORT))
    s.sendall(json.dumps(m))
    s.close()
    
def recvMailbox():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((SOCKET_ADDRESS, SOCKET_PORT))
    result = s.recv(SOCKET_BUF_SIZE)
    s.close()
    jsonReader = json.JsonReader()
    parsed = jsonReader.read(result)
    return parsed

# Métode que converteix un list a un strig
def convertListToJSON(listData):
    iteration_time = time.time()  #Return the time in seconds since the epoch
    epoch = iteration_time
    index = 0
    jsonDataArray = ""
    if (len(listData) > 0):
        while (index < len(listData)):
            #Send to Initialstate
            if "epock" in listData[index]:
                epoch = listData[index]["epoch"]
            else:
                epoch = iteration_time

            jsonData = "{\"epoch\":\"" + listData[index]["epoch"] + "\",\"key\":\"" + listData[index]["key"] + "\",\"value\":\"" + listData[index]["value"] + "\"}"
            if (index == 0):
                jsonDataArray = jsonData
            else:
                jsonDataArray = jsonDataArray + "," + jsonData
            index = index + 1

    return jsonDataArray

# Mètode que afegeix una línia al final d'un arxiu de text
def pushToFile(data, filename):
    with open(filename, "a") as f:
        f.write(data + '\n')
    return data

# Mètode que treu la primera línia d'un arxiu de text
# Si no hi ha cap línia retorna un string buit
def popFromFile(filename):
    data = ""
    # Read the first line and overwrite with the other lines
    with open(filename, 'r+') as f:
        lines = f.readlines()
 
        f.seek(0) #go to the begining
        index = 0
        for line in lines:
            if index == 0:
                data = line
            else:
                f.write(line)
            index = index + 1

        f.truncate()

    return data.rstrip('\n')



# Documentation => http://support.initialstate.com/knowledgebase/articles/590091-how-to-stream-events-via-restful-api
# Send events to the bucket (epoch timestamp)
# You can try this cURL command, just replace the X-IS-AccessKey header value with one from your account. In this example, the timestamp is specified in epoch.
# 
# curl --include \
#      --request POST \
#      --header "Content-Type: application/json" \
#      --header "X-IS-AccessKey: YOUR_KEY" \
#      --header "X-IS-BucketKey: curl_example_bucket" \
#      --header "Accept-Version: 0.0.1" \
#      --data-binary "[
#     {
#         \"epoch\": 1444309192,
#         \"key\": \"temperature\",
#         \"value\": \"27.8\"
#     }
# ]" \
# 'https://groker.initialstate.com/api/events'
#
# # Get the current timestamp in epoch in python
# iteration_time = time.time()
# 
# If return a HTTP 204 No content => the message is sent successfully to initialstate    
#Error executant subprocess.Popen: TypeError: int is not iterable => S'ha solucionat posant els arguments directament al metode Popen
#args = subprocess.check_call(["curl", "-k", "-v", "-X", "POST", "-H", "Content-Type:application/json", "-H", "Accept-Version:0.0.1", "-H", "X-IS-AccessKey:xNd1uUUn2TMfo1GCe69h7pLhyKYFC14Q", "-H", "X-IS-BucketKey:RKA4BGGSMSRX", "-d", "[{\"key\":\"temperature\",\"value\":\"21\"}]", "https://groker.initialstate.com/api/events"])
#process = subprocess.Popen(args, shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
def sendToInitialState(key, value):
    process = subprocess.Popen(["curl", "-k", "-v", "-X", "POST", "-H", "Content-Type:application/json", "-H", "Accept-Version:0.0.1", "-H", "X-IS-AccessKey:xNd1uUUn2TMfo1GCe69h7pLhyKYFC14Q", "-H", "X-IS-BucketKey:RKA4BGGSMSRX", "-d", "[{\"key\":\""+key+"\",\"value\":\""+value+"\"}]", "https://groker.initialstate.com/api/events"], shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print stdout
    print stderr

def sendValuesToInitialState(jsonDataArray):
    process = subprocess.Popen(["curl", "-k", "-v", "-X", "POST", "-H", "Content-Type:application/json", "-H", "Accept-Version:0.0.1", "-H", "X-IS-AccessKey:xNd1uUUn2TMfo1GCe69h7pLhyKYFC14Q", "-H", "X-IS-BucketKey:RKA4BGGSMSRX", "-d", "[" + jsonDataArray + "]", "https://groker.initialstate.com/api/events"], shell=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    print stdout
    print stderr



print "Command Line Arguments:" + str(len(sys.argv))
print "Command Line Arguments List:" + str(sys.argv)
if (len(sys.argv) != 2):
    print "The program only accepts 2 arguments: " 
    print "    Argument 1: mailbox_v4.py" 
    print "    Argument 2: can be TEST or RUN" 
    sys.exit()

if (sys.argv[1].upper() == "RUN"):
    print "Running application"
    print "Read from socket 5700"
    while True:
        # Receive data from microcontroller
        values = recvMailbox()
        print values["data"]
        print len(values["data"])
      
        # Save data to file
        if (len(values) > 0):
            dataPushed = pushToFile(convertListToJSON(values["data"]), FIFO_FILE_NAME)
            print dataPushed

        # Get data from file and send to initialstate
        dataToSend = popFromFile(FIFO_FILE_NAME)
        print dataToSend
        if (len(dataToSend) > 0):
            #Send to Initialstate
            sendValuesToInitialState(dataToSend)

        # Wait less than half of the microcontroller time to not lose data
        time.sleep(MAIN_LOOP_WAIT_TIME)
else:
    print "Testing application"

    print "Testing convertListToJSON"
    testValue1 = [{'epoch':'12345', 'key':'temperature', 'value':'25'},{'epoch':'12346', 'key':'pressure', 'value':'1024'}]
    testValue1Expected = '{"epoch":"12345","key":"temperature","value":"25"},{"epoch":"12346","key":"pressure","value":"1024"}'
    testValue2 = [{'epoch':'12355', 'key':'temperature', 'value':'24'},{'epoch':'12356', 'key':'pressure', 'value':'1023'}]
    testValue2Expected = '{"epoch":"12355","key":"temperature","value":"24"},{"epoch":"12356","key":"pressure","value":"1023"}'
    testValue3 = [{'epoch':'12365', 'key':'temperature', 'value':'23'},{'epoch':'12366', 'key':'pressure', 'value':'1022'}]
    testValue3Expected = '{"epoch":"12365","key":"temperature","value":"23"},{"epoch":"12366","key":"pressure","value":"1022"}'

    dataConverted1 = convertListToJSON(testValue1)
    if (dataConverted1 != testValue1Expected):
        print "Error 1.1 convertingListToJSON: value " + dataConverted1 + " is diferent from expected " + testValue1Expected
        sys.exit()

    dataConverted2 = convertListToJSON(testValue2)
    if (dataConverted2 != testValue2Expected):
        print "Error 1.2 convertingListToJSON: value " + dataConverted2 + " is diferent from expected " + testValue2Expected
        sys.exit()

    dataConverted3 = convertListToJSON(testValue3)
    if (dataConverted3 != testValue3Expected):
        print "Error 1.3 convertingListToJSON: value " + dataConverted3 + " is diferent from expected " + testValue3Expected
        sys.exit()

    print "Deleting test file"
    if os.path.exists("testfile"):
        os.remove("testfile")

    print "Testing method pushToFile"
    print "   Testing pushing line1 into file"
    line1 = pushToFile(dataConverted1, "testfile")
    if (line1 != dataConverted1):
        print "Error 2.1 pushToFile: value " + line1 + " is diferent from expected " + dataConverted1
        sys.exit()
    print "   Testing pushing line2 into file"
    line2 = pushToFile(dataConverted2, "testfile")
    if (line2 != dataConverted2):
        print "Error 2.2 pushToFile: value " + line2 + " is diferent from expected " + dataConverted2
        sys.exit()
    print "   Testing pushing line3 into file"
    line3 = pushToFile(dataConverted3, "testfile")
    if (line3 != dataConverted3):
        print "Error 2.3 pushToFile: value " + line3 + " is diferent from expected " + dataConverted3
        sys.exit()

    print "Testing method popFromFile"
    print "   Testing popping line1 from file"
    line1 = popFromFile("testfile")
    if (line1 != dataConverted1):
        print "Error 3.1 popFromFile: value " + line1 + " is diferent from expected " + dataConverted1
        sys.exit()
    print "   Testing popping line2 from file"
    line2 = popFromFile("testfile")
    if (line2 != dataConverted2):
        print "Error 3.2 popFromFile: value " + line2 + " is diferent from expected " + dataConverted2
        sys.exit()
    print "   Testing popping line3 from file"
    line3 = popFromFile("testfile")
    if (line3 != dataConverted3):
        print "Error 3.3 popFromFile: value " + line3 + " is diferent from expected " + dataConverted3
        sys.exit()
    print "   Testing popping line from file when file is empty"
    line4 = popFromFile("testfile")
    if (line4 != ""):
        print "Error 3.4 popFromFile: value " + line4 + " is diferent from expected \"\""
        sys.exit()
        
    print "Application tested with NO errors"
