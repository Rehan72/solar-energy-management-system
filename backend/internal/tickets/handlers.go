package tickets

import (
	"net/http"
	"sems-backend/internal/users"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreateTicketRequest struct {
	Subject     string `json:"subject" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type UpdateTicketRequest struct {
	Status TicketStatus `json:"status" binding:"required"`
}

func CreateTicketHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	u := user.(*users.User)
	userID, _ := uuid.Parse(u.ID)

	var req CreateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ticket, err := CreateTicket(userID, req.Subject, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create ticket"})
		return
	}

	c.JSON(http.StatusCreated, ticket)
}

func GetUserTicketsHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	u := user.(*users.User)

	tickets, err := GetTicketsByUserID(u.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func GetInstallerTicketsHandler(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}
	u := user.(*users.User)

	// Ensure user is an installer
	if u.Role != "INSTALLER" && u.Role != "SUPER_ADMIN" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	tickets, err := GetTicketsByInstallerID(u.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tickets"})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func UpdateTicketStatusHandler(c *gin.Context) {
	id := c.Param("id")
	var req UpdateTicketRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: verify ownership/permission (installer assigned to ticket or ticket owner)
	// For now, allowing any installer/admin to update structure

	err := UpdateTicketStatus(id, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket updated"})
}
