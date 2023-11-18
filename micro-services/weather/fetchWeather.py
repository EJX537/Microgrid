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

    return result_list


def main():
    # Define location of the residence, using gridpoints
    latitude = "93"
    longitude = "67"

    forecast = job(latitude, longitude)
    print(forecast)
    return

    # Schedule job every 12 hours
    schedule.every(12).hours.do(lambda: job(latitude, longitude))

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    main()
