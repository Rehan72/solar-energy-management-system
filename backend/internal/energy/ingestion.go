package energy

import (
	"net/http"
	"sems-backend/internal/database"
	"sems-backend/internal/devices"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type DataIngestionRequest struct {
	APIKey       string  `json:"api_key" binding:"required"`
	SolarPower   float64 `json:"solar_power"`
	LoadPower    float64 `json:"load_power"`
	BatteryLevel float64 `json:"battery_level"`
	GridPower    float64 `json:"grid_power"`
	Temperature  float64 `json:"temperature"`
	Humidity     float64 `json:"humidity"`
}

func IngestData(c *gin.Context) {
	var req DataIngestionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Find device by API key
	device, err := getDeviceByAPIKey(req.APIKey)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid API key"})
		return
	}

	if !device.IsActive {
		c.JSON(http.StatusForbidden, gin.H{"error": "Device is not active"})
		return
	}

	// Insert energy data
	energyData := &EnergyData{
		ID:           uuid.New(),
		DeviceID:     device.ID,
		Timestamp:    time.Now(),
		SolarPower:   req.SolarPower,
		LoadPower:    req.LoadPower,
		BatteryLevel: req.BatteryLevel,
		GridPower:    req.GridPower,
		Temperature:  req.Temperature,
		Humidity:     req.Humidity,
	}

	err = insertEnergyData(energyData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Data ingested successfully"})
}

func getDeviceByAPIKey(apiKey string) (*devices.Device, error) {
	device := &devices.Device{}
	query := `
		SELECT id, user_id, name, device_type, location, api_key, is_active, created_at, updated_at
		FROM devices
		WHERE api_key = $1`

	err := database.DB.QueryRow(query, apiKey).Scan(
		&device.ID, &device.UserID, &device.Name, &device.DeviceType,
		&device.Location, &device.APIKey, &device.IsActive,
		&device.CreatedAt, &device.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return device, nil
}

func insertEnergyData(data *EnergyData) error {
	query := `
		INSERT INTO energy_data (id, device_id, timestamp, solar_power, load_power, battery_level, grid_power, temperature, humidity)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`

	_, err := database.DB.Exec(query,
		data.ID, data.DeviceID, data.Timestamp,
		data.SolarPower, data.LoadPower, data.BatteryLevel,
		data.GridPower, data.Temperature, data.Humidity,
	)

	return err
}