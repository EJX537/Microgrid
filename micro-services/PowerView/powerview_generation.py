# URL background
# https://pv.inteless.com/oauth/token 
# Your login details are redirected to the authentication URL, which provides your bearer token for future API requests

import sys
import requests
import json
import time
import mysql.connector
from mysql.connector import Error
from requests.auth import HTTPBasicAuth
from datetime import datetime
from dateutil import parser

db_host = 'localhost'
db_user = 'microgridManager'
db_password = 'sluggrid'
db_name = 'microgridManager'

table_name = 'powerview_data'

# Enter username and password that you created on the Sunsynk website
my_user_email=str(sys.argv[1])
my_user_password=str(sys.argv[2])
is_docker=str(sys.argv[3])
print(is_docker == 'true')
if is_docker == 'true':
	db_host = 'host.docker.internal'
  
print(db_host)
  
loginurl = ('https://pv.inteless.com/oauth/token')

# API call to get realtime inverter related information
plant_id_endpoint = ('https://pv.inteless.com/api/v1/plants?page=1&limit=100&name=&status=')

db_config = {
    "host": db_host,
    "user": db_user,
    "password": db_password,
    "database": db_name
}

outage_timer = 0     #keeps track of time for outages
API_call_timer = 302 #In seconds, how frequently to do the API call. **Should be higher than 301**

def create_powerview_config_settings_table(table_name, retry_interval=3, max_retries=10):
    connection = None
    connection_attempts = 0
    # Connect to MySQL
    while not connection and connection_attempts < max_retries:
        try:
            connection = mysql.connector.connect(**db_config)
            print("MySQL Database connection for config table successful.")
        except Error as e:
            print(f"Error '{e}' occurred, trying again.")
            connection_attempts += 1
            time.sleep(retry_interval)
    if not connection: 
        print("Maximum connection attempts reached. Exiting.")
        return None

    # Create a cursor object to interact with the database
    cursor = connection.cursor()

    # SQL query to check if the table exists
    check_table_query = f"SHOW TABLES LIKE '{table_name}'"

    # Execute the query
    cursor.execute(check_table_query)

    # Fetch the result
    table_exists = cursor.fetchone()

    # If the table doesn't exist, create it
    if not table_exists:
        create_table_query = f"""
        CREATE TABLE {table_name} (
            device_name VARCHAR(255),
            permission_username VARCHAR(255),
            permission_password VARCHAR(255),
            outlink VARCHAR(255),
            device_status VARCHAR(255),
            freq_rate INT
        )
        """
        
        cursor.execute(create_table_query)
        print(f"Table {table_name} created.")

        add_powerview_query = f"""
        INSERT INTO {table_name} (device_name, permission_username, permission_password, outlink, device_status, freq_rate)
        VALUES ("powerview", "", "", "", "off", 100);
        """
        
        cursor.execute(add_powerview_query)
        print(f"Table {table_name} updated with powerview config.")

    # Commit the changes and close the connection
    connection.commit()
    cursor.close()
    connection.close()

# Example usage
create_powerview_config_settings_table('powerview_config_settings_table')

# Get bearer/access token
def my_bearer_token():
    headers = {
        'Content-type':'application/json', 
        'Accept':'application/json'
    }

    payload = {
        "username": my_user_email,
        "password": my_user_password,
        "grant_type":"password",
        "client_id":"csp-web"
        }
    raw_data = requests.post(loginurl, json=payload, headers=headers).json()
    # Access token extracted from response
    my_access_token = raw_data["data"]["access_token"]
    global the_bearer_token_string
    the_bearer_token_string = ('Bearer '+ my_access_token)
    return my_access_token

# Get plant data from plant
def get_and_insert_data():

    #get plant id from plant list
    headers_and_token = {
    'Content-type':'application/json', 
    'Accept':'application/json',
    'Authorization': the_bearer_token_string
    }
    r = requests.get(plant_id_endpoint, headers=headers_and_token)
    data_response = r.json()
    plant_id = data_response['data']['infos'][0]['id']
    
    #print(plant_id)

    #use plant id to find plant realtime data and plant flow data
    plant_realtime_endpoint = f"https://pv.inteless.com/api/v1/plant/{plant_id}?lan=en"
    plant_flow_endpoint = f"https://pv.inteless.com/api/v1/plant/energy/{plant_id}/flow"

    r_realtime = requests.get(plant_realtime_endpoint, headers=headers_and_token)
    r_flow = requests.get(plant_flow_endpoint, headers=headers_and_token)

    realtime_reponse = r_realtime.json()
    flow_response = r_flow.json()

    # print('****************************************************************data_response')
    # print(data_response)
    # print('****************************************************************realtime_response')
    # print(realtime_reponse)
    # print('****************************************************************flow_response')
    # print(flow_response)
    # print('****************************************************************all_data')

    all_data = {**data_response['data'], **realtime_reponse['data'], **flow_response['data']}
    #print(all_data)


    #outage detection
    outage_threshold = 30                                   #In minutes, outage threshold is how long an outage should be detected before notifying
    global outage_timer                                     #keeps track of time
    if (not all_data['gridTo'] and not all_data['toGrid']):
        outage_timer += API_call_timer // 60                #how much time has passed
        if (outage_timer >= outage_threshold):
            outage_message = f"Outage longer than {outage_threshold} minutes detected"
            print(outage_message)
    else:
        outage_timer = 0

    if 'data' in data_response and 'infos' in data_response['data']:
        insert_data(all_data)

def insert_data(data):
    connection = None
    connection_attempts = 0
    # Connect to MySQL
    while not connection and connection_attempts < 10:
        try:
            connection = mysql.connector.connect(**db_config)
            print("MySQL Database connection for inserting successful.")
        except Error as e:
            print(f"Error '{e}' occurred, trying again.")
            connection_attempts += 1
            time.sleep(3)
    if not connection: 
        print("Maximum connection attempts reached. Exiting.")
        return None
    cursor = connection.cursor()

    #check if powerview data table already exists & create one if not
    cursor.execute("SHOW TABLES LIKE 'powerview_data'")
    table_exists = cursor.fetchone()
    if not table_exists:
        cursor.execute ("""
            CREATE TABLE powerview_data (
                updateAt TIMESTAMP,
                name VARCHAR(255),
                status INT,
                totalPower FLOAT,
                pac FLOAT,
                efficiency FLOAT,
                etoday FLOAT,
                emonth FLOAT,
                eyear FLOAT,
                etotal FLOAT,
                income FLOAT,
                invest FLOAT,
                pvPower FLOAT,
                battPower FLOAT,
                gridOrMeterPower FLOAT,
                loadOrEpsPower FLOAT,
                genPower FLOAT,
                minPower FLOAT,
                soc FLOAT,
                heatPumpPower FLOAT,
                pvTo BOOLEAN,
                toLoad BOOLEAN,
                toGrid BOOLEAN,
                toBat BOOLEAN,
                batTo BOOLEAN,
                gridTo BOOLEAN,
                genTo BOOLEAN,
                minTo BOOLEAN,
                toHeatPump BOOLEAN,
                genOn BOOLEAN,
                microOn BOOLEAN,
                PRIMARY KEY (updateAt)
            )
        """)
        print('table created')

    #infos has general data about the current plant
    #infos is in a dictionary inside of an array at index 0 for some reason
    data_infos = data['infos'][0]
    #print(data_infos)

    #Check if this dataset already exists, the updateAt value keeps track of the datasets in intervals of 5 minutes and ~0.6seconds 
    check_record_query = 'SELECT updateAt FROM powerview_data WHERE updateAt = %s'
    cursor.execute(check_record_query, (parser.isoparse(data_infos['updateAt']),))
    updateAt_exists = cursor.fetchone()

    if (updateAt_exists):
        print('Data for this update time already exists. Please wait <5 minutes.')
    else:
        insert_query = """
        INSERT INTO powerview_data (updateAt, name, status, totalPower, pac, efficiency, etoday, emonth, eyear, etotal, income, invest, pvPower, battPower, gridOrMeterPower, loadOrEpsPower, genPower, minPower, soc, heatPumpPower, pvTo, toLoad, toGrid, toBat, batTo, gridTo, genTo, minTo, toHeatPump, genOn, microOn)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

    #"data" is in the format of:    
    #'pageSize': 100, 'pageNumber': 1, 'total': 1, 'infos': [{'id': 139057, 'name': 'Mantey Residence', 'thumbUrl': 'https://static.inteless.com/plant/20231013032039336154.jpg@!650w', 'status': 1, 'address': '22316 Citation Dr, Los Gatos, CA 95033, USA', 'pac': 135, 'efficiency': 0.027, 'etoday': 24.2, 'etotal': 1016.6, 'updateAt': '2023-11-24T00:04:21Z', 'createAt': '2023-10-02T19:41:07.000+00:00', 'type': 2, 'masterId': 5575, 'share': False, 'plantPermission': ['smart.light.view', 'smart.rule.view', 'station.share.cancle'], 'existCamera': False, 'email': 'smpsb02@gmail.com', 'phone': '8317893318'}], 'id': 139057, 'name': 'Mantey Residence', 'totalPower': 5.0, 'thumbUrl': 'https://static.inteless.com/plant/20231013032039336154.jpg', 'joinDate': '2023-09-30T00:00:00Z', 'type': 2, 'status': 1, 'charges': [{'id': 18675729, 'startRange': '', 'endRange': '', 'price': 1.0, 'type': 1, 'stationId': 139057, 'createAt': '2023-10-02T19:41:07Z'}], 'products': None, 'lon': -121.9939688, 'lat': 37.14126505, 'address': '22316 Citation Dr, Los Gatos, CA 95033, USA', 'master': {'id': 5575, 'nickname': 'Rogaciano Gonzalez ', 'mobile': '8317893318'}, 'currency': {'id': 251, 'code': 'USD', 'text': '$'}, 'timezone': {'id': 226, 'code': 'America/Los_Angeles', 'text': '(UTC-08:00)Pacific Time (US & Canada)'}, 'realtime': {'pac': 135, 'etoday': 24.2, 'emonth': 472.7, 'eyear': 1016.6, 'etotal': 1016.6, 'income': 24.2, 'efficiency': 2.7, 'updateAt': '2023-11-24T00:04:21Z', 'currency': {'id': 251, 'code': 'USD', 'text': '$'}, 'totalPower': 5.0}, 'createAt': '2023-10-02T19:41:07Z', 'phone': ' 408-710-2745\n    ', 'email': 'mantey@ucsc.edu', 'installer': 'Rogaciano Gonzalez ', 'principal': 'Patrick Mantey ', 'plantPermission': ['smart.light.view', 'smart.rule.view', 'station.share.cancle'], 'fluxProducts': None, 'invest': 50000.0, 'custCode': 29, 'protocolIdentifier': '', 'meterCode': 0, 'pvPower': 135, 'battPower': 46, 'gridOrMeterPower': 3656, 'loadOrEpsPower': 3670, 'genPower': 0, 'minPower': 0, 'soc': 100.0, 'heatPumpPower': 0, 'pvTo': True, 'toLoad': True, 'toGrid': False, 'toBat': False, 'batTo': True, 'gridTo': True, 'genTo': False, 'minTo': False, 'toHeatPump': False, 'existsGen': False, 'existsMin': False, 'genOn': False, 'microOn': False, 'existsMeter': False, 'bmsCommFaultFlag': False, 'existsHeatPump': False, 'pv': None, 'existThinkPower': False}    

        values = (
            parser.isoparse(data_infos['updateAt']),
            data_infos['name'],
            data_infos['status'],
            data['totalPower'],
            data_infos['pac'],
            data_infos['efficiency'],
            data_infos['etoday'],
            data['realtime']['emonth'],
            data['realtime']['eyear'],
            data_infos['etotal'],
            data['realtime']['income'],
            data['invest'],
            data['pvPower'],
            data['battPower'],
            data['gridOrMeterPower'],
            data['loadOrEpsPower'],
            data['genPower'],
            data['minPower'],
            data['soc'],
            data['heatPumpPower'],
            data['pvTo'],
            data['toLoad'],
            data['toGrid'],
            data['toBat'],
            data['batTo'],
            data['gridTo'],
            data['genTo'],
            data['minTo'],
            data['toHeatPump'],
            data['genOn'],
            data['microOn'],
        )
        
        # Execute the query with the data
        cursor.execute(insert_query, values)
        connection.commit()
        print('data sent')

    cursor.close()
    connection.close()

#main
if __name__ == "__main__":
    my_bearer_token()
    create_powerview_config_settings_table('powerview_config_settings_table')
    while(1):
        get_and_insert_data()
        time.sleep(API_call_timer) #<< This value should be higher than 300 because the API requires at least 5 minutes to update