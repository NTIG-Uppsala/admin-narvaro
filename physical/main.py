from machine import Pin, Timer, reset
import micropython
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

wlan = network.WLAN(network.STA_IF)
wlan.active(True)

enable_logs = True

# Real time clock
rtc = machine.RTC()

gc.collect()
micropython.mem_info()
temperature_pin = 4
sensor_temperature = machine.ADC(temperature_pin)

current_status = False
is_pressed = False

blinking_interval_ms = 500

# Create virtual timers
led_timer = Timer(-1)
update_time_timer = Timer(-1)


def load_secrets():
    global WIFI_SSID, WIFI_PASSWORD, TOKEN
    secrets_file = open("secrets.json")
    json_string = "".join(secrets_file.readlines())
    secrets = json.loads(json_string)
    WIFI_SSID = secrets["WIFI_SSID"]
    WIFI_PASSWORD = secrets["WIFI_PASSWORD"]
    TOKEN = secrets["TOKEN"]


def add_to_log(message):
    datetime = rtc.datetime()
    year = datetime[0]
    month = datetime[1]
    day = datetime[2]
    hour = datetime[4]
    minute = datetime[5]
    second = datetime[6]
    formatted_datetime = (
        f"{year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{second:02d} UTC"
    )
    bytes_per_kibibyte = 1024
    total_ram_kibibytes = (gc.mem_free() + gc.mem_alloc()) / bytes_per_kibibyte
    used_ram_kibibytes = gc.mem_alloc() / bytes_per_kibibyte
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
    response = urequests.post(url, headers=headers)
    return_data = response.json()["user_id"]
    response.close()
    return return_data


def get_user_status(user_id):
    global current_status

    add_to_log("trying to get user data")
    response = urequests.get("https://narvaro.ntig.net/api/get/users")
    add_to_log(f"getting users response: {response.status_code}")
    users_json = response.json()
    response.close()
    status = False
    for user in users_json:
        if user["_id"] == user_id:
            status = user["status"]
            add_to_log(f"user data retrieved: {user['name']}, status: {user['status']}")

            break
    return status


def set_user_status(status):
    data_to_send = {"status": status}
    add_to_log(f"setting status: {status}")
    response = urequests.post(
        "https://narvaro.ntig.net/api/user/setstatus",
        data=json.dumps(data_to_send),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TOKEN}",
        },
    )
    add_to_log(f"setting status response: {response.status_code}")
    response.close()


def button_handler():
    global available_led, not_available_led, available_button, not_available_button, current_status

    any_button_pressed = False

    if (
        not_available_button.value()
        and not any_button_pressed
        and current_status == True
    ):
        add_to_log("not available button pressed")
        any_button_pressed = True
        not_available_led.value(1)
        available_led.value(0)
        current_status = False
        set_user_status(current_status)
        return True
    elif (
        available_button.value() and not any_button_pressed and current_status == False
    ):
        add_to_log("available button pressed")
        any_button_pressed = True
        not_available_led.value(0)
        available_led.value(1)
        current_status = True
        set_user_status(current_status)
        return True
    else:
        any_button_pressed = False
    return False


def toggle_leds_state():
    available_led.value(not available_led.value())
    not_available_led.value(not not_available_led.value())


def wifi_connect():
    wlan.connect(WIFI_SSID, WIFI_PASSWORD)

    def set_leds_state(state):
        available_led.value(state)
        not_available_led.value(state)

    set_leds_state(0)
    led_timer.init(
        period=blinking_interval_ms,
        mode=Timer.PERIODIC,
        callback=lambda t: toggle_leds_state(),
    )

    max_wait_seconds = 10
    while max_wait_seconds > 0:
        if wlan.status() < network.STAT_IDLE or wlan.status() >= network.STAT_GOT_IP:
            break

        max_wait_seconds -= 1
        time.sleep(1)

    led_timer.deinit()

    add_to_log(f"internal adress: {wlan.ifconfig()}")

    if wlan.status() == network.STAT_GOT_IP:
        update_time()
        add_to_log("successfully connected to wifi")


def update_time():
    try:
        ntptime.settime()
    except:
        add_to_log("failed to update time")
        try_again_in_ms = 60_000
        update_time_timer.init(
            mode=Timer.ONE_SHOT,
            callback=lambda t: update_time(),
            period=try_again_in_ms,
        )


def main():
    global current_status
    # Tells us that the device is actually running the script
    main_led = Pin("LED", Pin.OUT)
    main_led.value(1)

    last_fetched = 0
    initial_get = False
    user_id = None

    load_secrets()

    wlan.disconnect()

    # Main loop
    while True:
        time.sleep_ms(200)
        try:
            # Checks if the wifi is connected
            if wlan.status() != network.STAT_GOT_IP:
                # Try to connect to wifi
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
                    current_status = get_user_status(user_id)

                button_handler()

                # Change leds
                if current_status:
                    available_led.value(1)
                    not_available_led.value(0)
                else:
                    available_led.value(0)
                    not_available_led.value(1)

        except Exception as e:
            add_to_log(str(e))
            # If something goes wrong, start alternate blinking leds
            start_time = time.time()
            not_available_led.value(1)
            available_led.value(0)

            led_timer.init(
                period=blinking_interval_ms,
                mode=Timer.PERIODIC,
                callback=lambda t: toggle_leds_state(),
            )

            while time.time() - start_time < 10:
                pass
            reset()
            led_timer.deinit()


main()
