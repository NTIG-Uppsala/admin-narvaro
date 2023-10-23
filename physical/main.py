from machine import Pin, Timer, reset
import network
import time
import urequests
import json
import ntptime
import gc

available_button = Pin(2, Pin.IN)
not_available_button = Pin(3, Pin.IN)
available_led = Pin(20, Pin.OUT)
not_available_led = Pin(21, Pin.OUT)

button_last_pressed = 0

button_was_pressed_without_wifi = False

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

enable_logs = True

# Real time clock
rtc = machine.RTC()

temperature_pin = 4
sensor_temperature = machine.ADC(temperature_pin)

user_available = False
is_pressed = False

blinking_interval_ms = 500

# Create virtual timers
led_timer = Timer(-1)
update_time_retry_timer = Timer(-1)
get_user_repeat_timer = Timer(-1)


def load_secrets():
    global WIFI_SSID, WIFI_PASSWORD, TOKEN
    secrets_file = open("secrets.json")
    json_string = "".join(secrets_file.readlines())
    secrets_file.close()
    secrets = json.loads(json_string)
    WIFI_SSID = secrets["WIFI_SSID"]
    WIFI_PASSWORD = secrets["WIFI_PASSWORD"]
    TOKEN = secrets["TOKEN"]


def format_time(datetime):
    year = datetime[0]
    month = datetime[1]
    day = datetime[2]
    hour = datetime[4]
    minute = datetime[5]
    second = datetime[6]
    return f"{year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d} UTC"


def add_to_log(message):
    formatted_datetime = format_time(rtc.datetime())
    bytes_per_kibibyte = 1024
    used_ram_kibibytes = gc.mem_alloc() / bytes_per_kibibyte
    total_ram_kibibytes = (gc.mem_free() + gc.mem_alloc()) / bytes_per_kibibyte
    log_message = f"{formatted_datetime}:\n"
    log_message += f"\t{message}\n"
    log_message += f"\tsignal strength: {wlan.status('rssi')} dBm\n"
    log_message += f"\ttemp: {get_temperature_celsius()}°C\n"
    log_message += f"\tRAM usage: {used_ram_kibibytes}/{total_ram_kibibytes} KiB\n"
    print("Logged message:", log_message)
    if enable_logs:
        file = open("log.txt", "a")
        file.write(log_message)
        file.close()


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
    url = "https://narvaro.ntig.net/api/device"
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
        response = urequests.get(
            "https://narvaro.ntig.net/api/get/users", timeout=wait_time_seconds
        )
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
            "https://narvaro.ntig.net/api/user/setstatus",
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

    time.sleep(2)
    add_to_log(f"setting status response: {response.status_code}")
    response.close()


def button_press_interrupt(button_pin):
    global user_available, button_last_pressed, button_was_pressed_without_wifi

    button_cooldown_seconds = 7

    if time.time() < button_last_pressed + button_cooldown_seconds:
        return

    button_last_pressed = time.time()

    if button_pin == available_button:
        available_led.value(1)
        not_available_led.value(0)
        user_available = True
    elif button_pin == not_available_button:
        available_led.value(0)
        not_available_led.value(1)
        user_available = False

    if wlan.status() == network.STAT_GOT_IP:
        set_user_status(user_available)
    else:
        button_was_pressed_without_wifi = True


# Handles interrupts
available_button.irq(trigger=Pin.IRQ_RISING, handler=button_press_interrupt)
not_available_button.irq(trigger=Pin.IRQ_RISING, handler=button_press_interrupt)


def toggle_leds_state():
    available_led.value(not available_led.value())
    not_available_led.value(not not_available_led.value())


def wifi_connect():
    add_to_log("trying to connect to wifi")

    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    max_wait_seconds = 10
    current_wait_seconds = 0
    while current_wait_seconds <= max_wait_seconds and (
        wlan.status() == network.STAT_IDLE or wlan.status() == network.STAT_CONNECTING
    ):
        current_wait_seconds += 1
        time.sleep(1)

    add_to_log(f"internal adress: {wlan.ifconfig()}")

    if wlan.status() == network.STAT_GOT_IP:
        update_time()
        add_to_log("successfully connected to wifi")


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

        # Checks if the wifi is connected
        if wlan.status() != network.STAT_GOT_IP:
            wifi_connect()
        else:
            if not user_id:
                user_id = get_self_user_id()

            # Check if the user status has been updated every 15 minutes
            get_user_status_interval = 900
            if (abs(time.time() - user_data_last_fetched)) > get_user_status_interval:
                user_data_last_fetched = time.time()
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
        # If something goes wrong, start alternate blinking leds
        error_raised_time = time.time()

        while time.time() - error_raised_time < 10:
            pass
        reset()


main()
