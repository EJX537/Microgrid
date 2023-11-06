from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from datetime import datetime, timedelta


# Create a new instance of the Firefox driver
driver = webdriver.Firefox()

# Open the website
driver.get('http://egauge18646.egaug.es')

time.sleep(30)

# Find the button element and click it
button = driver.find_element(By.ID, 'graph_menu_button')  # Replace with the actual button ID or other selector
button.click()

button = driver.find_element(By.XPATH, "//div[@class='GadgetMenuItem' and contains(text(), 'Export data to spreadsheet (CSV)')]")
button.click()

time.sleep(5)

# Calculate today's date in the format "11/4/2023"
today_date = datetime.now().strftime("%m/%d/%Y")

# Calculate the time 4 minutes ago and 3 minutes ago in 12-hour format with AM/PM
four_minutes_ago = (datetime.now() - timedelta(minutes=4)).strftime("%I:%M %p")
three_minutes_ago = (datetime.now() - timedelta(minutes=3)).strftime("%I:%M %p")

# Access the date and time input elements individually
date_input = driver.find_element(By.CLASS_NAME, 'date_input')
time_input1 = driver.find_element(By.CLASS_NAME, 'time_input')
time_input2 = driver.find_element(By.CLASS_NAME, 'time_input')

# Click the first field to enter the date
date_input.click()
date_input.send_keys(today_date)

# Use the TAB key to navigate to the next fields
date_input.send_keys(Keys.TAB)
time_input1.send_keys(four_minutes_ago)
time_input1.send_keys(Keys.TAB)
date_input.send_keys(today_date)
date_input.send_keys(Keys.TAB)
time_input2.send_keys(three_minutes_ago)

# Locate the <select> element
dropdown = driver.find_element(By.XPATH, "//select[contains(., 'minute')]")


# Create a Select object for the dropdown
select = Select(dropdown)

# Interact with the dropdown, e.g., select an option by its visible text
select.select_by_visible_text("second")


# # Close the browser when done
# driver.quit()
