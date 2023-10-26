# Setting up Rasberry Pi Pico W

To use Python with Rasberry Pi Pico, the MicroPython firmware needs to be installed. Follow [this guide](https://www.raspberrypi.com/documentation/microcontrollers/micropython.html#drag-and-drop-micropython) to install the firmware.

A `secrets.json` file must be created with the following keys:
```json
{
    "WIFI_SSID": "",
    "WIFI_PASSWORD": "",
    "TOKEN": "",
    "URL": ""
}
```
`WIFI_SSID` and `WIFI_PASSWORD` are the Wi-Fi credentials. `TOKEN` is used to get the user data. Each user has a unique token. A token can be found/generated in the admin dashboard. `URL` is the web address that requests are made to (e.g. https://narvaro.ntig.net).

Thonny can be used to move the `main.py` and `secrets.json` files to the Raspberry Pi Pico. Installation instructions for Thonny can be found [here](https://projects.raspberrypi.org/en/projects/getting-started-with-the-pico/2).

# Retrieving logs from Raspberry Pi Pico

Thonny can also be used to view the log file (`log.txt`) saved on the Raspberry Pi Pico.
