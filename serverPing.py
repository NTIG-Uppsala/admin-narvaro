import requests

url = "https://narvaro.ntig.dev/"

payload = ""
headers = {}

response = requests.request("POST", url, headers=headers, data=payload)

print(response.status_code)
