package users

import (
	"database/sql"
	"sems-backend/internal/database"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Helper function to convert sql.NullString to string
func nullStringToString(ns sql.NullString) string {
	if ns.Valid {
		return ns.String
	}
	return ""
}

// Helper function to convert string to sql.NullString
func stringToNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// Helper function to convert sql.NullFloat64 to float64
func nullFloat64ToFloat64(nf sql.NullFloat64) float64 {
	if nf.Valid {
		return nf.Float64
	}
	return 0
}

// Helper function to convert float64 to sql.NullFloat64
func float64ToNullFloat64(f float64) sql.NullFloat64 {
	if f == 0 {
		return sql.NullFloat64{Valid: false}
	}
	return sql.NullFloat64{Float64: f, Valid: true}
}

// Helper function to convert sql.NullBool to bool
func nullBoolToBool(nb sql.NullBool) bool {
	if nb.Valid {
		return nb.Bool
	}
	return false
}

// Helper function to convert bool to sql.NullBool
func boolToNullBool(b bool) sql.NullBool {
	return sql.NullBool{Bool: b, Valid: true}
}

// Helper function to convert sql.NullTime to time.Time
func nullTimeToTime(nt sql.NullTime) time.Time {
	if nt.Valid {
		return nt.Time
	}
	return time.Time{}
}

// Helper function to convert time.Time to sql.NullTime
func timeToNullTime(t time.Time) sql.NullTime {
	if t.IsZero() {
		return sql.NullTime{Valid: false}
	}
	return sql.NullTime{Time: t, Valid: true}
}

func CreateUser(firstName, lastName, email, passwordHash, role, phone, profileImage, addressLine1, addressLine2, city, state, pincode, region string, latitude, longitude float64, adminID string) (*User, error) {
	user := &User{
		ID:                    uuid.New().String(),
		FirstName:             firstName,
		LastName:              lastName,
		Email:                 email,
		PasswordHash:          passwordHash,
		Role:                  role,
		Phone:                 phone,
		ProfileImage:          profileImage,
		AddressLine1:          addressLine1,
		AddressLine2:          addressLine2,
		City:                  city,
		State:                 state,
		Pincode:               pincode,
		Region:                region,
		Latitude:              latitude,
		Longitude:             longitude,
		AdminID:               adminID,
		InstallationStatus:    InstallationStatusNotInstalled,
		SubsidyInterest:       false,
		DeviceLinked:          false,
		SubsidyApplied:        false,
		IsActive:              true,
		CreatedAt:             time.Now(),
		UpdatedAt:             time.Now(),
	}

	query := `
		INSERT INTO users (id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := database.DB.Exec(query, user.ID, user.FirstName, user.LastName, user.Email, user.PasswordHash, user.Role, user.Phone, user.ProfileImage, user.AddressLine1, user.AddressLine2, user.City, user.State, user.Pincode, user.Region, user.Latitude, user.Longitude, user.AdminID, user.InstallationStatus, user.PropertyType, user.AvgMonthlyBill, user.RoofAreaSqft, user.ConnectionType, user.SubsidyInterest, user.PlantCapacityKW, user.InstallationDate, user.NetMetering, user.InverterBrand, user.DISCOMName, user.ConsumerNumber, user.DeviceLinked, user.DeviceID, user.LastDataReceived, user.SubsidyApplied, user.SubsidyStatus, user.SchemeName, user.ApplicationID, user.IsActive, user.CreatedAt, user.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func GetUserByEmail(email string) (*User, error) {
	user := &User{}
	var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
	var adminID sql.NullString
	var latitude, longitude, avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
	var installationDate, lastDataReceived sql.NullTime
	var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at
		FROM users
		WHERE email = ?`
	err := database.DB.QueryRow(query, email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
		&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
		&city, &state, &pincode, &region, &latitude, &longitude, &adminID,
		&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
		&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
		&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
		&isActive, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	
	// Convert nullable fields
	user.Phone = nullStringToString(phone)
	user.ProfileImage = nullStringToString(profileImage)
	user.AddressLine1 = nullStringToString(addressLine1)
	user.AddressLine2 = nullStringToString(addressLine2)
	user.City = nullStringToString(city)
	user.State = nullStringToString(state)
	user.Pincode = nullStringToString(pincode)
	user.Region = nullStringToString(region)
	user.Latitude = nullFloat64ToFloat64(latitude)
	user.Longitude = nullFloat64ToFloat64(longitude)
	user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
	user.PropertyType = PropertyType(nullStringToString(propertyType))
	user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
	user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
	user.ConnectionType = ConnectionType(nullStringToString(connectionType))
	user.SubsidyInterest = nullBoolToBool(subsidyInterest)
	user.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
	user.InstallationDate = nullTimeToTime(installationDate)
	user.NetMetering = nullBoolToBool(netMetering)
	user.InverterBrand = nullStringToString(inverterBrand)
	user.DISCOMName = nullStringToString(discomName)
	user.ConsumerNumber = nullStringToString(consumerNumber)
	user.DeviceLinked = nullBoolToBool(deviceLinked)
	user.DeviceID = nullStringToString(deviceID)
	user.LastDataReceived = nullTimeToTime(lastDataReceived)
	user.SubsidyApplied = nullBoolToBool(subsidyApplied)
	user.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
	user.SchemeName = nullStringToString(schemeName)
	user.ApplicationID = nullStringToString(applicationID)
	user.IsActive = nullBoolToBool(isActive)
	user.Role = strings.ToUpper(user.Role)
	return user, nil
}

// GetUsersByRole returns users with a specific role
func GetUsersByRole(role string) ([]*User, error) {
	users := []*User{}
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at
		FROM users
		WHERE role = ?`
	rows, err := database.DB.Query(query, role)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		user := &User{}
		var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
		var adminID sql.NullString
		var latitude, longitude, avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
		var installationDate, lastDataReceived sql.NullTime
		var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
			&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
			&city, &state, &pincode, &region, &latitude, &longitude, &adminID,
			&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
			&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
			&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
			&isActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}

		// Convert nullable fields
		user.Phone = nullStringToString(phone)
		user.ProfileImage = nullStringToString(profileImage)
		user.AddressLine1 = nullStringToString(addressLine1)
		user.AddressLine2 = nullStringToString(addressLine2)
		user.City = nullStringToString(city)
		user.State = nullStringToString(state)
		user.Pincode = nullStringToString(pincode)
		user.Region = nullStringToString(region)
		user.Latitude = nullFloat64ToFloat64(latitude)
		user.Longitude = nullFloat64ToFloat64(longitude)
		user.AdminID = nullStringToString(adminID)
		user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
		user.PropertyType = PropertyType(nullStringToString(propertyType))
		user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
		user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
		user.ConnectionType = ConnectionType(nullStringToString(connectionType))
		user.SubsidyInterest = nullBoolToBool(subsidyInterest)
		user.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
		user.InstallationDate = nullTimeToTime(installationDate)
		user.NetMetering = nullBoolToBool(netMetering)
		user.InverterBrand = nullStringToString(inverterBrand)
		user.DISCOMName = nullStringToString(discomName)
		user.ConsumerNumber = nullStringToString(consumerNumber)
		user.DeviceLinked = nullBoolToBool(deviceLinked)
		user.DeviceID = nullStringToString(deviceID)
		user.LastDataReceived = nullTimeToTime(lastDataReceived)
		user.SubsidyApplied = nullBoolToBool(subsidyApplied)
		user.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
		user.SchemeName = nullStringToString(schemeName)
		user.ApplicationID = nullStringToString(applicationID)
		user.IsActive = nullBoolToBool(isActive)
		user.Role = strings.ToUpper(user.Role)
		users = append(users, user)
	}
	return users, nil
}

func GetAllUsers() ([]*User, error) {
	users := []*User{}
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at
		FROM users
		WHERE role = 'USER'` // Only return users with role "USER", exclude ADMIN and SUPER_ADMIN
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		user := &User{}
		var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
		var adminID sql.NullString
		var latitude, longitude, avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
		var installationDate, lastDataReceived sql.NullTime
		var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
			&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
			&city, &state, &pincode, &region, &latitude, &longitude, &adminID,
			&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
			&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
			&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
			&isActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}

		// Convert nullable fields
		user.Phone = nullStringToString(phone)
		user.ProfileImage = nullStringToString(profileImage)
		user.AddressLine1 = nullStringToString(addressLine1)
		user.AddressLine2 = nullStringToString(addressLine2)
		user.City = nullStringToString(city)
		user.State = nullStringToString(state)
		user.Pincode = nullStringToString(pincode)
		user.Region = nullStringToString(region)
		user.Latitude = nullFloat64ToFloat64(latitude)
		user.Longitude = nullFloat64ToFloat64(longitude)
		user.AdminID = nullStringToString(adminID)
		user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
		user.PropertyType = PropertyType(nullStringToString(propertyType))
		user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
		user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
		user.ConnectionType = ConnectionType(nullStringToString(connectionType))
		user.SubsidyInterest = nullBoolToBool(subsidyInterest)
		user.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
		user.InstallationDate = nullTimeToTime(installationDate)
		user.NetMetering = nullBoolToBool(netMetering)
		user.InverterBrand = nullStringToString(inverterBrand)
		user.DISCOMName = nullStringToString(discomName)
		user.ConsumerNumber = nullStringToString(consumerNumber)
		user.DeviceLinked = nullBoolToBool(deviceLinked)
		user.DeviceID = nullStringToString(deviceID)
		user.LastDataReceived = nullTimeToTime(lastDataReceived)
		user.SubsidyApplied = nullBoolToBool(subsidyApplied)
		user.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
		user.SchemeName = nullStringToString(schemeName)
		user.ApplicationID = nullStringToString(applicationID)
		user.IsActive = nullBoolToBool(isActive)
		user.Role = strings.ToUpper(user.Role)
		users = append(users, user)
	}
	return users, nil
}

// GetAllUsersIncludingAdmins returns all users including admins and super admins
func GetAllUsersIncludingAdmins() ([]*User, error) {
	users := []*User{}
	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at
		FROM users`
	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		user := &User{}
		var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
		var adminID sql.NullString
		var latitude, longitude, avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
		var installationDate, lastDataReceived sql.NullTime
		var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
			&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
			&city, &state, &pincode, &region, &latitude, &longitude, &adminID,
			&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
			&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
			&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
			&isActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}

		// Convert nullable fields
		user.Phone = nullStringToString(phone)
		user.ProfileImage = nullStringToString(profileImage)
		user.AddressLine1 = nullStringToString(addressLine1)
		user.AddressLine2 = nullStringToString(addressLine2)
		user.City = nullStringToString(city)
		user.State = nullStringToString(state)
		user.Pincode = nullStringToString(pincode)
		user.Region = nullStringToString(region)
		user.Latitude = nullFloat64ToFloat64(latitude)
		user.Longitude = nullFloat64ToFloat64(longitude)
		user.AdminID = nullStringToString(adminID)
		user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
		user.PropertyType = PropertyType(nullStringToString(propertyType))
		user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
		user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
		user.ConnectionType = ConnectionType(nullStringToString(connectionType))
		user.SubsidyInterest = nullBoolToBool(subsidyInterest)
		user.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
		user.InstallationDate = nullTimeToTime(installationDate)
		user.NetMetering = nullBoolToBool(netMetering)
		user.InverterBrand = nullStringToString(inverterBrand)
		user.DISCOMName = nullStringToString(discomName)
		user.ConsumerNumber = nullStringToString(consumerNumber)
		user.DeviceLinked = nullBoolToBool(deviceLinked)
		user.DeviceID = nullStringToString(deviceID)
		user.LastDataReceived = nullTimeToTime(lastDataReceived)
		user.SubsidyApplied = nullBoolToBool(subsidyApplied)
		user.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
		user.SchemeName = nullStringToString(schemeName)
		user.ApplicationID = nullStringToString(applicationID)
		user.IsActive = nullBoolToBool(isActive)
		user.Role = strings.ToUpper(user.Role)
		users = append(users, user)
	}
	return users, nil
}

func GetUserByID(id string) (*User, error) {
	user := &User{}
	var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
	var adminID sql.NullString
	var latitude, longitude, avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
	var installationDate, lastDataReceived sql.NullTime
	var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

	query := `
		SELECT id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at
		FROM users
		WHERE id = ?`
	err := database.DB.QueryRow(query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
		&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
		&city, &state, &pincode, &region, &latitude, &longitude, &adminID,
		&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
		&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
		&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
		&isActive, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return nil, err
	}

	// Convert nullable fields
	user.Phone = nullStringToString(phone)
	user.ProfileImage = nullStringToString(profileImage)
	user.AddressLine1 = nullStringToString(addressLine1)
	user.AddressLine2 = nullStringToString(addressLine2)
	user.City = nullStringToString(city)
	user.State = nullStringToString(state)
	user.Pincode = nullStringToString(pincode)
	user.Region = nullStringToString(region)
	user.Latitude = nullFloat64ToFloat64(latitude)
	user.Longitude = nullFloat64ToFloat64(longitude)
	user.AdminID = nullStringToString(adminID)
	user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
	user.PropertyType = PropertyType(nullStringToString(propertyType))
	user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
	user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
	user.ConnectionType = ConnectionType(nullStringToString(connectionType))
	user.SubsidyInterest = nullBoolToBool(subsidyInterest)
	user.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
	user.InstallationDate = nullTimeToTime(installationDate)
	user.NetMetering = nullBoolToBool(netMetering)
	user.InverterBrand = nullStringToString(inverterBrand)
	user.DISCOMName = nullStringToString(discomName)
	user.ConsumerNumber = nullStringToString(consumerNumber)
	user.DeviceLinked = nullBoolToBool(deviceLinked)
	user.DeviceID = nullStringToString(deviceID)
	user.LastDataReceived = nullTimeToTime(lastDataReceived)
	user.SubsidyApplied = nullBoolToBool(subsidyApplied)
	user.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
	user.SchemeName = nullStringToString(schemeName)
	user.ApplicationID = nullStringToString(applicationID)
	user.IsActive = nullBoolToBool(isActive)
	user.Role = strings.ToUpper(user.Role)
	return user, nil
}

func UpdateUser(user *User) error {
	query := `
		UPDATE users
		SET first_name = ?, last_name = ?, email = ?, role = ?, phone = ?, profile_image = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, region = ?, latitude = ?, longitude = ?, admin_id = ?, installation_status = ?, property_type = ?, avg_monthly_bill = ?, roof_area_sqft = ?, connection_type = ?, subsidy_interest = ?, plant_capacity_kw = ?, installation_date = ?, net_metering = ?, inverter_brand = ?, discom_name = ?, consumer_number = ?, device_linked = ?, device_id = ?, last_data_received = ?, subsidy_applied = ?, subsidy_status = ?, scheme_name = ?, application_id = ?, is_active = ?, updated_at = ?
		WHERE id = ?`
	_, err := database.DB.Exec(query,
		user.FirstName, user.LastName, user.Email, user.Role, user.Phone, user.ProfileImage,
		user.AddressLine1, user.AddressLine2, user.City, user.State, user.Pincode, user.Region,
		user.Latitude, user.Longitude, user.AdminID, user.InstallationStatus, user.PropertyType,
		user.AvgMonthlyBill, user.RoofAreaSqft, user.ConnectionType, user.SubsidyInterest,
		user.PlantCapacityKW, user.InstallationDate, user.NetMetering, user.InverterBrand,
		user.DISCOMName, user.ConsumerNumber, user.DeviceLinked, user.DeviceID, user.LastDataReceived,
		user.SubsidyApplied, user.SubsidyStatus, user.SchemeName, user.ApplicationID, user.IsActive,
		time.Now(), user.ID)
	return err
}

func DeleteUser(id string) error {
	query := `
		DELETE FROM users
		WHERE id = ?`
	_, err := database.DB.Exec(query, id)
	return err
}

// SolarProfile functions

func CreateSolarProfile(profile *SolarProfile) (*SolarProfile, error) {
	profile.ID = uuid.New().String()
	profile.CreatedAt = time.Now()
	profile.UpdatedAt = time.Now()
	
	query := `
		INSERT INTO solar_profiles (id, user_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	_, err := database.DB.Exec(query, 
		profile.ID, profile.UserID, profile.InstallationStatus, profile.PropertyType,
		profile.AvgMonthlyBill, profile.RoofAreaSqft, profile.ConnectionType, profile.SubsidyInterest,
		profile.PlantCapacityKW, profile.InstallationDate, profile.NetMetering, profile.InverterBrand,
		profile.DISCOMName, profile.ConsumerNumber, profile.DeviceLinked, profile.DeviceID, profile.LastDataReceived,
		profile.SubsidyApplied, profile.SubsidyStatus, profile.SchemeName, profile.ApplicationID,
		profile.CreatedAt, profile.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return profile, nil
}

func GetSolarProfileByUserID(userID string) (*SolarProfile, error) {
	profile := &SolarProfile{}
	var propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
	var avgMonthlyBill, roofAreaSqft, plantCapacityKW sql.NullFloat64
	var installationDate, lastDataReceived sql.NullTime
	var subsidyInterest, netMetering, deviceLinked, subsidyApplied sql.NullBool
	
	query := `
		SELECT id, user_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, created_at, updated_at
		FROM solar_profiles
		WHERE user_id = ?`
	err := database.DB.QueryRow(query, userID).Scan(
		&profile.ID, &profile.UserID, &profile.InstallationStatus, &propertyType,
		&avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
		&plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
		&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
		&profile.CreatedAt, &profile.UpdatedAt)
	if err != nil {
		return nil, err
	}
	
	profile.PropertyType = PropertyType(nullStringToString(propertyType))
	profile.ConnectionType = ConnectionType(nullStringToString(connectionType))
	profile.InverterBrand = nullStringToString(inverterBrand)
	profile.DISCOMName = nullStringToString(discomName)
	profile.ConsumerNumber = nullStringToString(consumerNumber)
	profile.DeviceID = nullStringToString(deviceID)
	profile.SubsidyStatus = SubsidyStatus(nullStringToString(subsidyStatus))
	profile.SchemeName = nullStringToString(schemeName)
	profile.ApplicationID = nullStringToString(applicationID)
	profile.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
	profile.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
	profile.PlantCapacityKW = nullFloat64ToFloat64(plantCapacityKW)
	profile.InstallationDate = nullTimeToTime(installationDate)
	profile.LastDataReceived = nullTimeToTime(lastDataReceived)
	profile.SubsidyInterest = nullBoolToBool(subsidyInterest)
	profile.NetMetering = nullBoolToBool(netMetering)
	profile.DeviceLinked = nullBoolToBool(deviceLinked)
	profile.SubsidyApplied = nullBoolToBool(subsidyApplied)
	
	return profile, nil
}

func UpdateSolarProfile(profile *SolarProfile) error {
	profile.UpdatedAt = time.Now()
	
	query := `
		UPDATE solar_profiles
		SET installation_status = ?, property_type = ?, avg_monthly_bill = ?, roof_area_sqft = ?, connection_type = ?, subsidy_interest = ?, plant_capacity_kw = ?, installation_date = ?, net_metering = ?, inverter_brand = ?, discom_name = ?, consumer_number = ?, device_linked = ?, device_id = ?, last_data_received = ?, subsidy_applied = ?, subsidy_status = ?, scheme_name = ?, application_id = ?, updated_at = ?
		WHERE id = ?`
	_, err := database.DB.Exec(query,
		profile.InstallationStatus, profile.PropertyType, profile.AvgMonthlyBill, profile.RoofAreaSqft,
		profile.ConnectionType, profile.SubsidyInterest, profile.PlantCapacityKW, profile.InstallationDate,
		profile.NetMetering, profile.InverterBrand, profile.DISCOMName, profile.ConsumerNumber,
		profile.DeviceLinked, profile.DeviceID, profile.LastDataReceived, profile.SubsidyApplied,
		profile.SubsidyStatus, profile.SchemeName, profile.ApplicationID, profile.UpdatedAt, profile.ID)
	return err
}
