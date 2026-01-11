package reports

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"sems-backend/internal/energy"
	"sems-backend/internal/plants"
	"sems-backend/internal/users"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

// ExportUsersHandler handles exporting user data to Excel or CSV
func ExportUsersHandler(c *gin.Context) {
	format := c.DefaultQuery("format", "excel")

	usersList, err := users.GetAllUsersIncludingAdmins()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users", "details": err.Error()})
		return
	}

	if format == "csv" {
		exportUsersCSV(c, usersList)
	} else {
		exportUsersExcel(c, usersList)
	}
}

func exportUsersCSV(c *gin.Context, usersList []*users.User) {
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=users_report.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	// Header
	writer.Write([]string{"ID", "First Name", "Last Name", "Email", "Role", "Phone", "Region", "Active", "Created At"})

	for _, u := range usersList {
		writer.Write([]string{
			u.ID,
			u.FirstName,
			u.LastName,
			u.Email,
			u.Role,
			u.Phone,
			u.Region,
			strconv.FormatBool(u.IsActive),
			u.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
}

func exportUsersExcel(c *gin.Context, usersList []*users.User) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Users"
	f.SetSheetName("Sheet1", sheet)

	// Header
	headers := []string{"ID", "First Name", "Last Name", "Email", "Role", "Phone", "Region", "Active", "Created At"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, u := range usersList {
		rowIdx := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", rowIdx), u.ID)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", rowIdx), u.FirstName)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", rowIdx), u.LastName)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", rowIdx), u.Email)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", rowIdx), u.Role)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", rowIdx), u.Phone)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", rowIdx), u.Region)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", rowIdx), u.IsActive)
		f.SetCellValue(sheet, fmt.Sprintf("I%d", rowIdx), u.CreatedAt.Format("2006-01-02 15:04:05"))
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=users_report.xlsx")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel", "details": err.Error()})
	}
}

// ExportPlantsHandler handles exporting plant data
func ExportPlantsHandler(c *gin.Context) {
	format := c.DefaultQuery("format", "excel")

	plantsList, err := plants.GetAllPlants()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch plants", "details": err.Error()})
		return
	}

	if format == "csv" {
		exportPlantsCSV(c, plantsList)
	} else {
		exportPlantsExcel(c, plantsList)
	}
}

func exportPlantsCSV(c *gin.Context, plantsList []plants.Plant) {
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=plants_report.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	writer.Write([]string{"ID", "Name", "Location", "Region", "Capacity (kW)", "Current Output (kW)", "Efficiency (%)", "Status"})

	for _, p := range plantsList {
		writer.Write([]string{
			p.ID.String(),
			p.Name,
			p.Location,
			p.Region,
			strconv.FormatFloat(p.CapacityKW, 'f', 2, 64),
			strconv.FormatFloat(p.CurrentOutputKW, 'f', 2, 64),
			strconv.FormatFloat(p.Efficiency, 'f', 2, 64),
			p.Status,
		})
	}
}

func exportPlantsExcel(c *gin.Context, plantsList []plants.Plant) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Plants"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"ID", "Name", "Location", "Region", "Capacity (kW)", "Current Output (kW)", "Efficiency (%)", "Status"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, p := range plantsList {
		rowIdx := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", rowIdx), p.ID.String())
		f.SetCellValue(sheet, fmt.Sprintf("B%d", rowIdx), p.Name)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", rowIdx), p.Location)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", rowIdx), p.Region)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", rowIdx), p.CapacityKW)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", rowIdx), p.CurrentOutputKW)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", rowIdx), p.Efficiency)
		f.SetCellValue(sheet, fmt.Sprintf("H%d", rowIdx), p.Status)
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=plants_report.xlsx")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel", "details": err.Error()})
	}
}

// ExportEnergyDataHandler handles exporting energy data
func ExportEnergyDataHandler(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID, _ := uuid.Parse(userIDStr.(string))
	format := c.DefaultQuery("format", "excel")

	days := 30
	if d, err := strconv.Atoi(c.Query("days")); err == nil {
		days = d
	}

	history, err := energy.GetEnergyHistory(userID, days, "")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch energy history", "details": err.Error()})
		return
	}

	if format == "csv" {
		exportEnergyCSV(c, history)
	} else {
		exportEnergyExcel(c, history)
	}
}

func exportEnergyCSV(c *gin.Context, history []*energy.EnergyData) {
	c.Header("Content-Type", "text/csv")
	c.Header("Content-Disposition", "attachment; filename=energy_report.csv")

	writer := csv.NewWriter(c.Writer)
	defer writer.Flush()

	writer.Write([]string{"Timestamp", "Solar Power (kW)", "Load Power (kW)", "Grid Power (kW)", "Battery (%)", "Temp (C)", "Humidity (%)"})

	for _, d := range history {
		writer.Write([]string{
			d.Timestamp.Format("2006-01-02 15:04:05"),
			strconv.FormatFloat(d.SolarPower, 'f', 2, 64),
			strconv.FormatFloat(d.LoadPower, 'f', 2, 64),
			strconv.FormatFloat(d.GridPower, 'f', 2, 64),
			strconv.FormatFloat(d.BatteryLevel, 'f', 2, 64),
			strconv.FormatFloat(d.Temperature, 'f', 2, 64),
			strconv.FormatFloat(d.Humidity, 'f', 2, 64),
		})
	}
}

func exportEnergyExcel(c *gin.Context, history []*energy.EnergyData) {
	f := excelize.NewFile()
	defer f.Close()

	sheet := "Energy"
	f.SetSheetName("Sheet1", sheet)

	headers := []string{"Timestamp", "Solar Power (kW)", "Load Power (kW)", "Grid Power (kW)", "Battery (%)", "Temp (C)", "Humidity (%)"}
	for i, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	for i, d := range history {
		rowIdx := i + 2
		f.SetCellValue(sheet, fmt.Sprintf("A%d", rowIdx), d.Timestamp.Format("2006-01-02 15:04:05"))
		f.SetCellValue(sheet, fmt.Sprintf("B%d", rowIdx), d.SolarPower)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", rowIdx), d.LoadPower)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", rowIdx), d.GridPower)
		f.SetCellValue(sheet, fmt.Sprintf("E%d", rowIdx), d.BatteryLevel)
		f.SetCellValue(sheet, fmt.Sprintf("F%d", rowIdx), d.Temperature)
		f.SetCellValue(sheet, fmt.Sprintf("G%d", rowIdx), d.Humidity)
	}

	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=energy_report.xlsx")

	if err := f.Write(c.Writer); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate Excel", "details": err.Error()})
	}
}
