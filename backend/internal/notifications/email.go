package notifications

import (
	"fmt"
	"net/smtp"
	"os"
	"strings"
)

// EmailConfig holds email configuration
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
}

// GetEmailConfig returns email configuration from environment variables
func GetEmailConfig() *EmailConfig {
	return &EmailConfig{
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@solarenergy.com"),
		FromName:     getEnv("FROM_NAME", "Solar Energy Management System"),
	}
}

// SendEmail sends an email notification
func SendEmail(to, subject, body string) error {
	config := GetEmailConfig()

	// Skip if SMTP not configured
	if config.SMTPUsername == "" || config.SMTPPassword == "" {
		fmt.Println("⚠️  SMTP not configured, skipping email send")
		return nil
	}

	// Set up authentication
	auth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPHost)

	// Compose message
	from := fmt.Sprintf("%s <%s>", config.FromName, config.FromEmail)
	msg := composeEmail(from, to, subject, body)

	// Send email
	addr := fmt.Sprintf("%s:%s", config.SMTPHost, config.SMTPPort)
	err := smtp.SendMail(addr, auth, config.FromEmail, []string{to}, []byte(msg))

	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	fmt.Printf("✅ Email sent to %s: %s\n", to, subject)
	return nil
}

// SendNotificationEmail sends a notification via email
func SendNotificationEmail(to, title, message string, severity NotificationSeverity) error {
	subject := fmt.Sprintf("[%s] %s", severity, title)

	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
	<style>
		body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #f59e0b 0%%, #ea580c 100%%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
		.content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
		.severity { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin-bottom: 15px; }
		.severity-CRITICAL { background: #dc2626; color: white; }
		.severity-HIGH { background: #ea580c; color: white; }
		.severity-MEDIUM { background: #f59e0b; color: white; }
		.severity-LOW { background: #10b981; color: white; }
		.message { background: white; padding: 20px; border-radius: 8px; margin-top: 15px; }
		.footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h2>☀️ Solar Energy Management System</h2>
		</div>
		<div class="content">
			<span class="severity severity-%s">%s</span>
			<h3>%s</h3>
			<div class="message">
				%s
			</div>
			<div class="footer">
				<p>This is an automated notification from your Solar Energy Management System.</p>
				<p>© 2026 Solar Energy Management System. All rights reserved.</p>
			</div>
		</div>
	</div>
</body>
</html>
	`, severity, severity, title, message)

	return SendEmail(to, subject, body)
}

// composeEmail creates a properly formatted email message
func composeEmail(from, to, subject, body string) string {
	headers := make(map[string]string)
	headers["From"] = from
	headers["To"] = to
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=UTF-8"

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	return message
}

// getEnv gets an environment variable with a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// SendBulkNotification sends notifications to multiple users
func SendBulkNotification(emails []string, title, message string, severity NotificationSeverity) error {
	var errors []string

	for _, email := range emails {
		err := SendNotificationEmail(email, title, message, severity)
		if err != nil {
			errors = append(errors, fmt.Sprintf("%s: %v", email, err))
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("failed to send to some recipients: %s", strings.Join(errors, "; "))
	}

	return nil
}
