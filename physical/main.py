from machine import Pin
import network
import time
import urequests
import json
led = Pin(1, Pin.OUT)
pin_in = Pin(2, Pin.IN)

pin_status_here = Pin(3, Pin.OUT)
pin_status_not_here = Pin(4, Pin.OUT)
wifi_active_pin = Pin(20, Pin.OUT)
wlan = network.WLAN(network.STA_IF)

USER_ID = "XXXXX"
WIFI_SSID = "XXXX"
WIFI_PASSWORD = "XXXX"

current_status = False
is_pressed = False

def get_user_status():
    global current_status, user_ID
    response = urequests.get("https://narvaro.ntig.net/api/getusers")
    print(response.status_code)
    print(response.text)
    users_json = response.json()
    for user in users_json:
        if user["_id"] == USER_ID:
            current_status = user["status"]
            print(f"{user}")  
#    with open("users.txt", "w") as f:
#        f.write(response.text)

def set_user_status():
    global user_ID, current_status
    if current_status:
        new_status = False
    else:
        new_status = True
    data_to_send = {"id": USER_ID, "status": new_status}
    response = urequests.post("https://narvaro.ntig.net/api/setstatus", data=json.dumps(data_to_send), headers={"Content-Type": "application/json"})
    print(response.status_code)
    print(response.text)
    current_status = new_status

def button_handler():
    global led, pin_in, is_pressed

    if pin_in.value() and not is_pressed:
        is_pressed = True
        led.value(1)
        set_user_status()
    else:
        led.value(0)
        is_pressed = False

def wifi_connect():
    global wifi_active_pin, wlan
    wlan.active(True)
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        print('waiting for connection...')
        max_wait -= 1
        wifi_active_pin.toggle()
        time.sleep(1)

    print("Internal adress -> ", wlan.ifconfig())   

def main():
    # Tells us that the device is acutally running the script    
    main_led = Pin("LED", Pin.OUT)
    main_led.value(1)

    last_fetched = time.time()
    # Main loop
    while True:
        try:
            # Checks if the wifi is connected
            if wlan.status() != 3:
                # Try to connect to wifi
                wifi_connect()
            else:
                # If not connected, try to connect
                wifi_active_pin.value(1)

                if (abs(time.time() - last_fetched)) > 30:
                    last_fetched = time.time()
                    get_user_status()


                # Handles button presses
                button_handler()
    
                if current_status:
                    pin_status_here.value(1)
                    pin_status_not_here.value(0)
                else:
                    pin_status_here.value(0)
                    pin_status_not_here.value(1)
        except Exception as e:
            print(e)

main()