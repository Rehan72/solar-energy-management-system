package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
	_ "modernc.org/sqlite"
)

var DB *sql.DB

// InitDB initializes the SQLite database connection
func InitDB() error {
	connStr := "./sems.db"

	var err error
	DB, err = sql.Open("sqlite", connStr)
	if err != nil {
		return fmt.Errorf("failed to open database: %w", err)
	}

	// Optimize connection pool for SQLite
	// Increased to 10 to prevent deadlocks during nested queries (e.g., Scan calling lookup)
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(10)
	DB.SetConnMaxLifetime(time.Hour)

	// Enable WAL mode and Busy Timeout
	// This helps prevent "database is locked" errors
	_, err = DB.Exec("PRAGMA journal_mode=WAL;")
	if err != nil {
		return fmt.Errorf("failed to set WAL mode: %w", err)
	}
	_, err = DB.Exec("PRAGMA busy_timeout=5000;")
	if err != nil {
		return fmt.Errorf("failed to set busy timeout: %w", err)
	}

	// Test the connection
	if err = DB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established (WAL mode & Busy Timeout optimized)")
	return nil
}

// CloseDB closes the database connection
func CloseDB() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
