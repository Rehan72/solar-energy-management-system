package devices

import (
	"net/http"
	"sems-backend/internal/database"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UpdateDeviceRequest struct {
	Name     string `json:"name"`
	Location string `json:"location"`
	IsActive *bool  `json:"is_active"`
}

// @Summary Get user devices
// @Description Get all devices for the current user
// @Tags Devices
// @Accept json
// @Produce json
// @Param type query string false "Filter by device type"
// @Param active query boolean false "Filter only active devices"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /user/devices [get]
func GetDevicesHandler(c *gin.Context) {
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

	// Get query params for filtering
	deviceType := c.Query("type")
	activeOnly := c.Query("active") == "true"

	devices, err := GetDevicesByUserID(userID, deviceType, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch devices"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"devices": devices,
		"count":   len(devices),
	})
}

// @Summary Get device by ID
// @Description Get details of a specific device
// @Tags Devices
// @Accept json
// @Produce json
// @Param id path string true "Device ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /user/devices/{id} [get]
// @Router /admin/devices/{id} [get]
// @Router /superadmin/devices/{id} [get]
func GetDeviceHandler(c *gin.Context) {
	deviceID := c.Param("id")
	id, err := uuid.Parse(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	device, err := GetDeviceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"device": device})
}

// @Summary Update device
// @Description Update device details
// @Tags Devices
// @Accept json
// @Produce json
// @Param id path string true "Device ID"
// @Param device body UpdateDeviceRequest true "Device update data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/devices/{id} [put]
// @Router /admin/devices/{id} [put]
func UpdateDeviceHandler(c *gin.Context) {
	deviceID := c.Param("id")
	id, err := uuid.Parse(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	var req UpdateDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	device, err := GetDeviceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	// Update fields
	if req.Name != "" {
		device.Name = &req.Name
	}
	if req.Location != "" {
		device.Location = &req.Location
	}
	if req.IsActive != nil {
		device.IsActive = *req.IsActive
	}

	err = UpdateDevice(device)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update device"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Device updated successfully",
		"device":  device,
	})
}

// @Summary Delete device
// @Description Delete a device
// @Tags Devices
// @Accept json
// @Produce json
// @Param id path string true "Device ID"
// @Success 200 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /user/devices/{id} [delete]
// @Router /admin/devices/{id} [delete]
func DeleteDeviceHandler(c *gin.Context) {
	deviceID := c.Param("id")
	id, err := uuid.Parse(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	err = DeleteDevice(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete device"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Device deleted successfully"})
}

// @Summary Regenerate API Key
// @Description Regenerate the API key for a device
// @Tags Devices
// @Accept json
// @Produce json
// @Param id path string true "Device ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /user/devices/{id}/regenerate-key [post]
func RegenerateAPIKeyHandler(c *gin.Context) {
	deviceID := c.Param("id")
	id, err := uuid.Parse(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	device, err := GetDeviceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	// Generate new API key
	device.APIKey = generateAPIKey()
	device.UpdatedAt = time.Now()

	err = UpdateDevice(device)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to regenerate API key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "API key regenerated successfully",
		"api_key": device.APIKey,
	})
}

// CreateUserDeviceHandler - Allows users to create their own devices
// @Summary Create user device
// @Description Create a new device for the current user
// @Tags Devices
// @Accept json
// @Produce json
// @Param device body CreateDeviceRequest true "Device creation data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /user/devices [post]
func CreateUserDeviceHandler(c *gin.Context) {
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

	var req CreateDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Set default device type if not provided
	if req.DeviceType == "" {
		req.DeviceType = "esp32"
	}

	// Create device for the user
	device, err := CreateDevice(userID, req.Name, req.DeviceType, req.Location)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create device"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Device created successfully",
		"device": gin.H{
			"id":          device.ID,
			"name":        *device.Name,
			"device_type": device.DeviceType,
			"location":    *device.Location,
			"api_key":     device.APIKey,
			"is_active":   device.IsActive,
		},
	})
}

// GetDevicePowerHandler - Returns power generation details for a specific device
// @Summary Get device power data
// @Description Get current power generation stats for a device
// @Tags Devices
// @Accept json
// @Produce json
// @Param id path string true "Device ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /user/devices/{id}/power [get]
// @Router /admin/devices/{id}/power [get]
// @Router /superadmin/devices/{id}/power [get]
func GetDevicePowerHandler(c *gin.Context) {
	deviceID := c.Param("id")
	id, err := uuid.Parse(deviceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid device ID"})
		return
	}

	device, err := GetDeviceByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Device not found"})
		return
	}

	// Get power data for the last 24 hours
	startDate := time.Now().AddDate(0, 0, -1)

	query := `
		SELECT 
			COALESCE(MAX(solar_power), 0) as current_power,
			COALESCE(SUM(solar_power), 0) as today_energy,
			COALESCE(AVG(solar_power), 0) as avg_power,
			COALESCE(MAX(solar_power), 0) as peak_power,
			COALESCE(AVG(battery_level), 0) as avg_battery,
			COALESCE(SUM(load_power), 0) as total_consumption
		FROM energy_data
		WHERE device_id = ? AND timestamp >= ?`

	var powerData struct {
		CurrentPower     float64 `db:"current_power"`
		TodayEnergy      float64 `db:"today_energy"`
		AvgPower         float64 `db:"avg_power"`
		PeakPower        float64 `db:"peak_power"`
		AvgBattery       float64 `db:"avg_battery"`
		TotalConsumption float64 `db:"total_consumption"`
	}

	err = database.DB.QueryRow(query, id, startDate).Scan(
		&powerData.CurrentPower,
		&powerData.TodayEnergy,
		&powerData.AvgPower,
		&powerData.PeakPower,
		&powerData.AvgBattery,
		&powerData.TotalConsumption,
	)

	if err != nil {
		// Return default values if no data
		c.JSON(http.StatusOK, gin.H{
			"device_id":         id,
			"device_name":       *device.Name,
			"current_power":     0,
			"today_energy":      0,
			"avg_power":         0,
			"peak_power":        0,
			"avg_battery":       0,
			"total_consumption": 0,
			"status":            "No data available",
		})
		return
	}

	// Calculate efficiency (typical solar panel efficiency is around 15-20%)
	efficiency := 0.0
	if powerData.AvgPower > 0 {
		efficiency = (powerData.AvgPower / 5.0) * 100 // Assuming 5kW max for calculation
	}

	c.JSON(http.StatusOK, gin.H{
		"device_id":         id,
		"device_name":       *device.Name,
		"current_power":     powerData.CurrentPower,
		"today_energy":      powerData.TodayEnergy,
		"avg_power":         powerData.AvgPower,
		"peak_power":        powerData.PeakPower,
		"avg_battery":       powerData.AvgBattery,
		"total_consumption": powerData.TotalConsumption,
		"efficiency":        efficiency,
		"status":            "Active",
		"last_updated":      time.Now().Format("2006-01-02 15:04:05"),
	})
}

// GetAllDevicesHandler - Returns all devices across all users (for admin)
// @Summary Get all devices (Admin)
// @Description Get all devices in the system
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Param search query string false "Search term"
// @Param status query string false "Status filter (ACTIVE/INACTIVE)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/devices [get]
// @Router /superadmin/devices [get]
func GetAllDevicesHandler(c *gin.Context) {
	// Get query params for filtering
	searchTerm := c.Query("search")
	statusFilter := c.Query("status")

	devices, err := GetAllDevices(searchTerm, statusFilter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch devices", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"devices": devices,
		"count":   len(devices),
	})
}
