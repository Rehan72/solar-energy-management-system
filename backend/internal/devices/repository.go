package devices

import (
	"sems-backend/internal/database"

	"github.com/google/uuid"
)

func CreateDevice(userID uuid.UUID, name, deviceType, location string) (*Device, error) {
	device := &Device{
		ID:         uuid.New(),
		UserID:     userID,
		Name:       name,
		DeviceType: deviceType,
		Location:   location,
		APIKey:     generateAPIKey(),
		IsActive:   true,
	}

	query := `
		INSERT INTO devices (id, user_id, name, device_type, location, api_key, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at`

	err := database.DB.QueryRow(query,
		device.ID, device.UserID, device.Name, device.DeviceType,
		device.Location, device.APIKey, device.IsActive).
		Scan(&device.CreatedAt, &device.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return device, nil
}

func generateAPIKey() string {
	return uuid.New().String()
}