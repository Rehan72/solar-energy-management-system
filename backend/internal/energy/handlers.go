package energy

import (
	"net/http"
	"sems-backend/internal/database"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetEnergyHistoryHandler returns historical energy data
func GetEnergyHistoryHandler(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Parse query parameters
	days := 7 // default to 7 days
	if daysStr := c.Query("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil {
			days = d
		}
	}

	deviceID := c.Query("device_id")

	history, err := GetEnergyHistory(userID, days, deviceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch energy history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"history": history,
		"days":    days,
	})
}

// GetEnergyAnalyticsHandler returns energy analytics and statistics
func GetEnergyAnalyticsHandler(c *gin.Context) {
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	analytics, err := GetEnergyAnalytics(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch analytics"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"analytics": analytics})
}

// GetEnergyHistory retrieves historical energy data for a user
func GetEnergyHistory(userID uuid.UUID, days int, deviceID string) ([]*EnergyData, error) {
	startDate := time.Now().AddDate(0, 0, -days)

	var query string
	var args []interface{}

	if deviceID != "" {
		dID, err := uuid.Parse(deviceID)
		if err != nil {
			return nil, err
		}
		query = `
			SELECT id, device_id, timestamp, solar_power, load_power,
			       battery_level, grid_power, temperature, humidity, created_at
			FROM energy_data
			WHERE device_id IN (SELECT id FROM devices WHERE user_id = ?)
			AND device_id = ?
			AND timestamp >= ?
			ORDER BY timestamp DESC`
		args = []interface{}{userID, dID, startDate}
	} else {
		query = `
			SELECT id, device_id, timestamp, solar_power, load_power,
			       battery_level, grid_power, temperature, humidity, created_at
			FROM energy_data
			WHERE device_id IN (SELECT id FROM devices WHERE user_id = ?)
			AND timestamp >= ?
			ORDER BY timestamp DESC`
		args = []interface{}{userID, startDate}
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []*EnergyData
	for rows.Next() {
		ed := &EnergyData{}
		err := rows.Scan(
			&ed.ID, &ed.DeviceID, &ed.Timestamp, &ed.SolarPower,
			&ed.LoadPower, &ed.BatteryLevel, &ed.GridPower,
			&ed.Temperature, &ed.Humidity, &ed.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		data = append(data, ed)
	}

	return data, nil
}

// GetEnergyAnalytics calculates analytics from energy data
func GetEnergyAnalytics(userID uuid.UUID) (*EnergyAnalytics, error) {
	analytics := &EnergyAnalytics{
		Generated:  EnergyStats{},
		Consumed:   EnergyStats{},
		GridExport: EnergyStats{},
		Savings:    SavingsStats{},
	}

	// Get last 30 days data
	startDate := time.Now().AddDate(0, 0, -30)

	query := `
		SELECT
			COALESCE(SUM(solar_power), 0) as total_solar,
			COALESCE(AVG(solar_power), 0) as avg_solar,
			COALESCE(MAX(solar_power), 0) as max_solar,
			COALESCE(SUM(load_power), 0) as total_load,
			COALESCE(AVG(load_power), 0) as avg_load,
			COALESCE(SUM(grid_power), 0) as total_grid,
			COALESCE(AVG(battery_level), 0) as avg_battery
		FROM energy_data
		WHERE device_id IN (SELECT id FROM devices WHERE user_id = ?)
		AND timestamp >= ?`

	err := database.DB.QueryRow(query, userID, startDate).Scan(
		&analytics.Generated.Total, &analytics.Generated.Average, &analytics.Generated.Max,
		&analytics.Consumed.Total, &analytics.Consumed.Average,
		&analytics.GridExport.Total, &analytics.BatteryLevel.Average,
	)
	if err != nil {
		return nil, err
	}

	// Calculate savings (assuming ₹8 per kWh)
	// Net energy = solar - load - grid export
	netEnergy := analytics.Generated.Total - analytics.Consumed.Total
	if netEnergy > 0 {
		analytics.Savings.TotalEnergy = netEnergy
		analytics.Savings.EstimatedSavings = netEnergy * 8 // ₹8 per kWh
	} else {
		analytics.Savings.TotalEnergy = 0
		analytics.Savings.EstimatedSavings = 0
	}

	// CO2 reduction (0.7 kg per kWh)
	analytics.Savings.CO2Reduction = analytics.Generated.Total * 0.7

	return analytics, nil
}

// EnergyAnalytics represents energy analytics data
type EnergyAnalytics struct {
	Generated    EnergyStats  `json:"generated"`
	Consumed     EnergyStats  `json:"consumed"`
	GridExport   EnergyStats  `json:"grid_export"`
	BatteryLevel EnergyStats  `json:"battery_level"`
	Savings      SavingsStats `json:"savings"`
}

// EnergyStats represents statistics for energy metrics
type EnergyStats struct {
	Total   float64 `json:"total"`
	Average float64 `json:"average"`
	Max     float64 `json:"max"`
	Min     float64 `json:"min"`
}

// SavingsStats represents savings calculations
type SavingsStats struct {
	TotalEnergy      float64 `json:"total_energy_kwh"`
	EstimatedSavings float64 `json:"estimated_savings_rs"`
	CO2Reduction     float64 `json:"co2_reduction_kg"`
}
