import unittest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time 



class CheckWebsite(unittest.TestCase):
    website_url = "http://localhost:8000/"  # Standard URL
    is_checked = None
    @classmethod
    def setUpClass(self):
        service = Service(executable_path=ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        #options.add_argument('--headless')
        self.driver = webdriver.Chrome(service=service, options=options)
    
    @classmethod
    def tearDownClass(self):
        self.driver.quit()

    def test_a_toggle_checkbox(self):
        self.driver.get(self.website_url + "setstatus?auth=Z2Kywv8RkQ")
        time.sleep(1)
        checkbox = self.driver.find_element(By.ID, "slider-635b94fc8ea8f0ec28efa1f1")
        self.is_checked = not checkbox.is_selected()
        checkbox.click()

    def test_b_check_status(self):
        self.driver.get(self.website_url)
        time.sleep(3)
        avalibility = self.driver.find_element(By.ID, "635b94fc8ea8f0ec28efa1f1")

        if self.is_checked:
            self.assertEqual(avalibility.text, "Tillgänglig")
        else:
            self.assertEqual(avalibility.text, "Ej tillgänglig")

if __name__ == "__main__":
    unittest.main(verbosity=2)
