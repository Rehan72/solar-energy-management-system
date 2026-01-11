package energy

import (
	"bytes"
	"encoding/json"
	"net/http"
	"sems-backend/internal/users"
	"sems-backend/internal/weather"

	"github.com/gin-gonic/gin"
)

type AIPredictionRequest struct {
	CloudCover  float64 `json:"cloud_cover,omitempty"`
	Temperature float64 `json:"temperature,omitempty"`
}

type AIPredictionResponse struct {
	Success              bool    `json:"success"`
	TomorrowPredictionKw float64 `json:"tomorrow_prediction_kw"`
	Timestamp            string  `json:"timestamp"`
	ModelVersion         string  `json:"model_version"`
}

func GetSolarPrediction(c *gin.Context) {
	var req AIPredictionRequest
	if err := c.ShouldBindJSON(&req); err != nil && err.Error() != "EOF" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// If cloud cover and temperature not provided, fetch from weather service
	if req.CloudCover == 0 && req.Temperature == 0 {
		userID := c.GetString("user_id")
		user, err := users.GetUserByID(userID)
		if err == nil && user.Latitude != 0 && user.Longitude != 0 {
			w, err := weather.GetWeather(user.Latitude, user.Longitude)
			if err == nil {
				// Use tomorrow's forecast if available, otherwise current
				if len(w.Forecast) > 8 { // 8 * 3h = 24h
					// Use forecast for roughly 24 hours from now
					req.CloudCover = float64(w.Forecast[8].CloudCover) / 100.0
					req.Temperature = w.Forecast[8].Temperature
				} else if len(w.Forecast) > 0 {
					req.CloudCover = float64(w.Forecast[0].CloudCover) / 100.0
					req.Temperature = w.Forecast[0].Temperature
				} else {
					req.CloudCover = float64(w.Current.CloudCover) / 100.0
					req.Temperature = w.Current.Temperature
				}
			}
		}
	}

	// Call AI service
	aiResponse, err := callAIService(req)
	if err != nil {
		// Fallback prediction
		c.JSON(http.StatusOK, gin.H{
			"prediction_kw": 4.2,
			"fallback":      true,
			"error":         err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, aiResponse)
}

func callAIService(req AIPredictionRequest) (*AIPredictionResponse, error) {
	aiServiceURL := "http://localhost:5000/ai/predict/solar"

	// Prepare request body if weather data provided
	var requestBody *bytes.Buffer
	if req.CloudCover != 0 || req.Temperature != 0 {
		jsonData, _ := json.Marshal(req)
		requestBody = bytes.NewBuffer(jsonData)
	}

	// Make HTTP request to AI service
	var resp *http.Response
	var err error

	if requestBody != nil {
		resp, err = http.Post(aiServiceURL, "application/json", requestBody)
	} else {
		resp, err = http.Get(aiServiceURL)
	}

	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse response
	var aiResp AIPredictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
		return nil, err
	}

	if !aiResp.Success {
		return nil, http.ErrNotSupported // Use as generic error
	}

	return &aiResp, nil
}
