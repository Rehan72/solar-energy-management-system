package energy

import (
	"sems-backend/internal/database"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type EnergyData struct {
	ID           uuid.UUID `json:"id" db:"id"`
	DeviceID     uuid.UUID `json:"device_id" db:"device_id"`
	Timestamp    time.Time `json:"timestamp" db:"timestamp"`
	SolarPower   float64   `json:"solar_power" db:"solar_power"`
	LoadPower    float64   `json:"load_power" db:"load_power"`
	BatteryLevel float64   `json:"battery_level" db:"battery_level"`
	GridPower    float64   `json:"grid_power" db:"grid_power"`
	Temperature  float64   `json:"temperature" db:"temperature"`
	Humidity     float64   `json:"humidity" db:"humidity"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type EnergyResponse struct {
	Solar   float64 `json:"solar"`
	Load    float64 `json:"load"`
	Battery float64 `json:"battery"`
	Grid    float64 `json:"grid"`
}

func CurrentEnergy(c *gin.Context) {
	// Get user ID from context
	userIDStr, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "User not authenticated"})
		return
	}

	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid user ID"})
		return
	}

	// Get latest energy data for user's devices
	data, err := getLatestEnergyData(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch energy data"})
		return
	}

	if data == nil {
		// Return default values if no data
		c.JSON(200, EnergyResponse{
			Solar:   0,
			Load:    0,
			Battery: 0,
			Grid:    0,
		})
		return
	}

	c.JSON(200, EnergyResponse{
		Solar:   data.SolarPower,
		Load:    data.LoadPower,
		Battery: data.BatteryLevel,
		Grid:    data.GridPower,
	})
}

func getLatestEnergyData(userID uuid.UUID) (*EnergyData, error) {
	query := `
		SELECT e.id, e.device_id, e.timestamp, e.solar_power, e.load_power,
		       e.battery_level, e.grid_power, e.temperature, e.humidity, e.created_at
		FROM energy_data e
		INNER JOIN devices d ON e.device_id = d.id
		WHERE d.user_id = ?
		ORDER BY e.timestamp DESC
		LIMIT 1`

	data := &EnergyData{}
	err := database.DB.QueryRow(query, userID).Scan(
		&data.ID, &data.DeviceID, &data.Timestamp, &data.SolarPower,
		&data.LoadPower, &data.BatteryLevel, &data.GridPower,
		&data.Temperature, &data.Humidity, &data.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return data, nil
}
