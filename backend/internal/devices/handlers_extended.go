package devices

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UpdateDeviceRequest struct {
	Name       string `json:"name"`
	Location   string `json:"location"`
	IsActive   *bool  `json:"is_active"`
}

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

// GetAllDevicesHandler - Returns all devices across all users (for admin)
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
