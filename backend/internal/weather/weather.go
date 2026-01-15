package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	apiKey  = os.Getenv("OPENWEATHER_API_KEY")
	baseURL = "https://api.openweathermap.org/data/2.5"
)

func GetWeather(lat, lon float64) (*WeatherResponse, error) {
	if apiKey == "" {
		return getMockWeather(lat, lon), nil
	}

	current, err := fetchCurrentWeather(lat, lon)
	if err != nil {
		return nil, err
	}

	forecast, err := fetchForecast(lat, lon)
	if err != nil {
		// Log error but return current weather anyway
		fmt.Printf("Error fetching forecast: %v\n", err)
		return &WeatherResponse{Current: *current, Forecast: []ForecastItem{}}, nil
	}

	return &WeatherResponse{
		Current:  *current,
		Forecast: forecast,
	}, nil
}

func fetchCurrentWeather(lat, lon float64) (*WeatherData, error) {
	url := fmt.Sprintf("%s/weather?lat=%f&lon=%f&appid=%s&units=metric", baseURL, lat, lon, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("weather API returned status: %d", resp.StatusCode)
	}

	var owmResp OWMCurrentResponse
	if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
		return nil, err
	}

	data := &WeatherData{
		Temperature: owmResp.Main.Temp,
		FeelsLike:   owmResp.Main.FeelsLike,
		MinTemp:     owmResp.Main.TempMin,
		MaxTemp:     owmResp.Main.TempMax,
		Pressure:    owmResp.Main.Pressure,
		Humidity:    owmResp.Main.Humidity,
		CloudCover:  owmResp.Clouds.All,
		WindSpeed:   owmResp.Wind.Speed,
		Condition:   owmResp.Weather[0].Main,
		Description: owmResp.Weather[0].Description,
		Icon:        owmResp.Weather[0].Icon,
		Timestamp:   time.Unix(owmResp.Dt, 0),
		Location:    owmResp.Name,
	}

	return data, nil
}

func fetchForecast(lat, lon float64) ([]ForecastItem, error) {
	url := fmt.Sprintf("%s/forecast?lat=%f&lon=%f&appid=%s&units=metric", baseURL, lat, lon, apiKey)
	resp, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("forecast API returned status: %d", resp.StatusCode)
	}

	var owmResp OWMForecastResponse
	if err := json.NewDecoder(resp.Body).Decode(&owmResp); err != nil {
		return nil, err
	}

	var items []ForecastItem
	for _, item := range owmResp.List {
		items = append(items, ForecastItem{
			Timestamp:   time.Unix(item.Dt, 0),
			Temperature: item.Main.Temp,
			Condition:   item.Weather[0].Main,
			Icon:        item.Weather[0].Icon,
			CloudCover:  item.Clouds.All,
		})
	}

	return items, nil
}

func getMockWeather(lat, lon float64) *WeatherResponse {
	now := time.Now()
	current := WeatherData{
		Temperature: 28.5,
		FeelsLike:   30.2,
		MinTemp:     25.0,
		MaxTemp:     32.0,
		Pressure:    1012,
		Humidity:    65,
		CloudCover:  20,
		WindSpeed:   12.5,
		Condition:   "Clear",
		Description: "sky is clear",
		Icon:        "01d",
		Timestamp:   now,
		Location:    "Mock City",
	}

	var forecast []ForecastItem
	for i := 1; i <= 5; i++ {
		forecast = append(forecast, ForecastItem{
			Timestamp:   now.Add(time.Duration(i*24) * time.Hour),
			Temperature: 28.0 + float64(i%3),
			Condition:   "Partly Cloudy",
			Icon:        "02d",
			CloudCover:  40,
		})
	}

	return &WeatherResponse{
		Current:  current,
		Forecast: forecast,
	}
}

// Handlers

// @Summary Get weather
// @Description Get current weather and forecast for a location
// @Tags Weather
// @Accept json
// @Produce json
// @Param lat query number false "Latitude"
// @Param lon query number false "Longitude"
// @Success 200 {object} WeatherResponse
// @Failure 500 {object} map[string]string
// @Router /weather [get]
func GetWeatherHandler(c *gin.Context) {
	// lat := parseFloat(c.Query("lat"))
	// lon := parseFloat(c.Query("lon"))

	// For demo purpose, we might want to get user's location if not provided
	// But let's stick to params for now

	var lat, lon float64
	fmt.Sscanf(c.Query("lat"), "%f", &lat)
	fmt.Sscanf(c.Query("lon"), "%f", &lon)

	if lat == 0 && lon == 0 {
		// Default to a location or return error
		// For now, let's use a mock location if none provided
		lat = 28.6139
		lon = 77.2090
	}

	weather, err := GetWeather(lat, lon)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, weather)
}
