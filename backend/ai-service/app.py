from flask import Flask, jsonify, request
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler
import joblib
import os
from datetime import datetime, timedelta

# LSTM imports - will be loaded lazily to avoid errors if tensorflow is not installed
lstm_available = False
try:
    from tensorflow.keras.models import Sequential, load_model
    from tensorflow.keras.layers import LSTM, Dense
    lstm_available = True
except ImportError:
    print("TensorFlow not installed, LSTM model will not be available")

app = Flask(__name__)

# Simple ML model for solar energy prediction
class SolarPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.lstm_model = None
        self.lstm_scaler = None
        self.is_trained = False
        self.lstm_trained = False
        
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
        print("Random Forest model trained and saved")

    def train_lstm_model(self, sequence_length=24):
        """Train LSTM model for time-series prediction"""
        if not lstm_available:
            print("TensorFlow not available, skipping LSTM training")
            return
            
        # Generate sample time-series data
        np.random.seed(42)
        dates = pd.date_range('2024-01-01', periods=8760, freq='H')  # Full year of hourly data
        hours = np.arange(len(dates))
        
        # Simulate solar power based on hour of day and day of year
        power_data = []
        for i, hour in enumerate(hours):
            day_of_year = (i // 24) + 1
            hour_of_day = i % 24
            
            # Skip night hours (no solar generation)
            if hour_of_day < 6 or hour_of_day > 18:
                power_data.append(0)
            else:
                # Bell curve for solar intensity during daylight hours
                peak_hour = 12
                std_dev = 3
                intensity = np.exp(-np.pow(hour_of_day - peak_hour, 2) / (2 * np.pow(std_dev, 2)))
                
                # Seasonal variation
                seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 0.3 + 0.7
                
                # Random weather variation
                weather_factor = np.random.uniform(0.7, 1.0)
                
                power = 5000 * intensity * seasonal_factor * weather_factor  # 5kW system
                power_data.append(power)
        
        power_data = np.array(power_data)
        
        # Scale data
        self.lstm_scaler = MinMaxScaler()
        scaled_data = self.lstm_scaler.fit_transform(power_data.reshape(-1, 1)).flatten()
        
        # Create sequences for LSTM
        X, y = [], []
        for i in range(len(scaled_data) - sequence_length):
            X.append(scaled_data[i:i+sequence_length])
            y.append(scaled_data[i+sequence_length])
        
        X, y = np.array(X), np.array(y)
        X = X.reshape((X.shape[0], X.shape[1], 1))
        
        # Train LSTM model
        self.lstm_model = Sequential([
            LSTM(64, input_shape=(sequence_length, 1)),
            Dense(1)
        ])
        
        self.lstm_model.compile(optimizer='adam', loss='mse')
        self.lstm_model.fit(X, y, epochs=10, batch_size=32, verbose=1)
        
        # Save model
        self.lstm_model.save('solar_lstm_model.h5')
        joblib.dump(self.lstm_scaler, 'lstm_scaler.pkl')
        
        self.lstm_trained = True
        print("LSTM model trained and saved")

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

    def predict_lstm(self, recent_power_values=None, sequence_length=24):
        """Predict next hour power using LSTM model"""
        if not lstm_available:
            return None, "LSTM not available"
            
        if not self.lstm_trained:
            try:
                self.lstm_model = load_model('solar_lstm_model.h5')
                self.lstm_scaler = joblib.load('lstm_scaler.pkl')
                self.lstm_trained = True
            except:
                print("LSTM model not found, training new model...")
                self.train_lstm_model()
                self.lstm_model = load_model('solar_lstm_model.h5')
                self.lstm_scaler = joblib.load('lstm_scaler.pkl')
                self.lstm_trained = True
        
        # Use recent values or generate sample
        if recent_power_values is None or len(recent_power_values) < sequence_length:
            # Generate sample recent values
            recent_power_values = np.random.rand(sequence_length) * 5000
        
        # Scale input
        scaled_input = self.lstm_scaler.transform(recent_power_values.reshape(-1, 1))
        
        # Reshape for LSTM [samples, time steps, features]
        X_input = scaled_input.reshape(1, sequence_length, 1)
        
        # Predict
        prediction_scaled = self.lstm_model.predict(X_input, verbose=0)
        
        # Inverse scale
        prediction = self.lstm_scaler.inverse_transform(prediction_scaled)[0][0]
        
        return max(0, prediction), None

    def load_model(self):
        """Load trained model from disk"""
        try:
            self.model = joblib.load('solar_model.pkl')
            self.scaler = joblib.load('scaler.pkl')
            self.is_trained = True
        except:
            print("Model not found, training new model...")
            self.train_model()
    
    def load_lstm_model(self):
        """Load LSTM model from disk"""
        if not lstm_available:
            return False
            
        try:
            self.lstm_model = load_model('solar_lstm_model.h5')
            self.lstm_scaler = joblib.load('lstm_scaler.pkl')
            self.lstm_trained = True
            return True
        except:
            return False

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

@app.route("/ai/predict/lstm", methods=['GET', 'POST'])
def predict_lstm():
    """LSTM-based prediction endpoint"""
    try:
        # Get recent power values from request if provided
        recent_power = None
        if request.method == 'POST' and request.is_json:
            data = request.get_json()
            if 'power_values' in data:
                recent_power = np.array(data['power_values'])
        
        if not lstm_available:
            return jsonify({
                "success": False,
                "error": "LSTM not available (TensorFlow not installed)",
                "fallback_prediction_kw": 4.2
            }), 500
        
        prediction, error = predictor.predict_lstm(recent_power)
        
        if error:
            return jsonify({
                "success": False,
                "error": error,
                "fallback_prediction_kw": 4.2
            }), 500
        
        return jsonify({
            "success": True,
            "predicted_power_watts": round(prediction, 2),
            "predicted_power_kw": round(prediction / 1000, 2),
            "timestamp": datetime.now().isoformat(),
            "model_type": "LSTM"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "fallback_prediction_kw": 4.2
        }), 500

@app.route("/ai/train/lstm", methods=['POST'])
def train_lstm():
    """Train LSTM model endpoint"""
    try:
        if not lstm_available:
            return jsonify({
                "success": False,
                "error": "TensorFlow not installed"
            }), 500
        
        predictor.train_lstm_model()
        
        return jsonify({
            "success": True,
            "message": "LSTM model trained successfully",
            "timestamp": datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/ai/health")
def health():
    return jsonify({
        "status": "AI service running",
        "model_trained": predictor.is_trained,
        "lstm_available": lstm_available,
        "lstm_trained": predictor.lstm_trained
    })

if __name__ == "__main__":
    # Train Random Forest model on startup if not exists
    if not os.path.exists('solar_model.pkl'):
        print("Training initial Random Forest model...")
        predictor.train_model()
    
    # Load LSTM model if available
    if lstm_available:
        predictor.load_lstm_model()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
