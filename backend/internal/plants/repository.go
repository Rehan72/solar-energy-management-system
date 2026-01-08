package plants

import (
	"database/sql"
	"sems-backend/internal/database"

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

func CreatePlant(plant *Plant) error {
	query := `
		INSERT INTO solar_plants (id, name, location, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := database.DB.Exec(query,
		plant.ID,
		plant.Name,
		plant.Location,
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
		SELECT id, name, location, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description, created_at, updated_at
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
		err := rows.Scan(
			&plant.ID,
			&plant.Name,
			&plant.Location,
			&plant.Region,
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
		plants = append(plants, plant)
	}
	return plants, nil
}

func GetPlantByID(id uuid.UUID) (*Plant, error) {
	query := `
		SELECT id, name, location, region, capacity_kw, current_output_kw, efficiency, latitude, longitude, status, description, created_at, updated_at
		FROM solar_plants
		WHERE id = ?
	`
	var plant Plant
	var latitude, longitude sql.NullFloat64
	err := database.DB.QueryRow(query, id).Scan(
		&plant.ID,
		&plant.Name,
		&plant.Location,
		&plant.Region,
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
	return &plant, nil
}

func UpdatePlant(plant *Plant) error {
	query := `
		UPDATE solar_plants
		SET name = ?, location = ?, region = ?, capacity_kw = ?, current_output_kw = ?, efficiency = ?, latitude = ?, longitude = ?, status = ?, description = ?
		WHERE id = ?
	`
	_, err := database.DB.Exec(query,
		plant.Name,
		plant.Location,
		plant.Region,
		plant.CapacityKW,
		plant.CurrentOutputKW,
		plant.Efficiency,
		float64ToNullFloat64(plant.Latitude),
		float64ToNullFloat64(plant.Longitude),
		plant.Status,
		plant.Description,
		plant.ID,
	)
	return err
}

func DeletePlant(id uuid.UUID) error {
	query := `DELETE FROM solar_plants WHERE id = ?`
	_, err := database.DB.Exec(query, id)
	return err
}
