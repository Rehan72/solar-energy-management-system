package devices

import (
	"time"

	"github.com/google/uuid"
)

type Device struct {
	ID            uuid.UUID  `json:"id" db:"id"`
	DeviceID      *string    `json:"device_id" db:"device_id"`
	UserID        *uuid.UUID `json:"user_id" db:"user_id"`
	UserName      string     `json:"user_name" db:"user_name"`
	Name          *string    `json:"name" db:"name"`
	DeviceType    string     `json:"device_type" db:"device_type"`
	Location      *string    `json:"location" db:"location"`
	APIKey        string     `json:"api_key" db:"api_key"`
	IsActive      bool       `json:"is_active" db:"is_active"`
	LastSeen      *time.Time `json:"last_seen" db:"last_seen"`
	CreatedAt     time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at" db:"updated_at"`
	// Power generation fields (populated from energy_data)
	CurrentPower  float64    `json:"current_power" db:"current_power"`
	TodayEnergy   float64    `json:"today_energy" db:"today_energy"`
	PeakPower     float64    `json:"peak_power" db:"peak_power"`
	AvgPower      float64    `json:"avg_power" db:"avg_power"`
	AvgBattery    float64    `json:"avg_battery" db:"avg_battery"`
	TotalConsumption float64 `json:"total_consumption" db:"total_consumption"`
	Efficiency    float64    `json:"efficiency" db:"efficiency"`
}

// DevicePowerDetails represents detailed power information for a device
type DevicePowerDetails struct {
	DeviceID          uuid.UUID `json:"device_id"`
	DeviceName        string    `json:"device_name"`
	CurrentPower      float64   `json:"current_power"`
	TodayEnergy       float64   `json:"today_energy"`
	AvgPower          float64   `json:"avg_power"`
	PeakPower         float64   `json:"peak_power"`
	AvgBattery        float64   `json:"avg_battery"`
	TotalConsumption  float64   `json:"total_consumption"`
	Efficiency        float64   `json:"efficiency"`
	Status            string    `json:"status"`
	LastUpdated       string    `json:"last_updated"`
}
