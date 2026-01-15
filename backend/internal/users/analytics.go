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

// Hierarchy structures
type UserInfo struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type AdminInfo struct {
	ID    string     `json:"id"`
	Name  string     `json:"name"`
	Users []UserInfo `json:"users"`
}

type PlantHierarchy struct {
	ID              string      `json:"id"`
	Name            string      `json:"name"`
	Latitude        float64     `json:"latitude"`
	Longitude       float64     `json:"longitude"`
	Status          string      `json:"status"`
	CurrentOutputKW float64     `json:"current_output_kw"`
	Admins          []AdminInfo `json:"admins"`
}

type RegionHierarchy struct {
	Region string           `json:"region"`
	Plants []PlantHierarchy `json:"plants"`
}

type PublicPlantInfo struct {
	ID              string  `json:"id"`
	Name            string  `json:"name"`
	Latitude        float64 `json:"latitude"`
	Longitude       float64 `json:"longitude"`
	Status          string  `json:"status"`
	CurrentOutputKW float64 `json:"current_output_kw"`
}

type PublicRegionHierarchy struct {
	Region string            `json:"region"`
	Plants []PublicPlantInfo `json:"plants"`
}

// @Summary Get global stats
// @Description Get global statistics for SuperAdmin
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Param region query string false "Region filter"
// @Param period query string false "Period (week, month, quarter, year)"
// @Success 200 {object} map[string]GlobalStats
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /superadmin/global/stats [get]
func GetGlobalStatsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	region := c.Query("region")
	period := c.DefaultQuery("period", "month")
	stats, err := GetStats("", region, period)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch global stats"})
		return
	}

	c.JSON(200, gin.H{"stats": stats})
}

// @Summary Get admin stats
// @Description Get statistics for Admin dashboard
// @Tags Admin
// @Accept json
// @Produce json
// @Param period query string false "Period (week, month, quarter, year)"
// @Success 200 {object} map[string]GlobalStats
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /admin/analytics [get]
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

	period := c.DefaultQuery("period", "month")
	stats, err := GetStats(adminID, "", period)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch admin stats"})
		return
	}

	c.JSON(200, gin.H{"stats": stats})
}

// GetStats retrieves statistics from the database, optionally filtered by adminID, region and period
func GetStats(adminID string, region string, period string) (*GlobalStats, error) {
	stats := &GlobalStats{}

	// Filter clause
	whereClause := ""
	params := []interface{}{}
	if adminID != "" {
		whereClause += " AND admin_id = ?"
		params = append(params, adminID)
	}
	if region != "" {
		whereClause += " AND region = ?"
		params = append(params, region)
	}

	// Period mapping
	interval := "-30 days"
	switch period {
	case "week":
		interval = "-7 days"
	case "quarter":
		interval = "-90 days"
	case "year":
		interval = "-365 days"
	}

	// 1. Get total users
	var totalUsers int
	queryUsers := "SELECT COUNT(*) FROM users WHERE role = 'USER'" + whereClause
	_ = database.DB.QueryRow(queryUsers, params...).Scan(&totalUsers)
	stats.TotalUsers = totalUsers

	// 2. Get active admins (only filtered by region if requested)
	var activeAdmins int
	queryAdmins := `SELECT COUNT(*) FROM users WHERE role = 'ADMIN' AND is_active = true`
	adminParams := []interface{}{}
	if region != "" {
		queryAdmins += " AND region = ?"
		adminParams = append(adminParams, region)
	}
	_ = database.DB.QueryRow(queryAdmins, adminParams...).Scan(&activeAdmins)
	stats.ActiveAdmins = activeAdmins

	// 3. Calculate energy generated
	var totalEnergy float64
	queryEnergy := `
		SELECT COALESCE(SUM(ed.solar_power), 0) 
		FROM energy_data ed
		JOIN users u ON ed.device_id = u.device_id
		WHERE ed.timestamp >= datetime('now', '` + interval + `')`

	energyParams := []interface{}{}
	if adminID != "" {
		queryEnergy += " AND u.admin_id = ?"
		energyParams = append(energyParams, adminID)
	}
	if region != "" {
		queryEnergy += " AND u.region = ?"
		energyParams = append(energyParams, region)
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

// @Summary Get regional stats
// @Description Get statistics grouped by region
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /superadmin/stats/regional [get]
func GetRegionalStatsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	rows, err := database.DB.Query(`
		SELECT 
			u.region, 
			COUNT(DISTINCT u.id) as users,
			COUNT(DISTINCT p.id) as plants
		FROM users u
		LEFT JOIN solar_plants p ON u.region = p.region
		WHERE u.role = 'USER' AND u.region IS NOT NULL AND u.region != ''
		GROUP BY u.region
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch regional stats"})
		return
	}
	defer rows.Close()

	type RegionalStat struct {
		Region string `json:"region"`
		Users  int    `json:"users"`
		Plants int    `json:"plants"`
	}

	var results []RegionalStat
	for rows.Next() {
		var s RegionalStat
		if err := rows.Scan(&s.Region, &s.Users, &s.Plants); err != nil {
			continue
		}
		results = append(results, s)
	}

	c.JSON(200, gin.H{"data": results})
}

// @Summary Get system hierarchy
// @Description Get full system hierarchy (Region -> Plant -> Admin -> User)
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /superadmin/hierarchy [get]
func GetSystemHierarchyHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(403, gin.H{"error": "Access denied"})
		return
	}

	// 1. Fetch all plants
	plantsRows, err := database.DB.Query(`
		SELECT id, name, region, latitude, longitude, status, current_output_kw 
		FROM solar_plants
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch plants for hierarchy"})
		return
	}
	defer plantsRows.Close()

	plantMap := make(map[string]*PlantHierarchy)
	regionMap := make(map[string]*RegionHierarchy)

	for plantsRows.Next() {
		var p PlantHierarchy
		var regionName string
		var lat, lng *float64
		if err := plantsRows.Scan(&p.ID, &p.Name, &regionName, &lat, &lng, &p.Status, &p.CurrentOutputKW); err != nil {
			continue
		}
		if lat != nil {
			p.Latitude = *lat
		}
		if lng != nil {
			p.Longitude = *lng
		}
		p.Admins = []AdminInfo{}

		plantMap[p.ID] = &p

		if _, ok := regionMap[regionName]; !ok {
			regionMap[regionName] = &RegionHierarchy{
				Region: regionName,
				Plants: []PlantHierarchy{},
			}
		}
	}

	// 2. Fetch all users and admins
	usersRows, err := database.DB.Query(`
		SELECT id, first_name, last_name, email, role, admin_id, plant_id 
		FROM users 
		WHERE role IN ('USER', 'ADMIN')
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch users for hierarchy"})
		return
	}
	defer usersRows.Close()

	admins := make(map[string]*AdminInfo)
	userToPlant := make(map[string]string)
	userToAdmin := make(map[string]string)
	userInfos := make(map[string]UserInfo)

	for usersRows.Next() {
		var id, fName, lName, email, role, adminID, plantID string
		if err := usersRows.Scan(&id, &fName, &lName, &email, &role, &adminID, &plantID); err != nil {
			continue
		}

		fullName := fName + " " + lName
		if role == "ADMIN" {
			admins[id] = &AdminInfo{
				ID:    id,
				Name:  fullName,
				Users: []UserInfo{},
			}
		} else if role == "USER" {
			userInfos[id] = UserInfo{ID: id, Name: fullName, Email: email}
			if plantID != "" {
				userToPlant[id] = plantID
			}
			if adminID != "" {
				userToAdmin[id] = adminID
			}
		}
	}

	// 3. Assemble the hierarchy
	// Group users by admin within plants
	type PlantAdminKey struct {
		PlantID string
		AdminID string
	}
	plantAdminMap := make(map[PlantAdminKey]*AdminInfo)

	for userID, plantID := range userToPlant {
		adminID := userToAdmin[userID]
		if adminID == "" {
			continue // Or handle unassigned admins
		}

		adminBase, ok := admins[adminID]
		if !ok {
			continue
		}

		key := PlantAdminKey{PlantID: plantID, AdminID: adminID}
		if _, exists := plantAdminMap[key]; !exists {
			plantAdminMap[key] = &AdminInfo{
				ID:    adminID,
				Name:  adminBase.Name,
				Users: []UserInfo{},
			}
		}
		plantAdminMap[key].Users = append(plantAdminMap[key].Users, userInfos[userID])
	}

	// Add grouped admins to plants
	for key, adminInfo := range plantAdminMap {
		if plant, ok := plantMap[key.PlantID]; ok {
			plant.Admins = append(plant.Admins, *adminInfo)
		}
	}

	// Better way: re-iterate and build final result
	// Reset region plants
	for _, r := range regionMap {
		r.Plants = []PlantHierarchy{}
	}

	// Re-run plants fetch to associate with regions correctly
	plantsRows2, _ := database.DB.Query(`SELECT id, region FROM solar_plants`)
	defer plantsRows2.Close()
	for plantsRows2.Next() {
		var pid, rname string
		plantsRows2.Scan(&pid, &rname)
		if p, ok := plantMap[pid]; ok {
			if r, ok := regionMap[rname]; ok {
				r.Plants = append(r.Plants, *p)
			}
		}
	}

	var result []RegionHierarchy
	for _, r := range regionMap {
		result = append(result, *r)
	}

	c.JSON(200, gin.H{"data": result})
}

// @Summary Get public hierarchy
// @Description Get basic plant info for public map
// @Tags Public
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /public/hierarchy [get]
func GetPublicHierarchyHandler(c *gin.Context) {
	// 1. Fetch all plants
	plantsRows, err := database.DB.Query(`
		SELECT id, name, region, latitude, longitude, status, current_output_kw 
		FROM solar_plants
	`)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch plants for public map"})
		return
	}
	defer plantsRows.Close()

	regionMap := make(map[string]*PublicRegionHierarchy)

	for plantsRows.Next() {
		var p PublicPlantInfo
		var regionName string
		var lat, lng *float64
		if err := plantsRows.Scan(&p.ID, &p.Name, &regionName, &lat, &lng, &p.Status, &p.CurrentOutputKW); err != nil {
			continue
		}
		if lat != nil {
			p.Latitude = *lat
		}
		if lng != nil {
			p.Longitude = *lng
		}

		if _, ok := regionMap[regionName]; !ok {
			regionMap[regionName] = &PublicRegionHierarchy{
				Region: regionName,
				Plants: []PublicPlantInfo{},
			}
		}
		regionMap[regionName].Plants = append(regionMap[regionName].Plants, p)
	}

	var result []PublicRegionHierarchy
	for _, r := range regionMap {
		result = append(result, *r)
	}

	c.JSON(200, gin.H{"data": result})
}
