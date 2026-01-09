package plants

import (
	"database/sql"
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
