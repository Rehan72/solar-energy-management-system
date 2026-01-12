package tickets

import (
	"log"
	"sems-backend/internal/database"
	"time"

	"github.com/google/uuid"
)

type TicketStatus string

const (
	StatusOpen       TicketStatus = "OPEN"
	StatusInProgress TicketStatus = "IN_PROGRESS"
	StatusResolved   TicketStatus = "RESOLVED"
	StatusClosed     TicketStatus = "CLOSED"
)

type Ticket struct {
	ID          string       `json:"id"`
	UserID      string       `json:"user_id"`
	InstallerID *string      `json:"installer_id"` // Can be nil initially
	Subject     string       `json:"subject"`
	Description string       `json:"description"`
	Status      TicketStatus `json:"status"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`

	// Joined fields
	UserName      string `json:"user_name,omitempty"`
	InstallerName string `json:"installer_name,omitempty"`
}

func CreateTicket(userID uuid.UUID, subject, description string) (*Ticket, error) {
	id := uuid.New().String()
	now := time.Now()
	status := StatusOpen

	// Logic to auto-assign installer could go here. For now, we leave it unassigned or assign to user's linked installer.
	var installerID *string
	// Fetch user's installer
	var linkedInstallerID string
	err := database.DB.QueryRow("SELECT installer_id FROM users WHERE id = ?", userID).Scan(&linkedInstallerID)
	if err == nil && linkedInstallerID != "" {
		installerID = &linkedInstallerID
	}

	query := `
		INSERT INTO tickets (id, user_id, installer_id, subject, description, status, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err = database.DB.Exec(query, id, userID.String(), installerID, subject, description, status, now, now)
	if err != nil {
		return nil, err
	}

	return &Ticket{
		ID:          id,
		UserID:      userID.String(),
		InstallerID: installerID,
		Subject:     subject,
		Description: description,
		Status:      status,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

func GetTicketsByUserID(userID string) ([]Ticket, error) {
	query := `
		SELECT t.id, t.user_id, t.installer_id, t.subject, t.description, t.status, t.created_at, t.updated_at,
		       COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as installer_name
		FROM tickets t
		LEFT JOIN users u ON t.installer_id = u.id
		WHERE t.user_id = ?
		ORDER BY t.created_at DESC
	`
	rows, err := database.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []Ticket
	for rows.Next() {
		var t Ticket
		var installerName *string
		var installerID *string
		if err := rows.Scan(&t.ID, &t.UserID, &installerID, &t.Subject, &t.Description, &t.Status, &t.CreatedAt, &t.UpdatedAt, &installerName); err != nil {
			log.Printf("Error scanning ticket: %v", err)
			continue
		}
		t.InstallerID = installerID
		if installerName != nil {
			t.InstallerName = *installerName
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func GetTicketsByInstallerID(installerID string) ([]Ticket, error) {
	query := `
		SELECT t.id, t.user_id, t.installer_id, t.subject, t.description, t.status, t.created_at, t.updated_at,
		       COALESCE(u.first_name || ' ' || u.last_name, 'Unknown') as user_name,
			   u.address_line1, u.city, u.phone
		FROM tickets t
		JOIN users u ON t.user_id = u.id
		WHERE t.installer_id = ?
		ORDER BY t.created_at DESC
	`
	rows, err := database.DB.Query(query, installerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []Ticket
	for rows.Next() {
		var t Ticket
		var address, city, phone string
		if err := rows.Scan(&t.ID, &t.UserID, &t.InstallerID, &t.Subject, &t.Description, &t.Status, &t.CreatedAt, &t.UpdatedAt, &t.UserName, &address, &city, &phone); err != nil {
			continue
		}
		// Append contact details to description for installer visibility (hack for now)
		t.Description += " | Loc: " + city + ", " + address + " | Ph: " + phone
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func UpdateTicketStatus(ticketID string, status TicketStatus) error {
	query := "UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?"
	_, err := database.DB.Exec(query, status, time.Now(), ticketID)
	return err
}
