package devices

import (
	"database/sql"
	"sems-backend/internal/database"
	"time"

	"github.com/google/uuid"
)

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

func nullTimeToTime(n sql.NullTime) *time.Time {
	if n.Valid {
		return &n.Time
	}
	return nil
}

func CreateDevice(userID uuid.UUID, name, deviceType, location string) (*Device, error) {
	namePtr := &name
	locationPtr := &location
	now := time.Now()
	device := &Device{
		ID:         uuid.New(),
		UserID:     &userID,
		Name:       namePtr,
		DeviceType: deviceType,
		Location:   locationPtr,
		APIKey:     generateAPIKey(),
		IsActive:   true,
		CreatedAt:  now,
		UpdatedAt:  now,
	}

	query := `
		INSERT INTO devices (id, user_id, name, device_type, location, api_key, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`

	_, err := database.DB.Exec(query,
		device.ID, uuidToString(device.UserID), device.Name, device.DeviceType,
		device.Location, device.APIKey, device.IsActive, device.CreatedAt, device.UpdatedAt)

	if err != nil {
		return nil, err
	}

	return device, nil
}

func uuidToString(u *uuid.UUID) string {
	if u == nil {
		return ""
	}
	return u.String()
}

func stringToUUID(s string) *uuid.UUID {
	if s == "" {
		return nil
	}
	u, err := uuid.Parse(s)
	if err != nil {
		return nil
	}
	return &u
}

func GetDevicesByUserID(userID uuid.UUID, deviceType string, activeOnly bool) ([]*Device, error) {
	query := `
		SELECT d.id, d.device_id, d.user_id, d.name, d.device_type, d.location, d.api_key, d.is_active, d.last_seen, d.created_at, d.updated_at,
			   COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') as user_name,
			   COALESCE((SELECT MAX(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as current_power,
			   COALESCE((SELECT SUM(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as today_energy,
			   COALESCE((SELECT MAX(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as peak_power,
			   COALESCE((SELECT AVG(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as avg_power,
			   COALESCE((SELECT AVG(battery_level) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as avg_battery,
			   COALESCE((SELECT SUM(load_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as total_consumption,
			   0 as efficiency
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		WHERE d.user_id = ?`

	args := []interface{}{userID}

	if deviceType != "" {
		query += " AND d.device_type = ?"
		args = append(args, deviceType)
	}

	if activeOnly {
		query += " AND d.is_active = true"
	}

	query += " ORDER BY d.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []*Device
	for rows.Next() {
		device := &Device{}
		var deviceID sql.NullString
		var userIDStr sql.NullString
		var name sql.NullString
		var location sql.NullString
		var lastSeen sql.NullTime
		err := rows.Scan(
			&device.ID, &deviceID, &userIDStr, &name, &device.DeviceType,
			&location, &device.APIKey, &device.IsActive, &lastSeen,
			&device.CreatedAt, &device.UpdatedAt, &device.UserName,
			&device.CurrentPower, &device.TodayEnergy, &device.PeakPower,
			&device.AvgPower, &device.AvgBattery, &device.TotalConsumption, &device.Efficiency,
		)
		if err != nil {
			return nil, err
		}
		device.DeviceID = nullStringToString(deviceID)
		device.UserID = stringToUUID(userIDStr.String)
		device.Name = nullStringToString(name)
		device.Location = nullStringToString(location)
		device.LastSeen = nullTimeToTime(lastSeen)
		devices = append(devices, device)
	}

	return devices, nil
}

func GetAllDevices(searchTerm string, statusFilter string) ([]*Device, error) {
	if database.DB == nil {
		return []*Device{}, nil
	}

	query := `
		SELECT d.id, d.device_id, d.user_id, d.name, d.device_type, d.location, d.api_key, d.is_active, d.last_seen, d.created_at, d.updated_at,
			   COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') as user_name,
			   COALESCE((SELECT MAX(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as current_power,
			   COALESCE((SELECT SUM(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as today_energy,
			   COALESCE((SELECT MAX(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as peak_power,
			   COALESCE((SELECT AVG(solar_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as avg_power,
			   COALESCE((SELECT AVG(battery_level) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as avg_battery,
			   COALESCE((SELECT SUM(load_power) FROM energy_data WHERE device_id = d.id AND timestamp >= datetime('now', '-1 day')), 0) as total_consumption,
			   0 as efficiency
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		WHERE 1=1`

	args := []interface{}{}

	if searchTerm != "" {
		query += " AND (d.name LIKE ? OR d.device_id LIKE ? OR d.location LIKE ?)"
		args = append(args, "%"+searchTerm+"%", "%"+searchTerm+"%", "%"+searchTerm+"%")
	}

	if statusFilter != "" {
		if statusFilter == "ACTIVE" {
			query += " AND d.is_active = true"
		} else if statusFilter == "INACTIVE" {
			query += " AND d.is_active = false"
		}
	}

	query += " ORDER BY d.created_at DESC"

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var devices []*Device
	for rows.Next() {
		device := &Device{}
		var deviceID sql.NullString
		var userIDStr sql.NullString
		var name sql.NullString
		var location sql.NullString
		var lastSeen sql.NullTime
		err := rows.Scan(
			&device.ID, &deviceID, &userIDStr, &name, &device.DeviceType,
			&location, &device.APIKey, &device.IsActive, &lastSeen,
			&device.CreatedAt, &device.UpdatedAt, &device.UserName,
			&device.CurrentPower, &device.TodayEnergy, &device.PeakPower,
			&device.AvgPower, &device.AvgBattery, &device.TotalConsumption, &device.Efficiency,
		)
		if err != nil {
			return nil, err
		}
		device.DeviceID = nullStringToString(deviceID)
		device.UserID = stringToUUID(userIDStr.String)
		device.Name = nullStringToString(name)
		device.Location = nullStringToString(location)
		device.LastSeen = nullTimeToTime(lastSeen)
		devices = append(devices, device)
	}

	return devices, nil
}

func GetDeviceByID(id uuid.UUID) (*Device, error) {
	device := &Device{}
	query := `
		SELECT d.id, d.device_id, d.user_id, d.name, d.device_type, d.location, d.api_key, d.is_active, d.last_seen, d.created_at, d.updated_at,
			   COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') as user_name
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		WHERE d.id = ?`

	var deviceID sql.NullString
	var userIDStr sql.NullString
	var name sql.NullString
	var location sql.NullString
	var lastSeen sql.NullTime
	err := database.DB.QueryRow(query, id).Scan(
		&device.ID, &deviceID, &userIDStr, &name, &device.DeviceType,
		&location, &device.APIKey, &device.IsActive, &lastSeen,
		&device.CreatedAt, &device.UpdatedAt, &device.UserName,
	)

	if err != nil {
		return nil, err
	}

	device.DeviceID = nullStringToString(deviceID)
	device.UserID = stringToUUID(userIDStr.String)
	device.Name = nullStringToString(name)
	device.Location = nullStringToString(location)
	device.LastSeen = nullTimeToTime(lastSeen)
	return device, nil
}

func UpdateDevice(device *Device) error {
	query := `
		UPDATE devices
		SET name = ?, location = ?, is_active = ?, updated_at = ?
		WHERE id = ?`

	_, err := database.DB.Exec(query,
		device.Name, device.Location, device.IsActive,
		time.Now(), device.ID,
	)
	return err
}

func DeleteDevice(id uuid.UUID) error {
	query := `DELETE FROM devices WHERE id = ?`
	_, err := database.DB.Exec(query, id)
	return err
}

func GetDeviceByAPIKey(apiKey string) (*Device, error) {
	device := &Device{}
	query := `
		SELECT d.id, d.device_id, d.user_id, d.name, d.device_type, d.location, d.api_key, d.is_active, d.last_seen, d.created_at, d.updated_at,
			   COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') as user_name
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		WHERE d.api_key = ? AND d.is_active = true`

	var deviceID sql.NullString
	var userIDStr sql.NullString
	var name sql.NullString
	var location sql.NullString
	var lastSeen sql.NullTime
	err := database.DB.QueryRow(query, apiKey).Scan(
		&device.ID, &deviceID, &userIDStr, &name, &device.DeviceType,
		&location, &device.APIKey, &device.IsActive, &lastSeen,
		&device.CreatedAt, &device.UpdatedAt, &device.UserName,
	)

	if err != nil {
		return nil, err
	}

	device.DeviceID = nullStringToString(deviceID)
	device.UserID = stringToUUID(userIDStr.String)
	device.Name = nullStringToString(name)
	device.Location = nullStringToString(location)
	device.LastSeen = nullTimeToTime(lastSeen)
	return device, nil
}

func generateAPIKey() string {
	return uuid.New().String()
}
