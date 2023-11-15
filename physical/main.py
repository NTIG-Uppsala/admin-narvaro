from machine import Pin, Timer, reset
import network
import time
import urequests
import json
import ntptime
import gc
import os

available_button = Pin(2, Pin.IN)
not_available_button = Pin(3, Pin.IN)
available_led = Pin(20, Pin.OUT)
not_available_led = Pin(21, Pin.OUT)

temperature_pin = 4
sensor_temperature = machine.ADC(temperature_pin)

button_last_pressed_seconds = 0

button_was_pressed_without_wifi = False

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

enable_logs = True

backup_wifi_in_use = False
set_try_wifi = 0

# Real time clock
rtc = machine.RTC()


user_available = False
is_pressed = False

# Create virtual timers
# -1 makes the timer virtual
led_timer = Timer(-1)
update_time_retry_timer = Timer(-1)
get_user_repeat_timer = Timer(-1)


def load_secrets():
    global WIFI_SSID, WIFI_PASSWORD, TOKEN, URL
    secrets_file = open("secrets.json")
    json_string = "".join(secrets_file.readlines())
    secrets_file.close()
    secrets = json.loads(json_string)
    TOKEN = secrets["TOKEN"]
    URL = secrets["URL"]
    if backup_wifi_in_use == True and "WIFI_SSID_BACKUP" in secrets:
        WIFI_SSID = secrets["WIFI_SSID_BACKUP"]
        WIFI_PASSWORD = secrets["WIFI_PASSWORD_BACKUP"]

    else:
        WIFI_SSID = secrets["WIFI_SSID"]
        WIFI_PASSWORD = secrets["WIFI_PASSWORD"]


def format_time(datetime):
    year = datetime[0]
    month = datetime[1]
    day = datetime[2]
    hour = datetime[4]
    minute = datetime[5]
    second = datetime[6]
    return f"{year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d} UTC"


def add_to_log(message):
    # Check if log file is too big
    if os.stat("log.txt")[6] > 80000:
        remove_first_n_lines("log.txt", 5)
        print("First 5 lines removed from log.txt")

    formatted_datetime = format_time(rtc.datetime())
    bytes_per_kibibyte = 1024
    used_ram_kibibytes = gc.mem_alloc() / bytes_per_kibibyte
    total_ram_kibibytes = (gc.mem_free() + gc.mem_alloc()) / bytes_per_kibibyte
    used_ram_in_procent = used_ram_kibibytes / total_ram_kibibytes * 100
    log_message = f"{formatted_datetime}:\n"
    log_message += f"\t{message}\n"
    log_message += f"\tRSSI: {wlan.status('rssi')} dBm\n"
    log_message += f"\ttemp: {get_temperature_celsius():.1f}°C\n"
    log_message += f"\tRAM usage: {used_ram_in_procent:.1f}%\n"
    print("Logged message:", log_message)
    if enable_logs:
        file = open("log.txt", "a")
        file.write(log_message)
        file.close()


def remove_first_n_lines(file_path, n):
    with open(file_path, "r") as file:
        lines = file.readlines()
    with open(file_path, "w") as file:
        for line in lines[n:]:
            file.write(line)


def get_temperature_celsius():
    # RP2040 datasheet 4.9.5. Temperature Sensor
    max_voltage = 3.3
    conversion_factor = max_voltage / (65535)
    # voltage of base emitter
    voltage = 0.706
    voltage_slope = 0.001721
    reading = sensor_temperature.read_u16() * conversion_factor
    degrees_celsius = 27 - (reading - voltage) / voltage_slope
    return degrees_celsius


def get_self_user_id():
    url = URL + "/api/device"
    headers = {"Authorization": "Bearer " + TOKEN}
    add_to_log("trying to get user_id")
    try:
        wait_time_seconds = 15
        response = urequests.post(url, headers=headers, timeout=wait_time_seconds)
    except Exception as error:
        add_to_log(f"failed to get user_id trying again, {error}")
        get_self_user_id()
    add_to_log(f"getting user_id response: {response.status_code}")
    return_data = response.json()["user_id"]
    response.close()
    return return_data


def get_user_status(user_id):
    global button_was_pressed_without_wifi

    add_to_log("trying to get user data")
    try:
        wait_time_seconds = 10
        response = urequests.get(URL + "/api/get/users", timeout=wait_time_seconds)
    except Exception as error:
        add_to_log(f"failed to get user trying again, exception: {error}")
        get_user_status(user_id)

    add_to_log(f"getting users response: {response.status_code}")
    users_json = response.json()
    response.close()
    status = False
    for user in users_json:
        if user["_id"] == user_id:
            if button_was_pressed_without_wifi:
                status = user_available
                button_was_pressed_without_wifi = False
            else:
                status = user["status"]
            add_to_log(f"user data retrieved: {user['name']}, status: {user['status']}")
            break
    return status


def set_user_status(status):
    data_to_send = {"status": status}
    add_to_log(f"setting status: {status}")
    try:
        wait_time_seconds = 15
        response = urequests.post(
            URL + "/api/user/setstatus",
            data=json.dumps(data_to_send),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {TOKEN}",
            },
            timeout=wait_time_seconds,
        )
    except Exception as error:
        add_to_log(f"failed to get user trying again, exception: {error}")
        set_user_status(status)

    add_to_log(f"setting status response: {response.status_code}")
    response.close()


def button_press_interrupt(button_pin):
    global user_available, button_last_pressed_seconds, button_was_pressed_without_wifi

    # This function is only used in "button_press_interrupt"
    def set_status_if_connected():
        global user_available, button_was_pressed_without_wifi
        if wlan.status() == network.STAT_GOT_IP:
            set_user_status(user_available)
        else:
            button_was_pressed_without_wifi = True

    # Prevents the button from being pressed too often
    button_cooldown_seconds = 7

    if time.time() < button_last_pressed_seconds + button_cooldown_seconds:
        return

    button_last_pressed_seconds = time.time()
    # Checks if the button is already pressed
    if button_pin == available_button and available_led.value() == 0:
        add_to_log("available button pressed")
        available_led.value(1)
        not_available_led.value(0)
        user_available = True
        set_status_if_connected()
    elif button_pin == not_available_button and not_available_led.value() == 0:
        add_to_log("not available button pressed")
        available_led.value(0)
        not_available_led.value(1)
        user_available = False
        set_status_if_connected()


# Handles interrupts
available_button.irq(trigger=Pin.IRQ_RISING, handler=button_press_interrupt)
not_available_button.irq(trigger=Pin.IRQ_RISING, handler=button_press_interrupt)


def wait_for_wifi(wlan, max_wait_seconds):
    current_wait_seconds = 0

    while current_wait_seconds <= max_wait_seconds and (
        wlan.status() == network.STAT_IDLE or wlan.status() == network.STAT_CONNECTING
    ):
        current_wait_seconds += 1
        time.sleep(1)

    return wlan.status() == network.STAT_GOT_IP


def wifi_connect():
    global set_try_wifi
    add_to_log(f"trying to connect to wifi, {WIFI_SSID}")

    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    if wait_for_wifi(wlan, max_wait_seconds=10):
        add_to_log(f"Internal address: {wlan.ifconfig()}")
        update_time()
        add_to_log("Successfully connected to WiFi")
    elif set_try_wifi == 5:
        print(set_try_wifi)
        global backup_wifi_in_use
        backup_wifi_in_use = not backup_wifi_in_use
        set_try_wifi = 0

        load_secrets()
        add_to_log(f"Failed to connect to WiFi, changing wifi to {WIFI_SSID}")
    else:
        set_try_wifi += 1
        add_to_log("Failed to connect to Wifi, trying again")


def update_time():
    try:
        ntptime.settime()
    except:
        add_to_log("failed to update time")
        try_again_ms = 60_000
        update_time_retry_timer.init(
            mode=Timer.ONE_SHOT,
            callback=lambda t: update_time(),
            period=try_again_ms,
        )


def main_loop():
    global user_available

    user_data_last_fetched = 0
    user_id = None

    while True:
        time.sleep_ms(200)

        if wlan.status() != network.STAT_GOT_IP:
            wifi_connect()
        else:
            if not user_id:
                user_id = get_self_user_id()

            # Check if the user status has been updated every 15 minutes
            get_user_status_interval = 900
            if (abs(time.time() - user_data_last_fetched)) > get_user_status_interval:
                user_data_last_fetched = time.time()
                # Fetching user status if it was uppdated on the website or if the button was pressed without wifi
                user_available = get_user_status(user_id)
                set_user_status(user_available)

            # Change leds
            if user_available:
                available_led.value(1)
                not_available_led.value(0)
            else:
                available_led.value(0)
                not_available_led.value(1)


def main():
    # Tells us that the device is actually running the script
    main_led = Pin("LED", Pin.OUT)
    main_led.value(1)

    load_secrets()

    wlan.disconnect()

    try:
        main_loop()
    except Exception as e:
        add_to_log("error: " + str(e))
        error_raised_time = time.time()

        while time.time() - error_raised_time < 10:
            pass
        reset()


main()
