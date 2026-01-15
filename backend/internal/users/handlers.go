package users

import (
	"net/http"
	"sems-backend/internal/plants"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	FirstName          string  `json:"first_name" binding:"required"`
	LastName           string  `json:"last_name" binding:"required"`
	Email              string  `json:"email" binding:"required,email"`
	Password           string  `json:"password" binding:"required,min=6"`
	Role               string  `json:"role" binding:"required,oneof=USER ADMIN SUPER_ADMIN INSTALLER GOVT"`
	Phone              string  `json:"phone"`
	ProfileImage       string  `json:"profile_image"`
	AddressLine1       string  `json:"address_line1"`
	AddressLine2       string  `json:"address_line2"`
	City               string  `json:"city"`
	State              string  `json:"state"`
	Pincode            string  `json:"pincode"`
	Region             string  `json:"region"`
	Latitude           float64 `json:"latitude"`
	Longitude          float64 `json:"longitude"`
	AdminID            string  `json:"admin_id"`
	InstallerID        string  `json:"installer_id"`
	PlantID            string  `json:"plant_id"`
	InstallationStatus string  `json:"installation_status"`
	PropertyType       string  `json:"property_type"`
	AvgMonthlyBill     float64 `json:"avg_monthly_bill"`
	RoofAreaSqft       float64 `json:"roof_area_sqft"`
	ConnectionType     string  `json:"connection_type"`
	SubsidyInterest    bool    `json:"subsidy_interest"`
	ProjectCost        float64 `json:"project_cost"`
	PlantCapacityKW    float64 `json:"plant_capacity_kw"`
	InstallationDate   string  `json:"installation_date"`
	NetMetering        bool    `json:"net_metering"`
	InverterBrand      string  `json:"inverter_brand"`
	DISCOMName         string  `json:"discom_name"`
	ConsumerNumber     string  `json:"consumer_number"`
	DeviceLinked       bool    `json:"device_linked"`
	DeviceID           string  `json:"device_id"`
	SubsidyApplied     bool    `json:"subsidy_applied"`
	SubsidyStatus      string  `json:"subsidy_status"`
	SchemeName         string  `json:"scheme_name"`
	ApplicationID      string  `json:"application_id"`
}

type UpdateUserRequest struct {
	FirstName          string  `json:"first_name"`
	LastName           string  `json:"last_name"`
	Email              string  `json:"email"`
	Role               string  `json:"role"`
	Phone              string  `json:"phone"`
	ProfileImage       string  `json:"profile_image"`
	AddressLine1       string  `json:"address_line1"`
	AddressLine2       string  `json:"address_line2"`
	City               string  `json:"city"`
	State              string  `json:"state"`
	Pincode            string  `json:"pincode"`
	Region             string  `json:"region"`
	Latitude           float64 `json:"latitude"`
	Longitude          float64 `json:"longitude"`
	AdminID            string  `json:"admin_id" binding:"-"`
	InstallerID        string  `json:"installer_id"`
	PlantID            string  `json:"plant_id"`
	InstallationStatus string  `json:"installation_status"`
	PropertyType       string  `json:"property_type"`
	AvgMonthlyBill     float64 `json:"avg_monthly_bill"`
	RoofAreaSqft       float64 `json:"roof_area_sqft"`
	ConnectionType     string  `json:"connection_type"`
	SubsidyInterest    bool    `json:"subsidy_interest"`
	ProjectCost        float64 `json:"project_cost"`
	PlantCapacityKW    float64 `json:"plant_capacity_kw"`
	InstallationDate   string  `json:"installation_date"`
	NetMetering        bool    `json:"net_metering"`
	InverterBrand      string  `json:"inverter_brand"`
	DISCOMName         string  `json:"discom_name"`
	ConsumerNumber     string  `json:"consumer_number"`
	SubsidyApplied     bool    `json:"subsidy_applied"`
	SubsidyStatus      string  `json:"subsidy_status"`
	SchemeName         string  `json:"scheme_name"`
	ApplicationID      string  `json:"application_id"`
	PersonnelNexusID   string  `json:"personnel_nexus_id"`
}

type UpdateSolarProfileRequest struct {
	InstallationStatus string  `json:"installation_status"`
	InstallerID        string  `json:"installer_id"`
	PlantID            string  `json:"plant_id"`
	PropertyType       string  `json:"property_type"`
	AvgMonthlyBill     float64 `json:"avg_monthly_bill"`
	RoofAreaSqft       float64 `json:"roof_area_sqft"`
	ConnectionType     string  `json:"connection_type"`
	SubsidyInterest    bool    `json:"subsidy_interest"`
	ProjectCost        float64 `json:"project_cost"`
	PlantCapacityKW    float64 `json:"plant_capacity_kw"`
	InstallationDate   string  `json:"installation_date"`
	NetMetering        bool    `json:"net_metering"`
	InverterBrand      string  `json:"inverter_brand"`
	DISCOMName         string  `json:"discom_name"`
	ConsumerNumber     string  `json:"consumer_number"`
	DeviceLinked       bool    `json:"device_linked"`
	DeviceID           string  `json:"device_id"`
	SubsidyApplied     bool    `json:"subsidy_applied"`
	SubsidyStatus      string  `json:"subsidy_status"`
	SchemeName         string  `json:"scheme_name"`
	ApplicationID      string  `json:"application_id"`
}

// @Summary Create a new user
// @Description Create a new user (SuperAdmin/Admin can create users/admins/installers)
// @Tags Users
// @Accept json
// @Produce json
// @Param user body CreateUserRequest true "User creation data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /admin/users [post]
// @Router /superadmin/admins [post]
func CreateUserHandler(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Get current user info
	currentUserRole := c.GetString("role")
	currentUserID := c.GetString("user_id")

	// Role-based access
	if currentUserRole == "ADMIN" && req.Role != "USER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admins can only create users"})
		return
	}
	if currentUserRole == "ADMIN" {
		req.AdminID = currentUserID
	}

	user, err := CreateUser(req.FirstName, req.LastName, req.Email, string(hashedPassword), req.Role, req.Phone, req.ProfileImage, req.AddressLine1, req.AddressLine2, req.City, req.State, req.Pincode, req.Region, req.Latitude, req.Longitude, req.AdminID, req.InstallerID, req.PlantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Set solar-specific fields if provided
	if req.InstallationStatus != "" {
		user.InstallationStatus = InstallationStatus(req.InstallationStatus)
	}
	if req.PropertyType != "" {
		user.PropertyType = PropertyType(req.PropertyType)
	}
	user.AvgMonthlyBill = req.AvgMonthlyBill
	user.RoofAreaSqft = req.RoofAreaSqft
	if req.ConnectionType != "" {
		user.ConnectionType = ConnectionType(req.ConnectionType)
	}
	user.SubsidyInterest = req.SubsidyInterest
	user.ProjectCost = req.ProjectCost
	user.PlantCapacityKW = req.PlantCapacityKW
	if req.InstallationDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", req.InstallationDate); err == nil {
			user.InstallationDate = parsedDate
		}
	}
	user.NetMetering = req.NetMetering
	user.InverterBrand = req.InverterBrand
	user.DISCOMName = req.DISCOMName
	user.ConsumerNumber = req.ConsumerNumber

	UpdateUser(user)

	// Create default plants for the region if it has none
	if req.Region != "" {
		if err := plants.CreateDefaultPlantsForRegion(req.Region); err != nil {
			// Log the error but don't fail the user creation
			// You might want to add proper logging here
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user,
	})
}

// @Summary Get all users
// @Description Get a list of users, optionally filtered by role
// @Tags Users
// @Accept json
// @Produce json
// @Param role query string false "Role filter (USER, ADMIN, INSTALLER)"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /admin/users [get]
// @Router /superadmin/users [get]
func GetUsersHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")

	// Get role from query parameter, default to "ALL" for superadmin, "USER" for admin
	var roleFilter string
	if currentUserRole == "SUPER_ADMIN" {
		roleFilter = c.DefaultQuery("role", "ALL")
	} else {
		roleFilter = c.DefaultQuery("role", "USER")
	}

	var users []*User
	var err error

	if currentUserRole == "SUPER_ADMIN" {
		// SuperAdmin can see all users or filter by role if specified
		if roleFilter == "ALL" {
			users, err = GetAllUsersIncludingAdmins()
		} else {
			users, err = GetUsersByRole(roleFilter)
		}
	} else if currentUserRole == "ADMIN" {
		currentUserID := c.GetString("user_id")
		// Fetch current admin details to determine scope
		adminUser, err := GetUserByID(currentUserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admin details"})
			return
		}

		// Fetch users based on Admin's scope (Region/Plant)
		users, err = GetUsersByScope(adminUser)

		// Filter by role if not ALL
		if err == nil && roleFilter != "ALL" {
			filtered := []*User{}
			for _, u := range users {
				if u.Role == roleFilter {
					filtered = append(filtered, u)
				}
			}
			users = filtered
		}
	} else {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

// @Summary Get user by ID
// @Description Get detailed information for a specific user
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /admin/users/{id} [get]
// @Router /superadmin/admins/{id} [get]
func GetUserHandler(c *gin.Context) {
	id := c.Param("id")
	user, err := GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check permissions
	currentUserRole := c.GetString("role")
	currentUserID := c.GetString("user_id")

	if (currentUserRole == "USER" && currentUserID != id) || (currentUserRole == "ADMIN" && user.AdminID != currentUserID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// @Summary Get current user profile
// @Description Get profile of the currently logged-in user
// @Tags Users
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /user/profile [get]
func GetCurrentUserHandler(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, err := GetUserByID(currentUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

// @Summary Update user
// @Description Update user details
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param user body UpdateUserRequest true "User update data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /admin/users/{id} [put]
// @Router /superadmin/admins/{id} [put]
func UpdateUserHandler(c *gin.Context) {
	id := c.Param("id")
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := GetUserByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Check permissions
	currentUserRole := c.GetString("role")
	currentUserID := c.GetString("user_id")

	if (currentUserRole == "USER" && currentUserID != id) || (currentUserRole == "ADMIN" && user.AdminID != currentUserID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	if currentUserRole == "ADMIN" && req.Role != "" && req.Role != "USER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admins can only manage users"})
		return
	}

	// Update basic fields
	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	if req.LastName != "" {
		user.LastName = req.LastName
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	if req.Phone != "" {
		user.Phone = req.Phone
	}
	if req.ProfileImage != "" {
		user.ProfileImage = req.ProfileImage
	}
	if req.AddressLine1 != "" {
		user.AddressLine1 = req.AddressLine1
	}
	if req.AddressLine2 != "" {
		user.AddressLine2 = req.AddressLine2
	}
	if req.City != "" {
		user.City = req.City
	}
	if req.State != "" {
		user.State = req.State
	}
	if req.Pincode != "" {
		user.Pincode = req.Pincode
	}
	if req.Region != "" {
		user.Region = req.Region
	}
	user.Latitude = req.Latitude
	user.Longitude = req.Longitude
	if currentUserRole == "SUPER_ADMIN" {
		user.AdminID = req.AdminID
	}
	if req.InstallerID != "" {
		user.InstallerID = req.InstallerID
	}
	if req.PlantID != "" {
		user.PlantID = req.PlantID
	}

	// Update solar-specific fields
	if req.InstallationStatus != "" {
		user.InstallationStatus = InstallationStatus(req.InstallationStatus)
	}
	if req.PropertyType != "" {
		user.PropertyType = PropertyType(req.PropertyType)
	}
	user.AvgMonthlyBill = req.AvgMonthlyBill
	user.RoofAreaSqft = req.RoofAreaSqft
	if req.ConnectionType != "" {
		user.ConnectionType = ConnectionType(req.ConnectionType)
	}
	user.SubsidyInterest = req.SubsidyInterest
	user.ProjectCost = req.ProjectCost
	user.PlantCapacityKW = req.PlantCapacityKW
	if req.InstallationDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", req.InstallationDate); err == nil {
			user.InstallationDate = parsedDate
		}
	}
	user.NetMetering = req.NetMetering
	user.InverterBrand = req.InverterBrand
	user.DISCOMName = req.DISCOMName
	user.ConsumerNumber = req.ConsumerNumber
	user.SubsidyApplied = req.SubsidyApplied
	if req.SubsidyStatus != "" {
		user.SubsidyStatus = SubsidyStatus(req.SubsidyStatus)
	}
	user.SchemeName = req.SchemeName
	user.ApplicationID = req.ApplicationID
	if req.PersonnelNexusID != "" {
		user.PersonnelNexusID = req.PersonnelNexusID
	}

	err = UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": user})
}

// UpdateSolarProfileHandler - Updates solar-specific profile for a user
// @Summary Update solar profile
// @Description Update solar-specific profile settings for the user
// @Tags Users
// @Accept json
// @Produce json
// @Param profile body UpdateSolarProfileRequest true "Solar Profile data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /user/solar-profile [put]
func UpdateSolarProfileHandler(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	var req UpdateSolarProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := GetUserByID(currentUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update solar-specific fields
	if req.InstallerID != "" {
		user.InstallerID = req.InstallerID
	}
	if req.PlantID != "" {
		user.PlantID = req.PlantID
	}
	if req.InstallationStatus != "" {
		user.InstallationStatus = InstallationStatus(req.InstallationStatus)
	}
	if req.PropertyType != "" {
		user.PropertyType = PropertyType(req.PropertyType)
	}
	user.AvgMonthlyBill = req.AvgMonthlyBill
	user.RoofAreaSqft = req.RoofAreaSqft
	if req.ConnectionType != "" {
		user.ConnectionType = ConnectionType(req.ConnectionType)
	}
	user.SubsidyInterest = req.SubsidyInterest
	user.ProjectCost = req.ProjectCost
	user.PlantCapacityKW = req.PlantCapacityKW
	if req.InstallationDate != "" {
		if parsedDate, err := time.Parse("2006-01-02", req.InstallationDate); err == nil {
			user.InstallationDate = parsedDate
		}
	}
	user.NetMetering = req.NetMetering
	user.InverterBrand = req.InverterBrand
	user.DISCOMName = req.DISCOMName
	user.ConsumerNumber = req.ConsumerNumber
	user.DeviceLinked = req.DeviceLinked
	user.DeviceID = req.DeviceID
	user.SubsidyApplied = req.SubsidyApplied
	if req.SubsidyStatus != "" {
		user.SubsidyStatus = SubsidyStatus(req.SubsidyStatus)
	}
	user.SchemeName = req.SchemeName
	user.ApplicationID = req.ApplicationID

	err = UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update solar profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Solar profile updated successfully",
		"user":    user,
	})
}

// GetSolarProfileHandler - Returns solar profile for current user
// @Summary Get solar profile
// @Description Get solar profile for the current user
// @Tags Users
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /user/solar-profile [get]
func GetSolarProfileHandler(c *gin.Context) {
	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, err := GetUserByID(currentUserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Return solar profile data
	solarProfile := SolarProfile{
		UserID:             user.ID,
		InstallationStatus: user.InstallationStatus,
		PropertyType:       user.PropertyType,
		AvgMonthlyBill:     user.AvgMonthlyBill,
		RoofAreaSqft:       user.RoofAreaSqft,
		ConnectionType:     user.ConnectionType,
		SubsidyInterest:    user.SubsidyInterest,
		ProjectCost:        user.ProjectCost,
		PlantCapacityKW:    user.PlantCapacityKW,
		InstallationDate:   user.InstallationDate,
		NetMetering:        user.NetMetering,
		InverterBrand:      user.InverterBrand,
		DISCOMName:         user.DISCOMName,
		ConsumerNumber:     user.ConsumerNumber,
		DeviceLinked:       user.DeviceLinked,
		DeviceID:           user.DeviceID,
		LastDataReceived:   user.LastDataReceived,
		SubsidyApplied:     user.SubsidyApplied,
		SubsidyStatus:      user.SubsidyStatus,
		SchemeName:         user.SchemeName,
		ApplicationID:      user.ApplicationID,
		PlantID:            user.PlantID,
	}

	c.JSON(http.StatusOK, gin.H{"solar_profile": solarProfile})
}

// @Summary Delete user
// @Description Delete a user by ID
// @Tags Users
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /admin/users/{id} [delete]
// @Router /superadmin/admins/{id} [delete]
func DeleteUserHandler(c *gin.Context) {
	id := c.Param("id")

	// Check permissions
	currentUserRole := c.GetString("role")
	currentUserID := c.GetString("user_id")

	if currentUserRole == "USER" && currentUserID != id {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	err := DeleteUser(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// For SuperAdmin: Get all admins
// @Summary Get all admins
// @Description Get a list of all administrators (SuperAdmin only)
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/admins [get]
func GetAdminsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	// Get users with role ADMIN directly
	admins, err := GetUsersByRole("ADMIN")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admins"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"admins": admins})
}

// For SuperAdmin & Admin: Get all installers
// @Summary Get all installers
// @Description Get a list of all installers
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /superadmin/installers [get]
// @Router /admin/installers [get]
func GetInstallersHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" && currentUserRole != "ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	installers, err := GetUsersByRole("INSTALLER")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch installers"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"installers": installers})
}

// Helper function to parse float from string
func parseFloat(s string) float64 {
	f, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return f
}
