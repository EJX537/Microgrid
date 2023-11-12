# URL background
#  https://pv.inteless.com/oauth/token 
# Your login details are redirected to the authentication URL, which provides your bearer token for future API requests

import sys
import requests
import json
import mysql.connector
from requests.auth import HTTPBasicAuth
from datetime import datetime
from dateutil import parser

db_host = 'localhost'  
db_user = 'microgridManager'
db_password = 'sluggrid'
db_name = 'microgridManager'

table_name = 'powerview_data'

# Enter your username and password that you created on the Sunsynk website.
my_user_email=str(sys.argv[1])
my_user_password=str(sys.argv[2])

loginurl = ('https://pv.inteless.com/oauth/token')

# API call to get realtime inverter related information
plant_id_endpoint = ('https://pv.inteless.com/api/v1/plants?page=1&limit=10&name=&status=')

db_config = {
    "host": db_host,
    "user": db_user,
    "password": db_password,
    "database": db_name
}

def insert_data(data_response):
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()

    check_table_query = f"SELECT 1 FROM {table_name} LIMIT 1;"


#     try:
#         cursor.execute(check_table_query)
#         cursor.fetchall()  # Consume the result
#     except mysql.connector.Error as err:
#         if err.errno == 1146:  # Table doesn't exist error code
#             # Table doesn't exist, create it
#             create_table_query = f"CREATE TABLE {table_name} ("
#             create_table_query += ', '.join([f'{col_name} {col_type}' for col_name, col_type in column_data])
#             create_table_query += ");"
#             cursor.execute(create_table_query)
#             db.commit()
 


    # Define the MySQL insert query
    insert_query = """
    INSERT INTO powerview_data (code, msg, pageSize, pageNumber, total, id, name, thumbUrl, status, address, pac, efficiency, etoday, etotal, updateAt, createAt, type, masterID, share, existCamera, email, phone, success)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    data_infos = data_response['data']['infos'][0]
    values = (
        data_response['code'],
        data_response['msg'],
        data_response['data']['pageSize'],
        data_response['data']['pageNumber'],
        data_response['data']['total'],
        data_infos['id'],
        data_infos['name'],
        data_infos['thumbUrl'],
        data_infos['status'],
        data_infos['address'],
        data_infos['pac'],
        data_infos['efficiency'],
        data_infos['etoday'],
        data_infos['etotal'],
        parser.isoparse(data_infos['updateAt']),
        parser.isoparse(data_infos['createAt']), 
        data_infos['type'],
        data_infos['masterId'],
        data_infos['share'],
        data_infos['existCamera'],
        data_infos['email'],
        data_infos['phone'],
        data_response['success']
    )
    
    # Execute the query with the data
    cursor.execute(insert_query, values)
    connection.commit()

    cursor.close()
    connection.close()

    print('data sent')

# print bearer/access token
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

# Get plant id and data from plant
def my_current_usage():
    headers_and_token = {
    'Content-type':'application/json', 
    'Accept':'application/json',
    'Authorization': the_bearer_token_string
    }
    r = requests.get(plant_id_endpoint, headers=headers_and_token)
    data_response = r.json()
    #plant_id_and_pac = data_response['data']['infos']
    #print(data_response)
    if 'data' in data_response and 'infos' in data_response['data']:
        for entry in data_response['data']['infos']:
            insert_data(data_response)

#main
if __name__ == "__main__":
    my_bearer_token()
    my_current_usage()
