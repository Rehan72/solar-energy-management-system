-- Solar Energy Management System Database Schema
-- PostgreSQL 13+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access control
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'USER', 'GOVT', 'INSTALLER')),
    phone VARCHAR(20),
    profile_image VARCHAR(500),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Devices table for IoT devices (ESP32 solar nodes)
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_seen TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Energy data table for storing sensor readings
CREATE TABLE energy_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voltage DECIMAL(8, 3), -- in volts
    current DECIMAL(8, 3), -- in amperes
    power DECIMAL(10, 3), -- in watts
    energy DECIMAL(12, 3), -- in watt-hours
    temperature DECIMAL(5, 2), -- in celsius
    irradiance DECIMAL(8, 2), -- in W/m²
    battery_level DECIMAL(5, 2), -- percentage
    status VARCHAR(20) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'error'))
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_user_id ON devices(user_id);
CREATE INDEX idx_energy_data_device_id ON energy_data(device_id);
CREATE INDEX idx_energy_data_timestamp ON energy_data(timestamp);
CREATE INDEX idx_energy_data_device_timestamp ON energy_data(device_id, timestamp DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin user (password: admin123 - hash this in production)
-- In production, use proper password hashing
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@solar.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 'SUPER_ADMIN');

-- Insert sample devices
INSERT INTO devices (device_id, api_key, name, location, latitude, longitude)
VALUES
    ('ESP32_SOLAR_001', 'api_key_001_secure', 'Solar Node Alpha', 'Roof Panel A', 28.6139, 77.2090),
    ('ESP32_SOLAR_002', 'api_key_002_secure', 'Solar Node Beta', 'Roof Panel B', 28.6140, 77.2091);

-- Insert sample energy data
INSERT INTO energy_data (device_id, voltage, current, power, energy, temperature, irradiance, battery_level, status)
SELECT
    d.id,
    12.5 + random() * 2, -- voltage between 12.5-14.5V
    5.0 + random() * 3, -- current between 5-8A
    (12.5 + random() * 2) * (5.0 + random() * 3), -- power = voltage * current
    100.0 + random() * 50, -- energy between 100-150Wh
    25.0 + random() * 10, -- temperature between 25-35°C
    800 + random() * 200, -- irradiance between 800-1000 W/m²
    85.0 + random() * 10, -- battery level between 85-95%
    CASE WHEN random() < 0.9 THEN 'normal' ELSE 'warning' END
FROM devices d
CROSS JOIN generate_series(1, 10) AS gs;