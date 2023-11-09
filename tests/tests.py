import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
import json
import os

# Get the current working directory
current_directory = os.getcwd()

# Join the current directory with the file name to create the full path
file_path = os.path.join(current_directory, "tests/testSecrets.json")

# Open the JSON file for reading
with open(file_path, "r") as file:
    data = json.load(file)
    password = data["dashboardPassword"]


class CheckWebsite(unittest.TestCase):
    website_url = "http://localhost:8000/"  # Standard URL
    is_checked = None

    @classmethod
    def setUpClass(self):
        options = webdriver.ChromeOptions()
        # options.add_argument("--headless")
        self.driver = webdriver.Chrome(options=options)

    @classmethod
    def tearDownClass(self):
        self.driver.quit()

    def test_a_toggle_checkbox(self):
        self.driver.get(self.website_url + "setstatus?auth=kA724hAn0a")
        time.sleep(1)
        checkbox = self.driver.find_element(By.ID, "653284cad43c535e3026f80a")
        self.__class__.is_checked = checkbox.is_selected()

    def test_b_check_status(self):
        self.driver.get(self.website_url)
        time.sleep(3)
        avalibility = self.driver.find_element(By.ID, "653284cad43c535e3026f80a")

        if self.__class__.is_checked:
            self.assertEqual(avalibility.text, "Tillgänglig")
        else:
            self.assertEqual(avalibility.text, "Ej tillgänglig")

    def test_login(self):
        self.driver.get(self.website_url + "/login")
        password_element = self.driver.find_element(By.ID, "password")
        login_button_element = self.driver.find_element(By.ID, "loginButton")

        # Now you can interact with these elements as needed
        password_element.send_keys(password)
        login_button_element.click()
        time.sleep(5)

    def test_personalLink(self):
        personal_link = self.driver.find_element(By.ID, "personalLink").get_attribute(
            "innerText"
        )
        time.sleep(2)
        self.driver.find_element(By.ID, "buttonEdit").click()
        time.sleep(2)
        edit_personal_link = self.driver.find_element(
            By.ID, "editPersonalLink"
        ).get_attribute("innerText")
        assert edit_personal_link == personal_link


if __name__ == "__main__":
    unittest.main(verbosity=2)
