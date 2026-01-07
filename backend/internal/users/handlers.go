package users

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type CreateUserRequest struct {
	FirstName    string  `json:"first_name" binding:"required"`
	LastName     string  `json:"last_name" binding:"required"`
	Email        string  `json:"email" binding:"required,email"`
	Password     string  `json:"password" binding:"required,min=6"`
	Role         string  `json:"role" binding:"required,oneof=USER ADMIN SUPER_ADMIN"`
	Phone        string  `json:"phone"`
	ProfileImage string  `json:"profile_image"`
	AddressLine1 string  `json:"address_line1"`
	AddressLine2 string  `json:"address_line2"`
	City         string  `json:"city"`
	State        string  `json:"state"`
	Pincode      string  `json:"pincode"`
	Region       string  `json:"region"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

type UpdateUserRequest struct {
	FirstName    string  `json:"first_name"`
	LastName     string  `json:"last_name"`
	Email        string  `json:"email"`
	Role         string  `json:"role"`
	Phone        string  `json:"phone"`
	ProfileImage string  `json:"profile_image"`
	AddressLine1 string  `json:"address_line1"`
	AddressLine2 string  `json:"address_line2"`
	City         string  `json:"city"`
	State        string  `json:"state"`
	Pincode      string  `json:"pincode"`
	Region       string  `json:"region"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

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

	// Get current user role
	currentUserRole := c.GetString("role")

	// Role-based access
	if currentUserRole == "ADMIN" && req.Role != "USER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admins can only create users"})
		return
	}
	if currentUserRole == "USER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Users cannot create other users"})
		return
	}

	user, err := CreateUser(req.FirstName, req.LastName, req.Email, string(hashedPassword), req.Role, req.Phone, req.ProfileImage, req.AddressLine1, req.AddressLine2, req.City, req.State, req.Pincode, req.Region, req.Latitude, req.Longitude)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user,
	})
}

func GetUsersHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")

	var users []*User
	var err error

	if currentUserRole == "SUPER_ADMIN" || currentUserRole == "ADMIN" {
		users, err = GetAllUsers()
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

	if currentUserRole == "USER" && currentUserID != id {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

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

	if currentUserRole == "USER" && currentUserID != id {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}
	if currentUserRole == "ADMIN" && req.Role != "" && req.Role != "USER" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admins can only manage users"})
		return
	}

	// Update fields
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

	err = UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": user})
}

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
func GetAdminsHandler(c *gin.Context) {
	currentUserRole := c.GetString("role")
	if currentUserRole != "SUPER_ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	users, err := GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch admins"})
		return
	}

	admins := []*User{}
	for _, u := range users {
		if u.Role == "ADMIN" {
			admins = append(admins, u)
		}
	}

	c.JSON(http.StatusOK, gin.H{"admins": admins})
}
