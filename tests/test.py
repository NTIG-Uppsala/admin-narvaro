import unittest
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By


class testPageTitle(unittest.TestCase):

    website_url = "http://localhost:8000/" # Standard url

    # Check if "Florist Blåklinten" is in the <title> of the page
    @classmethod
    def setUpClass(self):
        service = Service(executable_path=ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        self.driver = webdriver.Chrome(service=service, options=options)


    @classmethod
    def tearDownClass(self):
        self.driver.quit()
    
    def test(self):
        test_str = "test input text"

        self.driver.get(self.website_url + "input.html")

        input_field = self.driver.find_element(By.ID, "inputfield")

        input_field.send_keys(test_str)

        self.driver.find_element(By.ID, "send").click

        self.driver.get(self.website_url + "output.html")

        body_text = self.driver.find_element(By.TAG_NAME, "body").text

        self.assertIn(test_str, body_text)



if __name__ == "__main__":
    if len(sys.argv) > 1:
        website_url = sys.argv.pop()

    unittest.main(verbosity=2)
    
