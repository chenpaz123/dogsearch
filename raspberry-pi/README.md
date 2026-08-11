# RexiChip - Raspberry Pi Bluetooth Scanner

A Raspberry Pi application that scans chip numbers from a Bluetooth RFID reader and sends them to Firebase Realtime Database for processing by the main RexiChip application.

## Features

- 📡 **WiFi Hotspot** - Creates a hotspot for initial configuration
- 🌐 **Web Interface** - Easy WiFi setup via browser
- 📲 **Bluetooth Scanning** - Reads 15-digit chip numbers from SPP-180 scanner
- 🔥 **Firebase Integration** - Sends chip data to Firebase in real-time
- 📝 **Logging** - Comprehensive logging for debugging
- 🔒 **Security** - Environment-based configuration

## Hardware Requirements

- **Raspberry Pi** (3/4/Zero W recommended)
- **Bluetooth RFID Scanner** (SPP-180 or compatible)
- **MicroSD Card** (8GB+ recommended)
- **Power Supply** (5V/2.5A minimum)

## Software Requirements

- **Raspberry Pi OS** (Bullseye or newer)
- **Python 3.8+**
- **Bluetooth support** enabled

## Installation

### 1. Prepare Raspberry Pi

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install system dependencies
sudo apt install -y python3-pip python3-dev bluetooth libbluetooth-dev hostapd dnsmasq
```

### 2. Clone & Install

```bash
# Copy the raspberry-pi folder to your Pi
cd ~
# (Transfer the folder via scp, USB, or git clone)

cd raspberry-pi

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

**Important**: Update the following in `.env`:

- `FLASK_SECRET_KEY` - Change to a random secret key
- `FIREBASE_DATABASE_URL` - Your Firebase database URL
- `BLUETOOTH_DEVICE_NAME` - Your scanner's Bluetooth name (if different)

### 4. Add Firebase Service Account Key

1. Download your Firebase service account key from Firebase Console
2. Save it as `private-key.json` in the `raspberry-pi/` directory
3. Ensure correct permissions: `chmod 600 private-key.json`

### 5. Configure Bluetooth

```bash
# Enable Bluetooth
sudo systemctl enable bluetooth
sudo systemctl start bluetooth

# Pair your RFID scanner (if required)
bluetoothctl
# > scan on
# > pair XX:XX:XX:XX:XX:XX  (your scanner's MAC address)
# > trust XX:XX:XX:XX:XX:XX
# > exit
```

## Usage

### Manual Start

```bash
cd ~/raspberry-pi
source venv/bin/activate
sudo python scanner.py
```

The scanner will:

1. Create a WiFi hotspot named `RexiChip-Setup`
2. Start a web server at `http://192.168.1.1:8000`
3. Wait for WiFi configuration

### Configure WiFi

1. Connect to the `RexiChip-Setup` WiFi hotspot from your phone/laptop
2. Open browser and go to `http://192.168.1.1:8000`
3. Enter your WiFi credentials
4. The Pi will connect to WiFi and start scanning

### Auto-Start on Boot

Create a systemd service:

```bash
sudo nano /etc/systemd/system/rexichip-scanner.service
```

```ini
[Unit]
Description=RexiChip Bluetooth Scanner
After=network.target bluetooth.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/raspberry-pi
Environment="PATH=/home/pi/raspberry-pi/venv/bin"
ExecStart=/home/pi/raspberry-pi/venv/bin/python scanner.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rexichip-scanner
sudo systemctl start rexichip-scanner

# Check status
sudo systemctl status rexichip-scanner

# View logs
sudo journalctl -u rexichip-scanner -f
```

## How It Works

### Data Flow

```
RFID Scanner (Bluetooth)
        ↓
 Raspberry Pi (scanner.py)
        ↓
 Firebase Realtime Database (/chip)
        ↓
 Node.js App (dog-details.js)
        ↓
 Display Dog Information
```

### Chip Number Validation

- Only 15-digit numbers are accepted
- Written to Firebase at `/chip` path
- The Node.js app listens for changes and processes the chip

## Troubleshooting

### Scanner Not Connecting

```bash
# Check Bluetooth status
sudo systemctl status bluetooth
hcitool scan

# Check logs
tail -f scanner.log
```

### WiFi Hotspot Not Working

```bash
# Check hostapd
sudo systemctl status hostapd

# Check dnsmasq
sudo systemctl status dnsmasq

# Restart services
sudo systemctl restart hostapd dnsmasq
```

### Firebase Connection Issues

- Verify `private-key.json` exists and has correct permissions
- Check `FIREBASE_DATABASE_URL` in `.env`
- Ensure internet connectivity: `ping 8.8.8.8`

### Bluetooth Pairing Issues

```bash
# Restart Bluetooth
sudo systemctl restart bluetooth

# Remove old pairing
bluetoothctl
# > remove XX:XX:XX:XX:XX:XX
# > scan on
# > pair XX:XX:XX:XX:XX:XX
```

## Configuration Options

See `.env.example` for all available options:

| Variable                | Default        | Description                |
| ----------------------- | -------------- | -------------------------- |
| `FLASK_PORT`            | 8000           | Web interface port         |
| `HOTSPOT_SSID`          | RexiChip-Setup | Hotspot name               |
| `HOTSPOT_IP`            | 192.168.1.1    | Hotspot IP address         |
| `BLUETOOTH_DEVICE_NAME` | SPP-180        | Scanner Bluetooth name     |
| `BLUETOOTH_BAUDRATE`    | 9600           | Serial communication speed |

## Maintenance

### View Logs

```bash
# Application logs
tail -f ~/raspberry-pi/scanner.log

# System logs
sudo journalctl -u rexichip-scanner -f
```

### Update Software

```bash
cd ~/raspberry-pi
source venv/bin/activate
git pull  # if using git
pip install -r requirements.txt --upgrade
sudo systemctl restart rexichip-scanner
```

## Security Notes

- Change `FLASK_SECRET_KEY` to a random value
- Keep `private-key.json` secure (never commit to git)
- Consider adding authentication to the web interface for production
- Use WPA2 encryption for the hotspot (configure in hostapd.conf)

## License

Part of the RexiChip Dog Show Management System
