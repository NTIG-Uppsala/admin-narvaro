from machine import Pin, Timer, reset
import micropython
import network
import time
import urequests
import json
import ntptime
import gc

here_button_pin = Pin(2, Pin.IN)
not_here_button_pin = Pin(3, Pin.IN)
pin_status_here = Pin(20, Pin.OUT)
pin_status_not_here = Pin(21, Pin.OUT)
# wifi_active_pin = Pin(20, Pin.OUT)

# Set up WLAN
wlan = network.WLAN(network.STA_IF)
wlan.active(True)

enable_logs = True

rtc = machine.RTC()

selected_pin_on_pico = 4

sensor_temp = machine.ADC(selected_pin_on_pico)

gc.collect()
micropython.mem_info()

# Secrets that should not be public
WIFI_SSID = ""
WIFI_PASSWORD = ""
TOKEN = ""

current_status = False
is_pressed = False

blinking_interval_ms = 500

#Create virtual timers
toggle_here_led = Timer(-1)
toggle_not_here_led = Timer(-1)
update_time_timer = Timer(-1)

def add_to_log(message):
    if enable_logs:
        bytes_per_kibibyte = 1024
        total_ram_kibibytes = (gc.mem_free() + gc.mem_alloc()) / bytes_per_kibibyte
        used_ram_kibibytes = gc.mem_alloc() / bytes_per_kibibyte
        file = open("log.txt","a")
        file.write(f"{rtc.datetime()}: {message}, signal strength: {wlan.status('rssi')} dBm, temp: {get_temperature_celsius()}°C, RAM usage: {used_ram_kibibytes}/{total_ram_kibibytes} KiB\n")
        file.close()
        
def get_temperature_celsius():
    # RP2040 datasheet 4.9.5. Temperature Sensor
    max_voltage = 3.3
    conversion_factor = max_voltage / (65535)
    # voltage of base emitter
    voltage = 0.706
    voltage_slope = 0.001721
    reading = sensor_temp.read_u16() * conversion_factor
    degrees_celsius = 27 - (reading - voltage)/voltage_slope
    return degrees_celsius

def get_self_user_id():
    url = "https://narvaro.ntig.net/api/device"
    headers = {"Authorization": "Bearer " + TOKEN}
    response = urequests.post(url, headers=headers)
    return_data = response.json()["user_id"]
    response.close()
    return return_data

def get_user_status(user_id):
    global current_status, latest_change
    pin_status_here.value(1)
    pin_status_not_here.value(1)

    print("Getting users...")
    add_to_log("trying to get user data")
    response = urequests.get("https://narvaro.ntig.net/api/get/users")
    print("Getting users", response.status_code)
    users_json = response.json()
    response.close()
    status = False
    latest_change = None
    for user in users_json:
        if user["_id"] == user_id:
            status = user["status"]
            latest_change = user["latest_change_diff"]
            print(f"{user}")
            add_to_log(f"user data retrieved: {user['name']}, status: {user['status']}")

            break

    print(latest_change)
    pin_status_here.value(0)
    pin_status_not_here.value(0)
    return status, latest_change


def set_user_status(status):
    data_to_send = {"status": status}
    print("Setting status...")
    response = urequests.post("https://narvaro.ntig.net/api/user/setstatus", data=json.dumps(data_to_send), headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"})
    print("Setting status", response.status_code)
    response.close()

def button_handler():
    global pin_status_here, pin_status_not_here, here_button_pin, not_here_button_pin, current_status

    any_button_pressed = False

    if not_here_button_pin.value() and not any_button_pressed and current_status == True:
        print("Not here button pressed")
        add_to_log("not here button pressed")
        any_button_pressed = True
        pin_status_not_here.value(1)
        pin_status_here.value(0)
        current_status = False
        set_user_status(current_status)
        return True
    elif here_button_pin.value() and not any_button_pressed and current_status == False:
        print("Here button pressed")
        add_to_log("here button pressed")
        any_button_pressed = True
        pin_status_not_here.value(0)
        pin_status_here.value(1)
        current_status = True
        set_user_status(current_status)
        return True
    else:
        any_button_pressed = False
    return False

def wifi_connect():    
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    toggle_here_led.init(period=blinking_interval_ms, mode=Timer.PERIODIC, callback=lambda t:pin_status_here.value(not pin_status_here.value()))
    toggle_not_here_led.init(period=blinking_interval_ms, mode=Timer.PERIODIC, callback=lambda t:pin_status_not_here.value(not pin_status_not_here.value()))


    max_wait_seconds = 10
    while max_wait_seconds > 0:
        if wlan.status() < network.STAT_IDLE or wlan.status() >= network.STAT_GOT_IP:
            break

        max_wait_seconds -= 1
        time.sleep(1)

    toggle_here_led.deinit()
    toggle_not_here_led.deinit()

    print("Internal adress -> ", wlan.ifconfig())
    
    if wlan.status() == network.STAT_GOT_IP:
        update_time()
        add_to_log("successfully connected to wifi")
    
def update_time():
    try:
        ntptime.settime()
    except:
        add_to_log("failed to update time")
        try_again_in_ms = 60_000
        update_time_timer.init(mode=Timer.ONE_SHOT, callback=lambda t: update_time(), period=try_again_in_ms)
    
def main():
    global current_status
    # Tells us that the device is actually running the script
    main_led = Pin("LED", Pin.OUT)
    main_led.value(1)

    last_fetched = 0
    initial_get = False
    user_id = None
    latest_change_diff = 0 
    is_leds_blinking = False

            
    wlan.disconnect()
        
    # Main loop
    while True:
        
        time.sleep_ms(200)
        try:
                        
            # Checks if the wifi is connected
            if wlan.status() != network.STAT_GOT_IP:
                # Try to connect to wifi
                print("trying to connect")
                add_to_log("trying to connect to wifi")
                wifi_connect()
            else:
                                
                if not initial_get or not user_id:
                    user_id = get_self_user_id()
                    initial_get = True

                # Check if the user status has been updated every 15 minutes
                get_user_status_interval = 900
                if (abs(time.time() - last_fetched)) > get_user_status_interval:
                    last_fetched = time.time()
                    current_status, latest_change_diff = get_user_status(user_id)

                # Handles button presses
                was_pressed = button_handler()
                if was_pressed:
                    latest_change_diff = 0
        
                # Change leds  
                if is_leds_blinking:
                    is_leds_blinking = False
                    toggle_here_led.deinit()
                    toggle_not_here_led.deinit()

                if current_status:
                    pin_status_here.value(1)
                    pin_status_not_here.value(0)
                else:
                    pin_status_here.value(0)
                    pin_status_not_here.value(1)

        except Exception as e:
            print(e)
        
            add_to_log(str(e))
            # If something goes wrong, start alternate blinking leds
            start_time = time.time()
            pin_status_not_here.value(1)
            pin_status_here.value(0)

            toggle_not_here_led.init(period=blinking_interval_ms, mode=Timer.PERIODIC, callback=lambda t:pin_status_not_here.value(not pin_status_not_here.value()))
            toggle_here_led.init(period=blinking_interval_ms, mode=Timer.PERIODIC, callback=lambda t:pin_status_here.value(not pin_status_here.value()))
            
            while time.time() - start_time < 10:
                pass
            reset()
            toggle_not_here_led.deinit()
            toggle_here_led.deinit()


main()


