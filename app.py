from pathlib import Path
import pickle

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "heart_risk_model.pkl"
DATA_PATH = BASE_DIR / "heart_disease_risk_dataset_earlymed.csv"

with MODEL_PATH.open("rb") as model_file:
    saved_model = pickle.load(model_file)

model = saved_model["model"]
FEATURES = saved_model["features"]

def load_metrics() -> dict:
    data = pd.read_csv(DATA_PATH)
    features = data[FEATURES]
    labels = data["Heart_Risk"]
    predictions = model.predict(features)
    probabilities = model.predict_proba(features)[:, 1]
    return {
        "records": len(data),
        "positive_rate": round(float(labels.mean() * 100), 2),
        "accuracy": round(float(accuracy_score(labels, predictions) * 100), 2),
        "precision": round(float(precision_score(labels, predictions) * 100), 2),
        "recall": round(float(recall_score(labels, predictions) * 100), 2),
        "f1": round(float(f1_score(labels, predictions) * 100), 2),
        "roc_auc": round(float(roc_auc_score(labels, probabilities) * 100), 2),
    }

METRICS = load_metrics()

class RiskRequest(BaseModel):
    Chest_Pain: int = Field(ge=0, le=1)
    Shortness_of_Breath: int = Field(ge=0, le=1)
    Fatigue: int = Field(ge=0, le=1)
    Palpitations: int = Field(ge=0, le=1)
    Dizziness: int = Field(ge=0, le=1)
    Pain_Arms_Jaw_Back: int = Field(ge=0, le=1)
    High_BP: int = Field(ge=0, le=1)
    High_Cholesterol: int = Field(ge=0, le=1)
    Diabetes: int = Field(ge=0, le=1)
    Smoking: int = Field(ge=0, le=1)
    Obesity: int = Field(ge=0, le=1)
    Sedentary_Lifestyle: int = Field(ge=0, le=1)
    Family_History: int = Field(ge=0, le=1)
    Chronic_Stress: int = Field(ge=0, le=1)
    Gender: int = Field(ge=0, le=1)
    Age: float = Field(ge=1, le=120)

app = FastAPI(title="CardioPulse Risk API", version="1.0.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

@app.get("/", include_in_schema=False)
def dashboard() -> FileResponse:
    return FileResponse(BASE_DIR / "static" / "index.html")

@app.get("/api/metrics")
def metrics() -> dict:
    return METRICS

@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_PATH.name, "features": len(FEATURES)}

@app.post("/api/predict")
def predict(request: RiskRequest) -> dict:
    try:
        values = request.model_dump()
        row = pd.DataFrame([[values[feature] for feature in FEATURES]], columns=FEATURES)
        probability = float(model.predict_proba(row)[0][1])
        prediction = int(model.predict(row)[0])
        return {
            "prediction": prediction,
            "risk_probability": round(probability * 100, 1),
            "risk_band": "High risk" if probability >= 0.5 else "Lower risk",
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error
