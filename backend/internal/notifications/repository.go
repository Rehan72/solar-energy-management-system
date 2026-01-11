package notifications

import (
	"database/sql"
	"encoding/json"
	"sems-backend/internal/database"
	"time"

	"github.com/google/uuid"
)

// CreateNotification creates a new notification
func CreateNotification(userID uuid.UUID, notifType NotificationType, title, message string, severity NotificationSeverity, actionURL string) (*Notification, error) {
	notification := &Notification{
		ID:        uuid.New(),
		UserID:    userID,
		Type:      notifType,
		Title:     title,
		Message:   message,
		Severity:  severity,
		Read:      false,
		ActionURL: actionURL,
		CreatedAt: time.Now(),
	}

	query := `
		INSERT INTO notifications (id, user_id, type, title, message, severity, read, action_url, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := database.DB.Exec(query,
		notification.ID.String(),
		notification.UserID.String(),
		notification.Type,
		notification.Title,
		notification.Message,
		notification.Severity,
		notification.Read,
		notification.ActionURL,
		notification.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return notification, nil
}

// GetUserNotifications retrieves all notifications for a user
func GetUserNotifications(userID uuid.UUID, limit int, offset int) ([]*Notification, error) {
	query := `
		SELECT id, user_id, type, title, message, severity, read, action_url, created_at
		FROM notifications
		WHERE user_id = ?
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?
	`

	rows, err := database.DB.Query(query, userID.String(), limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []*Notification
	for rows.Next() {
		var n Notification
		var idStr, userIDStr string

		err := rows.Scan(
			&idStr,
			&userIDStr,
			&n.Type,
			&n.Title,
			&n.Message,
			&n.Severity,
			&n.Read,
			&n.ActionURL,
			&n.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		n.ID, _ = uuid.Parse(idStr)
		n.UserID, _ = uuid.Parse(userIDStr)
		notifications = append(notifications, &n)
	}

	return notifications, nil
}

// GetUnreadCount returns the count of unread notifications for a user
func GetUnreadCount(userID uuid.UUID) (int, error) {
	query := `SELECT COUNT(*) FROM notifications WHERE user_id = ? AND read = 0`

	var count int
	err := database.DB.QueryRow(query, userID.String()).Scan(&count)
	if err != nil {
		return 0, err
	}

	return count, nil
}

// MarkAsRead marks a notification as read
func MarkAsRead(notificationID uuid.UUID, userID uuid.UUID) error {
	query := `UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?`

	_, err := database.DB.Exec(query, notificationID.String(), userID.String())
	return err
}

// MarkAllAsRead marks all notifications as read for a user
func MarkAllAsRead(userID uuid.UUID) error {
	query := `UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0`

	_, err := database.DB.Exec(query, userID.String())
	return err
}

// DeleteNotification deletes a notification
func DeleteNotification(notificationID uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM notifications WHERE id = ? AND user_id = ?`

	_, err := database.DB.Exec(query, notificationID.String(), userID.String())
	return err
}

// GetNotificationPreferences retrieves user notification preferences
func GetNotificationPreferences(userID uuid.UUID) (*NotificationPreferences, error) {
	query := `
		SELECT user_id, email_enabled, sms_enabled, push_enabled, alert_types
		FROM notification_preferences
		WHERE user_id = ?
	`

	var prefs NotificationPreferences
	var userIDStr string

	err := database.DB.QueryRow(query, userID.String()).Scan(
		&userIDStr,
		&prefs.EmailEnabled,
		&prefs.SMSEnabled,
		&prefs.PushEnabled,
		&prefs.AlertTypes,
	)

	if err == sql.ErrNoRows {
		// Create default preferences
		return CreateDefaultPreferences(userID)
	}

	if err != nil {
		return nil, err
	}

	prefs.UserID, _ = uuid.Parse(userIDStr)
	return &prefs, nil
}

// CreateDefaultPreferences creates default notification preferences for a user
func CreateDefaultPreferences(userID uuid.UUID) (*NotificationPreferences, error) {
	defaultAlertTypes, _ := json.Marshal([]string{"ALERT", "WARNING", "CRITICAL"})

	prefs := &NotificationPreferences{
		UserID:       userID,
		EmailEnabled: true,
		SMSEnabled:   false,
		PushEnabled:  true,
		AlertTypes:   string(defaultAlertTypes),
	}

	query := `
		INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, alert_types)
		VALUES (?, ?, ?, ?, ?)
	`

	_, err := database.DB.Exec(query,
		prefs.UserID.String(),
		prefs.EmailEnabled,
		prefs.SMSEnabled,
		prefs.PushEnabled,
		prefs.AlertTypes,
	)

	if err != nil {
		return nil, err
	}

	return prefs, nil
}

// UpdateNotificationPreferences updates user notification preferences
func UpdateNotificationPreferences(userID uuid.UUID, emailEnabled, smsEnabled, pushEnabled bool, alertTypes []string) error {
	alertTypesJSON, _ := json.Marshal(alertTypes)

	query := `
		INSERT INTO notification_preferences (user_id, email_enabled, sms_enabled, push_enabled, alert_types)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
			email_enabled = excluded.email_enabled,
			sms_enabled = excluded.sms_enabled,
			push_enabled = excluded.push_enabled,
			alert_types = excluded.alert_types
	`

	_, err := database.DB.Exec(query,
		userID.String(),
		emailEnabled,
		smsEnabled,
		pushEnabled,
		string(alertTypesJSON),
	)

	return err
}
