package inventory

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	Repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{Repo: repo}
}

// @Summary Create inventory item
// @Description Create a new item in the inventory (Admin only)
// @Tags Inventory
// @Accept json
// @Produce json
// @Param item body InventoryItem true "Inventory Item"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /inventory [post]
func (h *Handler) CreateItem(c *gin.Context) {
	var item InventoryItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input format"})
		return
	}

	if err := h.Repo.CreateItem(c.Request.Context(), &item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Item created successfully",
		"item":    item,
	})
}

// @Summary Get all inventory items
// @Description Get a list of all inventory items
// @Tags Inventory
// @Accept json
// @Produce json
// @Success 200 {object} map[string][]InventoryItem
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /inventory [get]
func (h *Handler) GetAllItems(c *gin.Context) {
	items, err := h.Repo.GetAllItems(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch items"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"items": items})
}

// @Summary Get inventory item
// @Description Get details of a specific inventory item
// @Tags Inventory
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Success 200 {object} InventoryItem
// @Failure 404 {object} map[string]string
// @Security BearerAuth
// @Router /inventory/{id} [get]
func (h *Handler) GetItem(c *gin.Context) {
	id := c.Param("id")
	item, err := h.Repo.GetItemByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}

	c.JSON(http.StatusOK, item)
}

// @Summary Update inventory item
// @Description Update an inventory item (Admin only)
// @Tags Inventory
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Param item body InventoryItem true "Item update data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /inventory/{id} [put]
func (h *Handler) UpdateItem(c *gin.Context) {
	id := c.Param("id")
	var item InventoryItem
	if err := c.ShouldBindJSON(&item); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	item.ID = id

	if err := h.Repo.UpdateItem(c.Request.Context(), &item); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item updated successfully"})
}

// @Summary Delete inventory item
// @Description Delete an inventory item (Admin only)
// @Tags Inventory
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Success 200 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security BearerAuth
// @Router /inventory/{id} [delete]
func (h *Handler) DeleteItem(c *gin.Context) {
	id := c.Param("id")
	if err := h.Repo.DeleteItem(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted successfully"})
}
