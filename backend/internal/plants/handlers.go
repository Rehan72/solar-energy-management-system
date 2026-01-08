package plants

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type CreatePlantRequest struct {
	Name            string   `json:"name" binding:"required"`
	Location        string   `json:"location" binding:"required"`
	Region          string   `json:"region" binding:"required"`
	CapacityKW      float64  `json:"capacity_kw" binding:"required,gt=0"`
	CurrentOutputKW float64  `json:"current_output_kw"`
	Efficiency      float64  `json:"efficiency"`
	Latitude        *float64 `json:"latitude"`
	Longitude       *float64 `json:"longitude"`
	Status          string   `json:"status"`
	Description     string   `json:"description"`
}

type UpdatePlantRequest struct {
	Name            string   `json:"name"`
	Location        string   `json:"location"`
	Region          string   `json:"region"`
	CapacityKW      float64  `json:"capacity_kw"`
	CurrentOutputKW float64  `json:"current_output_kw"`
	Efficiency      float64  `json:"efficiency"`
	Latitude        *float64 `json:"latitude"`
	Longitude       *float64 `json:"longitude"`
	Status          string   `json:"status"`
	Description     string   `json:"description"`
}

func CreatePlantHandler(c *gin.Context) {
	var req CreatePlantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// Set defaults
	if req.Status == "" {
		req.Status = "ACTIVE"
	}
	if req.Efficiency == 0 {
		req.Efficiency = 85.0
	}

	plant := &Plant{
		ID:              uuid.New(),
		Name:            req.Name,
		Location:        req.Location,
		Region:          req.Region,
		CapacityKW:      req.CapacityKW,
		CurrentOutputKW: req.CurrentOutputKW,
		Efficiency:      req.Efficiency,
		Latitude:        req.Latitude,
		Longitude:       req.Longitude,
		Status:          req.Status,
		Description:     req.Description,
	}

	if err := CreatePlant(plant); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create plant", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Plant created successfully",
		"plant":   plant,
	})
}

func GetPlantsHandler(c *gin.Context) {
	plants, err := GetAllPlants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"plants": plants,
	})
}

func GetPlantHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
		return
	}

	plant, err := GetPlantByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant", "details": err.Error()})
		return
	}

	if plant == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"plant": plant,
	})
}

func UpdatePlantHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
		return
	}

	// Check if plant exists
	existing, err := GetPlantByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant", "details": err.Error()})
		return
	}
	if existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	var req UpdatePlantRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input", "details": err.Error()})
		return
	}

	// Update fields
	if req.Name != "" {
		existing.Name = req.Name
	}
	if req.Location != "" {
		existing.Location = req.Location
	}
	if req.Region != "" {
		existing.Region = req.Region
	}
	if req.CapacityKW > 0 {
		existing.CapacityKW = req.CapacityKW
	}
	existing.CurrentOutputKW = req.CurrentOutputKW
	if req.Efficiency > 0 {
		existing.Efficiency = req.Efficiency
	}
	if req.Latitude != nil {
		existing.Latitude = req.Latitude
	}
	if req.Longitude != nil {
		existing.Longitude = req.Longitude
	}
	if req.Status != "" {
		existing.Status = req.Status
	}
	existing.Description = req.Description

	if err := UpdatePlant(existing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update plant", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Plant updated successfully",
		"plant":   existing,
	})
}

func DeletePlantHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid plant ID"})
		return
	}

	// Check if plant exists
	existing, err := GetPlantByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plant", "details": err.Error()})
		return
	}
	if existing == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Plant not found"})
		return
	}

	if err := DeletePlant(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete plant", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Plant deleted successfully",
	})
}
