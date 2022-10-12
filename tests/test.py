import unittest
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By


class testPageTitle(unittest.TestCase):

    website_url = "http://localhost:8000/" # Standard url

    @classmethod
    def setUpClass(self):
        service = Service(executable_path=ChromeDriverManager().install())
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        self.driver = webdriver.Chrome(service=service, options=options)


    @classmethod
    def tearDownClass(self):
        self.driver.quit()
    
    def test_click_checkbox(self):
        self.driver.get(self.website_url)
        test_switch = self.driver.find_element(By.XPATH, '/html/body/div[2]/div/div[4]/div[1]/label')
        test_switch.click()


        self.driver.get(self.website_url + "output")

        avaliable_text = self.driver.find_element(By.XPATH, "/html/body/div[2]/div/div[4]/span").text
        

        self.assertEquals("tillgänglig", avaliable_text)



if __name__ == "__main__":
    if len(sys.argv) > 1:
        website_url = sys.argv.pop()

    unittest.main(verbosity=2)
    
