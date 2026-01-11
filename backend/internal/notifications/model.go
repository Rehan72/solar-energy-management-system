package notifications

import (
	"time"

	"github.com/google/uuid"
)

// NotificationType represents the type of notification
type NotificationType string

const (
	NotificationTypeAlert       NotificationType = "ALERT"
	NotificationTypeInfo        NotificationType = "INFO"
	NotificationTypeWarning     NotificationType = "WARNING"
	NotificationTypeSuccess     NotificationType = "SUCCESS"
	NotificationTypeMaintenance NotificationType = "MAINTENANCE"
	NotificationTypeSystem      NotificationType = "SYSTEM"
)

// NotificationSeverity represents the severity level
type NotificationSeverity string

const (
	SeverityLow      NotificationSeverity = "LOW"
	SeverityMedium   NotificationSeverity = "MEDIUM"
	SeverityHigh     NotificationSeverity = "HIGH"
	SeverityCritical NotificationSeverity = "CRITICAL"
)

// Notification represents a user notification
type Notification struct {
	ID        uuid.UUID            `json:"id" db:"id"`
	UserID    uuid.UUID            `json:"user_id" db:"user_id"`
	Type      NotificationType     `json:"type" db:"type"`
	Title     string               `json:"title" db:"title"`
	Message   string               `json:"message" db:"message"`
	Severity  NotificationSeverity `json:"severity" db:"severity"`
	Read      bool                 `json:"read" db:"read"`
	ActionURL string               `json:"action_url" db:"action_url"`
	CreatedAt time.Time            `json:"created_at" db:"created_at"`
}

// NotificationPreferences represents user notification preferences
type NotificationPreferences struct {
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	EmailEnabled bool      `json:"email_enabled" db:"email_enabled"`
	SMSEnabled   bool      `json:"sms_enabled" db:"sms_enabled"`
	PushEnabled  bool      `json:"push_enabled" db:"push_enabled"`
	AlertTypes   string    `json:"alert_types" db:"alert_types"` // JSON array of enabled alert types
}

// CreateNotificationRequest represents the request to create a notification
type CreateNotificationRequest struct {
	UserID    string               `json:"user_id" binding:"required"`
	Type      NotificationType     `json:"type" binding:"required"`
	Title     string               `json:"title" binding:"required"`
	Message   string               `json:"message" binding:"required"`
	Severity  NotificationSeverity `json:"severity"`
	ActionURL string               `json:"action_url"`
}

// UpdatePreferencesRequest represents the request to update notification preferences
type UpdatePreferencesRequest struct {
	EmailEnabled bool     `json:"email_enabled"`
	SMSEnabled   bool     `json:"sms_enabled"`
	PushEnabled  bool     `json:"push_enabled"`
	AlertTypes   []string `json:"alert_types"`
}
