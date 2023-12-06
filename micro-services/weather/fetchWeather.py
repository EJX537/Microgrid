import requests
import schedule
import time
import mysql.connector

def getWeather(latitude, longitude):
		print("Fetching weather data...")
		# Make a GET request to the National Weather Service API
		response = requests.get(
				f"https://api.weather.gov/gridpoints/MTR/{latitude},{longitude}/forecast",
				headers={"User-Agent": "MyWeatherApp/1.0"},
		)

		# Parse the response content to a JSON object
		data = response.json()
		# Return weather data
		print("Weather data fetched.")
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
				icon = period["icon"]

				# Create a dictionary for each period
				period_dict = {
						"startTime": start_time,
						"temperature": temperature,
						"shortForecast": short_forecast,
						"icon": icon,
				}

				# Append the dictionary to the result list
				result_list.append(period_dict)

		print("Storing weather data...")
		# Store data into database
		# Connect to MySQL
		conn = None
		connection_attempts = 0
		while not conn and connection_attempts < max_retries:
			try:
				conn = mysql.connector.connect(
				host="host.docker.internal",
				user="microgridManager",
				password="sluggrid",
				database="microgridManager",
		)
				print("MySQL Database connection for weather successful.")
			except Error as e:
				print(f"Error '{e}' occurred, trying again.")
				connection_attempts += 1
				time.sleep(retry_interval)
		if not conn: 
			print("Maximum connection attempts reached. Exiting.")
			return None


		# Create a cursor
		cursor = conn.cursor()

		# Create a table if not exists
		create_table_query = """
		CREATE TABLE IF NOT EXISTS weather_data (
				id INT AUTO_INCREMENT PRIMARY KEY,
				startTime DATETIME,
				temperature INT,
				shortForecast VARCHAR(255),
				icon VARCHAR(255)
		)
		"""
		cursor.execute(create_table_query)

		# Insert data into the table
		print("Weather data stored.")
		insert_query = """
		INSERT INTO weather_data (startTime, temperature, shortForecast, icon) VALUES (%s, %s, %s, %s)
		"""

		for period in result_list:
				cursor.execute(
						insert_query,
						(
								period["startTime"],
								period["temperature"],
								period["shortForecast"],
								period["icon"],
						),
				)

		# Commit the changes
		conn.commit()

		# Close the cursor and connection
		cursor.close()
		conn.close()
		print("Weather service finished.")
		return

def main():
		# Define location of the residence, using gridpoints
		latitude = "93"
		longitude = "67"
  
		job(latitude, longitude)
  
		# Schedule job every 12 hours
		schedule.every(12).hours.do(lambda: job(latitude, longitude))

		while True:
			schedule.run_pending()
			time.sleep(1)


if __name__ == "__main__":
  print("Starting weather service...")
  main() 
