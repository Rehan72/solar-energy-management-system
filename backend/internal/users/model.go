package users

import (
	"time"
)

type User struct {
	ID           string    `json:"id" db:"id"`
	FirstName    string    `json:"first_name" db:"first_name"`
	LastName     string    `json:"last_name" db:"last_name"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Role         string    `json:"role" db:"role"`
	Phone        string    `json:"phone" db:"phone"`
	ProfileImage string    `json:"profile_image" db:"profile_image"`
	AddressLine1 string    `json:"address_line1" db:"address_line1"`
	AddressLine2 string    `json:"address_line2" db:"address_line2"`
	City         string    `json:"city" db:"city"`
	State        string    `json:"state" db:"state"`
	Pincode      string    `json:"pincode" db:"pincode"`
	Region       string    `json:"region" db:"region"`
	Latitude     float64   `json:"latitude" db:"latitude"`
	Longitude    float64   `json:"longitude" db:"longitude"`
	IsActive     bool      `json:"is_active" db:"is_active"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
