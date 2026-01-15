package installer

import (
	"net/http"
	"sems-backend/internal/users"
	"time"

	"github.com/gin-gonic/gin"
)

type CompleteInstallationRequest struct {
	DeviceID      string  `json:"device_id" binding:"required"`
	PlantCapacity float64 `json:"plant_capacity_kw"`
	InverterBrand string  `json:"inverter_brand"`
}

// GetAvailableJobsHandler returns all users with status INSTALLATION_PLANNED
// @Summary Get available installation jobs
// @Description Get a list of jobs available for installation
// @Tags Installer
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /installer/jobs [get]
func GetAvailableJobsHandler(c *gin.Context) {
	jobs, err := users.GetUsersByInstallationStatus(users.InstallationStatusPlanned)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch installation jobs"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"jobs":  jobs,
		"count": len(jobs),
	})
}

// CompleteInstallationHandler marks a job as INSTALLED and links device
// @Summary Complete installation
// @Description Mark an installation job as complete and link a device
// @Tags Installer
// @Accept json
// @Produce json
// @Param id path string true "User ID (Job ID)"
// @Param completion body CompleteInstallationRequest true "Completion details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /installer/jobs/{id}/complete [post]
func CompleteInstallationHandler(c *gin.Context) {
	userID := c.Param("id")
	var req CompleteInstallationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := users.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update user record
	user.InstallationStatus = users.InstallationStatusInstalled
	user.DeviceLinked = true
	user.DeviceID = req.DeviceID
	user.InstallationDate = time.Now()

	if req.PlantCapacity > 0 {
		user.PlantCapacityKW = req.PlantCapacity
	}
	if req.InverterBrand != "" {
		user.InverterBrand = req.InverterBrand
	}

	err = users.UpdateUser(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update installation status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Installation passed and device linked successfully",
		"user":    user,
	})
}
