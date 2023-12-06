This program takes data from PowerView and puts it into the MySQL Database once every 5 minutes and 2 seconds. The API updates once every 5 minutes and ~0.8 seconds.

```
Usage: python3 powerview_generation.py <User/Email> <Password> <Using Docker true/false>
```

```
Dependencies: python3, pip python-dateutil, pip mysql-connector-python, pip3 requests
```

```
It currently takes data from Plant List, Plant Realtime, and Plant Flow.

The numbers refer to the section in the API manual.

Plant List (3.2.1) tracks general information about the plant.

Plant Realtime (3.2.3) tracks general energy statistics about the plant.

Plant Flow (3.2.4) tracks the flow of energy throughout the Microgrid.

For more deatils on the API, Read >> ***E-linter CSP Platform Open API Manual_V211004_sunsynk.pdf*** in the directory
```

To change how frequently the program calls the API, change the time.sleep() value in #main. **Remember that the API updates once every 5 minutes**

To change what database change the following variable values in the file.
```
db_host 
db_user 
db_password 
db_name 
```


