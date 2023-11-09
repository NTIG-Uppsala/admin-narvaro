import unittest
import requests
import json


class CheckWebsite(unittest.TestCase):
    url = "https://narvaro.ntig.dev/api/logs"
    TOKEN = "22"

    payload = json.dumps({"Time": "2021-05-11 12:00:00", "Logs": "Test"})
    headers = {"Content-Type": "application/json", "Authorization": "Bearer " + TOKEN}

    def test_api_response(self):
        response = requests.request(
            "POST", self.url, headers=self.headers, data=self.payload
        )
        print(response.status_code)
        # self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main(verbosity=2)
