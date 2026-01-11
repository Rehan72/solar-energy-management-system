package weather

import "time"

type WeatherData struct {
	Temperature float64   `json:"temperature"`
	FeelsLike   float64   `json:"feels_like"`
	MinTemp     float64   `json:"min_temp"`
	MaxTemp     float64   `json:"max_temp"`
	Pressure    int       `json:"pressure"`
	Humidity    int       `json:"humidity"`
	CloudCover  int       `json:"cloud_cover"`
	WindSpeed   float64   `json:"wind_speed"`
	Condition   string    `json:"condition"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Timestamp   time.Time `json:"timestamp"`
	Location    string    `json:"location"`
}

type ForecastItem struct {
	Timestamp   time.Time `json:"timestamp"`
	Temperature float64   `json:"temperature"`
	Condition   string    `json:"condition"`
	Icon        string    `json:"icon"`
	CloudCover  int       `json:"cloud_cover"`
}

type WeatherResponse struct {
	Current  WeatherData    `json:"current"`
	Forecast []ForecastItem `json:"forecast"`
}

// OpenWeatherMap API structures
type OWMCurrentResponse struct {
	Main struct {
		Temp      float64 `json:"temp"`
		FeelsLike float64 `json:"feels_like"`
		TempMin   float64 `json:"temp_min"`
		TempMax   float64 `json:"temp_max"`
		Pressure  int     `json:"pressure"`
		Humidity  int     `json:"humidity"`
	} `json:"main"`
	Weather []struct {
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Clouds struct {
		All int `json:"all"`
	} `json:"clouds"`
	Wind struct {
		Speed float64 `json:"speed"`
	} `json:"wind"`
	Name string `json:"name"`
	Dt   int64  `json:"dt"`
}

type OWMForecastResponse struct {
	List []struct {
		Dt   int64 `json:"dt"`
		Main struct {
			Temp float64 `json:"temp"`
		} `json:"main"`
		Weather []struct {
			Main string `json:"main"`
			Icon string `json:"icon"`
		} `json:"weather"`
		Clouds struct {
			All int `json:"all"`
		} `json:"clouds"`
	} `json:"list"`
}
