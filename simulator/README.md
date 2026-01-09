# Solar Energy Management System (SEMS) - Simulator

A powerful software-based simulator that acts like real solar devices (ESP32) and sends realistic data to your SEMS backend. Perfect for development, testing, demos, and presentations without needing physical hardware.

## 🚀 Quick Start

### Node.js Version (Recommended)

```bash
# Navigate to simulator directory
cd simulator

# Install dependencies
npm install

# Start simulator (default: 1 device, 5-second interval)
npm start

# Start with debug mode
npm run start:debug

# Multi-plant mode (simulates 100+ devices across plants)
npm run start:multi
```

### Python Version

```bash
# Navigate to simulator directory
cd simulator

# Install dependencies
pip install requests

# Run simulator
python solarSimulator.py

# With options
python solarSimulator.py --multi --debug --server http://localhost:8080 --devices 10
```

## 📋 Features

### 🌅 Realistic Solar Data Generation
- **Day/Night Cycle**: Solar intensity follows a bell curve based on time of day
- **Peak Generation**: Maximum output at noon (configurable)
- **Variable Conditions**: Realistic random variations in power output

### ⚡ Fault Simulation
Simulates real-world issues:
- `ZERO_VOLTAGE`: Panel disconnected (5% chance)
- `SPIKE`: Inverter malfunction (1.7% chance)
- `LOW_CURRENT`: Dust or shading (1.7% chance)

### 🌱 Multi-Plant Support
- Simulate 100+ devices across multiple solar plants
- Each plant has multiple devices with unique IDs
- Devices distributed across different geographic locations

### 📊 Data Points Generated
| Field | Description | Range |
|-------|-------------|-------|
| `solar_power` | Solar generation (W) | 0-5000 |
| `load_power` | Consumer load (W) | 0-3000 |
| `battery_level` | Battery charge (%) | 10-100 |
| `grid_power` | Grid export/import (W) | 0-5000 |
| `temperature` | Ambient temp (°C) | 20-45 |
| `humidity` | Relative humidity (%) | 20-90 |

## ⚙️ Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_URL` | `http://localhost:8080` | Backend server URL |
| `INTERVAL_MS` | `5000` | Data send interval (milliseconds) |
| `DEVICE_COUNT` | `1` | Number of virtual devices |
| `MULTI_PLANT` | `false` | Enable multi-plant mode |
| `ENABLE_FAULTS` | `true` | Enable fault simulation |
| `DEBUG` | `false` | Enable debug output |

### Example: Custom Configuration

```bash
# Run with custom settings
SERVER_URL=http://localhost:8080 INTERVAL_MS=2000 DEVICE_COUNT=10 npm start

# Or for Python
export SERVER_URL=http://localhost:8080
export DEVICE_COUNT=20
python solarSimulator.py --multi
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Solar Simulator                           │
├─────────────────────────────────────────────────────────────┤
│  • Day/Night Cycle Calculation                               │
│  • Fault Injection Engine                                    │
│  • Multi-Device Manager                                      │
│  • HTTP Client                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP POST /iot/data
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     SEMS Backend                             │
├─────────────────────────────────────────────────────────────┤
│  • IoT Data Endpoint                                         │
│  • API Key Validation                                        │
│  • Energy Data Storage                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Database
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Database                                  │
├─────────────────────────────────────────────────────────────┤
│  • energy_data table                                         │
│  • devices table                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📈 Solar Intensity Curve

The simulator uses a Gaussian (bell curve) function for realistic solar intensity:

```
Intensity = exp(-(hour - peak_hour)² / (2 × σ²))

Where:
- sunrise = 6 AM
- sunset = 6 PM
- peak_hour = 12 PM
- σ = (sunset - sunrise) / 4
```

This creates a smooth curve that:
- Starts at 0 at 6 AM
- Reaches maximum at noon
- Returns to 0 at 6 PM

## 🎯 Use Cases

1. **Development Testing**: Test your backend without physical devices
2. **Demo & Presentations**: Show a working system during demos
3. **Load Testing**: Simulate 100+ devices to test scalability
4. **Fault Handling**: Test your system's response to errors
5. **AI/ML Training**: Generate training data for prediction models

## 🔧 Integration with Real ESP32

The simulator sends data in the exact same format as a real ESP32:

```javascript
// Same format used by both simulator and real ESP32
{
  api_key: "device_api_key",
  solar_power: 3500.50,
  load_power: 1500.25,
  battery_level: 75.0,
  grid_power: 2000.25,
  temperature: 32.5,
  humidity: 55.0
}
```

This means you can:
1. Develop with the simulator
2. Deploy with real ESP32 devices
3. No code changes needed!

## 📝 Command Line Options

### Node.js
```bash
node solarSimulator.js --multi     # Multi-plant mode
node solarSimulator.js --debug     # Debug output
```

### Python
```bash
python solarSimulator.py --multi              # Multi-plant mode
python solarSimulator.py --debug              # Debug output
python solarSimulator.py --server URL         # Custom server
python solarSimulator.py --devices 50         # 50 devices
python solarSimulator.py --interval 2000      # 2-second interval
```

## 🚨 Troubleshooting

### Connection Refused
- Make sure backend is running: `cd backend && go run cmd/server/main.go`
- Check server URL in configuration

### Authentication Errors
- Devices need valid API keys in the database
- For testing, the simulator generates mock API keys

### No Data in Dashboard
- Check backend logs for ingestion errors
- Verify database connection
- Enable debug mode for detailed output

## 📄 License

MIT License - Feel free to use in your projects!

## 🤝 Contributing

Contributions welcome! Feel free to submit PRs for:
- Additional fault types
- More realistic data models
- MQTT support
- Other enhancements
