import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
import time


class CheckWebsite(unittest.TestCase):
    website_url = "http://localhost:8000/"  # Standard URL
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


if __name__ == "__main__":
    unittest.main(verbosity=2)
