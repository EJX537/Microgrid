import requests
import json
import sys

def main():
	latitude = sys.argv[1]
	longitude = sys.argv[2]
	
	# Make a GET request to the National Weather Service API
	response = requests.get(f"https://api.weather.gov/points/{latitude},{longitude}", headers={"User-Agent": "MyWeatherApp/1.0"})

	# Parse the response content to a JSON object
	data = response.json()

	# Get the forecast URL
	forecast_url = data['properties']['forecast']

	# Make a GET request to the forecast URL
	forecast_response = requests.get(forecast_url, headers={"User-Agent": "MyWeatherApp/1.0"})

	print(forecast_url)
	# Print the forecast data
	print(forecast_response)
 
if __name__ == "__main__":
	main()
