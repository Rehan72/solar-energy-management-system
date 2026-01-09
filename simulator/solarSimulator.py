#!/usr/bin/env python3
"""
Solar Energy Management System (SEMS) - Advanced Simulator (Python Version)

This simulator acts exactly like a real ESP32 solar device and sends
realistic data to your backend following day/night cycles and fault injection.

Features:
- Realistic solar intensity curve (bell curve based on time of day)
- Fault simulation (zero voltage, spikes, random drops)
- Multi-device support (100+ virtual devices)
- Real-time data streaming to backend

Usage:
    python solarSimulator.py
    
For multi-plant mode:
    python solarSimulator.py --multi

Requirements:
    pip install requests
"""

import time
import random
import requests
import argparse
import sys
from datetime import datetime
from typing import Dict, List, Optional
import os

# ============================================
# CONFIGURATION
# ============================================

class Config:
    """Configuration class for the solar simulator"""
    
    # Backend configuration
    SERVER_URL: str = os.environ.get('SERVER_URL', 'http://localhost:8080')
    ENDPOINT: str = '/iot/data'
    
    # Simulation settings
    INTERVAL_MS: int = int(os.environ.get('INTERVAL_MS', 5000))
    DEVICE_COUNT: int = int(os.environ.get('DEVICE_COUNT', 1))
    
    # Solar parameters
    SUNRISE_HOUR: int = 6
    SUNSET_HOUR: int = 18
    PEAK_HOUR: int = 12
    MAX_SOLAR_POWER: float = 5000.0
    
    # Fault simulation settings
    ENABLE_FAULTS: bool = True
    FAULT_RATE: float = 0.05
    
    # Multi-plant mode
    MULTI_PLANT_MODE: bool = False
    PLANTS_PER_DEVICE: int = 5
    
    # Debug mode
    DEBUG: bool = os.environ.get('DEBUG', '').lower() == 'true'


# ============================================
# DEVICE GENERATION
# ============================================

LOCATIONS = [
    {'city': 'Delhi', 'lat': 28.6139, 'lng': 77.2090},
    {'city': 'Mumbai', 'lat': 19.0760, 'lng': 72.8777},
    {'city': 'Bangalore', 'lat': 12.9716, 'lng': 77.5946},
    {'city': 'Chennai', 'lat': 13.0827, 'lng': 80.2707},
    {'city': 'Kolkata', 'lat': 22.5726, 'lng': 88.3639},
    {'city': 'Hyderabad', 'lat': 17.3850, 'lng': 78.4867},
    {'city': 'Pune', 'lat': 18.5204, 'lng': 73.8567},
    {'city': 'Ahmedabad', 'lat': 23.0225, 'lng': 72.5714},
]


def generate_device(index: int) -> Dict:
    """Generate a virtual device with unique ID and API key"""
    device_id = f"SIM-{str(index + 1).zfill(3)}"
    return {
        'deviceId': device_id,
        'apiKey': f"sim_api_key_{device_id}_{int(time.time())}_{index}",
        'plantId': f"PLANT-{index // Config.PLANTS_PER_DEVICE + 1}",
        'name': f"Simulated Device {index + 1}",
        'location': LOCATIONS[index % len(LOCATIONS)],
    }


def generate_devices(count: int) -> List[Dict]:
    """Generate multiple virtual devices"""
    return [generate_device(i) for i in range(count)]


# ============================================
# SOLAR INTENSITY CALCULATION
# ============================================

def calculate_solar_intensity(hour: float) -> float:
    """
    Calculate solar intensity based on time of day
    Returns a value between 0 and 1 representing solar intensity
    
    Uses a bell curve (Gaussian) based on sunrise, peak, and sunset times
    """
    # Night time - no solar generation
    if hour < Config.SUNRISE_HOUR or hour >= Config.SUNSET_HOUR:
        return 0.0
    
    # Calculate the spread of the bell curve
    std_dev = (Config.SUNSET_HOUR - Config.SUNRISE_HOUR) / 4
    
    # Gaussian function for bell curve
    intensity = math.exp(
        -math.pow(hour - Config.PEAK_HOUR, 2) / (2 * math.pow(std_dev, 2))
    )
    
    return max(0.0, min(1.0, intensity))


# ============================================
# SOLAR DATA GENERATION
# ============================================

def generate_solar_data(device: Dict, hour: float) -> Dict:
    """Generate realistic solar data based on current time and location"""
    # Calculate solar intensity for this hour
    solar_intensity = calculate_solar_intensity(hour)
    
    # Base values with some randomness
    base_solar_power = Config.MAX_SOLAR_POWER * solar_intensity
    random_factor = 0.9 + random.random() * 0.2  # ±10% variance
    
    # Calculate main metrics
    solar_power = base_solar_power * random_factor
    load_power = solar_power * (0.3 + random.random() * 0.4)
    grid_power = max(0, solar_power - load_power)
    battery_level = calculate_battery_level(hour, solar_intensity)
    temperature = calculate_temperature(hour, solar_intensity)
    humidity = calculate_humidity(hour, solar_intensity)
    
    return {
        'api_key': device['apiKey'],
        'solar_power': round(solar_power, 2),
        'load_power': round(load_power, 2),
        'battery_level': round(battery_level, 2),
        'grid_power': round(grid_power, 2),
        'temperature': round(temperature, 1),
        'humidity': round(humidity, 1),
    }


def calculate_battery_level(hour: float, solar_intensity: float) -> float:
    """Simulate battery level based on time of day"""
    night_discharge = 2  # % per hour at night
    day_charge = 15      # % per hour at peak sun
    
    base_level = 50
    
    if hour < Config.SUNRISE_HOUR:
        return max(10, base_level - (Config.SUNRISE_HOUR - hour) * night_discharge)
    elif hour < Config.PEAK_HOUR:
        return min(95, base_level + (hour - Config.SUNRISE_HOUR) * day_charge * solar_intensity)
    elif hour < Config.SUNSET_HOUR:
        return min(100, base_level + (Config.PEAK_HOUR - Config.SUNRISE_HOUR) * day_charge * solar_intensity)
    else:
        return max(20, 100 - (hour - Config.SUNSET_HOUR) * night_discharge)


def calculate_temperature(hour: float, solar_intensity: float) -> float:
    """Calculate temperature based on time of day"""
    base_temp = 25
    solar_heating = solar_intensity * 15
    
    # Temperature lags behind solar intensity by ~2 hours
    temp_lag = 2
    adjusted_hour = (hour - temp_lag + 24) % 24
    lagged_intensity = calculate_solar_intensity(adjusted_hour)
    
    return base_temp + lagged_intensity * solar_heating + (random.random() * 2 - 1)


def calculate_humidity(hour: float, solar_intensity: float) -> float:
    """Calculate humidity based on time of day"""
    base_humidity = 60
    temp_effect = solar_intensity * 40
    
    return max(20, min(90, base_humidity - temp_effect + (random.random() * 10 - 5)))


# ============================================
# FAULT SIMULATION
# ============================================

def apply_fault(data: Dict) -> Dict:
    """Apply realistic faults to the generated data"""
    if not Config.ENABLE_FAULTS:
        return data
    
    chance = random.random()
    
    if chance < Config.FAULT_RATE:
        fault_type = random.random()
        
        if fault_type < 0.33:
            # ZERO_VOLTAGE - Panel disconnected
            print("  ⚠️  FAULT: ZERO_VOLTAGE (Panel disconnected)")
            return {
                **data,
                'solar_power': 0,
                'battery_level': max(10, data['battery_level'] - 5),
                'fault': 'ZERO_VOLTAGE',
            }
        elif fault_type < 0.66:
            # SPIKE - Inverter issue
            print("  ⚠️  FAULT: SPIKE (Inverter issue)")
            return {
                **data,
                'solar_power': data['solar_power'] * 1.5,
                'grid_power': data['grid_power'] * 1.8,
                'fault': 'SPIKE',
            }
        else:
            # LOW_CURRENT - Dust/shading
            print("  ⚠️  FAULT: LOW_CURRENT (Dust/Shading)")
            return {
                **data,
                'solar_power': data['solar_power'] * 0.3,
                'load_power': data['load_power'] * 0.5,
                'fault': 'LOW_CURRENT',
            }
    
    return data


# ============================================
# DATA TRANSMISSION
# ============================================

def send_data(device: Dict, data: Dict) -> Dict:
    """Send data to the backend server"""
    url = f"{Config.SERVER_URL}{Config.ENDPOINT}"
    
    try:
        response = requests.post(url, json=data, timeout=10)
        
        if response.status_code == 200:
            return {'success': True, 'message': response.json().get('message', 'OK')}
        else:
            return {'success': False, 'message': f"HTTP {response.status_code}"}
    except requests.exceptions.RequestException as e:
        return {'success': False, 'message': str(e)}


# ============================================
# MAIN SIMULATION LOOP
# ============================================

def run_simulation():
    """Main simulation function"""
    import math  # Import here to avoid circular dependency
    
    print('╔════════════════════════════════════════════════════════════╗')
    print('║      Solar Energy Management System (SEMS) - Simulator     ║')
    print('╠════════════════════════════════════════════════════════════╣')
    print(f'║  Server: {Config.SERVER_URL.ljust(44)}║')
    print(f'║  Endpoint: {Config.ENDPOINT.ljust(41)}║')
    print(f'║  Devices: {str(Config.DEVICE_COUNT).ljust(44)}║')
    print(f'║  Interval: {Config.INTERVAL_MS}ms{" " * (38 - len(str(Config.INTERVAL_MS)))}║')
    print(f'║  Multi-Plant: {"Yes" if Config.MULTI_PLANT_MODE else "No".ljust(41)}║')
    print(f'║  Faults: {"Enabled" if Config.ENABLE_FAULTS else "Disabled".ljust(41)}║')
    print('╚════════════════════════════════════════════════════════════╝')
    print('')
    
    # Generate devices
    devices = generate_devices(Config.DEVICE_COUNT)
    print(f'📡 Initialized {len(devices)} virtual device(s)\n')
    
    if Config.MULTI_PLANT_MODE:
        plant_ids = list(dict.fromkeys(d['plantId'] for d in devices))
        print(f'🌱 Plants: {", ".join(plant_ids)}\n')
    
    # Display device info
    for device in devices[:5]:
        print(f"  • {device['deviceId']} → {device['plantId']} ({device['location']['city']})")
    if len(devices) > 5:
        print(f"  ... and {len(devices) - 5} more devices\n")
    
    print('🚀 Starting data simulation...\n')
    
    iteration = 0
    
    try:
        while True:
            iteration += 1
            now = datetime.now()
            hour = now.hour + now.minute / 60
            
            # Progress output
            sys.stdout.write(f'\r📊 Iteration {iteration} | {now.strftime("%H:%M:%S")} | Hour: {hour:.2f}')
            sys.stdout.flush()
            
            if Config.DEBUG:
                print(f'\n🔍 Debug - Hour: {hour:.2f}, Intensity: {calculate_solar_intensity(hour):.3f}')
            
            # Send data for each device
            success_count = 0
            fail_count = 0
            
            for device in devices:
                # Generate data for this device
                data = generate_solar_data(device, hour)
                
                # Apply fault simulation
                data = apply_fault(data)
                
                # Send to backend
                result = send_data(device, data)
                
                if result['success']:
                    success_count += 1
                    if Config.DEBUG:
                        print(f"  ✅ {device['deviceId']}: OK")
                else:
                    fail_count += 1
                    print(f"  ❌ {device['deviceId']}: {result['message']}")
            
            if Config.DEBUG or fail_count > 0:
                print(f'\n  Summary: {success_count} success, {fail_count} failed')
            
            # Wait for next iteration
            time.sleep(Config.INTERVAL_MS / 1000)
    
    except KeyboardInterrupt:
        print('\n\n🛑 Simulator stopped by user')
        sys.exit(0)


# ============================================
# ENTRY POINT
# ============================================

if __name__ == '__main__':
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Solar Energy Management System Simulator')
    parser.add_argument('--multi', action='store_true', help='Enable multi-plant mode')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--server', type=str, help='Backend server URL')
    parser.add_argument('--devices', type=int, help='Number of virtual devices')
    parser.add_argument('--interval', type=int, help='Data send interval in milliseconds')
    
    args = parser.parse_args()
    
    # Apply command line arguments
    if args.multi:
        Config.MULTI_PLANT_MODE = True
    if args.debug:
        Config.DEBUG = True
    if args.server:
        Config.SERVER_URL = args.server
    if args.devices:
        Config.DEVICE_COUNT = args.devices
    if args.interval:
        Config.INTERVAL_MS = args.interval
    
    run_simulation()
