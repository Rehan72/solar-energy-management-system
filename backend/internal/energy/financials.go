package energy

import (
	"log"
	"net/http"
	"sems-backend/internal/devices"
	"sems-backend/internal/users"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FinancialStats struct {
	TotalSavings    float64 `json:"total_savings"`
	ROIPercentage   float64 `json:"roi_percentage"`
	ProjectCost     float64 `json:"project_cost"`
	PaybackProgress float64 `json:"payback_progress"`
	TariffRate      float64 `json:"tariff_rate"`
}

func GetFinancialStatsHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	u := user.(*users.User)

	// Default tariff if not set (e.g. 8 INR/kWh)
	tariff := u.TariffRate
	if tariff == 0 {
		tariff = 8.0
	}

	// Calculate total energy generated
	// In a real app, this would be a SUM aggregate query.
	// For this MVP, we'll fetch history (limited) or estimate.
	// Since we don't have a reliable 'TotalYield' field in DB yet, let's sum up today's energy from connected devices as a proxy + historical dummy data
	// OR better: use the 'TotalEnergy' field if available on devices.

	var totalEnergykWh float64

	// Get user devices
	userID, err := uuid.Parse(u.ID)
	if err == nil {
		userDevices, err := devices.GetDevicesByUserID(userID, "", false)
		if err == nil {
			for range userDevices {
				// In a real scenario, we'd query the 'energy_data' table for SUM(power * time).
				// Here we will simulate 'Total Life Energy' based on LastDataReceived or just random for demo if 0.
				// Ideally the Device struct should have 'TotalYield'

				// For DEMO purposes: calculating pseudo-total based on plant capacity * days installed * 4 hours sun
				daysSinceInstallation := 0.0
				if !u.InstallationDate.IsZero() {
					daysSinceInstallation = time.Since(u.InstallationDate).Hours() / 24
				} else {
					// Fallback if date not set
					daysSinceInstallation = 30 // Assume 1 month
				}

				// Estimate: Capacity * 4 kWh/day * days * efficiency (0.8)
				capacity := u.PlantCapacityKW
				if capacity == 0 {
					duration := 5.0
					capacity = duration
				} // Fallback

				totalEnergykWh += capacity * 4.0 * daysSinceInstallation * 0.85
			}
		} else {
			log.Printf("Error getting devices for financial stats: %v", err)
		}
	}

	// Calculate Financials
	savings := totalEnergykWh * tariff

	// Avoid division by zero
	projectCost := u.ProjectCost
	if projectCost == 0 {
		// Estimate project cost: ~40,000 INR per kW
		if u.PlantCapacityKW > 0 {
			projectCost = u.PlantCapacityKW * 40000
		} else {
			projectCost = 200000 // Default 5kW system cost
		}
	}

	roi := 0.0
	progress := 0.0
	if projectCost > 0 {
		roi = (savings / projectCost) * 100
		progress = (savings / projectCost) * 100
		if progress > 100 {
			progress = 100
		}
	}

	c.JSON(http.StatusOK, FinancialStats{
		TotalSavings:    savings,
		ROIPercentage:   roi,
		ProjectCost:     projectCost,
		PaybackProgress: progress,
		TariffRate:      tariff,
	})
}
