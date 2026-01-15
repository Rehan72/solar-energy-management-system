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

// @Summary Create a ticket
// @Description Create a new support ticket
// @Tags Tickets
// @Accept json
// @Produce json
// @Param ticket body CreateTicketRequest true "Ticket creation data"
// @Success 201 {object} Ticket
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /user/tickets [post]
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

// @Summary Get user tickets
// @Description Get current user's tickets
// @Tags Tickets
// @Accept json
// @Produce json
// @Success 200 {object} []Ticket
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /user/tickets [get]
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

// @Summary Get installer tickets
// @Description Get tickets assigned to current installer
// @Tags Tickets
// @Accept json
// @Produce json
// @Success 200 {object} []Ticket
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /installer/tickets [get]
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

// @Summary Update ticket status
// @Description Update status of a ticket
// @Tags Tickets
// @Accept json
// @Produce json
// @Param id path string true "Ticket ID"
// @Param status body UpdateTicketRequest true "New status"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /installer/tickets/{id}/status [put]
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
