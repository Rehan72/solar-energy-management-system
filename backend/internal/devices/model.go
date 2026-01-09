package devices

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	DeviceID     *string    `json:"device_id" db:"device_id"`
	UserID       *uuid.UUID `json:"user_id" db:"user_id"`
	UserName     string     `json:"user_name" db:"user_name"`
	Name         *string    `json:"name" db:"name"`
	DeviceType   string     `json:"device_type" db:"device_type"`
	Location     *string    `json:"location" db:"location"`
	APIKey       string     `json:"api_key" db:"api_key"`
	IsActive     bool       `json:"is_active" db:"is_active"`
	LastSeen     *time.Time `json:"last_seen" db:"last_seen"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}
