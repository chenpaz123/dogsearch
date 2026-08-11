"""
RexiChip - Raspberry Pi Bluetooth Scanner
==========================================

A Raspberry Pi application that:
1. Creates a WiFi hotspot for initial setup
2. Provides a web interface to configure WiFi credentials
3. Reads chip numbers from a Bluetooth RFID scanner
4. Sends chip data to Firebase Realtime Database

Author: RexiChip Team
Version: 2.0.0
"""

import subprocess
import threading
import time
import re
import logging
from typing import Optional, List
import bluetooth
import serial
import termios
from flask import Flask, render_template, request, redirect, flash, jsonify
import firebase_admin
from firebase_admin import credentials, db

from config import Config

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scanner.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = Config.FLASK_SECRET_KEY

# Global state
_bluetooth_thread: Optional[threading.Thread] = None
_shutdown_event = threading.Event()


def _run_command(command: List[str]) -> bool:
    """
    Execute a system command safely.
    
    Args:
        command: List of command arguments
        
    Returns:
        True if successful, False otherwise
    """
    try:
        subprocess.run(command, check=True, capture_output=True, text=True)
        logger.debug(f"Command succeeded: {' '.join(command)}")
        return True
    except subprocess.CalledProcessError as exc:
        logger.error(f"Command failed: {exc.cmd} -> {exc.returncode}")
        logger.error(f"Error output: {exc.stderr}")
        return False


def execute_commands(commands: List[List[str]]) -> bool:
    """
    Execute multiple system commands.
    
    Args:
        commands: List of command lists
        
    Returns:
        True if all commands succeeded, False otherwise
    """
    for command in commands:
        if not _run_command(command):
            return False
    return True


def create_hotspot() -> bool:
    """
    Create a WiFi hotspot for initial configuration.
    
    Returns:
        True if hotspot created successfully, False otherwise
    """
    logger.info("Creating WiFi hotspot...")
    commands = [
        ["sudo", "systemctl", "stop", "NetworkManager"],
        ["sudo", "systemctl", "stop", "dnsmasq"],
        ["sudo", "systemctl", "stop", "hostapd"],
        ["sudo", "ifconfig", "wlan0", "down"],
        ["sudo", "iwconfig", "wlan0", "mode", "ad-hoc", "essid", Config.HOTSPOT_SSID, "channel", "1"],
        ["sudo", "ifconfig", "wlan0", "up", Config.HOTSPOT_IP, "netmask", "255.255.255.0"],
        ["sudo", "systemctl", "start", "dnsmasq"],
        ["sudo", "systemctl", "start", "hostapd"]
    ]
    
    if execute_commands(commands):
        logger.info(f"Hotspot '{Config.HOTSPOT_SSID}' created successfully at {Config.HOTSPOT_IP}")
        return True
    else:
        logger.error("Failed to create hotspot")
        return False


def connect_to_wifi(ssid: str, password: str) -> bool:
    """
    Connect to a WiFi network.
    
    Args:
        ssid: WiFi network name
        password: WiFi password
        
    Returns:
        True if connected successfully, False otherwise
    """
    if not ssid or not password:
        logger.warning("SSID or password is empty")
        return False

    logger.info(f"Attempting to connect to WiFi: {ssid}")
    
    if not execute_commands([
        ["sudo", "nmcli", "dev", "wifi", "connect", ssid, "password", password],
        ["sudo", "systemctl", "start", "NetworkManager"]
    ]):
        logger.error("Failed to execute WiFi connection commands")
        return False

    # Wait for internet connection (max 30 seconds)
    max_retries = 6
    for attempt in range(max_retries):
        try:
            subprocess.run(
                ["ping", "-c", "1", "8.8.8.8"],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                timeout=5
            )
            logger.info("Successfully connected to WiFi and internet")
            break
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            if attempt < max_retries - 1:
                logger.warning(f"Connection attempt {attempt + 1} failed. Retrying...")
                time.sleep(5)
            else:
                logger.error("Failed to establish internet connection")
                return False

    # Disable hotspot
    commands = [
        ["sudo", "systemctl", "stop", "dnsmasq"],
        ["sudo", "systemctl", "stop", "hostapd"],
        ["sudo", "ifconfig", "wlan0", "down"],
        ["sudo", "iwconfig", "wlan0", "mode", "managed"],
        ["sudo", "ifconfig", "wlan0", "up"],
        ["sudo", "systemctl", "start", "NetworkManager"]
    ]

    if not execute_commands(commands):
        logger.warning("Failed to cleanly disable hotspot")

    # Start Bluetooth scanning thread
    start_bluetooth_thread()
    
    return True


def start_bluetooth_thread() -> None:
    """Start the Bluetooth scanning thread if not already running."""
    global _bluetooth_thread
    
    if _bluetooth_thread is None or not _bluetooth_thread.is_alive():
        _bluetooth_thread = threading.Thread(target=read_bluetooth_data, daemon=True)
        _bluetooth_thread.start()
        logger.info("Bluetooth scanning thread started")


def initialize_firebase() -> bool:
    """
    Initialize Firebase connection.
    
    Returns:
        True if initialized successfully, False otherwise
    """
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(Config.FIREBASE_KEY_PATH)
            firebase_admin.initialize_app(cred, {
                'databaseURL': Config.FIREBASE_DATABASE_URL
            })
            logger.info("Firebase initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        return False


def read_bluetooth_data() -> None:
    """
    Continuously scan for Bluetooth RFID scanner and read chip numbers.
    Writes chip numbers to Firebase Realtime Database.
    """
    target_name = Config.BLUETOOTH_DEVICE_NAME
    logger.info(f"Starting Bluetooth scanner for device: {target_name}")

    def connect_to_device(target_address: str) -> Optional[serial.Serial]:
        """Connect to Bluetooth serial device."""
        retry_count = 0
        max_retries = 3
        
        while retry_count < max_retries and not _shutdown_event.is_set():
            try:
                _run_command(["sudo", "rfcomm", "bind", "0", target_address])
                port = serial.Serial("/dev/rfcomm0", baudrate=Config.BLUETOOTH_BAUDRATE, timeout=1)
                logger.info("Bluetooth device connected!")
                return port
            except serial.serialutil.SerialException as e:
                retry_count += 1
                logger.warning(f"Connection attempt {retry_count} failed: {e}")
                time.sleep(2)
        
        logger.error("Failed to connect to Bluetooth device after retries")
        return None

    while not _shutdown_event.is_set():
        try:
            # Discover nearby Bluetooth devices
            logger.info("Scanning for Bluetooth devices...")
            nearby_devices = bluetooth.discover_devices(duration=Config.BLUETOOTH_SCAN_DURATION)
            target_address = None

            for bdaddr in nearby_devices:
                try:
                    device_name = bluetooth.lookup_name(bdaddr, timeout=5)
                    if device_name == target_name:
                        target_address = bdaddr
                        logger.info(f"Found target device: {target_name} ({target_address})")
                        break
                except Exception as e:
                    logger.debug(f"Error looking up device {bdaddr}: {e}")
                    continue

            if target_address is None:
                logger.warning(f"Target device '{target_name}' not found. Retrying in 5s...")
                time.sleep(5)
                continue

            port = connect_to_device(target_address)
            if port is None:
                continue

            # Read data from Bluetooth device
            while not _shutdown_event.is_set():
                try:
                    data = port.readline()
                    if not data:
                        continue
                        
                    chip_data = data.decode("utf-8").strip()
                    logger.info(f"Received data: {chip_data}")

                    # Validate chip number (15 digits)
                    if re.match(r'^\d{15}$', chip_data):
                        chip_num = int(chip_data)
                        
                        # Write to Firebase
                        try:
                            db.reference('/chip').set(chip_num)
                            logger.info(f"Chip {chip_num} saved to Firebase")
                        except Exception as e:
                            logger.error(f"Failed to write to Firebase: {e}")
                    else:
                        logger.warning(f"Invalid chip format: {chip_data}")

                except UnicodeDecodeError as e:
                    logger.warning(f"Failed to decode data: {e}")
                except termios.error:
                    logger.warning("No chip detected")
                    db.reference('/chip').set(0)
                except serial.serialutil.SerialException:
                    logger.warning("Bluetooth device disconnected")
                    break

        except Exception as e:
            logger.error(f"Bluetooth scanning error: {e}")
            time.sleep(5)


# Flask Routes
@app.route('/', methods=['GET', 'POST'])
def wifi_form():
    """Web interface for WiFi configuration."""
    if request.method == 'POST':
        ssid = request.form.get('ssid', '').strip()
        password = request.form.get('password', '').strip()
        
        if not ssid:
            flash('SSID is required', 'error')
            return render_template('wifi_form.html')
        
        # Connect to WiFi in a background thread to avoid blocking
        threading.Thread(target=connect_to_wifi, args=(ssid, password), daemon=True).start()
        flash(f'Connecting to {ssid}...', 'info')
        return render_template('connecting.html', ssid=ssid)
    
    return render_template('wifi_form.html')


@app.route('/status')
def status():
    """Get current system status."""
    return jsonify({
        'hotspot_ssid': Config.HOTSPOT_SSID,
        'bluetooth_scanning': _bluetooth_thread is not None and _bluetooth_thread.is_alive(),
        'firebase_connected': firebase_admin._apps is not None and len(firebase_admin._apps) > 0
    })


@app.route('/stop', methods=['POST'])
def stop_server():
    """Gracefully shutdown the server."""
    logger.info("Shutdown requested")
    _shutdown_event.set()
    flash('Server shutting down...', 'info')
    
    # Shutdown Flask
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    
    return 'Server shutting down...'


def main():
    """Main entry point."""
    logger.info("=== RexiChip Raspberry Pi Scanner Starting ===")
    
    # Initialize Firebase
    if not initialize_firebase():
        logger.critical("Failed to initialize Firebase. Exiting.")
        return
    
    # Create hotspot for initial setup
    if not create_hotspot():
        logger.critical("Failed to create hotspot. Exiting.")
        return
    
    logger.info(f"Web interface available at http://{Config.HOTSPOT_IP}:{Config.FLASK_PORT}")
    
    # Start Flask server
    try:
        app.run(
            host='0.0.0.0',
            port=Config.FLASK_PORT,
            debug=False,
            use_reloader=False
        )
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        _shutdown_event.set()
        logger.info("=== RexiChip Raspberry Pi Scanner Stopped ===")


if __name__ == '__main__':
    main()
