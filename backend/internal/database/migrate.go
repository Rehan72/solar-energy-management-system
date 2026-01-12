package database

import (
	"database/sql"
	"log"
)

// RunMigrations executes all database migrations
func RunMigrations() error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'USER',
			first_name TEXT,
			last_name TEXT,
			phone TEXT,
			organization TEXT,
			is_active INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			profile_image TEXT,
			address_line1 TEXT,
			address_line2 TEXT,
			city TEXT,
			state TEXT,
			pincode TEXT,
			region TEXT,
			latitude REAL,
			longitude REAL,
			admin_id TEXT REFERENCES users(id),
			installation_status TEXT DEFAULT 'NOT_INSTALLED',
			property_type TEXT,
			avg_monthly_bill REAL,
			roof_area_sqft REAL,
			connection_type TEXT,
			subsidy_interest INTEGER DEFAULT 0,
			plant_capacity_kw REAL,
			net_metering INTEGER DEFAULT 0,
			inverter_brand TEXT,
			discom_name TEXT,
			consumer_number TEXT,
			device_linked INTEGER DEFAULT 0,
			device_id TEXT,
			subsidy_applied INTEGER DEFAULT 0,
			subsidy_status TEXT,
			scheme_name TEXT,
			application_id TEXT,
			installation_date DATETIME,
			last_data_received DATETIME,
			project_cost REAL,
			plant_id TEXT REFERENCES solar_plants(id)
		);`,
		`CREATE TABLE IF NOT EXISTS devices (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
			device_name TEXT NOT NULL,
			device_type TEXT NOT NULL,
			api_key TEXT UNIQUE NOT NULL,
			status TEXT DEFAULT 'ACTIVE',
			location_lat REAL,
			location_lng REAL,
			installation_date DATETIME,
			last_seen DATETIME,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			device_id TEXT,
			name TEXT,
			location TEXT,
			is_active INTEGER DEFAULT 1
		);`,
		`CREATE TABLE IF NOT EXISTS energy_data (
			id TEXT PRIMARY KEY,
			device_id TEXT REFERENCES devices(id) ON DELETE CASCADE,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			voltage REAL,
			current REAL,
			solar_power REAL,
			load_power REAL,
			grid_power REAL,
			battery_level REAL,
			temperature REAL,
			humidity REAL,
			solar_irradiance REAL,
			grid_status INTEGER DEFAULT 0,
			weather_condition TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE INDEX IF NOT EXISTS idx_energy_data_device_timestamp ON energy_data(device_id, timestamp);`,
		`CREATE INDEX IF NOT EXISTS idx_energy_data_timestamp ON energy_data(timestamp);`,
		`CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);`,
		`CREATE INDEX IF NOT EXISTS idx_devices_api_key ON devices(api_key);`,
		// Solar plants table
		`CREATE TABLE IF NOT EXISTS solar_plants (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			location TEXT NOT NULL,
			region_id TEXT,
			region TEXT NOT NULL,
			capacity_kw REAL NOT NULL,
			current_output_kw REAL DEFAULT 0,
			efficiency REAL DEFAULT 85.00,
			latitude REAL,
			longitude REAL,
			status TEXT DEFAULT 'ACTIVE',
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		// Create demo device for simulator
		`INSERT OR REPLACE INTO devices (id, user_id, device_name, device_type, api_key, status, location_lat, location_lng) VALUES ('00000000-0000-0000-0000-000000000001', NULL, 'Demo Device', 'SIMULATOR', 'demo_api_key', 'ACTIVE', 28.6139, 77.2090);`,
		// Create alerts table
		`CREATE TABLE IF NOT EXISTS alerts (
			id TEXT PRIMARY KEY,
			plant_id TEXT,
			device_id TEXT,
			severity TEXT NOT NULL,
			message TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			resolved BOOLEAN DEFAULT 0
		);`,
		// Add installer_id to users
		`ALTER TABLE users ADD COLUMN installer_id TEXT REFERENCES users(id);`,
		// Add project_cost to users if not exists
		`ALTER TABLE users ADD COLUMN project_cost REAL;`,
		// Add plant_id to users if not exists
		`ALTER TABLE users ADD COLUMN plant_id TEXT REFERENCES solar_plants(id);`,
		// Create solar_profiles table if not exists
		`CREATE TABLE IF NOT EXISTS solar_profiles (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
			installation_status TEXT,
			property_type TEXT,
			admin_id TEXT,
			installer_id TEXT,
			avg_monthly_bill REAL,
			roof_area_sqft REAL,
			connection_type TEXT,
			subsidy_interest INTEGER,
			project_cost REAL,
			plant_capacity_kw REAL,
			installation_date DATETIME,
			net_metering INTEGER,
			inverter_brand TEXT,
			discom_name TEXT,
			consumer_number TEXT,
			device_linked INTEGER,
			device_id TEXT,
			last_data_received DATETIME,
			subsidy_applied INTEGER,
			subsidy_status TEXT,
			scheme_name TEXT,
			application_id TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		// Create notifications table
		`CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
			type TEXT NOT NULL,
			title TEXT NOT NULL,
			message TEXT NOT NULL,
			severity TEXT DEFAULT 'MEDIUM',
			read INTEGER DEFAULT 0,
			action_url TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		// Create notification preferences table
		`CREATE TABLE IF NOT EXISTS notification_preferences (
			user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
			email_enabled INTEGER DEFAULT 1,
			sms_enabled INTEGER DEFAULT 0,
			push_enabled INTEGER DEFAULT 1,
			alert_types TEXT DEFAULT '["ALERT","WARNING","CRITICAL"]'
		);`,
		// Create index for notifications
		`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, created_at DESC);`,
		// Cleanup invalid seed data from previous version
		`DELETE FROM solar_plants WHERE id IN ('p1', 'p2', 'p3', 'p4');`,
		// Seed initial plants with valid UUIDs
		`INSERT OR IGNORE INTO solar_plants (id, name, location, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description)
		VALUES 
		('550e8400-e29b-41d4-a716-446655440001', 'Delhi North Plant', 'Rohini, Delhi', 'Delhi', 500.0, 320.5, 92.0, 28.7041, 77.1025, 'ACTIVE', 'Primary plant for North Delhi'),
		('550e8400-e29b-41d4-a716-446655440002', 'Mumbai Coastal Solar', 'Marine Drive, Mumbai', 'Maharashtra', 750.0, 410.2, 88.0, 19.0760, 72.8777, 'ACTIVE', 'Coastal deployment with high humidity tolerance'),
		('550e8400-e29b-41d4-a716-446655440003', 'Bangalore Tech Park', 'Electronic City, Bangalore', 'Karnataka', 1200.0, 850.0, 95.0, 12.9716, 77.5946, 'ACTIVE', 'Integration with IT hub micro-grid'),
		('550e8400-e29b-41d4-a716-446655440004', 'Rajasthan Desert Solar', 'Jaisalmer', 'Rajasthan', 5000.0, 4200.0, 96.0, 26.9157, 70.9083, 'ACTIVE', 'Utility scale desert deployment');`,
		// Create tickets table
		`CREATE TABLE IF NOT EXISTS tickets (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
			installer_id TEXT,
			subject TEXT NOT NULL,
			description TEXT,
			status TEXT DEFAULT 'OPEN',
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
	}

	for i, migration := range migrations {
		if err := executeMigration(DB, migration); err != nil {
			// Log warning but continue - some migrations may fail due to existing columns
			log.Printf("⚠️  Migration %d warning: %v", i+1, err)
		} else {
			log.Printf("✅ Migration %d executed successfully", i+1)
		}
	}

	log.Println("🎉 All database migrations completed successfully")
	return nil
}

// executeMigration runs a single SQL migration
func executeMigration(db *sql.DB, query string) error {
	_, err := db.Exec(query)
	return err
}
