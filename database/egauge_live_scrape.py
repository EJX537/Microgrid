from selenium import webdriver
from bs4 import BeautifulSoup
import time

# Set up a web driver (e.g., Firefox)
driver = webdriver.Firefox()

# Open the website
url = 'http://egauge18646.egaug.es/check.html'  # Replace with the URL of the website you want to scrape
driver.get(url)

# Define the list of element IDs you want to extract
element_ids = [
    'freq',
    'ch0',
    'ch8',
    'ch1',
    'ch9',
    'ch2',
    'ch3',
    'ch4',
    'ch5',
    'ch6',
    'ch7',
    'ch10',
    'ch11',
    'ch12',
    'ch13',
    'ch14',
    'ch15',
    'value0',
    'value1',
    'value2',
    'value3',
    'value4',
    'value5',
    'value6',
    'value7',
    'value8',
    'value9',
    'value10',
    'value11',
]

while True:
    # Get the updated HTML after dynamic content is loaded
    updated_html = driver.page_source

    # Parse the updated HTML with BeautifulSoup
    soup = BeautifulSoup(updated_html, 'html.parser')

    # Create a dictionary to store the extracted values
    extracted_values = {}

    # Iterate through the element IDs and extract their text
    for element_id in element_ids:
        element = soup.find('span', id=element_id)
        if element:
            extracted_values[element_id] = element.get_text()
        else:
            extracted_values[element_id] = 'Element not found'

    # Print the extracted values
    for element_id, value in extracted_values.items():
        print(f"{element_id}: {value}")

    # Wait for one second before scraping again
    time.sleep(10)
