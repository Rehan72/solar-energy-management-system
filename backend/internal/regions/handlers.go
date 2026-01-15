package regions

import (
	"fmt"
	"net/http"
	"time"

	"sems-backend/internal/database"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetRegionsHandler handles GET /superadmin/regions
// @Summary Get all regions
// @Description Get a list of all regions
// @Tags Regions
// @Accept json
// @Produce json
// @Success 200 {object} []Region
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/regions [get]
func GetRegionsHandler(c *gin.Context) {
	regions, err := GetAllRegions()
	if err != nil {
		fmt.Printf("Error fetching regions: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch regions", "details": err.Error()})
		return
	}
	c.JSON(http.StatusOK, regions)
}

// CreateRegionHandler handles POST /superadmin/regions
// @Summary Create a region
// @Description Create a new region
// @Tags Regions
// @Accept json
// @Produce json
// @Param region body RegionRequest true "Region creation data"
// @Success 201 {object} Region
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/regions [post]
func CreateRegionHandler(c *gin.Context) {
	var req RegionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	// Set default status if not provided
	if req.Status == "" {
		req.Status = "ACTIVE"
	}

	region, err := CreateRegion(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create region", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, region)
}

// UpdateRegionHandler handles PUT /superadmin/regions/:id
// @Summary Update a region
// @Description Update region details
// @Tags Regions
// @Accept json
// @Produce json
// @Param id path string true "Region ID"
// @Param region body RegionRequest true "Region update data"
// @Success 200 {object} Region
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/regions/{id} [put]
func UpdateRegionHandler(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Region ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid region ID format"})
		return
	}

	var req RegionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "details": err.Error()})
		return
	}

	region, err := UpdateRegion(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update region", "details": err.Error()})
		return
	}

	if region == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Region not found"})
		return
	}

	c.JSON(http.StatusOK, region)
}

// DeleteRegionHandler handles DELETE /superadmin/regions/:id
// @Summary Delete a region
// @Description Delete a region by ID
// @Tags Regions
// @Accept json
// @Produce json
// @Param id path string true "Region ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/regions/{id} [delete]
func DeleteRegionHandler(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Region ID is required"})
		return
	}

	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid region ID format"})
		return
	}

	err = DeleteRegion(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete region", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Region deleted successfully"})
}

// GetAllRegions retrieves all regions from database or returns demo data
func GetAllRegions() ([]Region, error) {
	if database.DB == nil {
		return getDemoRegions(), nil
	}

	// Check if regions table exists
	var tableName string
	err := database.DB.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='regions'").Scan(&tableName)
	if err != nil || tableName != "regions" {
		createTable()
		return []Region{}, nil
	}

	rows, err := database.DB.Query(`SELECT id, name, state, country, timezone, description, status, COALESCE(latitude, 0), COALESCE(longitude, 0), expected_users, expected_plants, capacity_mw, created_at, updated_at FROM regions`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var regions []Region
	for rows.Next() {
		var r Region
		var createdAt, updatedAt string
		err := rows.Scan(&r.ID, &r.Name, &r.State, &r.Country, &r.Timezone, &r.Description, &r.Status, &r.Latitude, &r.Longitude, &r.ExpectedUsers, &r.ExpectedPlants, &r.CapacityMW, &createdAt, &updatedAt)
		if err != nil {
			return nil, err
		}
		// Parse timestamps
		if createdAt != "" {
			r.CreatedAt, _ = time.Parse("2006-01-02T15:04:05Z07:00", createdAt)
		}
		if updatedAt != "" {
			r.UpdatedAt, _ = time.Parse("2006-01-02T15:04:05Z07:00", updatedAt)
		}
		regions = append(regions, r)
	}

	if len(regions) == 0 {
		return []Region{}, nil
	}

	return regions, nil
}

// seedMissingRegions seeds any demo regions that don't exist in the database
func seedMissingRegions(existingRegions []Region) {
	demoRegions := getDemoRegions()
	existingRegionNames := make(map[string]bool)
	for _, r := range existingRegions {
		existingRegionNames[r.Name] = true
	}

	query := `INSERT OR IGNORE INTO regions (id, name, state, country, timezone, description, status, latitude, longitude, expected_users, expected_plants, capacity_mw, created_at, updated_at)
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	now := time.Now().Format(time.RFC3339)
	for _, r := range demoRegions {
		if !existingRegionNames[r.Name] {
			_, err := database.DB.Exec(query,
				r.ID.String(),
				r.Name,
				r.State,
				r.Country,
				r.Timezone,
				r.Description,
				r.Status,
				r.Latitude,
				r.Longitude,
				r.ExpectedUsers,
				r.ExpectedPlants,
				r.CapacityMW,
				now,
				now,
			)
			if err != nil {
				// Ignore errors for duplicate entries
				continue
			}
		}
	}
}

// seedRegions inserts demo regions into the database
func seedRegions() {
	demoRegions := getDemoRegions()
	query := `INSERT OR IGNORE INTO regions (id, name, state, country, timezone, description, status, latitude, longitude, expected_users, expected_plants, capacity_mw, created_at, updated_at)
			  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	now := time.Now().Format(time.RFC3339)
	for _, r := range demoRegions {
		_, err := database.DB.Exec(query,
			r.ID.String(),
			r.Name,
			r.State,
			r.Country,
			r.Timezone,
			r.Description,
			r.Status,
			r.Latitude,
			r.Longitude,
			r.ExpectedUsers,
			r.ExpectedPlants,
			r.CapacityMW,
			now,
			now,
		)
		if err != nil {
			// Ignore errors for duplicate entries
			continue
		}
	}
}

// CreateRegion creates a new region in the database
func CreateRegion(req RegionRequest) (*Region, error) {
	if database.DB == nil {
		return createDemoRegion(req), nil
	}

	createTable()

	now := time.Now()
	id := uuid.New()

	query := `INSERT INTO regions (id, name, state, country, timezone, description, status, latitude, longitude, expected_users, expected_plants, capacity_mw, created_at, updated_at)
		  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := database.DB.Exec(query, id.String(), req.Name, req.State, req.Country, req.Timezone, req.Description, req.Status,
		req.Latitude, req.Longitude, req.ExpectedUsers, req.ExpectedPlants, req.CapacityMW, now.Format(time.RFC3339), now.Format(time.RFC3339))
	if err != nil {
		return nil, err
	}

	return &Region{
		ID:             id,
		Name:           req.Name,
		State:          req.State,
		Country:        req.Country,
		Timezone:       req.Timezone,
		Description:    req.Description,
		Status:         req.Status,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		ExpectedUsers:  req.ExpectedUsers,
		ExpectedPlants: req.ExpectedPlants,
		CapacityMW:     req.CapacityMW,
		CreatedAt:      now,
		UpdatedAt:      now,
	}, nil
}

// UpdateRegion updates an existing region
func UpdateRegion(id uuid.UUID, req RegionRequest) (*Region, error) {
	if database.DB == nil {
		// Demo mode - return updated demo region
		demo := createDemoRegion(req)
		demo.ID = id
		return demo, nil
	}

	now := time.Now()

	query := `UPDATE regions SET name=?, state=?, country=?, timezone=?, description=?, status=?, latitude=?, longitude=?, expected_users=?, expected_plants=?, capacity_mw=?, updated_at=? WHERE id=?`

	result, err := database.DB.Exec(query, req.Name, req.State, req.Country, req.Timezone, req.Description, req.Status,
		req.Latitude, req.Longitude, req.ExpectedUsers, req.ExpectedPlants, req.CapacityMW, now.Format(time.RFC3339), id.String())
	if err != nil {
		return nil, err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return nil, nil // Region not found
	}

	return &Region{
		ID:             id,
		Name:           req.Name,
		State:          req.State,
		Country:        req.Country,
		Timezone:       req.Timezone,
		Description:    req.Description,
		Status:         req.Status,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		ExpectedUsers:  req.ExpectedUsers,
		ExpectedPlants: req.ExpectedPlants,
		CapacityMW:     req.CapacityMW,
		UpdatedAt:      now,
	}, nil
}

// DeleteRegion deletes a region by ID
func DeleteRegion(id uuid.UUID) error {
	if database.DB == nil {
		return nil // Demo mode
	}

	query := `DELETE FROM regions WHERE id=?`
	_, err := database.DB.Exec(query, id.String())
	return err
}

// createTable creates the regions table if it doesn't exist
func createTable() {
	query := `CREATE TABLE IF NOT EXISTS regions (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL,
		state TEXT NOT NULL,
		country TEXT NOT NULL,
		timezone TEXT NOT NULL,
		description TEXT,
		status TEXT DEFAULT 'ACTIVE',
		latitude REAL,
		longitude REAL,
		expected_users INTEGER DEFAULT 0,
		expected_plants INTEGER DEFAULT 0,
		capacity_mw REAL DEFAULT 0,
		created_at TEXT,
		updated_at TEXT
	)`
	database.DB.Exec(query)
}

// getDemoRegions returns sample region data for demo purposes
func getDemoRegions() []Region {
	now := time.Now()
	return []Region{
		{ID: uuid.MustParse("11111111-1111-1111-1111-111111111111"), Name: "Delhi", State: "Delhi", Country: "India", Timezone: "Asia/Kolkata", Status: "ACTIVE", ExpectedUsers: 150, ExpectedPlants: 5, CapacityMW: 500, CreatedAt: now, UpdatedAt: now},
		{ID: uuid.MustParse("22222222-2222-2222-2222-222222222222"), Name: "Mumbai", State: "Maharashtra", Country: "India", Timezone: "Asia/Kolkata", Status: "ACTIVE", ExpectedUsers: 200, ExpectedPlants: 8, CapacityMW: 800, CreatedAt: now, UpdatedAt: now},
		{ID: uuid.MustParse("33333333-3333-3333-3333-333333333333"), Name: "Patna", State: "Bihar", Country: "India", Timezone: "Asia/Kolkata", Status: "ACTIVE", ExpectedUsers: 80, ExpectedPlants: 3, CapacityMW: 300, CreatedAt: now, UpdatedAt: now},
		{ID: uuid.MustParse("44444444-4444-4444-4444-444444444444"), Name: "Ahmedabad", State: "Gujarat", Country: "India", Timezone: "Asia/Kolkata", Status: "ACTIVE", ExpectedUsers: 120, ExpectedPlants: 4, CapacityMW: 400, CreatedAt: now, UpdatedAt: now},
		{ID: uuid.MustParse("55555555-5555-5555-5555-555555555555"), Name: "Jasoola Vihar-phase-1", State: "Delhi", Country: "India", Timezone: "Asia/Kolkata", Status: "ACTIVE", ExpectedUsers: 50, ExpectedPlants: 2, CapacityMW: 200, CreatedAt: now, UpdatedAt: now},
	}
}

// createDemoRegion creates a demo region for testing
func createDemoRegion(req RegionRequest) *Region {
	now := time.Now()
	return &Region{
		ID:             uuid.New(),
		Name:           req.Name,
		State:          req.State,
		Country:        req.Country,
		Timezone:       req.Timezone,
		Description:    req.Description,
		Status:         req.Status,
		Latitude:       req.Latitude,
		Longitude:      req.Longitude,
		ExpectedUsers:  req.ExpectedUsers,
		ExpectedPlants: req.ExpectedPlants,
		CapacityMW:     req.CapacityMW,
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}
