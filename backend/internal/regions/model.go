package regions

import (
	"time"

	"github.com/google/uuid"
)

// Region represents a geographical region with aggregated statistics
type Region struct {
	ID             uuid.UUID `json:"id" db:"id"`
	Name           string    `json:"name" db:"name"`
	State          string    `json:"state" db:"state"`
	Country        string    `json:"country" db:"country"`
	Timezone       string    `json:"timezone" db:"timezone"`
	Description    string    `json:"description" db:"description"`
	Status         string    `json:"status" db:"status"`
	Latitude       float64   `json:"latitude" db:"latitude"`
	Longitude      float64   `json:"longitude" db:"longitude"`
	ExpectedUsers  int       `json:"expected_users" db:"expected_users"`
	ExpectedPlants int       `json:"expected_plants" db:"expected_plants"`
	CapacityMW     float64   `json:"capacity_mw" db:"capacity_mw"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}

// RegionRequest represents the request body for creating a region
type RegionRequest struct {
	Name           string  `json:"name" binding:"required"`
	State          string  `json:"state" binding:"required"`
	Country        string  `json:"country" binding:"required"`
	Timezone       string  `json:"timezone" binding:"required"`
	Description    string  `json:"description"`
	Status         string  `json:"status"`
	Latitude       float64 `json:"latitude"`
	Longitude      float64 `json:"longitude"`
	ExpectedUsers  int     `json:"expected_users"`
	ExpectedPlants int     `json:"expected_plants"`
	CapacityMW     float64 `json:"capacity_mw"`
}
