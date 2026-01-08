-- Solar Energy Management System Database Schema
-- PostgreSQL 13+ compatible

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access control and solar-specific fields
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
    admin_id UUID REFERENCES users(id),

    -- Solar-specific fields
    installation_status VARCHAR(50) DEFAULT 'NOT_INSTALLED' CHECK (installation_status IN ('NOT_INSTALLED', 'INSTALLATION_PLANNED', 'INSTALLED')),
    property_type VARCHAR(50) CHECK (property_type IN ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL')),
    
    -- For prospective users (planning stage)
    avg_monthly_bill DECIMAL(10, 2),
    roof_area_sqft DECIMAL(10, 2),
    connection_type VARCHAR(50) CHECK (connection_type IN ('SINGLE_PHASE', 'THREE_PHASE')),
    subsidy_interest BOOLEAN DEFAULT false,
    
    -- For installed users
    plant_capacity_kw DECIMAL(10, 2),
    installation_date TIMESTAMP WITH TIME ZONE,
    net_metering BOOLEAN DEFAULT false,
    inverter_brand VARCHAR(100),
    discom_name VARCHAR(100),
    consumer_number VARCHAR(50),
    
    -- Device linking (optional)
    device_linked BOOLEAN DEFAULT false,
    device_id VARCHAR(100),
    last_data_received TIMESTAMP WITH TIME ZONE,
    
    -- Subsidy details
    subsidy_applied BOOLEAN DEFAULT false,
    subsidy_status VARCHAR(50) CHECK (subsidy_status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED')),
    scheme_name VARCHAR(255),
    application_id VARCHAR(100),
    
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

-- Solar Profiles table for user solar-specific data
CREATE TABLE solar_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    
    installation_status VARCHAR(50) DEFAULT 'NOT_INSTALLED' CHECK (installation_status IN ('NOT_INSTALLED', 'INSTALLATION_PLANNED', 'INSTALLED')),
    property_type VARCHAR(50) CHECK (property_type IN ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL')),
    
    -- For prospective users (planning stage)
    avg_monthly_bill DECIMAL(10, 2),
    roof_area_sqft DECIMAL(10, 2),
    connection_type VARCHAR(50) CHECK (connection_type IN ('SINGLE_PHASE', 'THREE_PHASE')),
    subsidy_interest BOOLEAN DEFAULT false,
    
    -- For installed users
    plant_capacity_kw DECIMAL(10, 2),
    installation_date TIMESTAMP WITH TIME ZONE,
    net_metering BOOLEAN DEFAULT false,
    inverter_brand VARCHAR(100),
    discom_name VARCHAR(100),
    consumer_number VARCHAR(50),
    
    -- Device linking (optional)
    device_linked BOOLEAN DEFAULT false,
    device_id VARCHAR(100),
    last_data_received TIMESTAMP WITH TIME ZONE,
    
    -- Subsidy details
    subsidy_applied BOOLEAN DEFAULT false,
    subsidy_status VARCHAR(50) CHECK (subsidy_status IN ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED')),
    scheme_name VARCHAR(255),
    application_id VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for solar_profiles updated_at
CREATE TRIGGER update_solar_profiles_updated_at BEFORE UPDATE ON solar_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for solar_profiles
CREATE INDEX idx_solar_profiles_user_id ON solar_profiles(user_id);

-- Solar Plants table for tracking solar power plants
CREATE TABLE solar_plants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500) NOT NULL,
    region VARCHAR(100) NOT NULL,
    capacity_kw DECIMAL(10, 2) NOT NULL,
    current_output_kw DECIMAL(10, 2) DEFAULT 0,
    efficiency DECIMAL(5, 2) DEFAULT 85.00,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE', 'INACTIVE')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for solar_plants updated_at
CREATE TRIGGER update_solar_plants_updated_at BEFORE UPDATE ON solar_plants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for solar_plants
CREATE INDEX idx_solar_plants_region ON solar_plants(region);
CREATE INDEX idx_solar_plants_status ON solar_plants(status);

-- Insert sample solar plants
INSERT INTO solar_plants (name, location, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status)
VALUES
    ('Delhi Solar Farm Phase 1', 'Sector 15, Rohini, Delhi - 110085', 'Delhi', 1000.0, 850.0, 85.0, 28.7300, 77.0900, 'ACTIVE'),
    ('Mumbai Solar Hub', 'Andheri East, Mumbai - 400069', 'Mumbai', 2500.0, 2100.0, 84.0, 19.1197, 72.8468, 'ACTIVE'),
    ('Patna Solar Station', 'Kankarbagh, Patna - 800020', 'Patna', 500.0, 380.0, 76.0, 25.5927, 85.0900, 'ACTIVE'),
    ('Ahmedabad Green Energy', 'SG Highway, Ahmedabad - 380015', 'Ahmedabad', 1500.0, 1200.0, 80.0, 23.0225, 72.5714, 'ACTIVE');

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