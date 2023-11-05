from selenium import webdriver
from selenium.webdriver.common.by import By
import time
# Create a new instance of the Firefox driver
driver = webdriver.Firefox()

# Open the website
driver.get('http://egauge18646.egaug.es/')

time.sleep(30)
# Find the button element and click it
button = driver.find_element(By.ID,'graph_menu_button')  # Replace with the actual button ID or other selector
button.click()

button = driver.find_element(By.XPATH, "//div[@class='GadgetMenuItem' and contains(text(), 'Export data to spreadsheet (CSV)')]")
button.click()

button = driver.find_element(By.XPATH, "//input[@type='button' and @value='Export']")
button.click()

# Optionally, perform other tasks like filling out forms, navigating, or scraping data

# Close the browser when done
driver.quit()
