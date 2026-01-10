package users

import (
	"sems-backend/internal/database"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GlobalStats represents global statistics for dashboards
type GlobalStats struct {
	TotalPlants      int     `json:"total_plants"`
	ActiveDevices    int     `json:"active_devices"`
	EnergyGenerated  string  `json:"energy_generated"`
	TotalEnergy      float64 `json:"total_energy"`
	ActiveAdmins     int     `json:"active_admins"`
	Revenue          string  `json:"revenue"`
	RevenueRaw       float64 `json:"revenue_raw"`
	TotalUsers       int     `json:"total_users"`
	SystemEfficiency string  `json:"system_efficiency"`
	CO2Reduced       string  `json:"co2_reduced"`
	Uptime           string  `json:"uptime"`
}

// GetGlobalStatsHandler returns global statistics for super admin
func GetGlobalStatsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	stats, err := GetStats("")
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch global stats"})
		return
	}

	c.JSON(200, gin.H{"stats": stats})
}

// GetAdminStatsHandler returns statistics for admin dashboard
func GetAdminStatsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	currentUserID := c.GetString("user_id")

	if currentUserRole != "ADMIN" && currentUserRole != "SUPER_ADMIN" {
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	adminID := ""
	if currentUserRole == "ADMIN" {
		adminID = currentUserID
	}

	stats, err := GetStats(adminID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch admin stats"})
		return
	}

	c.JSON(200, gin.H{"stats": stats})
}

// GetStats retrieves statistics from the database, optionally filtered by adminID
func GetStats(adminID string) (*GlobalStats, error) {
	stats := &GlobalStats{}

	// Filter clause
	whereClause := ""
	params := []interface{}{}
	if adminID != "" {
		whereClause = " AND admin_id = ?"
		params = append(params, adminID)
	}

	// 1. Get total users
	var totalUsers int
	queryUsers := "SELECT COUNT(*) FROM users WHERE role = 'USER'" + whereClause
	_ = database.DB.QueryRow(queryUsers, params...).Scan(&totalUsers)
	stats.TotalUsers = totalUsers

	// 2. Get active admins (only relevant for global stats)
	if adminID == "" {
		var activeAdmins int
		_ = database.DB.QueryRow(`SELECT COUNT(*) FROM users WHERE role = 'ADMIN' AND is_active = true`).Scan(&activeAdmins)
		stats.ActiveAdmins = activeAdmins
	}

	// 3. Calculate energy generated
	var totalEnergy float64
	queryEnergy := `
		SELECT COALESCE(SUM(ed.solar_power), 0) 
		FROM energy_data ed
		JOIN users u ON ed.device_id = u.device_id
		WHERE ed.timestamp >= datetime('now', '-30 days')`

	energyParams := []interface{}{}
	if adminID != "" {
		queryEnergy += " AND u.admin_id = ?"
		energyParams = append(energyParams, adminID)
	}

	_ = database.DB.QueryRow(queryEnergy, energyParams...).Scan(&totalEnergy)
	stats.TotalEnergy = totalEnergy

	// Format energy display
	if totalEnergy >= 1000 {
		stats.EnergyGenerated = strconv.FormatFloat(totalEnergy/1000, 'f', 1, 64) + " MWh"
	} else {
		stats.EnergyGenerated = strconv.FormatFloat(totalEnergy, 'f', 1, 64) + " kWh"
	}

	// 4. Calculate revenue (₹8 per kWh)
	revenue := totalEnergy * 8
	stats.RevenueRaw = revenue

	if revenue >= 10000000 {
		stats.Revenue = "₹" + strconv.FormatFloat(revenue/10000000, 'f', 1, 64) + "Cr"
	} else if revenue >= 100000 {
		stats.Revenue = "₹" + strconv.FormatFloat(revenue/100000, 'f', 1, 64) + "L"
	} else {
		stats.Revenue = "₹" + strconv.FormatFloat(revenue, 'f', 0, 64)
	}

	// 5. System efficiency (Demo value)
	stats.SystemEfficiency = "94.2%"

	// 6. CO2 reduction (0.7 kg per kWh)
	co2 := totalEnergy * 0.7
	if co2 >= 1000 {
		stats.CO2Reduced = strconv.FormatFloat(co2/1000, 'f', 1, 64) + " tons"
	} else {
		stats.CO2Reduced = strconv.FormatFloat(co2, 'f', 1, 64) + " kg"
	}

	// 7. System uptime (Demo value)
	stats.Uptime = "99.9%"

	// 8. Total plants (Installed users)
	var totalPlants int
	queryPlants := "SELECT COUNT(*) FROM users WHERE role = 'USER' AND installation_status = 'INSTALLED'" + whereClause
	_ = database.DB.QueryRow(queryPlants, params...).Scan(&totalPlants)
	stats.TotalPlants = totalPlants
	stats.ActiveDevices = totalPlants

	return stats, nil
}
