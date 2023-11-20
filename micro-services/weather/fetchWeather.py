import schedule
import time
import subprocess
import requests
import json
import sys
import os
import mysql.connector
from datetime import datetime
from mysql.connector import Error, IntegrityError
from egauge import webapi
from egauge.webapi.device import Local
from egauge.webapi.device.physical_quantity import PhysicalQuantity
from typing import List


def getWeather(latitude, longitude):
    # Make a GET request to the National Weather Service API
    response = requests.get(
        f"https://api.weather.gov/gridpoints/MTR/{latitude},{longitude}/forecast",
        headers={"User-Agent": "MyWeatherApp/1.0"},
    )

    # Parse the response content to a JSON object
    data = response.json()

    # Return weather data
    return data


def job(latitude, longitude):
    # Get current weather data
    data = getWeather(latitude, longitude)

    # Parse information
    # Extract periods from properties
    periods = data["properties"]["periods"]

    # Create list to hold results
    result_list = []

    # Loop through each period
    for period in periods:
        start_time = period["startTime"]
        temperature = period["temperature"]
        short_forecast = period["shortForecast"]

        # Create a dictionary for each period
        period_dict = {start_time: [temperature, short_forecast]}

        # Append the dictionary to the result list
        result_list.append(period_dict)

    # Store data into database
    # Connect to MySQL
    conn = mysql.connector.connect(
        host="localhost",
        user="microgridManager",
        password="sluggrid",
        database="microgridManager",
    )

    # Create a cursor
    cursor = conn.cursor()

    # Create a table if not exists
    create_table_query = """
    CREATE TABLE IF NOT EXISTS weather_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        start_time DATETIME,
        temperature INT,
        short_forecast VARCHAR(255)
    )
    """
    cursor.execute(create_table_query)

    # Insert data into the table
    insert_query = """
    INSERT INTO weather_data (start_time, temperature, short_forecast) VALUES (%s, %s, %s)
    """

    for period in result_list:
        cursor.execute(
            insert_query,
            (period["start_time"], period["temperature"], period["short_forecast"]),
        )

    # Commit the changes
    conn.commit()

    # Close the cursor and connection
    cursor.close()
    conn.close()

    return


def main():
    # Define location of the residence, using gridpoints
    latitude = "93"
    longitude = "67"

    # FOR TEST ONLY
    job(latitude, longitude)
    return

    # Schedule job every 12 hours
    schedule.every(12).hours.do(lambda: job(latitude, longitude))

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
