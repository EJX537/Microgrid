This program takes data from PowerView and puts it into the MySQL Database

It currently takes data from Plant List, Plant Realtime, and Plant Flow.

To change what database change the following variable values in the file.
```
db_host 
db_user 
db_password 
db_name 
```


```
Usage: python3 powerview_generation.py <User/Email> <Password>
```

```
Dependencies: python3, pip python-dateutil, pip mysql-connector-python, pip3 requests
```
