"""
FastAPI Model Serving for Solar Energy AI Predictions
Provides REST API for:
- Power forecasting (LSTM)
- Anomaly detection (Autoencoder)
- Real-time predictions
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import joblib
import os
from datetime import datetime

# Lazy imports for TensorFlow models
try:
    from tensorflow.keras.models import load_model
    tf_available = True
except ImportError:
    tf_available = False
    print("TensorFlow not available, using fallback predictions")

app = FastAPI(
    title="Solar Energy AI Service",
    description="AI-powered solar energy forecasting and anomaly detection",
    version="1.0.0"
)

# Model paths
FORECAST_MODEL_PATH = "ai-service/solar_lstm_model.h5"
ANOMALY_MODEL_PATH = "ai-service/anomaly_model.h5"
FORECAST_SCALER_PATH = "ai-service/lstm_scaler.pkl"
ANOMALY_SCALER_PATH = "ai-service/anomaly_scaler.pkl"

# Load models on startup
forecast_model = None
anomaly_model = None
forecast_scaler = None
anomaly_scaler = None

def load_forecast_model():
    """Load LSTM forecast model"""
    global forecast_model, forecast_scaler
    if tf_available and os.path.exists(FORECAST_MODEL_PATH):
        try:
            forecast_model = load_model(FORECAST_MODEL_PATH)
            if os.path.exists(FORECAST_SCALER_PATH):
                forecast_scaler = joblib.load(FORECAST_SCALER_PATH)
            return True
        except Exception as e:
            print(f"Error loading forecast model: {e}")
    return False

def load_anomaly_model():
    """Load anomaly detection model"""
    global anomaly_model, anomaly_scaler
    if tf_available and os.path.exists(ANOMALY_MODEL_PATH):
        try:
            anomaly_model = load_model(ANOMALY_MODEL_PATH)
            if os.path.exists(ANOMALY_SCALER_PATH):
                anomaly_scaler = joblib.load(ANOMALY_SCALER_PATH)
            return True
        except Exception as e:
            print(f"Error loading anomaly model: {e}")
    return False

# Request/Response models
class ForecastRequest(BaseModel):
    power_series: List[float]
    hours_ahead: int = 1

class ForecastResponse(BaseModel):
    success: bool
    prediction: float
    prediction_kw: float
    hours_ahead: int
    confidence: Optional[float] = None
    timestamp: str

class AnomalyRequest(BaseModel):
    power_value: float

class AnomalyResponse(BaseModel):
    success: bool
    anomaly: bool
    score: float
    message: str
    timestamp: str

class BatchAnomalyRequest(BaseModel):
    power_values: List[float]

class BatchAnomalyResponse(BaseModel):
    success: bool
    results: List[dict]
    total_anomalies: int
    timestamp: str

class HealthResponse(BaseModel):
    status: str
    forecast_model_loaded: bool
    anomaly_model_loaded: bool
    tensorflow_available: bool

# Health check
@app.get("/health", response_model=HealthResponse)
def health_check():
    """Check service health"""
    return HealthResponse(
        status="healthy",
        forecast_model_loaded=forecast_model is not None,
        anomaly_model_loaded=anomaly_model is not None,
        tensorflow_available=tf_available
    )

# Forecast endpoint
@app.post("/predict/forecast", response_model=ForecastResponse)
def predict_forecast(request: ForecastRequest):
    """
    Predict future power output using LSTM model
    
    Args:
        power_series: List of recent power values (last 24 hours recommended)
        hours_ahead: Number of hours to predict ahead (default: 1)
    
    Returns:
        Predicted power value in watts and kW
    """
    if not tf_available or forecast_model is None:
        # Fallback: return average of input series
        if len(request.power_series) > 0:
            avg_power = np.mean(request.power_series)
        else:
            avg_power = 2500  # Default 2.5kW
        
        return ForecastResponse(
            success=True,
            prediction=avg_power,
            prediction_kw=round(avg_power / 1000, 2),
            hours_ahead=request.hours_ahead,
            confidence=0.5,
            timestamp=datetime.now().isoformat()
        )
    
    try:
        # Prepare input
        series = np.array(request.power_series)
        
        # If we have enough data, use it; otherwise pad with zeros
        sequence_length = 24
        if len(series) < sequence_length:
            # Pad with zeros at the beginning
            padding = np.zeros(sequence_length - len(series))
            series = np.concatenate([padding, series])
        
        # Scale input
        if forecast_scaler:
            scaled_series = forecast_scaler.transform(series.reshape(-1, 1)).flatten()
        else:
            scaled_series = series / 5000  # Simple normalization
        
        # Reshape for LSTM [samples, time steps, features]
        X_input = scaled_series[-sequence_length:].reshape(1, sequence_length, 1)
        
        # Predict
        prediction_scaled = forecast_model.predict(X_input, verbose=0)
        
        # Inverse scale
        if forecast_scaler:
            prediction = forecast_scaler.inverse_transform(prediction_scaled)[0][0]
        else:
            prediction = prediction_scaled[0][0] * 5000
        
        prediction = max(0, prediction)  # Power can't be negative
        
        return ForecastResponse(
            success=True,
            prediction=round(prediction, 2),
            prediction_kw=round(prediction / 1000, 2),
            hours_ahead=request.hours_ahead,
            confidence=0.85,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Anomaly detection endpoint
@app.post("/detect/anomaly", response_model=AnomalyResponse)
def detect_anomaly(request: AnomalyRequest):
    """
    Detect if a power value is anomalous using Autoencoder
    
    Args:
        power_value: The power value to check
    
    Returns:
        Whether it's anomalous, reconstruction error score, and message
    """
    if not tf_available or anomaly_model is None:
        # Fallback: simple threshold-based detection
        is_anomaly = request.power_value > 6000 or (request.power_value == 0 and 6 <= datetime.now().hour <= 18)
        return AnomalyResponse(
            success=True,
            anomaly=is_anomaly,
            score=0.0,
            message="Fallback: " + ("Anomaly detected" if is_anomaly else "Normal"),
            timestamp=datetime.now().isoformat()
        )
    
    try:
        # Scale input
        if anomaly_scaler:
            scaled_value = anomaly_scaler.transform([[request.power_value]])
        else:
            scaled_value = np.array([[request.power_value / 5000]])
        
        # Reconstruct
        reconstructed = anomaly_model.predict(scaled_value, verbose=0)
        
        # Calculate reconstruction error
        loss = np.mean(np.abs(reconstructed - scaled_value))
        
        # Determine if anomalous
        threshold = 0.08
        is_anomaly = loss > threshold
        
        # Determine message
        if is_anomaly:
            if request.power_value == 0:
                message = "ANOMALY: Zero power output detected"
            elif request.power_value < 100:
                message = "ANOMALY: Sudden power drop detected"
            elif request.power_value > 6000:
                message = "ANOMALY: Unexpected spike detected"
            else:
                message = "ANOMALY: Degraded efficiency detected"
        else:
            message = "Normal"
        
        return AnomalyResponse(
            success=True,
            anomaly=is_anomaly,
            score=float(loss),
            message=message,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection error: {str(e)}")

# Batch anomaly detection
@app.post("/detect/anomaly/batch", response_model=BatchAnomalyResponse)
def detect_batch_anomalies(request: BatchAnomalyRequest):
    """Detect anomalies for multiple power values"""
    results = []
    total_anomalies = 0
    
    for power in request.power_values:
        # Reuse single anomaly detection logic
        req = AnomalyRequest(power_value=power)
        resp = detect_anomaly(req)
        
        result = {
            "power": power,
            "anomaly": resp.anomaly,
            "score": resp.score,
            "message": resp.message
        }
        results.append(result)
        if resp.anomaly:
            total_anomalies += 1
    
    return BatchAnomalyResponse(
        success=True,
        results=results,
        total_anomalies=total_anomalies,
        timestamp=datetime.now().isoformat()
    )

# Load models on startup
@app.on_event("startup")
async def startup_event():
    print("Loading AI models...")
    forecast_loaded = load_forecast_model()
    anomaly_loaded = load_anomaly_model()
    print(f"Forecast model loaded: {forecast_loaded}")
    print(f"Anomaly model loaded: {anomaly_loaded}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
