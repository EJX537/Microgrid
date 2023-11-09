from egauge import webapi

URI = "https://egauge18646.egaug.es" # replace DEV with meter name
USR = "USER" # replace USER with user name
PWD = "PASS" # replace PASS with password

dev = webapi.device.Device(URI, webapi.JWTAuth(USR,PWD))

print("hostname is " + dev.get("/config/net/hostname")["result"])