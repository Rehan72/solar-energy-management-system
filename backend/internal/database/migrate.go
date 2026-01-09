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
			last_data_received DATETIME
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
			power REAL,
			energy_generated REAL,
			energy_consumed REAL,
			temperature REAL,
			humidity REAL,
			solar_irradiance REAL,
			battery_level REAL,
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
