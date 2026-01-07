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