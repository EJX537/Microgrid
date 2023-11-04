from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Set the path to your GeckoDriver executable
driver_path = "./drivers/geckodriver"

# URL of the website you want to scrape
url = "http://egauge18646.egaug.es/"

# Initialize the Firefox WebDriver
driver = webdriver.Firefox(executable_path=driver_path)

# Open the website
driver.get(url)

try:
    # Wait for the button to be clickable
    button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.ID, "graph_menu_button"))
    )

    # Click the button to open the dropdown menu
    button.click()

    # Wait for the download button to be clickable in the dropdown menu
    button2 = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (
                By.XPATH,
                "//div[@class='GadgetMenuItem' and contains(text(), 'Export data to spreadsheet (CSV)')]",
            )
        )
    )

    # Click the download button to download the file
    button2.click()

    # Wait for the download button to be clickable in the dropdown menu
    download_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable(
            (By.XPATH, "//input[@type='button' and @value='Export']")
        )
    )

    # Click the download button to download the file
    download_button.click()

except Exception as e:
    print(f"An error occurred: {e}")

finally:
    # Close the browser window
    driver.quit()
