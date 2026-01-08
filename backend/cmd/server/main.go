package main

import (
	"log"
	"sems-backend/internal/auth"
	"sems-backend/internal/database"
	"sems-backend/internal/devices"
	"sems-backend/internal/energy"
	"sems-backend/internal/middleware"
	"sems-backend/internal/plants"
	"sems-backend/internal/users"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

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

	// Seed endpoint to create initial super admin (for testing)
	r.POST("/seed/superadmin", func(c *gin.Context) {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		_, err := users.CreateUser("Super", "Admin", "admin@solar.com", string(hashedPassword), "SUPER_ADMIN", "", "", "", "", "", "", "", "", 0, 0, "")
		if err != nil {
			c.JSON(500, gin.H{"error": "Failed to create super admin", "details": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Super admin created successfully", "email": "admin@solar.com", "password": "admin123"})
	})

	// Public auth routes
	r.POST("/auth/register", auth.Register)
	r.POST("/auth/login", auth.Login)

	// IoT data ingestion (public, authenticated by API key)
	r.POST("/iot/data", energy.IngestData)

	// USER Routes (USER, ADMIN can access)
	user := r.Group("/user")
	user.Use(middleware.AuthMiddleware(), middleware.RequireRole("USER", "ADMIN", "SUPER_ADMIN"))
	{
		user.GET("/profile", users.GetCurrentUserHandler)
		user.PUT("/profile", users.UpdateUserHandler)
		user.GET("/solar-profile", users.GetSolarProfileHandler)
		user.PUT("/solar-profile", users.UpdateSolarProfileHandler)
		user.GET("/energy/current", energy.CurrentEnergy)
		user.POST("/energy/predict", energy.GetSolarPrediction)
		user.GET("/energy/history", energy.GetEnergyHistoryHandler)
		user.GET("/energy/analytics", energy.GetEnergyAnalyticsHandler)
		// Device management for users
		user.GET("/devices", devices.GetDevicesHandler)
		user.GET("/devices/:id", devices.GetDeviceHandler)
		user.PUT("/devices/:id", devices.UpdateDeviceHandler)
		user.DELETE("/devices/:id", devices.DeleteDeviceHandler)
		user.POST("/devices/:id/regenerate-key", devices.RegenerateAPIKeyHandler)
	}

	// INSTALLER Routes
	installer := r.Group("/installer")
	installer.Use(middleware.AuthMiddleware(), middleware.RequireRole("INSTALLER"))
	{
		installer.POST("/devices", devices.CreateDeviceHandler)
	}

	// ADMIN Routes
	admin := r.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.RequireRole("ADMIN", "SUPER_ADMIN"))
	{
		admin.GET("/users", users.GetUsersHandler)
		admin.POST("/users", users.CreateUserHandler)
		admin.GET("/users/:id", users.GetUserHandler)
		admin.PUT("/users/:id", users.UpdateUserHandler)
		admin.DELETE("/users/:id", users.DeleteUserHandler)
		admin.GET("/analytics", func(c *gin.Context) { c.JSON(200, gin.H{"message": "System analytics"}) })
		
		// Device management for admins
		admin.GET("/devices", devices.GetAllDevicesHandler)
		admin.GET("/devices/:id", devices.GetDeviceHandler)
		admin.PUT("/devices/:id", devices.UpdateDeviceHandler)
		admin.DELETE("/devices/:id", devices.DeleteDeviceHandler)
	}

	// SUPER_ADMIN Routes
	superAdmin := r.Group("/superadmin")
	superAdmin.Use(middleware.AuthMiddleware(), middleware.RequireRole("SUPER_ADMIN"))
	{
		superAdmin.GET("/admins", users.GetAdminsHandler)
		superAdmin.POST("/admins", users.CreateUserHandler)
		superAdmin.GET("/admins/:id", users.GetUserHandler)
		superAdmin.PUT("/admins/:id", users.UpdateUserHandler)
		superAdmin.DELETE("/admins/:id", users.DeleteUserHandler)
		superAdmin.GET("/users", users.GetUsersHandler) // all users
		superAdmin.GET("/global/stats", users.GetGlobalStatsHandler)
		
		// Plants routes
		superAdmin.GET("/plants", plants.GetPlantsHandler)
		superAdmin.POST("/plants", plants.CreatePlantHandler)
		superAdmin.GET("/plants/:id", plants.GetPlantHandler)
		superAdmin.PUT("/plants/:id", plants.UpdatePlantHandler)
		superAdmin.DELETE("/plants/:id", plants.DeletePlantHandler)
	}

	// GOVERNMENT Routes
	govt := r.Group("/govt")
	govt.Use(middleware.AuthMiddleware(), middleware.RequireRole("GOVT"))
	{
		govt.GET("/subsidy/reports", func(c *gin.Context) { c.JSON(200, gin.H{"message": "Subsidy reports"}) })
	}

	log.Println("Server starting on :8080")
	r.Run(":8080")
}

