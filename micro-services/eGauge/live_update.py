#/cgi-bin/egauge

from egauge import webapi

URI = "http://egauge18646.egaug.es" # replace DEV with meter name
USR = "ppridge1" # replace USER with user name
PWD = "ppridge" # replace PASS with password

dev = webapi.device.Device(URI, webapi.JWTAuth(USR,PWD))

#https://kb.egauge.net/books/egauge-meter-communication/page/register-data-examples
# print("hostname is " + dev.get("/config/net/hostname")["result"])
# dev.get('/register?reg=3+5+7+9&rate')
print(dev.get('/register?reg=3+5+7+9&rate'))