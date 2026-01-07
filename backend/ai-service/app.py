from flask import Flask, jsonify, request
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os
from datetime import datetime, timedelta

app = Flask(__name__)

# Simple ML model for solar energy prediction
class SolarPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_trained = False

    def generate_sample_data(self):
        """Generate sample historical solar data for training"""
        np.random.seed(42)
        dates = pd.date_range('2023-01-01', '2024-12-31', freq='D')
        n_days = len(dates)

        # Simulate solar generation based on season, weather factors
        solar_data = []
        for i, date in enumerate(dates):
            month = date.month
            day_of_year = date.dayofyear

            # Seasonal variation (more sun in summer)
            seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 0.5 + 0.5

            # Weather factors (simplified)
            cloud_cover = np.random.uniform(0, 1)
            temperature = 20 + 10 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 5)

            # Solar generation (kW)
            base_generation = 5.0 * seasonal_factor
            weather_penalty = (1 - cloud_cover) * (1 if 15 <= temperature <= 35 else 0.7)
            generation = base_generation * weather_penalty * np.random.uniform(0.8, 1.2)

            solar_data.append({
                'date': date,
                'month': month,
                'day_of_year': day_of_year,
                'seasonal_factor': seasonal_factor,
                'cloud_cover': cloud_cover,
                'temperature': temperature,
                'solar_generation': max(0, generation)
            })

        return pd.DataFrame(solar_data)

    def train_model(self):
        """Train the ML model"""
        df = self.generate_sample_data()

        # Features for prediction
        features = ['month', 'day_of_year', 'seasonal_factor', 'cloud_cover', 'temperature']
        X = df[features]
        y = df['solar_generation']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)

        # Train Random Forest model
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)

        # Save model
        joblib.dump(self.model, 'solar_model.pkl')
        joblib.dump(self.scaler, 'scaler.pkl')

        self.is_trained = True
        print("Model trained and saved")

    def predict_solar(self, date=None, weather_data=None):
        """Predict solar generation for a given date"""
        if not self.is_trained:
            self.load_model()

        if date is None:
            date = datetime.now() + timedelta(days=1)  # Tomorrow

        # Extract features from date
        month = date.month
        day_of_year = date.dayofyear
        seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 0.5 + 0.5

        # Default weather data if not provided
        if weather_data is None:
            weather_data = {
                'cloud_cover': np.random.uniform(0, 1),
                'temperature': 20 + 10 * np.sin(2 * np.pi * day_of_year / 365) + np.random.normal(0, 5)
            }

        features = np.array([[
            month,
            day_of_year,
            seasonal_factor,
            weather_data['cloud_cover'],
            weather_data['temperature']
        ]])

        # Scale features
        features_scaled = self.scaler.transform(features)

        # Make prediction
        prediction = self.model.predict(features_scaled)[0]

        return max(0, prediction)

    def load_model(self):
        """Load trained model from disk"""
        try:
            self.model = joblib.load('solar_model.pkl')
            self.scaler = joblib.load('scaler.pkl')
            self.is_trained = True
        except:
            print("Model not found, training new model...")
            self.train_model()

# Initialize predictor
predictor = SolarPredictor()

@app.route("/ai/predict/solar", methods=['GET', 'POST'])
def predict_solar():
    try:
        # Get weather data from request if provided
        weather_data = None
        if request.method == 'POST' and request.is_json:
            data = request.get_json()
            if 'cloud_cover' in data and 'temperature' in data:
                weather_data = {
                    'cloud_cover': float(data['cloud_cover']),
                    'temperature': float(data['temperature'])
                }

        prediction = predictor.predict_solar(weather_data=weather_data)

        return jsonify({
            "success": True,
            "tomorrow_prediction_kw": round(prediction, 2),
            "timestamp": datetime.now().isoformat(),
            "model_version": "1.0"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "fallback_prediction_kw": 4.2
        }), 500

@app.route("/ai/health")
def health():
    return jsonify({
        "status": "AI service running",
        "model_trained": predictor.is_trained
    })

if __name__ == "__main__":
    # Train model on startup if not exists
    if not os.path.exists('solar_model.pkl'):
        print("Training initial model...")
        predictor.train_model()

    app.run(host='0.0.0.0', port=5000, debug=True)