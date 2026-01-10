package energy

import (
	"sems-backend/internal/database"
	"time"

	"github.com/google/uuid"
)

// Alert severity levels
type AlertSeverity string

const (
	AlertSeverityInfo     AlertSeverity = "INFO"
	AlertSeverityWarn     AlertSeverity = "WARN"
	AlertSeverityCritical AlertSeverity = "CRITICAL"
)

// Alert represents a system alert
type Alert struct {
	ID        uuid.UUID     `json:"id"`
	PlantID   *uuid.UUID    `json:"plant_id,omitempty"`
	DeviceID  *uuid.UUID    `json:"device_id,omitempty"`
	Severity  AlertSeverity `json:"severity"`
	Message   string        `json:"message"`
	CreatedAt time.Time     `json:"created_at"`
	Resolved  bool          `json:"resolved"`
}

// CheckAlert checks incoming sensor data for alerts
func CheckAlert(data *EnergyData) ([]Alert, error) {
	var alerts []Alert

	// Check for zero power output (during expected daylight hours)
	hour := time.Now().Hour()
	if hour >= 6 && hour <= 18 {
		if data.SolarPower == 0 {
			alert := Alert{
				ID:        uuid.New(),
				DeviceID:  &data.DeviceID,
				Severity:  AlertSeverityWarn,
				Message:   "Zero power output detected during daylight hours",
				CreatedAt: time.Now(),
				Resolved:  false,
			}
			alerts = append(alerts, alert)
		}
	}

	// Check for abnormal power spike (assuming 5kW system max)
	if data.SolarPower > 6000 {
		alert := Alert{
			ID:        uuid.New(),
			DeviceID:  &data.DeviceID,
			Severity:  AlertSeverityWarn,
			Message:   "Unexpected power spike detected",
			CreatedAt: time.Now(),
			Resolved:  false,
		}
		alerts = append(alerts, alert)
	}

	// Check for very low power (possible fault)
	if data.SolarPower > 0 && data.SolarPower < 100 && hour >= 8 && hour <= 16 {
		alert := Alert{
			ID:        uuid.New(),
			DeviceID:  &data.DeviceID,
			Severity:  AlertSeverityCritical,
			Message:   "Sudden power drop detected - possible panel fault",
			CreatedAt: time.Now(),
			Resolved:  false,
		}
		alerts = append(alerts, alert)
	}

	// Check for low battery
	if data.BatteryLevel < 20 {
		alert := Alert{
			ID:        uuid.New(),
			DeviceID:  &data.DeviceID,
			Severity:  AlertSeverityWarn,
			Message:   "Low battery level detected",
			CreatedAt: time.Now(),
			Resolved:  false,
		}
		alerts = append(alerts, alert)
	}

	// Check for high temperature
	if data.Temperature > 45 {
		alert := Alert{
			ID:        uuid.New(),
			DeviceID:  &data.DeviceID,
			Severity:  AlertSeverityCritical,
			Message:   "High temperature detected - possible overheating",
			CreatedAt: time.Now(),
			Resolved:  false,
		}
		alerts = append(alerts, alert)
	}

	// Save all alerts
	for _, alert := range alerts {
		if err := saveAlert(&alert); err != nil {
			// Log error but don't fail
			println("Error saving alert:", err.Error())
		}
	}

	return alerts, nil
}

// CreateAlert creates a new alert
func CreateAlert(severity AlertSeverity, message string, plantID, deviceID *uuid.UUID) (*Alert, error) {
	alert := &Alert{
		ID:        uuid.New(),
		PlantID:   plantID,
		DeviceID:  deviceID,
		Severity:  severity,
		Message:   message,
		CreatedAt: time.Now(),
		Resolved:  false,
	}

	if err := saveAlert(alert); err != nil {
		return nil, err
	}

	return alert, nil
}

// saveAlert saves an alert to the database
func saveAlert(alert *Alert) error {
	query := `
		INSERT INTO alerts (id, plant_id, device_id, severity, message, created_at, resolved)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`

	_, err := database.DB.Exec(query,
		alert.ID,
		alert.PlantID,
		alert.DeviceID,
		alert.Severity,
		alert.Message,
		alert.CreatedAt,
		alert.Resolved,
	)

	return err
}

// GetAlerts retrieves alerts with optional filters
func GetAlerts(plantID *uuid.UUID, resolved *bool, limit int) ([]Alert, error) {
	query := `
		SELECT id, plant_id, device_id, severity, message, created_at, resolved
		FROM alerts
		WHERE 1=1
	`

	var args []interface{}

	if plantID != nil {
		query += " AND plant_id = ?"
		args = append(args, plantID)
	}

	if resolved != nil {
		query += " AND resolved = ?"
		args = append(args, *resolved)
	}

	query += " ORDER BY created_at DESC"

	if limit > 0 {
		query += " LIMIT ?"
		args = append(args, limit)
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []Alert
	for rows.Next() {
		var alert Alert
		if err := rows.Scan(
			&alert.ID,
			&alert.PlantID,
			&alert.DeviceID,
			&alert.Severity,
			&alert.Message,
			&alert.CreatedAt,
			&alert.Resolved,
		); err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}

	return alerts, nil
}

// ResolveAlert marks an alert as resolved
func ResolveAlert(alertID uuid.UUID) error {
	query := `UPDATE alerts SET resolved = true WHERE id = ?`
	_, err := database.DB.Exec(query, alertID)
	return err
}

// BroadcastAlert sends alert to WebSocket clients
func BroadcastAlert(alert *Alert) {
	// This will be implemented when WebSocket is added
	// For now, just log
	println("ALERT:", string(alert.Severity), alert.Message)
}
