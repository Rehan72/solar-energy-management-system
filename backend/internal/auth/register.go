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
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=6"`
	Phone     string `json:"phone" binding:"required"`
	// Address details (optional at registration)
	AddressLine1 string `json:"address_line1"`
	City         string `json:"city"`
	State        string `json:"state"`
	Pincode      string `json:"pincode"`
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
		"", // Region
		0,
		0,
		"", // AdminID
		"", // InstallerID
		"", // PlantID
	)
	if err != nil {
		log.Printf("CreateUser error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Notification will be sent after Onboarding Complete

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":         user.ID,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"email":      user.Email,
			"phone":      user.Phone,
		},
	})
}
