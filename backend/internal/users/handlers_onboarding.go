package users

import (
	"fmt"
	"net/http"
	"sems-backend/internal/database"
	"sems-backend/internal/notifications"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type OnboardingRequest struct {
	Region       string  `json:"region" binding:"required"`
	PlantID      string  `json:"plant_id" binding:"required"`
	AdminID      string  `json:"admin_id" binding:"required"`
	AddressLine1 string  `json:"address_line1" binding:"required"`
	AddressLine2 string  `json:"address_line2"`
	City         string  `json:"city" binding:"required"`
	State        string  `json:"state" binding:"required"`
	Pincode      string  `json:"pincode" binding:"required"`
	Latitude     float64 `json:"latitude"`
	Longitude    float64 `json:"longitude"`
}

// @Summary Complete Onboarding
// @Description Complete user onboarding process
// @Tags Users
// @Accept json
// @Produce json
// @Param data body OnboardingRequest true "Onboarding data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /user/onboarding [post]
func CompleteOnboarding(c *gin.Context) {
	userID := c.GetString("user_id") // Assuming AuthMiddleware sets this
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req OnboardingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update User in DB
	query := `
		UPDATE users 
		SET region = ?, plant_id = ?, admin_id = ?, 
			address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, 
			latitude = ?, longitude = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	_, err := database.DB.Exec(query,
		req.Region, req.PlantID, req.AdminID,
		req.AddressLine1, req.AddressLine2, req.City, req.State, req.Pincode,
		req.Latitude, req.Longitude, userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user profile"})
		return
	}

	// Fetch User details for notification
	user, err := GetUserByID(userID)
	if err != nil {
		// Log error but continue
		fmt.Printf("Error fetching user for notification: %v\n", err)
	}

	// Notify Selected Admin
	adminUUID, err := uuid.Parse(req.AdminID)
	if err == nil {
		userName := "A new user"
		if user != nil {
			userName = fmt.Sprintf("%s %s", user.FirstName, user.LastName)
		}

		notifications.CreateNotification(
			adminUUID,
			notifications.NotificationTypeAlert,
			"New User Onboarding Complete",
			fmt.Sprintf("%s has completed onboarding and is assigned to your plant.", userName),
			notifications.SeverityMedium,
			"/admin/users",
		)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Onboarding completed successfully"})
}
