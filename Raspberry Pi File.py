import os
import bluetooth
import serial
import termios
import time
import re
from flask import Flask, render_template, request, redirect
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('./private-key.json')

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://dog-search-17ece-default-rtdb.europe-west1.firebasedatabase.app'
})

# Function to execute a list of shell commands


def execute_commands(commands):
    for command in commands:
        os.system(command)

# Function to create a hotspot using the Raspberry Pi's Wi-Fi interface (wlan0)


def create_hotspot():
    # (Commands to create and configure the hotspot)
    commands = [
        "sudo systemctl stop NetworkManager",
        "sudo systemctl stop dnsmasq",
        "sudo systemctl stop hostapd",
        "sudo ifconfig wlan0 down",
        "sudo iwconfig wlan0 mode ad-hoc essid myhotspot channel 1",
        "sudo ifconfig wlan0 up 192.168.1.1 netmask 255.255.255.0",
        "sudo systemctl start dnsmasq",
        "sudo systemctl start hostapd"
    ]
    execute_commands(commands)

# Function to connect the Raspberry Pi to a Wi-Fi network and stop the hotspot


def connect_to_wifi(ssid, password):
    # (Commands to connect to Wi-Fi and configure network settings)
    commands = [
        f"sudo nmcli dev wifi connect {ssid} password {password}"
    ]
    execute_commands(commands)
    os.system("sudo systemctl start NetworkManager")
    # (Code to wait for a successful connection)
    while True:
        result = os.system("ping -c 1 8.8.8.8")
        if result == 0:
            print("Connected to wifi")
            break
        else:
            print("Not connected to wifi. Retrying...")
            time.sleep(5)
    # (Commands to stop hotspot-related services and switch to managed Wi-Fi mode)
    commands = [
        "sudo systemctl stop dnsmasq",
        "sudo systemctl stop hostapd",
        "sudo systemctl stop flask-server",
        "sudo ifconfig wlan0 down",
        "sudo iwconfig wlan0 mode managed",
        "sudo ifconfig wlan0 up",
        "sudo systemctl start NetworkManager"
    ]

    execute_commands(commands)
    read_bluetooth_data()


# Flask web app for receiving Wi-Fi credentials
app = Flask(__name__)

# Route to handle Wi-Fi form submission


@app.route('/', methods=['GET', 'POST'])
def wifi_form():
    if request.method == 'POST':
        ssid = request.form['ssid']
        password = request.form['password']
        connect_to_wifi(ssid, password)
        return redirect('/stop', code=307)
    return render_template('wifi_form.html')
# Search for the Bluetooth device and read data from it

# Function to read Bluetooth data from a specific device and update the Firebase database


def read_bluetooth_data():
    # Define the target Bluetooth device name
    target_name = "SPP-180"
    print("Start Bluetooth")

    # Function to connect to the Bluetooth device given its address
    def connect_to_device(target_address):
        # Keep trying to connect until successful
        while True:
            try:
                # Bind the Bluetooth device to a communication channel
                os.system(f"sudo rfcomm bind 0 {target_address}")
                # Create a serial connection to the Bluetooth device
                port = serial.Serial("/dev/rfcomm0", baudrate=9600)
                print("Bluetooth device connected!")
                return port
            except serial.serialutil.SerialException:
                # If connection fails, wait and try again
                print("Bluetooth device disconnected. Waiting for reconnection...")
                time.sleep(1)

    # Main loop to discover and connect to the Bluetooth device
    while True:
        # Discover nearby Bluetooth devices
        nearby_devices = bluetooth.discover_devices()
        target_address = None

        # Check if the target device is in the list of discovered devices
        for bdaddr in nearby_devices:
            if target_name == bluetooth.lookup_name(bdaddr):
                target_address = bdaddr
                break

        # If the target device is not found, wait and retry
        if target_address is None:
            print("Target Bluetooth device not found.")
            time.sleep(1)
            continue

        print("Found target Bluetooth device with address:", target_address)

        # Connect to the Bluetooth device
        port = connect_to_device(target_address)

        # Loop to read data from the Bluetooth device
        while True:
            try:
                # Read a line of data from the Bluetooth device
                data = port.readline()
                newdata = data.decode("utf-8").strip()
                print("Received data:", newdata)

                # Check if the received data is a 15-digit integer
                if re.match(r'^\d{15}$', newdata):
                    chip_num = int(newdata)
                    # Save the chip number to Firebase
                    db.reference('/chip').set(chip_num)
                    print("Saved data to Firebase")
                else:
                    print("Received data is not a 15-digit integer")

            except ValueError:
                print("Cannot convert data to an integer")
            except termios.error:
                print("No chip found")
                db.child("/chip").set("No chip found")
            except serial.serialutil.SerialException:
                # If the Bluetooth device disconnects, try to reconnect
                print("Bluetooth device disconnected.")
                port = connect_to_device(target_address)


# Main script execution
if __name__ == '__main__':
    create_hotspot()
    app.run(host='0.0.0.0', port=8000)
