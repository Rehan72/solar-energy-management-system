package inventory

import (
	"time"
)

type InventoryItem struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Category    string    `json:"category" db:"category"` // e.g., "Solar Panel", "Inverter", "Battery", "Mounting"
	Brand       string    `json:"brand" db:"brand"`
	Model       string    `json:"model" db:"model"`
	Description string    `json:"description" db:"description"`
	Price       float64   `json:"price" db:"price"`
	StockQty    int       `json:"stock_qty" db:"stock_qty"`
	ImageURL    string    `json:"image_url" db:"image_url"`         // Primary image
	Gallery     string    `json:"gallery" db:"gallery"`             // JSON string of additional image URLs
	Specs       string    `json:"specs" db:"specs"`                 // JSON string of technical specifications
	IsActive    bool      `json:"is_active" db:"is_active"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
