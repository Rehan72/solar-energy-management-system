package main

import (
	"log"
	"sems-backend/internal/auth"
	"sems-backend/internal/database"
	"sems-backend/internal/devices"
	"sems-backend/internal/energy"
	"sems-backend/internal/govt"
	installerPkg "sems-backend/internal/installer"
	"sems-backend/internal/middleware"
	"sems-backend/internal/notifications"
	"sems-backend/internal/plants"
	"sems-backend/internal/regions"
	"sems-backend/internal/reports"
	"sems-backend/internal/tickets"
	"sems-backend/internal/users"
	"sems-backend/internal/weather"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"golang.org/x/crypto/bcrypt"

	_ "sems-backend/docs"
)

// @title           Solar Energy Management System API
// @version         1.0
// @description     API documentation for the Solar Energy Management System.
// @termsOfService  http://swagger.io/terms/

// @contact.name    API Support
// @contact.url     http://www.swagger.io/support
// @contact.email   support@swagger.io

// @license.name    Apache 2.0
// @license.url     http://www.apache.org/licenses/LICENSE-2.0.html

// @host            localhost:8080
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	// Initialize database (skip if not available for demo)
	if err := database.InitDB(); err != nil {
		log.Println("Database not available, running in demo mode:", err)
	} else {
		defer database.CloseDB()

		// Run migrations
		if err := database.RunMigrations(); err != nil {
			log.Println("Failed to run migrations, continuing in demo mode:", err)
		}
	}

	// Initialize Govt/Subsidy package
	govt.Init()

	// Start Anomaly Detection Worker (every 15 minutes)
	energy.StartAnomalyDetectionWorker(15 * time.Minute)

	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		AllowCredentials: false,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "SEMS backend running",
		})
	})

	r.GET("/test", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "root test works"})
	})

	// Swagger
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Seed endpoint to create initial super admin (for testing)
	r.POST("/seed/superadmin", func(c *gin.Context) {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("SuperAdmin@123"), bcrypt.DefaultCost)
		_, err := users.CreateUser("Super", "Admin", "superAdmin@solar.com", string(hashedPassword), "SUPER_ADMIN", "", "", "", "", "", "", "", "", 0, 0, "", "", "")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create super admin", "details": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Super admin created successfully", "email": "superAdmin@solar.com", "password": "SuperAdmin@123"})
	})

	// Public auth routes
	r.POST("/auth/register", auth.Register)
	r.POST("/auth/login", auth.Login)

	// IoT data ingestion (public, authenticated by API key)
	r.POST("/iot/data", energy.IngestData)

	// Public hierarchy for map
	r.GET("/public/hierarchy", users.GetPublicHierarchyHandler)

	// USER Routes (USER, ADMIN can access)
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(), middleware.RequireRole("USER", "ADMIN", "SUPER_ADMIN"))
	{
		user.GET("/profile", users.GetCurrentUserHandler)
		user.PUT("/profile", users.UpdateUserHandler)
		user.POST("/onboarding", users.CompleteOnboarding) // New Onboarding Endpoint
		user.GET("/solar-profile", users.GetSolarProfileHandler)
		user.PUT("/solar-profile", users.UpdateSolarProfileHandler)
		user.GET("/energy/current", energy.CurrentEnergy)
		user.GET("/energy/financials", energy.GetFinancialStatsHandler)
		user.POST("/energy/predict", energy.GetSolarPrediction)
		user.GET("/energy/history", energy.GetEnergyHistoryHandler)
		user.GET("/energy/analytics", energy.GetEnergyAnalyticsHandler)
		// Device management for users
		user.GET("/devices", devices.GetDevicesHandler)
		user.POST("/devices", devices.CreateUserDeviceHandler)
		user.GET("/devices/:id", devices.GetDeviceHandler)
		user.PUT("/devices/:id", devices.UpdateDeviceHandler)
		user.DELETE("/devices/:id", devices.DeleteDeviceHandler)
		user.POST("/devices/:id/regenerate-key", devices.RegenerateAPIKeyHandler)
		user.GET("/devices/:id/power", devices.GetDevicePowerHandler)
		// Notifications
		user.GET("/notifications", notifications.GetNotificationsHandler)
		user.GET("/notifications/unread-count", notifications.GetUnreadCountHandler)
		user.PUT("/notifications/:id/read", notifications.MarkAsReadHandler)
		user.PUT("/notifications/read-all", notifications.MarkAllAsReadHandler)
		user.DELETE("/notifications/:id", notifications.DeleteNotificationHandler)
		user.GET("/notification-preferences", notifications.GetPreferencesHandler)
		user.PUT("/notification-preferences", notifications.UpdatePreferencesHandler)
		// Reports
		user.GET("/reports/energy/export", reports.ExportEnergyDataHandler)
		// Weather
		user.GET("/weather", weather.GetWeatherHandler)
		// Tickets
		user.GET("/tickets", tickets.GetUserTicketsHandler)
		user.POST("/tickets", tickets.CreateTicketHandler)
	}

	// INSTALLER Routes
	installerGroup := r.Group("/installer")
	installerGroup.Use(middleware.AuthMiddleware(), middleware.RequireRole("INSTALLER", "SUPER_ADMIN"))
	{
		installerGroup.POST("/devices", devices.CreateDeviceHandler)
		installerGroup.GET("/jobs", installerPkg.GetAvailableJobsHandler)
		installerGroup.POST("/jobs/:id/complete", installerPkg.CompleteInstallationHandler)
		// Tickets
		installerGroup.GET("/tickets", tickets.GetInstallerTicketsHandler)
		installerGroup.PUT("/tickets/:id/status", tickets.UpdateTicketStatusHandler)
	}

	// SUPER_ADMIN Routes
	superAdmin := r.Group("/superadmin")
	superAdmin.Use(middleware.AuthMiddleware(), middleware.RequireRole("SUPER_ADMIN"))
	{
		superAdmin.GET("/admins", users.GetAdminsHandler)
		superAdmin.GET("/installers", users.GetInstallersHandler)
		superAdmin.POST("/admins", users.CreateUserHandler)
		superAdmin.GET("/admins/:id", users.GetUserHandler)
		superAdmin.PUT("/admins/:id", users.UpdateUserHandler)
		superAdmin.DELETE("/admins/:id", users.DeleteUserHandler)
		superAdmin.GET("/users", users.GetUsersHandler) // all users
		superAdmin.GET("/global/stats", users.GetGlobalStatsHandler)
		superAdmin.GET("/stats/regional", users.GetRegionalStatsHandler)
		superAdmin.GET("/hierarchy", users.GetSystemHierarchyHandler)

		// SuperAdmin Device Management - View ALL devices across all users
		superAdmin.GET("/devices", devices.GetAllDevicesHandler)
		superAdmin.GET("/devices/:id", devices.GetDeviceHandler)
		superAdmin.GET("/devices/:id/power", devices.GetDevicePowerHandler)

		// SuperAdmin Energy Analytics - View ALL energy data
		superAdmin.GET("/energy/analytics", energy.GetEnergyAnalyticsHandler)
		superAdmin.GET("/energy/history", energy.GetEnergyHistoryHandler)
		superAdmin.GET("/energy/current", energy.CurrentEnergy)
		superAdmin.GET("/energy/trend", energy.GetGlobalEnergyTrendHandler)

		// Regions routes
		superAdmin.GET("/regions", regions.GetRegionsHandler)
		superAdmin.POST("/regions", regions.CreateRegionHandler)
		superAdmin.PUT("/regions/:id", regions.UpdateRegionHandler)
		superAdmin.DELETE("/regions/:id", regions.DeleteRegionHandler)
		superAdmin.GET("/test-regions", func(c *gin.Context) { c.JSON(200, gin.H{"message": "test regions works"}) })
		superAdmin.GET("/test", func(c *gin.Context) { c.JSON(200, gin.H{"message": "test route works"}) })

		// Plants routes
		superAdmin.GET("/plants", plants.GetPlantsHandler)
		superAdmin.POST("/plants", plants.CreatePlantHandler)
		superAdmin.GET("/plants/:id", plants.GetPlantHandler)
		superAdmin.PUT("/plants/:id", plants.UpdatePlantHandler)
		superAdmin.DELETE("/plants/:id", plants.DeletePlantHandler)

		// Reports
		superAdmin.GET("/reports/users/export", reports.ExportUsersHandler)
		superAdmin.GET("/reports/plants/export", reports.ExportPlantsHandler)
	}

	// ADMIN Routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "SUPER_ADMIN"))
	{
		admin.GET("/users", users.GetUsersHandler)
		admin.GET("/installers", users.GetInstallersHandler)
		admin.POST("/users", users.CreateUserHandler)
		admin.GET("/users/:id", users.GetUserHandler)
		admin.PUT("/users/:id", users.UpdateUserHandler)
		admin.DELETE("/users/:id", users.DeleteUserHandler)
		admin.GET("/analytics", users.GetAdminStatsHandler)

		// Device management for admins
		admin.GET("/devices", devices.GetAllDevicesHandler)
		admin.GET("/devices/:id", devices.GetDeviceHandler)
		admin.GET("/devices/:id/power", devices.GetDevicePowerHandler)
		admin.PUT("/devices/:id", devices.UpdateDeviceHandler)
		admin.DELETE("/devices/:id", devices.DeleteDeviceHandler)
	}

	// GOVERNMENT Routes
	govtGroup := r.Group("/govt")
	govtGroup.Use(middleware.AuthMiddleware(), middleware.RequireRole("GOVT", "SUPER_ADMIN"))
	{
		govtGroup.GET("/dashboard/stats", govt.GetDashboardStatsHandler)
		govtGroup.GET("/subsidies/pending", govt.GetPendingSubsidiesHandler)
		govtGroup.GET("/subsidies/history", govt.GetSubsidyHistoryHandler)
		govtGroup.PUT("/subsidies/:id/status", govt.UpdateSubsidyStatusHandler)
		govtGroup.GET("/subsidy/reports", func(c *gin.Context) { c.JSON(200, gin.H{"message": "Regional Reports Placeholder"}) })
	}

	log.Println("Server starting on :8080 with regions support")
	r.Run(":8080")
}
