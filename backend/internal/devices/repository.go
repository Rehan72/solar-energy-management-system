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
	device := &Device{
		ID:         uuid.New(),
		UserID:     &userID,
		Name:       namePtr,
		DeviceType: deviceType,
		Location:   locationPtr,
		APIKey:     generateAPIKey(),
		IsActive:   true,
	}

	query := `
		INSERT INTO devices (id, user_id, name, device_type, location, api_key, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at`

	err := database.DB.QueryRow(query,
		device.ID, uuidToString(device.UserID), device.Name, device.DeviceType,
		device.Location, device.APIKey, device.IsActive).
		Scan(&device.CreatedAt, &device.UpdatedAt)

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
			   COALESCE(power.current_power, 0) as current_power,
			   COALESCE(power.today_energy, 0) as today_energy,
			   COALESCE(power.peak_power, 0) as peak_power,
			   COALESCE(power.avg_power, 0) as avg_power,
			   COALESCE(power.avg_battery, 0) as avg_battery,
			   COALESCE(power.total_consumption, 0) as total_consumption,
			   COALESCE(power.efficiency, 0) as efficiency
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		LEFT JOIN LATERAL (
			SELECT device_id,
				   MAX(solar_power) as current_power,
				   SUM(solar_power) as today_energy,
				   AVG(solar_power) as avg_power,
				   MAX(solar_power) as peak_power,
				   AVG(battery_level) as avg_battery,
				   SUM(load_power) as total_consumption,
				   0 as efficiency
			FROM energy_data
			WHERE device_id = d.id AND timestamp >= NOW() - INTERVAL '24 hours'
			GROUP BY device_id
		) power ON true
		WHERE d.user_id = $1`

	args := []interface{}{userID}

	if deviceType != "" {
		query += " AND d.device_type = $2"
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
			   COALESCE(power.current_power, 0) as current_power,
			   COALESCE(power.today_energy, 0) as today_energy,
			   COALESCE(power.peak_power, 0) as peak_power,
			   COALESCE(power.avg_power, 0) as avg_power,
			   COALESCE(power.avg_battery, 0) as avg_battery,
			   COALESCE(power.total_consumption, 0) as total_consumption,
			   COALESCE(power.efficiency, 0) as efficiency
		FROM devices d
		LEFT JOIN users u ON d.user_id = u.id
		LEFT JOIN LATERAL (
			SELECT device_id,
				   MAX(solar_power) as current_power,
				   SUM(solar_power) as today_energy,
				   AVG(solar_power) as avg_power,
				   MAX(solar_power) as peak_power,
				   AVG(battery_level) as avg_battery,
				   SUM(load_power) as total_consumption,
				   0 as efficiency
			FROM energy_data
			WHERE device_id = d.id AND timestamp >= NOW() - INTERVAL '24 hours'
			GROUP BY device_id
		) power ON true
		WHERE 1=1`

	args := []interface{}{}

	if searchTerm != "" {
		query += " AND (d.name ILIKE $1 OR d.device_id ILIKE $2 OR d.location ILIKE $3)"
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
		WHERE d.id = $1`

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
		SET name = $1, location = $2, is_active = $3, updated_at = $4
		WHERE id = $5`

	_, err := database.DB.Exec(query,
		device.Name, device.Location, device.IsActive,
		time.Now(), device.ID,
	)
	return err
}

func DeleteDevice(id uuid.UUID) error {
	query := `DELETE FROM devices WHERE id = $1`
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
		WHERE d.api_key = $1 AND d.is_active = true`

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
