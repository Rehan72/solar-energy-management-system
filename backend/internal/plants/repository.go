package plants

import (
	"database/sql"
	"fmt"
	"sems-backend/internal/database"
	"time"

	"github.com/google/uuid"
)

func nullFloat64ToFloat64(n sql.NullFloat64) *float64 {
	if n.Valid {
		return &n.Float64
	}
	return nil
}

func float64ToNullFloat64(f *float64) sql.NullFloat64 {
	if f == nil {
		return sql.NullFloat64{Valid: false}
	}
	return sql.NullFloat64{Valid: true, Float64: *f}
}

func nullStringToString(n sql.NullString) *string {
	if n.Valid {
		return &n.String
	}
	return nil
}

func stringToNullString(s *string) sql.NullString {
	if s == nil {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{Valid: true, String: *s}
}

// getRegionIDByName retrieves a region ID by its name, and creates the region if it doesn't exist
func getRegionIDByName(regionName string) *uuid.UUID {
	if regionName == "" {
		return nil
	}
	var regionID string
	query := `SELECT id FROM regions WHERE name = ? LIMIT 1`
	err := database.DB.QueryRow(query, regionName).Scan(&regionID)
	if err == nil && regionID != "" {
		parsed, err := uuid.Parse(regionID)
		if err == nil {
			return &parsed
		}
	}

	// Region doesn't exist, create it automatically
	regionUUID := uuid.New()
	insertQuery := `INSERT INTO regions (id, name, state, country, timezone, description, status, expected_users, expected_plants, capacity_mw, created_at, updated_at)
				  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	now := time.Now().Format(time.RFC3339)
	_, err = database.DB.Exec(insertQuery,
		regionUUID.String(),
		regionName,
		"Default State", // Default state
		"India",         // Default country
		"Asia/Kolkata",  // Default timezone
		"Auto-created region",
		"ACTIVE",
		0,
		0,
		0,
		now,
		now,
	)
	if err != nil {
		// If insertion fails, return nil
		return nil
	}

	return &regionUUID
}

func CreatePlant(plant *Plant) error {
	query := `
		INSERT INTO solar_plants (id, name, location, region_id, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	var regionID interface{}
	if plant.RegionID != nil {
		regionID = plant.RegionID.String()
	} else if plant.Region != "" {
		// Auto-lookup region_id by region name
		if id := getRegionIDByName(plant.Region); id != nil {
			regionID = id.String()
			plant.RegionID = id
		}
	} else {
		regionID = nil
	}

	_, err := database.DB.Exec(query,
		plant.ID,
		plant.Name,
		plant.Location,
		regionID,
		plant.Region,
		plant.CapacityKW,
		plant.CurrentOutputKW,
		plant.Efficiency,
		float64ToNullFloat64(plant.Latitude),
		float64ToNullFloat64(plant.Longitude),
		plant.Status,
		plant.Description,
	)
	return err
}

func GetAllPlants() ([]Plant, error) {
	query := `
		SELECT id, name, location, region_id, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description, created_at, updated_at
		FROM solar_plants
		ORDER BY created_at DESC
	`
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plants []Plant
	for rows.Next() {
		var plant Plant
		var latitude, longitude sql.NullFloat64
		var regionID, region sql.NullString
		err := rows.Scan(
			&plant.ID,
			&plant.Name,
			&plant.Location,
			&regionID,
			&region,
			&plant.CapacityKW,
			&plant.CurrentOutputKW,
			&plant.Efficiency,
			&latitude,
			&longitude,
			&plant.Status,
			&plant.Description,
			&plant.CreatedAt,
			&plant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		plant.Latitude = nullFloat64ToFloat64(latitude)
		plant.Longitude = nullFloat64ToFloat64(longitude)

		// Parse region_id UUID or auto-lookup from region name
		if regionID.Valid {
			parsed, err := uuid.Parse(regionID.String)
			if err == nil {
				plant.RegionID = &parsed
			}
		} else if region.Valid && region.String != "" {
			// Auto-lookup region_id based on region name
			if id := getRegionIDByName(region.String); id != nil {
				plant.RegionID = id
				// Update the database with the resolved region_id
				updatePlantRegionID(plant.ID, id)
			}
		}

		// Set region name
		if region.Valid {
			plant.Region = region.String
		}

		plants = append(plants, plant)
	}
	return plants, nil
}

func GetPlantByID(id uuid.UUID) (*Plant, error) {
	query := `
		SELECT id, name, location, region_id, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description, created_at, updated_at
		FROM solar_plants
		WHERE id = ?
	`
	var plant Plant
	var latitude, longitude sql.NullFloat64
	var regionID, region sql.NullString
	err := database.DB.QueryRow(query, id.String()).Scan(
		&plant.ID,
		&plant.Name,
		&plant.Location,
		&regionID,
		&region,
		&plant.CapacityKW,
		&plant.CurrentOutputKW,
		&plant.Efficiency,
		&latitude,
		&longitude,
		&plant.Status,
		&plant.Description,
		&plant.CreatedAt,
		&plant.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	plant.Latitude = nullFloat64ToFloat64(latitude)
	plant.Longitude = nullFloat64ToFloat64(longitude)

	// Parse region_id UUID or auto-lookup from region name
	if regionID.Valid {
		parsed, err := uuid.Parse(regionID.String)
		if err == nil {
			plant.RegionID = &parsed
		}
	} else if region.Valid && region.String != "" {
		// Auto-lookup region_id based on region name
		if id := getRegionIDByName(region.String); id != nil {
			plant.RegionID = id
			// Update the database with the resolved region_id
			updatePlantRegionID(plant.ID, id)
		}
	}

	// Set region name
	if region.Valid {
		plant.Region = region.String
	}

	return &plant, nil
}

func UpdatePlant(plant *Plant) error {
	query := `
		UPDATE solar_plants
		SET name = ?, location = ?, region_id = ?, region = ?, capacity_kw = ?, current_output_kw = ?, efficiency = ?, latitude = ?, longitude = ?, status = ?, description = ?
		WHERE id = ?
	`
	var regionID interface{}
	if plant.RegionID != nil {
		regionID = plant.RegionID.String()
	} else if plant.Region != "" {
		// Auto-lookup region_id by region name
		if id := getRegionIDByName(plant.Region); id != nil {
			regionID = id.String()
			plant.RegionID = id
		}
	} else {
		regionID = nil
	}

	_, err := database.DB.Exec(query,
		plant.Name,
		plant.Location,
		regionID,
		plant.Region,
		plant.CapacityKW,
		plant.CurrentOutputKW,
		plant.Efficiency,
		float64ToNullFloat64(plant.Latitude),
		float64ToNullFloat64(plant.Longitude),
		plant.Status,
		plant.Description,
		plant.ID.String(),
	)
	return err
}

func DeletePlant(id uuid.UUID) error {
	query := `DELETE FROM solar_plants WHERE id = ?`
	_, err := database.DB.Exec(query, id.String())
	return err
}

// updatePlantRegionID updates the region_id for a plant in the database
func updatePlantRegionID(plantID uuid.UUID, regionID *uuid.UUID) error {
	if regionID == nil {
		return nil
	}
	query := `UPDATE solar_plants SET region_id = ? WHERE id = ?`
	_, err := database.DB.Exec(query, regionID.String(), plantID.String())
	return err
}

// GetPlantsCountByRegion returns the number of plants in a region
func GetPlantsCountByRegion(regionName string) (int, error) {
	query := `SELECT COUNT(*) FROM solar_plants WHERE region = ?`
	var count int
	err := database.DB.QueryRow(query, regionName).Scan(&count)
	return count, err
}

// CreateDefaultPlantsForRegion creates default plants for a region if it has no plants
func CreateDefaultPlantsForRegion(regionName string) error {
	// Check if region exists and get its details
	var regionID string
	var expectedPlants int
	var capacityMW float64
	query := `SELECT id, expected_plants, capacity_mw FROM regions WHERE name = ?`
	err := database.DB.QueryRow(query, regionName).Scan(&regionID, &expectedPlants, &capacityMW)
	if err != nil {
		return err
	}

	// Check current plant count
	currentCount, err := GetPlantsCountByRegion(regionName)
	if err != nil {
		return err
	}

	// If we already have plants, don't create more
	if currentCount > 0 {
		return nil
	}

	// Create default plants based on expected_plants
	for i := 1; i <= expectedPlants; i++ {
		plantName := fmt.Sprintf("%s Solar Plant %c", regionName, 'A'+i-1)
		plantLocation := fmt.Sprintf("%s Region - Plant %c", regionName, 'A'+i-1)
		plantDescription := fmt.Sprintf("Auto-generated plant for %s region", regionName)

		plant := &Plant{
			ID:              uuid.New(),
			Name:            plantName,
			Location:        plantLocation,
			Region:          regionName,
			CapacityKW:      capacityMW * 1000 / float64(expectedPlants), // Distribute capacity evenly
			CurrentOutputKW: 0,
			Efficiency:      85.0,
			Status:          "ACTIVE",
			Description:     plantDescription,
		}

		// Set region_id if we have it
		if regionID != "" {
			parsed, err := uuid.Parse(regionID)
			if err == nil {
				plant.RegionID = &parsed
			}
		}

		if err := CreatePlant(plant); err != nil {
			return err
		}
	}

	return nil
}

// GetPlantsByRegion returns all plants in a specific region
func GetPlantsByRegion(regionName string) ([]Plant, error) {
	query := `
		SELECT id, name, location, region_id, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description, created_at, updated_at
		FROM solar_plants
		WHERE region = ?
		ORDER BY created_at DESC
	`
	rows, err := database.DB.Query(query, regionName)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plants []Plant
	for rows.Next() {
		var plant Plant
		var latitude, longitude sql.NullFloat64
		var regionID, region sql.NullString
		err := rows.Scan(
			&plant.ID,
			&plant.Name,
			&plant.Location,
			&regionID,
			&region,
			&plant.CapacityKW,
			&plant.CurrentOutputKW,
			&plant.Efficiency,
			&latitude,
			&longitude,
			&plant.Status,
			&plant.Description,
			&plant.CreatedAt,
			&plant.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		plant.Latitude = nullFloat64ToFloat64(latitude)
		plant.Longitude = nullFloat64ToFloat64(longitude)

		if regionID.Valid {
			parsed, err := uuid.Parse(regionID.String)
			if err == nil {
				plant.RegionID = &parsed
			}
		}
		if region.Valid {
			plant.Region = region.String
		}

		plants = append(plants, plant)
	}
	return plants, nil
}

// UpdatePlantCurrentPower updates the current power output of a plant by summing up latest device readings
func UpdatePlantCurrentPower(plantID string) error {
	if plantID == "" {
		return nil
	}

	query := `
		UPDATE solar_plants
		SET current_output_kw = (
			SELECT COALESCE(SUM(ed.solar_power), 0)
			FROM (
				SELECT device_id, MAX(timestamp) as max_ts
				FROM energy_data
				GROUP BY device_id
			) latest
			JOIN energy_data ed ON ed.device_id = latest.device_id AND ed.timestamp = latest.max_ts
			JOIN users u ON ed.device_id = u.device_id
			WHERE u.plant_id = ?
		)
		WHERE id = ?`

	_, err := database.DB.Exec(query, plantID, plantID)
	return err
}
