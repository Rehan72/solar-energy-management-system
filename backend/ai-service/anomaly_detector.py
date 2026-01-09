"""
AI Anomaly Detection Model for Solar Energy System
Uses Autoencoder to detect abnormal solar behavior:
- Sudden power drop
- Zero voltage
- Unexpected spikes
- Degraded efficiency
"""

import numpy as np
import pandas as pd
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.layers import Input, Dense
from sklearn.preprocessing import MinMaxScaler
import joblib
import os

ANOMALY_THRESHOLD = 0.08
MODEL_PATH = 'anomaly_model.h5'
SCALER_PATH = 'anomaly_scaler.pkl'

class AnomalyDetector:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_trained = False
        
    def load_data_from_db(self, db_config=None):
        """
        Load solar power data from database for training
        For SQLite, use pandas read_sql_query
        For PostgreSQL, use psycopg2
        """
        if db_config is None:
            # Generate sample data for demo
            return self.generate_sample_data()
        
        try:
            # Try PostgreSQL connection
            import psycopg2
            conn = psycopg2.connect(**db_config)
            df = pd.read_sql("""
                SELECT power FROM energy_data
                WHERE power > 0
                ORDER BY timestamp
            """, conn)
            conn.close()
            return df
        except Exception as e:
            print(f"Database connection failed: {e}, using sample data")
            return self.generate_sample_data()
    
    def generate_sample_data(self):
        """Generate sample solar power data for training"""
        np.random.seed(42)
        hours = 24 * 365  # Full year of hourly data
        
        power_data = []
        for i in range(hours):
            hour_of_day = i % 24
            
            # No solar at night
            if hour_of_day < 6 or hour_of_day > 18:
                power_data.append(0)
            else:
                # Bell curve for solar intensity
                peak_hour = 12
                std_dev = 3
                intensity = np.exp(-np.pow(hour_of_day - peak_hour, 2) / (2 * np.pow(std_dev, 2)))
                
                # Seasonal variation
                day_of_year = (i // 24) + 1
                seasonal_factor = np.sin(2 * np.pi * day_of_year / 365) * 0.3 + 0.7
                
                # Random noise
                noise = np.random.normal(1, 0.1)
                
                power = 5000 * intensity * seasonal_factor * noise
                power_data.append(max(0, power))
        
        return pd.DataFrame({'power': power_data})
    
    def train_model(self, data=None):
        """Train the Autoencoder model for anomaly detection"""
        if data is None:
            data = self.load_data_from_db()
        
        # Filter out zero values (night time)
        data = data[data['power'] > 0]
        
        # Scale data
        self.scaler = MinMaxScaler()
        scaled_data = self.scaler.fit_transform(data[['power']])
        
        # Build Autoencoder
        input_layer = Input(shape=(1,))
        encoded = Dense(8, activation="relu")(input_layer)
        decoded = Dense(1)(encoded)
        
        self.model = Model(input_layer, decoded)
        self.model.compile(optimizer="adam", loss="mse")
        
        # Train
        self.model.fit(
            scaled_data, scaled_data,
            epochs=20,
            batch_size=32,
            verbose=1
        )
        
        # Save model
        self.model.save(MODEL_PATH)
        joblib.dump(self.scaler, SCALER_PATH)
        
        self.is_trained = True
        print("Anomaly detection model trained and saved")
        
        return self
    
    def load_model(self):
        """Load trained model from disk"""
        if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
            try:
                self.model = load_model(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                self.is_trained = True
                return True
            except Exception as e:
                print(f"Error loading model: {e}")
                return False
        return False
    
    def detect_anomaly(self, power_value):
        """
        Detect if a power value is anomalous
        Returns: (is_anomaly: bool, score: float, message: str)
        """
        if not self.is_trained:
            if not self.load_model():
                print("Model not found, training new model...")
                self.train_model()
        
        try:
            # Scale the input
            scaled_value = self.scaler.transform([[power_value]])
            
            # Reconstruct
            reconstructed = self.model.predict(scaled_value, verbose=0)
            
            # Calculate reconstruction error
            loss = np.mean(np.abs(reconstructed - scaled_value))
            
            is_anomaly = loss > ANOMALY_THRESHOLD
            
            # Determine anomaly type
            message = "Normal"
            if is_anomaly:
                if power_value == 0:
                    message = "ANOMALY: Zero power output detected"
                elif power_value < 100:  # Very low power during daylight
                    message = "ANOMALY: Sudden power drop detected"
                elif loss > 0.15:
                    message = "ANOMALY: Unexpected spike detected"
                else:
                    message = "ANOMALY: Degraded efficiency detected"
            
            return is_anomaly, loss, message
            
        except Exception as e:
            print(f"Error in anomaly detection: {e}")
            return False, 0, f"Error: {str(e)}"
    
    def detect_batch_anomalies(self, power_values):
        """Detect anomalies for a batch of power values"""
        results = []
        for power in power_values:
            is_anomaly, score, message = self.detect_anomaly(power)
            results.append({
                'power': power,
                'is_anomaly': is_anomaly,
                'score': float(score),
                'message': message
            })
        return results
    
    def get_model_info(self):
        """Get information about the trained model"""
        return {
            'is_trained': self.is_trained,
            'anomaly_threshold': ANOMALY_THRESHOLD,
            'model_path': MODEL_PATH,
            'scaler_path': SCALER_PATH
        }


# Standalone functions for easy use
def detect_power_anomaly(power_value):
    """Convenience function to detect anomaly in a single power value"""
    detector = AnomalyDetector()
    return detector.detect_anomaly(power_value)


def train_and_save_anomaly_model():
    """Train and save the anomaly detection model"""
    detector = AnomalyDetector()
    detector.train_model()
    return detector.get_model_info()


if __name__ == "__main__":
    # Example usage
    print("Training anomaly detection model...")
    detector = AnomalyDetector()
    detector.train_model()
    
    print("\nTesting anomaly detection...")
    
    # Test normal value
    normal_power = 3500  # Typical mid-day power
    is_anomaly, score, message = detector.detect_anomaly(normal_power)
    print(f"Power: {normal_power}W - Anomaly: {is_anomaly}, Score: {score:.4f}, Message: {message}")
    
    # Test zero power (anomaly)
    zero_power = 0
    is_anomaly, score, message = detector.detect_anomaly(zero_power)
    print(f"Power: {zero_power}W - Anomaly: {is_anomaly}, Score: {score:.4f}, Message: {message}")
    
    # Test spike (anomaly)
    spike_power = 7000  # Unrealistically high
    is_anomaly, score, message = detector.detect_anomaly(spike_power)
    print(f"Power: {spike_power}W - Anomaly: {is_anomaly}, Score: {score:.4f}, Message: {message}")
    
    # Test drop (anomaly)
    drop_power = 500  # Sudden drop
    is_anomaly, score, message = detector.detect_anomaly(drop_power)
    print(f"Power: {drop_power}W - Anomaly: {is_anomaly}, Score: {score:.4f}, Message: {message}")
