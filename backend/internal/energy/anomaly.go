package energy

import (
	"fmt"
	"log"
	"sems-backend/internal/database"
	"sems-backend/internal/notifications"
	"time"

	"github.com/google/uuid"
)

// CheckAnomalies runs a periodic check on all active devices to detect issues.
// In a real production system, this would be a separate worker service.
func StartAnomalyDetectionWorker(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			checkAllDevices()
		}
	}()
}

func checkAllDevices() {
	// Only check during sunlight hours (approx 9 AM to 4 PM)
	now := time.Now()
	hour := now.Hour()
	if hour < 9 || hour > 16 {
		return
	}

	log.Println("🔍 Running anomaly detection scan...")

	// Fetch all active devices with their latest power reading
	// Using a custom query to join with users for capacity info
	query := `
		SELECT d.id, d.user_id, d.device_name, 
		       COALESCE((SELECT solar_power FROM energy_data WHERE device_id = d.id ORDER BY timestamp DESC LIMIT 1), 0) as current_power,
		       COALESCE(u.plant_capacity_kw, 5.0) as capacity,
			   u.email
		FROM devices d
		JOIN users u ON d.user_id = u.id
		WHERE d.status = 'ACTIVE' AND d.is_active = 1
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		log.Printf("Error querying devices for anomaly detection: %v", err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		var deviceID, userIDStr, deviceName, email string
		var currentPower, capacity float64

		if err := rows.Scan(&deviceID, &userIDStr, &deviceName, &currentPower, &capacity, &email); err != nil {
			continue
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			continue
		}

		// ANOMALY RULE 1: Severe Underperformance
		// If current power is less than 10% of capacity during peak hours (11 AM - 2 PM)
		if hour >= 11 && hour <= 14 {
			threshold := capacity * 0.10
			if currentPower < threshold {
				// Check if we already alerted recently to avoid spam (omitted for simplicity, but important)

				log.Printf("⚠️ Anomaly detected for %s (%s): Low power %.2f kW vs Cap %.2f kW", deviceName, email, currentPower, capacity)

				// Create Notification
				notifications.CreateNotification(
					userID,
					"ALERT",
					"Low Solar Generation Detected",
					"Your system '"+deviceName+"' is producing unusually low power ("+formatFloat(currentPower)+" kW). Please check for obstruction or shading.",
					"CRITICAL",
					"/user/devices/"+deviceID,
				)
			}
		}

		// ANOMALY RULE 2: Zero Generation during day
		if currentPower == 0 {
			notifications.CreateNotification(
				userID,
				"WARNING",
				"No Power Generation",
				"Device '"+deviceName+"' is reporting 0 kW output during daylight hours.",
				"HIGH",
				"/user/devices/"+deviceID,
			)
		}
	}
}

func formatFloat(f float64) string {
	return fmt.Sprintf("%.2f", f)
}
