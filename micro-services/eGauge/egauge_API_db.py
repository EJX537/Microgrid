import os
from datetime import datetime
import mysql.connector
from mysql.connector import Error, IntegrityError
from egauge import webapi
from egauge.webapi.device import Local
from egauge.webapi.device.physical_quantity import PhysicalQuantity
from typing import List
import json
import time

# Specify eGauge details - This is what lets us connect to our particular meter
meter_dev = os.getenv("EGDEV", "http://egauge18646.egaug.es")
meter_user = os.getenv("EGUSR", "ppridge1")
meter_password = os.getenv("EGPWD", "ppridge")


def create_egauge_config_settings_table(host, user, password, database, table_name):
    # Connect to MySQL
    connection = mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database
    )

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

        add_eguage_query = f"""
        INSERT INTO {table_name} (device_name, permission_username, permission_password, outlink, device_status, freq_gitrate)
        VALUES ("eguage", "", "", "", "off", 100);
        """
        
        cursor.execute(add_eguage_query)
        print(f"Table {table_name} updated with eguage config.")

    # Commit the changes and close the connection
    connection.commit()
    cursor.close()
    connection.close()

# Example usage
create_egauge_config_settings_table('localhost', 'microgridManager', 'sluggrid', 'microgridManager', 'egauge_config_settings_table')


# Function to create a device with retry logic
def create_egauge_device(dev_url, user, password, retry_interval=300, max_retries=10):
    retries = 0
    while retries < max_retries:
        try:
            dev = webapi.device.Device(dev_url, webapi.JWTAuth(user, password))
            return dev
        except Exception as e:
            print(f"Error creating eGauge device: {e}")
            retries += 1
            print(f"Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)
    print(f"Max retries reached. Exiting.")
    return None

# Create eGauge device with retry logic
dev = create_egauge_device(meter_dev, meter_user, meter_password)

sensors = ["env=all", "l=all", "s=all"]

# Request all available sections: the sensor values themselves as well
# as derived real energy and apparent energy sections.
sections = [Local.SECTION_ENERGY]
# Request all available metrics for each sensor/energy: the rate
# (e.g., power), the accumulated value (e.g., energy), as well as the

# sensor's type (physical unit).
metrics = [Local.METRIC_RATE, Local.METRIC_CUMUL, Local.METRIC_TYPE]

# Request all available sensor measurements: normal (RMS value), mean,
# and frequency:
measurements = ["normal", "mean", "freq"]

#This assembles the query string to make sure we get all the sections we want
query_string = "&".join(sections + metrics)

# Function to create a MySQL connection
def create_connection():
    try:
        connection = mysql.connector.connect(**mysql_config)
        if connection.is_connected():
            print("Connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

# Function to insert data into MySQL table, handling duplicates
def insert_data(connection, table_name, columns, values):
    try:
        cursor = connection.cursor()
        insert_query = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(['%s']*len(columns))})"

        # Insert each row individually
        for row_values in values:
            cursor.execute(insert_query, row_values)

        connection.commit()
        print("Data inserted successfully.")
    except IntegrityError as e:
        print(f"IntegrityError: {e}")
        print("Duplicate entry. Skipping insertion.")
        connection.rollback()
    except Error as e:
        print(f"Error: {e}")
    finally:
        cursor.close()


# Function to insert or update data in the table
def insert_or_update_rate(table_name, nested_data, column_names):
    # Wrap column names with backticks to handle special characters
    columns = ", ".join(
        [
            f"`{col.replace('*', '_').replace('-', 'neg').replace('+', 'pos').replace('/', 'div').replace(' ', '_')}`"
            for col in column_names
            if col != "time"
        ]
    )

    # Create values
    values = ", ".join(["%s"] * len(column_names))
    update_set = ", ".join(
        [
            f"{column} = VALUES({column})"
            for column in column_names
            if column != "time"
        ]
    )

    # Include the 'time' column separately in values and update_set
    columns += ", time"
    values += ", %s"
    update_set += ", time = VALUES(time)"

    # Use ON DUPLICATE KEY UPDATE to handle updates
    # query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE {update_set}"
    query = f"INSERT INTO rate (`S4_L2`, `S3_L1`, `S6_L2`, `S5_L1`, `S2_L2`, `S1_L1`, `S8_L2`, `S7_L1`, `S10_L2`, `S9_L1`, `S12_L2`, `S11_L1`, time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE S4_L2 = VALUES(S4_L2), S3_L1 = VALUES(S3_L1), S6_L2 = VALUES(S6_L2), S5_L1 = VALUES(S5_L1), S2_L2 = VALUES(S2_L2), S1_L1 = VALUES(S1_L1), S8_L2 = VALUES(S8_L2), S7_L1 = VALUES(S7_L1), S10_L2 = VALUES(S10_L2), S9_L1 = VALUES(S9_L1), S12_L2 = VALUES(S12_L2), S11_L1 = VALUES(S11_L1), time = VALUES(time)"

    print("*******THIS IS MY QUERY ******\n")
    print(query)
    print("****THIS IS MY QUERY ******\n")
    # Extract the values from the nested dictionary and convert them to a tuple
    data_tuple = tuple(
        [-value if col.startswith("-") else value for col, value in nested_data.items()]
        + [datetime.now()]
    )

    print("Data Tuple:", data_tuple)
    # Execute the query
    try:
        cursor.execute(query, data_tuple)
        connection.commit()
        print("Data inserted successfully.")
    except Exception as e:
        print(f"Error inserting data: {e}")

def insert_or_update_cumulative(table_name, nested_data, column_names):
    # Wrap column names with backticks to handle special characters
    columns = ", ".join(
        [
            f"`{col.replace('*', '_').replace('-', 'neg').replace('+', 'pos').replace('/', 'div').replace(' ', '_')}`"
            for col in column_names
            if col != "time"
        ]
    )

    # Create values
    values = ", ".join(["%s"] * len(column_names))
    update_set = ", ".join(
        [
            f"{column} = VALUES({column})"
            for column in column_names
            if column != "time"
        ]
    )

    # Include the 'time' column separately in values and update_set
    columns += ", time"
    values += ", %s"
    update_set += ", time = VALUES(time)"

    # Use ON DUPLICATE KEY UPDATE to handle updates
    # query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE {update_set}"
    query = f"INSERT INTO cumulative (`S4_L2`, `S3_L1`, `S6_L2`, `S5_L1`, `S2_L2`, `S1_L1`, `S8_L2`, `S7_L1`, `S10_L2`, `S9_L1`, `S12_L2`, `S11_L1`, time) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE S4_L2 = VALUES(S4_L2), S3_L1 = VALUES(S3_L1), S6_L2 = VALUES(S6_L2), S5_L1 = VALUES(S5_L1), S2_L2 = VALUES(S2_L2), S1_L1 = VALUES(S1_L1), S8_L2 = VALUES(S8_L2), S7_L1 = VALUES(S7_L1), S10_L2 = VALUES(S10_L2), S9_L1 = VALUES(S9_L1), S12_L2 = VALUES(S12_L2), S11_L1 = VALUES(S11_L1), time = VALUES(time)"

    print("*******THIS IS MY QUERY ******\n")
    print(query)
    print("****THIS IS MY QUERY ******\n")
    # Extract the values from the nested dictionary and convert them to a tuple
    data_tuple = tuple(
        [-value if col.startswith("-") else value for col, value in nested_data.items()]
        + [datetime.now()]
    )

    print("Data Tuple:", data_tuple)
    # Execute the query
    try:
        cursor.execute(query, data_tuple)
        connection.commit()
        print("Data inserted successfully.")
    except Exception as e:
        print(f"Error inserting data: {e}")


while True:
    # Fetch the sensor values from the meter
    if dev:
        local = Local(dev, query_string)
        string_version = str(local)
        data = json.loads(string_version)

        # The rest of your code for processing and inserting data into MySQL
        # ...
 #I am keeping these debug prints in on purpose
    #because if something goes wrong it will let us tell what is wrong
    cumulative = {}
    rate = {}
    for key, values in data["energy"].items():
        cumulative[key] = int(values["cumul"])
        rate[key] = values["rate"]

    print("Cumulative Dictionary:")
    print(cumulative)

    print("\nRate Dictionary:")
    print(rate)

    # Connect to MySQL (replace placeholders with actual values)
    db_config = {
        "host": "localhost",
        "user": "microgridManager",
        "password": "sluggrid",
        "database": "microgridManager",
    }

    # Connect to MySQL database
    connection = mysql.connector.connect(**db_config)
    cursor = connection.cursor()


    # Check if the 'cumulative' table exists
    cursor.execute("SHOW TABLES LIKE 'cumulative'")
    table_exists = cursor.fetchone()
    # If the 'cumulative' table doesn't exist, create it
    if not table_exists:
        cursor.execute(
            """
            CREATE TABLE cumulative (
                S4_L2 DECIMAL(65, 30),
                S3_L1 DECIMAL(65, 30),
                S6_L2 DECIMAL(65, 30),
                S5_L1 DECIMAL(65, 30),
                S2_L2 DECIMAL(65, 30),
                S1_L1 DECIMAL(65, 30),
                S8_L2 DECIMAL(65, 30),
                S7_L1 DECIMAL(65, 30),
                S10_L2 DECIMAL(65, 30),
                S9_L1 DECIMAL(65, 30),
                S12_L2 DECIMAL(65, 30),
                S11_L1 DECIMAL(65, 30),
                time TIMESTAMP,
                PRIMARY KEY (time)
            )
        """
        )
    columns_list_cumulative = [
        "S4_L2",
        "S3_L1",
        "S6_L2",
        "S5_L1",
        "S2_L2",
        "S1_L1",
        "S8_L2",
        "S7_L1",
        "S10_L2",
        "S9_L1",
        "S12_L2",
        "S11_L1",
    ]

    # Insert or update data in the 'cumulative' table
    insert_or_update_cumulative("cumulative", cumulative, columns_list_cumulative + ["time"])

    # Check if the 'rate' table exists
    cursor.execute("SHOW TABLES LIKE 'rate'")
    table_exists = cursor.fetchone()

    # If the 'rate' table doesn't exist, create it
    if not table_exists:
        cursor.execute(
            """
            CREATE TABLE rate (
                S4_L2 DECIMAL(18, 6),
                S3_L1 DECIMAL(18, 6),
                S6_L2 DECIMAL(18, 6),
                S5_L1 DECIMAL(18, 6),
                S2_L2 DECIMAL(18, 6),
                S1_L1 DECIMAL(18, 6),
                S8_L2 DECIMAL(18, 6),
                S7_L1 DECIMAL(18, 6),
                S10_L2 DECIMAL(18, 6),
                S9_L1 DECIMAL(18, 6),
                S12_L2 DECIMAL(18, 6),
                S11_L1 DECIMAL(18, 6),
                time TIMESTAMP,
                PRIMARY KEY (time)
            )
        """
        )

    columns_list_rate = [
        "S4_L2",
        "S3_L1",
        "S6_L2",
        "S5_L1",
        "S2_L2",
        "S1_L1",
        "S8_L2",
        "S7_L1",
        "S10_L2",
        "S9_L1",
        "S12_L2",
        "S11_L1",
    ]

    # Insert or update data in the 'rate' table
    insert_or_update_rate("rate", rate, columns_list_rate + ["time"])

    # Close the MySQL connection
    cursor.close()
    connection.close()
    time.sleep(5)
    time.sleep(30)
