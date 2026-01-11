package auth

import (
	"log"
	"net/http"
	"sems-backend/internal/database"
	"sems-backend/internal/users"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	// Basic user details (required)
	FirstName    string `json:"first_name" binding:"required"`
	LastName     string `json:"last_name" binding:"required"`
	Email        string `json:"email" binding:"required,email"`
	Password     string `json:"password" binding:"required,min=6"`
	Phone        string `json:"phone" binding:"required"`
	AddressLine1 string `json:"address_line1" binding:"required"`
	City         string `json:"city" binding:"required"`
	State        string `json:"state" binding:"required"`
	Pincode      string `json:"pincode" binding:"required"`

	// Solar-specific fields
	InstallationStatus string `json:"installation_status" binding:"required,oneof=NOT_INSTALLED INSTALLATION_PLANNED INSTALLED"`
	PropertyType       string `json:"property_type" binding:"omitempty,oneof=RESIDENTIAL COMMERCIAL INDUSTRIAL"`

	// For prospective users (planning stage)
	AvgMonthlyBill  float64 `json:"avg_monthly_bill"`
	RoofAreaSqft    float64 `json:"roof_area_sqft"`
	ConnectionType  string  `json:"connection_type"`
	SubsidyInterest bool    `json:"subsidy_interest"`

	// For installed users
	PlantCapacityKW float64 `json:"plant_capacity_kw"`
	NetMetering     bool    `json:"net_metering"`
	InverterBrand   string  `json:"inverter_brand"`
	DISCOMName      string  `json:"discom_name"`
	ConsumerNumber  string  `json:"consumer_number"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	log.Printf("Register attempt: name=%s %s, email=%s", req.FirstName, req.LastName, req.Email)
	log.Printf("DB is nil: %v", database.DB == nil)

	// Check if user already exists
	existingUser, _ := users.GetUserByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create user
	user, err := users.CreateUser(
		req.FirstName,
		req.LastName,
		req.Email,
		string(hashedPassword),
		"USER",
		req.Phone,
		"",
		req.AddressLine1,
		"",
		req.City,
		req.State,
		req.Pincode,
		"",
		0,
		0,
		"",
		"",
		"",
	)
	if err != nil {
		log.Printf("CreateUser error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Update user with solar-specific fields
	user.InstallationStatus = users.InstallationStatus(req.InstallationStatus)
	if req.PropertyType != "" {
		user.PropertyType = users.PropertyType(req.PropertyType)
	}

	// Handle based on installation status
	switch req.InstallationStatus {
	case "NOT_INSTALLED", "INSTALLATION_PLANNED":
		// Prospective user fields
		user.AvgMonthlyBill = req.AvgMonthlyBill
		user.RoofAreaSqft = req.RoofAreaSqft
		if req.ConnectionType != "" {
			user.ConnectionType = users.ConnectionType(req.ConnectionType)
		}
		user.SubsidyInterest = req.SubsidyInterest

	case "INSTALLED":
		// Installed user fields
		user.PropertyType = users.PropertyType(req.PropertyType)
		user.PlantCapacityKW = req.PlantCapacityKW
		user.NetMetering = req.NetMetering
		user.InverterBrand = req.InverterBrand
		user.DISCOMName = req.DISCOMName
		user.ConsumerNumber = req.ConsumerNumber
	}

	// Update user in database
	err = users.UpdateUser(user)
	if err != nil {
		log.Printf("UpdateUser error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user with solar details"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":                  user.ID,
			"first_name":          user.FirstName,
			"last_name":           user.LastName,
			"email":               user.Email,
			"phone":               user.Phone,
			"city":                user.City,
			"state":               user.State,
			"pincode":             user.Pincode,
			"installation_status": user.InstallationStatus,
			"property_type":       user.PropertyType,
			"avg_monthly_bill":    user.AvgMonthlyBill,
			"plant_capacity_kw":   user.PlantCapacityKW,
		},
	})
}
