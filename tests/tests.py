import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time


class CheckWebsite(unittest.TestCase):
    website_url = "https://narvaro.ntig.net/"  # Standard URL
    is_checked = None

    @classmethod
    def setUpClass(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        self.driver = webdriver.Chrome(options=options)

    @classmethod
    def tearDownClass(self):
        self.driver.quit()

    def test_a_toggle_checkbox(self):
        self.driver.get(self.website_url + "setstatus?auth=jtgz6rgTGT")
        time.sleep(1)
        checkbox = self.driver.find_element(By.ID, "634ea9b368bd856cebfdddc4")
        self.__class__.is_checked = checkbox.is_selected()

    def test_b_check_status(self):
        self.driver.get(self.website_url)
        time.sleep(3)
        avalibility = self.driver.find_element(By.ID, "634ea9b368bd856cebfdddc4")

        if self.__class__.is_checked:
            self.assertEqual(avalibility.text, "Tillgänglig")
        else:
            self.assertEqual(avalibility.text, "Ej tillgänglig")


if __name__ == "__main__":
    unittest.main(verbosity=2)
