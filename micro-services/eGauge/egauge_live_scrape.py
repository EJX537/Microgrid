from selenium import webdriver
from bs4 import BeautifulSoup
import mysql.connector
import time

# Set up a web driver (e.g., Firefox)
driver = webdriver.Firefox()

# Open the website
url = 'http://egauge18646.egaug.es/check.html'
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

# db_host = 'localhost'  # Assuming the MySQL container runs on the same machine
# db_user = 'microgridManager'
# db_password = 'sluggrid'
# db_name = 'microgridManager'

# MySQL database connection settings
db_config = {
    'host': 'localhost',
    'user': 'microgridManager',
    'password': 'sluggrid',
    'database': 'microgridManager',
}

# Connect to MySQL database
conn = mysql.connector.connect(**db_config)
cursor = conn.cursor()

# Create table if not exists
create_table_query = """
CREATE TABLE IF NOT EXISTS egauge_live_scraped_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    element_id VARCHAR(50),
    value VARCHAR(255)
);
"""
cursor.execute(create_table_query)
conn.commit()

while True:
    try:
        # Get the updated HTML after dynamic content is loaded
        updated_html = driver.page_source

        # Parse the updated HTML with BeautifulSoup
        soup = BeautifulSoup(updated_html, 'html.parser')

        # Iterate through the element IDs and insert their text into the database
        for element_id in element_ids:
            element = soup.find('span', id=element_id)
            if element:
                value = element.get_text()
            else:
                value = 'Element not found'

            # Insert data into the database
            insert_query = "INSERT INTO scraped_data (element_id, value) VALUES (%s, %s)"
            data = (element_id, value)
            cursor.execute(insert_query, data)
            conn.commit()

        print("Scraping and database insertion successful.")

    except Exception as e:
        print(f"Error: {e}")

    # Wait for one second before scraping again
    time.sleep(10)

# Close the database connection when done
conn.close()
