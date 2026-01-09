/**
 * Solar Energy Management System (SEMS) - Advanced Simulator
 * 
 * This simulator acts exactly like a real ESP32 solar device and sends
 * realistic data to your backend following day/night cycles and fault injection.
 * 
 * Features:
 * - Realistic solar intensity curve (bell curve based on time of day)
 * - Fault simulation (zero voltage, spikes, random drops)
 * - Multi-device support (100+ virtual devices)
 * - Real-time data streaming to backend
 * 
 * Usage:
 *   node solarSimulator.js
 *   
 * For multi-plant mode:
 *   node solarSimulator.js --multi
 */

import axios from 'axios';
import readline from 'readline';

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Backend configuration
  serverUrl: process.env.SERVER_URL || 'http://localhost:8080',
  endpoint: '/iot/data',
  
  // Simulation settings
  intervalMs: parseInt(process.env.INTERVAL_MS) || 5000,  // Data send interval
  deviceCount: parseInt(process.env.DEVICE_COUNT) || 1,   // Number of virtual devices
  
  // Solar parameters (adjust based on your installation)
  sunriseHour: 6,      // 6 AM
  sunsetHour: 18,      // 6 PM
  peakHour: 12,        // 12 PM (maximum solar output)
  maxSolarPower: 5000, // Watts (5kW system)
  
  // Fault simulation settings
  enableFaults: true,
  faultRate: 0.05,     // 5% chance of fault per reading
  
  // Multi-plant mode
  multiPlantMode: process.argv.includes('--multi') || process.env.MULTI_PLANT === 'true',
  plantsPerDevice: 5,  // Number of devices per plant
  
  // Debug mode
  debug: process.env.DEBUG === 'true' || false,
};

// Device API keys (in production, these would come from your database)
// For simulator, we use simple demo API keys that the backend accepts
const generateDevice = (index, plantId = null) => {
  const deviceId = `SIM-${String(index + 1).padStart(3, '0')}`;
  return {
    deviceId,
    // Use simple demo API key format that backend accepts (starts with "sim_")
    apiKey: `sim_${deviceId}_demo_key`,
    plantId: plantId || `PLANT-${Math.floor(index / CONFIG.plantsPerDevice) + 1}`,
    name: `Simulated Device ${index + 1}`,
    location: getLocationForIndex(index),
  };
};

// Generate varied locations for realism
const getLocationForIndex = (index) => {
  const locations = [
    { city: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { city: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { city: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { city: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { city: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { city: 'Pune', lat: 18.5204, lng: 73.8567 },
    { city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
  ];
  return locations[index % locations.length];
};

// Generate devices based on configuration
const generateDevices = () => {
  const devices = [];
  for (let i = 0; i < CONFIG.deviceCount; i++) {
    devices.push(generateDevice(i));
  }
  return devices;
};

// ============================================
// SOLAR INTENSITY CALCULATION
// ============================================

/**
 * Calculate solar intensity based on time of day
 * Returns a value between 0 and 1 representing solar intensity
 * 
 * Uses a bell curve (Gaussian) based on sunrise, peak, and sunset times
 * This creates realistic solar generation patterns
 */
function calculateSolarIntensity(hour) {
  // Night time - no solar generation
  if (hour < CONFIG.sunriseHour || hour >= CONFIG.sunsetHour) {
    return 0;
  }
  
  // Calculate the spread of the bell curve
  // Standard deviation determines how "wide" the bell curve is
  const stdDev = (CONFIG.sunsetHour - CONFIG.sunriseHour) / 4;
  
  // Gaussian function for bell curve
  const intensity = Math.exp(
    -Math.pow(hour - CONFIG.peakHour, 2) / (2 * Math.pow(stdDev, 2))
  );
  
  return Math.max(0, Math.min(1, intensity));
}

// ============================================
// SOLAR DATA GENERATION
// ============================================

/**
 * Generate realistic solar data based on current time and location
 */
function generateSolarData(device, hour, location) {
  // Calculate solar intensity for this hour
  const solarIntensity = calculateSolarIntensity(hour);
  
  // Base values with some randomness
  const baseSolarPower = CONFIG.maxSolarPower * solarIntensity;
  const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variance
  
  // Calculate main metrics
  const solarPower = baseSolarPower * randomFactor;
  const loadPower = solarPower * (0.3 + Math.random() * 0.4); // 30-70% self-consumption
  const gridPower = Math.max(0, solarPower - loadPower); // Excess to grid
  const batteryLevel = calculateBatteryLevel(hour, solarIntensity);
  const temperature = calculateTemperature(hour, solarIntensity);
  const humidity = calculateHumidity(hour, solarIntensity);
  
  return {
    api_key: device.apiKey,
    solar_power: Math.round(solarPower * 100) / 100,
    load_power: Math.round(loadPower * 100) / 100,
    battery_level: Math.round(batteryLevel * 100) / 100,
    grid_power: Math.round(gridPower * 100) / 100,
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity * 10) / 10,
  };
}

/**
 * Simulate battery level based on time of day
 * Battery drains at night, charges during day
 */
function calculateBatteryLevel(hour, solarIntensity) {
  const nightDischarge = 2; // % per hour at night
  const dayCharge = 15;     // % per hour at peak sun
  
  // Simplified battery simulation
  // This would be more complex in production with actual battery models
  const baseLevel = 50; // Start at 50%
  
  if (hour < CONFIG.sunriseHour) {
    // Early morning - battery draining
    return Math.max(10, baseLevel - (CONFIG.sunriseHour - hour) * nightDischarge);
  } else if (hour >= CONFIG.sunriseHour && hour < CONFIG.peakHour) {
    // Morning - battery charging
    return Math.min(95, baseLevel + (hour - CONFIG.sunriseHour) * dayCharge * solarIntensity);
  } else if (hour >= CONFIG.peakHour && hour < CONFIG.sunsetHour) {
    // Afternoon - battery still charging but less
    return Math.min(100, baseLevel + (CONFIG.peakHour - CONFIG.sunriseHour) * dayCharge * solarIntensity);
  } else {
    // Evening/night - battery discharging
    return Math.max(20, 100 - (hour - CONFIG.sunsetHour) * nightDischarge);
  }
}

/**
 * Calculate temperature based on time of day
 * Temperature follows a delayed curve relative to solar intensity
 */
function calculateTemperature(hour, solarIntensity) {
  // Base temperature (25°C) + solar heating effect
  const baseTemp = 25;
  const solarHeating = solarIntensity * 15; // Up to 15°C increase from sun
  
  // Temperature lags behind solar intensity by ~2 hours
  const tempLag = 2;
  const adjustedHour = (hour - tempLag + 24) % 24;
  const laggedIntensity = calculateSolarIntensity(adjustedHour);
  
  return baseTemp + laggedIntensity * solarHeating + (Math.random() * 2 - 1);
}

/**
 * Calculate humidity based on time of day
 * Humidity is inversely related to temperature
 */
function calculateHumidity(hour, solarIntensity) {
  const baseHumidity = 60;
  const tempEffect = (solarIntensity * 40); // Higher temp = lower humidity
  
  // Add some randomness
  return Math.max(20, Math.min(90, baseHumidity - tempEffect + (Math.random() * 10 - 5)));
}

// ============================================
// FAULT SIMULATION
// ============================================

/**
 * Apply realistic faults to the generated data
 * Faults simulate real-world issues like:
 * - Panel disconnection (zero voltage)
 * - Inverter issues (spikes)
 * - Dust/shading (low current)
 * - Cloud cover (random drops)
 */
function applyFault(data) {
  if (!CONFIG.enableFaults) return data;
  
  const chance = Math.random();
  
  // 5% chance of any fault
  if (chance < CONFIG.faultRate) {
    const faultType = Math.random();
    
    if (faultType < 0.33) {
      // ZERO_VOLTAGE - Panel disconnected
      console.log(`  ⚠️  FAULT: ZERO_VOLTAGE (Panel disconnected)`);
      return {
        ...data,
        solar_power: 0,
        battery_level: Math.max(10, data.battery_level - 5),
        fault: 'ZERO_VOLTAGE',
      };
    } else if (faultType < 0.66) {
      // SPIKE - Inverter issue
      console.log(`  ⚠️  FAULT: SPIKE (Inverter issue)`);
      return {
        ...data,
        solar_power: data.solar_power * 1.5,
        grid_power: data.grid_power * 1.8,
        fault: 'SPIKE',
      };
    } else {
      // LOW_CURRENT - Dust/shading
      console.log(`  ⚠️  FAULT: LOW_CURRENT (Dust/Shading)`);
      return {
        ...data,
        solar_power: data.solar_power * 0.3,
        load_power: data.load_power * 0.5,
        fault: 'LOW_CURRENT',
      };
    }
  }
  
  return data;
}

// ============================================
// DATA TRANSMISSION
// ============================================

/**
 * Send data to the backend server
 */
async function sendData(device, data) {
  const url = `${CONFIG.serverUrl}${CONFIG.endpoint}`;
  
  try {
    const response = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });
    
    if (response.status === 200) {
      return { success: true, message: response.data.message || 'OK' };
    } else {
      return { success: false, message: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.error || error.message || 'Unknown error' 
    };
  }
}

// ============================================
// MAIN SIMULATION LOOP
// ============================================

/**
 * Main simulation function
 */
async function runSimulation() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║      Solar Energy Management System (SEMS) - Simulator     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Server: ${CONFIG.serverUrl.padEnd(44)}║`);
  console.log(`║  Endpoint: ${CONFIG.endpoint.padEnd(41)}║`);
  console.log(`║  Devices: ${String(CONFIG.deviceCount).padEnd(44)}║`);
  console.log(`║  Interval: ${CONFIG.intervalMs}ms${' '.repeat(38)}║`);
  console.log(`║  Multi-Plant: ${CONFIG.multiPlantMode ? 'Yes' : 'No'.padEnd(41)}║`);
  console.log(`║  Faults: ${CONFIG.enableFaults ? 'Enabled' : 'Disabled'.padEnd(44)}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Generate devices
  const devices = generateDevices();
  console.log(`📡 Initialized ${devices.length} virtual device(s)\n`);
  
  if (CONFIG.multiPlantMode) {
    const plantIds = [...new Set(devices.map(d => d.plantId))];
    console.log(`🌱 Plants: ${plantIds.join(', ')}\n`);
  }
  
  // Display device info
  devices.slice(0, 5).forEach(device => {
    console.log(`  • ${device.deviceId} → ${device.plantId} (${device.location.city})`);
  });
  if (devices.length > 5) {
    console.log(`  ... and ${devices.length - 5} more devices\n`);
  }
  
  console.log('🚀 Starting data simulation...\n');
  
  let iteration = 0;
  
  // Main simulation loop
  const runLoop = async () => {
    iteration++;
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    
    // Clear console line for progress
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`📊 Iteration ${iteration} | ${now.toLocaleTimeString()} | Hour: ${hour.toFixed(2)}`);
    
    if (CONFIG.debug) {
      console.log(`\n🔍 Debug - Hour: ${hour.toFixed(2)}, Intensity: ${calculateSolarIntensity(hour).toFixed(3)}`);
    }
    
    // Send data for each device
    let successCount = 0;
    let failCount = 0;
    
    for (const device of devices) {
      // Generate data for this device
      let data = generateSolarData(device, hour, device.location);
      
      // Apply fault simulation
      data = applyFault(data);
      
      // Send to backend
      const result = await sendData(device, data);
      
      if (result.success) {
        successCount++;
        if (CONFIG.debug) {
          console.log(`  ✅ ${device.deviceId}: OK`);
        }
      } else {
        failCount++;
        console.log(`  ❌ ${device.deviceId}: ${result.message}`);
      }
    }
    
    if (CONFIG.debug || failCount > 0) {
      console.log(`\n  Summary: ${successCount} success, ${failCount} failed`);
    }
    
    // Schedule next iteration
    setTimeout(runLoop, CONFIG.intervalMs);
  };
  
  // Start the simulation
  runLoop();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Simulator stopped by user');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Simulator stopped');
    process.exit(0);
  });
}

// ============================================
// ENTRY POINT
// ============================================

// Run the simulation
runSimulation().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
