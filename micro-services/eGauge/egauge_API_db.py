import os
from datetime import datetime
import mysql.connector
from mysql.connector import Error, IntegrityError
from egauge import webapi
from egauge.webapi.device import Local
from egauge.webapi.device.physical_quantity import PhysicalQuantity
from typing import List
import json

# MySQL connection details
mysql_config = {
    "host": "localhost",
    "user": "microgridManager",
    "password": "sluggrid",
    "database": "microgridManager",
}


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


# Specify eGauge details
meter_dev = os.getenv("EGDEV", "http://egauge18646.egaug.es")
meter_user = os.getenv("EGUSR", "ppridge1")
meter_password = os.getenv("EGPWD", "ppridge")

dev = webapi.device.Device(meter_dev, webapi.JWTAuth(meter_user, meter_password))


def format_measurements(sensor_name: str, pq_list: List[PhysicalQuantity]):
    """Format a SENSOR_NAME and a list of physical quantities PQ_LIST such
    that each has a fixed width of 18 characters.
    """
    ret = f"{sensor_name:18s}"
    for pq in pq_list:
        formatted = f"{pq.value:14.3f} {pq.unit}"
        if len(formatted) < 18:
            formatted = (18 - len(formatted)) * " " + formatted
        ret += formatted
    return ret


# Request values for all available sensors: built-in environmental
# sensors, all line inputs, and all sensors.  Note that, except for
# environmental sensors, sensor values are measured only if there is
# at least one register using it.  Thus, you may need to configure
# some registers to see the desired sensors.
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

query_string = "&".join(sections + metrics)

# Fetch the sensor values from the meter:
local = Local(dev, query_string)

# print(data_dict)
# print(local)
print("string version", str(local))
string_version = str(local)
# THIS IS WHAT DATA THE SQL QUERIES WILL LOOP THROUGH
data = json.loads(
    string_version
)  # You can adjust the 'indent' parameter for formatting
# print("check that we got it to become a json", type(json_string));
# new_dict = dict(json_string) # make it back into a dictionary

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


# Function to insert or update data in the table
def insert_or_update(table_name, nested_data, column_names):
    # print("THIS IS WHAT NESTED_DATA IS\n", nested_data)
    # print("This is the type of nested_data\n", type(nested_data))

    # Wrap column names with backticks to handle special characters
    columns = ", ".join(
        [
            f"`{col.replace('*', '_').replace('-', 'neg').replace('+', 'pos').replace('/', 'div').replace(' ', '_')}`"
            for col in column_names
            if col != "time"
        ]
    )

    # Create values
    values = ""
    for key, value in nested_data.items():
        # If the value is not a dictionary, convert it into a dictionary with a single key
        if not isinstance(value, dict):
            value = {key: value}

        print(value)
        values += ", ".join(value)
        update_set = ", ".join(
            [
                f"{column} = VALUES({column})"
                for column in column_names
                if column != "time"
            ]
        )

    print("\n\n\n\n\n\n\n")
    print(columns)
    # Include the 'time' column separately in values and update_set
    columns += ", time"
    values += ", " + ", ".join(["%s"] * len(value.keys()))
    update_set += ", time = VALUES(time)"

    # Use ON DUPLICATE KEY UPDATE to handle updates
    query = f"INSERT INTO {table_name} ({columns}) VALUES ({values}) ON DUPLICATE KEY UPDATE {update_set}"

    # Print the SQL query
    # print("SQL Query:", query)

    # Extract the values from the nested dictionary and convert them to a tuple
    data_tuple = tuple(
        [-value if col.startswith("-") else value for col, value in value.items()]
        + [datetime.now()]
    )

    # Execute the query
    try:
        cursor.execute(query, data_tuple)
        connection.commit()
        print("Data inserted successfully.")
    except Exception as e:
        print(f"Error inserting data: {e}")


# Check if the 'cumulative' table exists
cursor.execute("SHOW TABLES LIKE 'cumulative'")
table_exists = cursor.fetchone()
# If the 'cumulative' table doesn't exist, create it
if not table_exists:
    cursor.execute(
        """
        CREATE TABLE cumulative (
            S10_L2 DECIMAL(18, 6),
            S7_L1 DECIMAL(18, 6),
            S8_L2 DECIMAL(18, 6),
            S9_L1 DECIMAL(18, 6),
            S1_L1 DECIMAL(18, 6),
            S11_L1 DECIMAL(18, 6),
            S12_L2 DECIMAL(18, 6),
            S2_L2 DECIMAL(18, 6),
            S3_L1 DECIMAL(18, 6),
            S4_L2 DECIMAL(18, 6),
            S5_L1 DECIMAL(18, 6),
            S6_L2 DECIMAL(18, 6),
            time TIMESTAMP,
            PRIMARY KEY (time)
        )
    """
    )
columns_list_cumulative = [
    "S10_L2",
    "S7_L1",
    "S8_L2",
    "S9_L1",
    "S1_L1",
    "S11_L1",
    "S12_L2",
    "S2_L2",
    "S3_L1",
    "S4_L2",
    "S5_L1",
    "S6_L2",
]

# Insert or update data in the 'cumulative' table
insert_or_update("cumulative", cumulative, columns_list_cumulative + ["time"])

# Check if the 'rate' table exists
cursor.execute("SHOW TABLES LIKE 'rate'")
table_exists = cursor.fetchone()

# If the 'rate' table doesn't exist, create it
if not table_exists:
    cursor.execute(
        """
        CREATE TABLE rate (
            S10_L2 DECIMAL(18, 6),
            S7_L1 DECIMAL(18, 6),
            S8_L2 DECIMAL(18, 6),
            S9_L1 DECIMAL(18, 6),
            S1_L1 DECIMAL(18, 6),
            S11_L1 DECIMAL(18, 6),
            S12_L2 DECIMAL(18, 6),
            S2_L2 DECIMAL(18, 6),
            S3_L1 DECIMAL(18, 6),
            S4_L2 DECIMAL(18, 6),
            S5_L1 DECIMAL(18, 6),
            S6_L2 DECIMAL(18, 6),
            time TIMESTAMP,
            PRIMARY KEY (time)
        )
    """
    )

columns_list_rate = [
    "S10_L2",
    "S7_L1",
    "S8_L2",
    "S9_L1",
    "S1_L1",
    "S11_L1",
    "S12_L2",
    "S2_L2",
    "S3_L1",
    "S4_L2",
    "S5_L1",
    "S6_L2",
]

# Insert or update data in the 'rate' table
insert_or_update("rate", rate, columns_list_rate + ["time"])

# Close the MySQL connection
cursor.close()
connection.close()
