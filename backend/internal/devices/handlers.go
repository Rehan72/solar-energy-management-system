package devices

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateDeviceRequest struct {
	Name       string `json:"name" binding:"required"`
	DeviceType string `json:"device_type"`
	Location   string `json:"location"`
}

func CreateDeviceHandler(c *gin.Context) {
	var req CreateDeviceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// Get user ID from context (set by auth middleware)
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

	// Set default device type if not provided
	if req.DeviceType == "" {
		req.DeviceType = "esp32"
	}

	// Create device
	device, err := CreateDevice(userID, req.Name, req.DeviceType, req.Location)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create device"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Device created successfully",
		"device": gin.H{
			"id":       device.ID,
			"name":     device.Name,
			"type":     device.DeviceType,
			"location": device.Location,
			"api_key":  device.APIKey,
		},
	})
}