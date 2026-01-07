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
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	log.Printf("Register attempt: name=%s, email=%s", req.Name, req.Email)
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
	log.Printf("About to call CreateUser with: %s, %s, %s, %s, %s", req.Name, "", req.Email, string(hashedPassword), "user")
	user, err := users.CreateUser(req.Name, "", req.Email, string(hashedPassword), "USER", "", "", "", "", "", "", "", "", 0, 0)
	if err != nil {
		log.Printf("CreateUser error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":    user.ID,
			"name":  user.FirstName + " " + user.LastName,
			"email": user.Email,
		},
	})
}
