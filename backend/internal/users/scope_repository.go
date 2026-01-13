package users

import (
	"database/sql"
	"sems-backend/internal/database"
	"strings"
)

// GetUsersByScope returns users that fall within the scope of the given admin (by Region/Plant)
func GetUsersByScope(admin *User) ([]*User, error) {
	users := []*User{}
	var query string
	var args []interface{}

	// Query columns (reused from existing functions)
	columns := `id, first_name, last_name, email, password_hash, role, phone, profile_image, address_line1, address_line2, city, state, pincode, region, latitude, longitude, admin_id, installer_id, plant_id, installation_status, property_type, avg_monthly_bill, roof_area_sqft, connection_type, subsidy_interest, project_cost, plant_capacity_kw, installation_date, net_metering, inverter_brand, discom_name, consumer_number, device_linked, device_id, last_data_received, subsidy_applied, subsidy_status, scheme_name, application_id, is_active, created_at, updated_at`

	// If Admin has a specific Plant ID, fetch users assigned to that plant
	if admin.PlantID != "" {
		query = "SELECT " + columns + " FROM users WHERE plant_id = ? AND role = 'USER'"
		args = []interface{}{admin.PlantID}
	} else if admin.Region != "" {
		// If Admin is Regional (no specific plant), fetch ALL users in that Region
		query = "SELECT " + columns + " FROM users WHERE region = ? AND role = 'USER'"
		args = []interface{}{admin.Region}
	} else {
		// Fallback: If Admin has no region/plant (global admin?), fetch all users?
		// Or assume they should see their assigned users specifically via admin_id?
		// Given the user prompt "user does not belong to admin", scope is key.
		// If no scope defined, maybe return empty or their direct reports.
		query = "SELECT " + columns + " FROM users WHERE admin_id = ? AND role = 'USER'"
		args = []interface{}{admin.ID}
	}

	rows, err := database.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		user := &User{}
		// ... scanning logic ...
		// (Duplicating scan logic here is verbose. I should have refactored scan into a helper,
		// but since I can't easily refactor entire file now, I will copy-paste scan logic).
		var phone, profileImage, addressLine1, addressLine2, city, state, pincode, region, installationStatus, propertyType, connectionType, inverterBrand, discomName, consumerNumber, deviceID, subsidyStatus, schemeName, applicationID sql.NullString
		var aID, installerID, pID sql.NullString
		var latitude, longitude, avgMonthlyBill, roofAreaSqft, projectCost, plantCapacityKW sql.NullFloat64
		var installationDate, lastDataReceived sql.NullTime
		var subsidyInterest, netMetering, deviceLinked, subsidyApplied, isActive sql.NullBool

		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PasswordHash,
			&user.Role, &phone, &profileImage, &addressLine1, &addressLine2,
			&city, &state, &pincode, &region, &latitude, &longitude, &aID, &installerID, &pID,
			&installationStatus, &propertyType, &avgMonthlyBill, &roofAreaSqft, &connectionType, &subsidyInterest,
			&projectCost, &plantCapacityKW, &installationDate, &netMetering, &inverterBrand, &discomName, &consumerNumber,
			&deviceLinked, &deviceID, &lastDataReceived, &subsidyApplied, &subsidyStatus, &schemeName, &applicationID,
			&isActive, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			return nil, err
		}

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
		user.AdminID = nullStringToString(aID)
		user.InstallerID = nullStringToString(installerID)
		user.PlantID = nullStringToString(pID)
		user.InstallationStatus = InstallationStatus(nullStringToString(installationStatus))
		user.PropertyType = PropertyType(nullStringToString(propertyType))
		user.AvgMonthlyBill = nullFloat64ToFloat64(avgMonthlyBill)
		user.RoofAreaSqft = nullFloat64ToFloat64(roofAreaSqft)
		user.ConnectionType = ConnectionType(nullStringToString(connectionType))
		user.SubsidyInterest = nullBoolToBool(subsidyInterest)
		user.ProjectCost = nullFloat64ToFloat64(projectCost)
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
