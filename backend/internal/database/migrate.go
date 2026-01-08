package database

import (
	"database/sql"
	"fmt"
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
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
		// Add missing columns to users table
		`ALTER TABLE users ADD COLUMN profile_image TEXT;`,
		`ALTER TABLE users ADD COLUMN address_line1 TEXT;`,
		`ALTER TABLE users ADD COLUMN address_line2 TEXT;`,
		`ALTER TABLE users ADD COLUMN city TEXT;`,
		`ALTER TABLE users ADD COLUMN state TEXT;`,
		`ALTER TABLE users ADD COLUMN pincode TEXT;`,
		`ALTER TABLE users ADD COLUMN region TEXT;`,
		`ALTER TABLE users ADD COLUMN latitude REAL;`,
		`ALTER TABLE users ADD COLUMN longitude REAL;`,
		`ALTER TABLE users ADD COLUMN admin_id TEXT REFERENCES users(id);`,
		`ALTER TABLE users ADD COLUMN installation_status TEXT DEFAULT 'NOT_INSTALLED';`,
		`ALTER TABLE users ADD COLUMN property_type TEXT;`,
		`ALTER TABLE users ADD COLUMN avg_monthly_bill REAL;`,
		`ALTER TABLE users ADD COLUMN roof_area_sqft REAL;`,
		`ALTER TABLE users ADD COLUMN connection_type TEXT;`,
		`ALTER TABLE users ADD COLUMN subsidy_interest INTEGER DEFAULT 0;`,
		`ALTER TABLE users ADD COLUMN plant_capacity_kw REAL;`,
		`ALTER TABLE users ADD COLUMN net_metering INTEGER DEFAULT 0;`,
		`ALTER TABLE users ADD COLUMN inverter_brand TEXT;`,
		`ALTER TABLE users ADD COLUMN discom_name TEXT;`,
		`ALTER TABLE users ADD COLUMN consumer_number TEXT;`,
		`ALTER TABLE users ADD COLUMN device_linked INTEGER DEFAULT 0;`,
		`ALTER TABLE users ADD COLUMN device_id TEXT;`,
		`ALTER TABLE users ADD COLUMN subsidy_applied INTEGER DEFAULT 0;`,
		`ALTER TABLE users ADD COLUMN subsidy_status TEXT;`,
		`ALTER TABLE users ADD COLUMN scheme_name TEXT;`,
		`ALTER TABLE users ADD COLUMN application_id TEXT;`,
		`ALTER TABLE users ADD COLUMN installation_date DATETIME;`,
		`ALTER TABLE users ADD COLUMN last_data_received DATETIME;`,
		// Solar plants table
		`CREATE TABLE IF NOT EXISTS solar_plants (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			location TEXT NOT NULL,
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
	}

	for i, migration := range migrations {
		if err := executeMigration(DB, migration); err != nil {
			return fmt.Errorf("failed to execute migration %d: %w", i+1, err)
		}
		log.Printf("✅ Migration %d executed successfully", i+1)
	}

	log.Println("🎉 All database migrations completed successfully")
	return nil
}

// executeMigration runs a single SQL migration
func executeMigration(db *sql.DB, query string) error {
	_, err := db.Exec(query)
	return err
}