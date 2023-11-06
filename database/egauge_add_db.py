import csv
import os
import mysql.connector
from datetime import datetime
# Database connection parameters using environment variables
db_host = 'localhost'  # Assuming the MySQL container runs on the same machine
db_user = 'microgridManager'
db_password = 'sluggrid'
db_name = 'microgridManager'

# Specify the directory where your downloaded CSV files are saved
download_directory = '/Users/Kevin/Downloads'  # Replace with the actual directory

# Get a list of all files in the directory
all_files = os.listdir(download_directory)

# Sort the files by their modification time in descending order
all_files.sort(key=lambda x: os.path.getmtime(os.path.join(download_directory, x)), reverse=True)

# Select the most recently modified file
latest_csv_file = os.path.join(download_directory, all_files[0])

# Define table name and column names
table_name = 'egauge_data'
column_names = [
    'Date_Time',
    'use_kW',
    'gen_kW',
    'MaxVrmsA_V',
    'MaxVrmsB_V',
    'Renewable_Power_kW',
    'Consumption_House_kW',
    'VrmsA_V',
    'VrmsB_V',
    'I11_A',
    'I12_A',
    'I21_A',
    'I22_A',
    'I31_A',
    'I32_A',
    'F1_Hz',
    'Grid_Power_kW',
    'Generac_Power_kW',
    'Current_on_Utility_Tie_A',
    'Shop_kW',
    'Panel1_HVAC_kW',
    'Panel2_H2O_kW',
    'Panel3_Kitchen_kW'
]

# Establish a connection to the MySQL database
db = mysql.connector.connect(
    host=db_host,
    user=db_user,
    password=db_password,
    database=db_name
)

cursor = db.cursor()

# Check if the table exists
check_table_query = f"SELECT 1 FROM {table_name} LIMIT 1;"

try:
    cursor.execute(check_table_query)
    cursor.fetchall()  # Consume the result
except mysql.connector.Error as err:
    if err.errno == 1146:  # Table doesn't exist error code
        # Table doesn't exist, create it
        create_table_query = f"CREATE TABLE {table_name} ("
        create_table_query += ', '.join([f'{col_name} {col_type}' for col_name, col_type in column_data])
        create_table_query += ");"
        cursor.execute(create_table_query)
        db.commit()

# Parse the selected CSV file
data = []

with open(latest_csv_file, 'r') as file:
    csv_reader = csv.reader(file)
    header = next(csv_reader)  # Skip the header row

    for row in csv_reader:
        # Convert the 'Date & Time' string to a valid datetime format
        date_time = datetime.strptime(row[0], '%Y-%m-%d %H:%M:%S')  
        row[0] = date_time  # Replace the original string with the datetime object
        data.append(row)
# Prepare the INSERT query
insert_query = f"INSERT INTO {table_name} ({', '.join(column_names)}) VALUES ({', '.join(['%s'] * len(column_names))})"

# Iterate through the CSV data and insert it into the database
for row in data:
    cursor.execute(insert_query, tuple(row))

# Commit the changes and close the database connection
db.commit()
cursor.close()
db.close()
