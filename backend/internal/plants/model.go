package plants

import (
	"time"

	"github.com/google/uuid"
)

type Plant struct {
	ID              uuid.UUID  `json:"id" db:"id"`
	Name            string     `json:"name" db:"name"`
	Location        string     `json:"location" db:"location"`
	RegionID        *uuid.UUID `json:"region_id" db:"region_id"`
	Region          string     `json:"region" db:"region"` // For display purposes
	CapacityKW      float64    `json:"capacity_kw" db:"capacity_kw"`
	CurrentOutputKW float64    `json:"current_output_kw" db:"current_output_kw"`
	Efficiency      float64    `json:"efficiency" db:"efficiency"`
	Latitude        *float64   `json:"latitude" db:"latitude"`
	Longitude       *float64   `json:"longitude" db:"longitude"`
	Status          string     `json:"status" db:"status"`
	Description     string     `json:"description" db:"description"`
	CreatedAt       time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at" db:"updated_at"`
}

type PlantStatus string

const (
	PlantStatusActive      PlantStatus = "ACTIVE"
	PlantStatusMaintenance PlantStatus = "MAINTENANCE"
	PlantStatusInactive    PlantStatus = "INACTIVE"
)
