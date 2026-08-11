"""
Configuration settings for RexiChip Raspberry Pi Scanner.
Load settings from environment variables with sensible defaults.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Application configuration."""
    
    # Flask Configuration
    FLASK_SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'change-me-in-production')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 8000))
    
    # Hotspot Configuration
    HOTSPOT_SSID = os.getenv('HOTSPOT_SSID', 'RexiChip-Setup')
    HOTSPOT_IP = os.getenv('HOTSPOT_IP', '192.168.1.1')
    
    # Bluetooth Configuration
    BLUETOOTH_DEVICE_NAME = os.getenv('BLUETOOTH_DEVICE_NAME', 'SPP-180')
    BLUETOOTH_BAUDRATE = int(os.getenv('BLUETOOTH_BAUDRATE', 9600))
    BLUETOOTH_SCAN_DURATION = int(os.getenv('BLUETOOTH_SCAN_DURATION', 8))
    
    # Firebase Configuration
    FIREBASE_KEY_PATH = os.getenv('FIREBASE_KEY_PATH', './private-key.json')
    FIREBASE_DATABASE_URL = os.getenv(
        'FIREBASE_DATABASE_URL',
        'https://dog-search-17ece-default-rtdb.europe-west1.firebasedatabase.app'
    )
    
    @classmethod
    def validate(cls):
        """Validate critical configuration."""
        errors = []
        
        if cls.FLASK_SECRET_KEY == 'change-me-in-production':
            errors.append("FLASK_SECRET_KEY must be changed for production")
        
        if not os.path.exists(cls.FIREBASE_KEY_PATH):
            errors.append(f"Firebase key not found: {cls.FIREBASE_KEY_PATH}")
        
        if errors:
            raise ValueError("Configuration errors:\n" + "\n".join(f"  - {e}" for e in errors))
