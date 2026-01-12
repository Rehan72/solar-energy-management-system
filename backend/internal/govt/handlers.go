package govt

import (
	"fmt"
	"log"
	"net/http"
	"sems-backend/internal/users"
	"time"

	"github.com/gin-gonic/gin"
)

// Init initializes the govt package
func Init() {
	log.Println("🏛️  Government subsidy module initialized")
}

type UpdateSubsidyRequest struct {
	Status string `json:"status" binding:"required,oneof=APPROVED REJECTED"`
	Reason string `json:"reason"` // Optional reason for rejection
}

// GetPendingSubsidiesHandler returns all users with PENDING subsidy status
func GetPendingSubsidiesHandler(c *gin.Context) {
	usersList, err := users.GetUsersBySubsidyStatus(users.SubsidyStatusPending)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending subsidies"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"subsidies": usersList,
		"count":     len(usersList),
	})
}

// GetSubsidyHistoryHandler returns processed subsidies (APPROVED/REJECTED/DISBURSED)
func GetSubsidyHistoryHandler(c *gin.Context) {
	approved, err := users.GetUsersBySubsidyStatus(users.SubsidyStatusApproved)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch approved subsidies"})
		return
	}

	rejected, err := users.GetUsersBySubsidyStatus(users.SubsidyStatusRejected)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch rejected subsidies"})
		return
	}

	disbursed, err := users.GetUsersBySubsidyStatus(users.SubsidyStatusDisbursed)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch disbursed subsidies"})
		return
	}

	// Combine lists
	history := append(approved, rejected...)
	history = append(history, disbursed...)

	c.JSON(http.StatusOK, gin.H{
		"subsidies": history,
		"count":     len(history),
	})
}

// UpdateSubsidyStatusHandler handles approval/rejection
func UpdateSubsidyStatusHandler(c *gin.Context) {
	userID := c.Param("id")
	var req UpdateSubsidyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := users.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.SubsidyStatus != users.SubsidyStatusPending {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Application is not in PENDING state"})
		return
	}

	newStatus := users.SubsidyStatus(req.Status)
	applicationID := user.ApplicationID

	// Generate Application ID if approving and one doesn't exist
	if newStatus == users.SubsidyStatusApproved && applicationID == "" {
		applicationID = fmt.Sprintf("SUB-%d-%s", time.Now().Unix(), userID[:8])
	}

	err = users.UpdateUserSubsidyStatus(userID, newStatus, applicationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
		return
	}

	// TODO: Send email notification to user

	c.JSON(http.StatusOK, gin.H{
		"message":        "Subsidy status updated successfully",
		"status":         newStatus,
		"application_id": applicationID,
	})
}

// GetDashboardStatsHandler returns overview for Govt dashboard
func GetDashboardStatsHandler(c *gin.Context) {
	pending, _ := users.GetUsersBySubsidyStatus(users.SubsidyStatusPending)
	approved, _ := users.GetUsersBySubsidyStatus(users.SubsidyStatusApproved)
	rejected, _ := users.GetUsersBySubsidyStatus(users.SubsidyStatusRejected)
	disbursed, _ := users.GetUsersBySubsidyStatus(users.SubsidyStatusDisbursed)

	c.JSON(http.StatusOK, gin.H{
		"pending_count":   len(pending),
		"approved_count":  len(approved),
		"rejected_count":  len(rejected),
		"disbursed_count": len(disbursed),
		"total_processed": len(approved) + len(rejected) + len(disbursed),
	})
}
