package weather

import (
	"testing"
)

func TestGetWeather(t *testing.T) {
	// Test with default coordinates (mock data)
	w, err := GetWeather(28.6139, 77.2090)
	if err != nil {
		t.Fatalf("Failed to get weather: %v", err)
	}

	if w.Current.Condition == "" {
		t.Error("Current weather condition should not be empty")
	}

	if w.Current.Temperature == 0 && w.Current.Condition != "Clear" {
		t.Log("Warning: Temperature is 0, which might be valid but unusual for mock data")
	}

	if len(w.Forecast) == 0 {
		t.Error("Forecast should not be empty")
	}

	// Verify forecast length (should be around 40 items for OWM 5-day/3-hour)
	// In our mock, we generate 8 items
	if len(w.Forecast) < 5 {
		t.Errorf("Forecast too short: got %d items", len(w.Forecast))
	}
}

func TestMockWeather(t *testing.T) {
	w := getMockWeather(0, 0)

	if w.Current.Location != "Mock City" {
		t.Errorf("Expected 'Mock City', got %s", w.Current.Location)
	}

	foundPredictionDay := false
	for _, item := range w.Forecast {
		if item.Condition != "" {
			foundPredictionDay = true
			break
		}
	}

	if !foundPredictionDay {
		t.Error("Mock forecast items should have conditions")
	}
}
