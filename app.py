from pathlib import Path
import math
import pickle
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    log_loss,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
    roc_curve,
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "heart_risk_model.pkl"
DATA_PATH = BASE_DIR / "heart_disease_risk_dataset_earlymed.csv"

with MODEL_PATH.open("rb") as model_file:
    saved_model = pickle.load(model_file)

model = saved_model["model"]
FEATURES = saved_model["features"]

FEATURE_METADATA = {
    "Chest_Pain": {"label": "Chest Pain (Angina)", "category": "Symptom", "desc": "Substernal pressure, tightness, or aching during exertion or rest"},
    "Shortness_of_Breath": {"label": "Shortness of Breath (Dyspnea)", "category": "Symptom", "desc": "Difficulty breathing or air hunger during mild activity or recumbency"},
    "Pain_Arms_Jaw_Back": {"label": "Referred Pain (Arms/Jaw/Back)", "category": "Symptom", "desc": "Radiating ischemic discomfort into upper extremity, neck, or back"},
    "Palpitations": {"label": "Palpitations", "category": "Symptom", "desc": "Sensation of fluttering, rapid pounding, or irregular heartbeats"},
    "Dizziness": {"label": "Dizziness / Syncope", "category": "Symptom", "desc": "Lightheadedness, orthostatic instability, or transient pre-syncope"},
    "Fatigue": {"label": "Severe Unexplained Fatigue", "category": "Symptom", "desc": "Chronic profound physical exhaustion unresponsive to sleep"},
    "High_BP": {"label": "Hypertension (High BP)", "category": "Comorbidity", "desc": "Systolic ≥ 130 mmHg or diastolic ≥ 80 mmHg or anti-hypertensive rx"},
    "High_Cholesterol": {"label": "High Cholesterol / Lipids", "category": "Comorbidity", "desc": "Elevated LDL-C / total cholesterol or active lipid-lowering therapy"},
    "Diabetes": {"label": "Diabetes / Hyperglycemia", "category": "Comorbidity", "desc": "Fasting glucose ≥ 126 mg/dL, HbA1c ≥ 6.5%, or antidiabetic rx"},
    "Smoking": {"label": "Smoking / Tobacco Inhalation", "category": "Lifestyle", "desc": "Active or significant past history of cigarette, cigar, or vape use"},
    "Obesity": {"label": "Obesity (BMI ≥ 30)", "category": "Comorbidity", "desc": "Excess adiposity and elevated waist-to-hip circumferential ratio"},
    "Sedentary_Lifestyle": {"label": "Sedentary Lifestyle", "category": "Lifestyle", "desc": "Fewer than 150 minutes of moderate physical exercise per week"},
    "Family_History": {"label": "Family History of CAD", "category": "Comorbidity", "desc": "Premature first-degree cardiovascular disease occurrence"},
    "Chronic_Stress": {"label": "Chronic Psychological Stress", "category": "Lifestyle", "desc": "High sympathetic nervous strain and elevated baseline cortisol"},
    "Gender": {"label": "Biological Sex (Male)", "category": "Demographic", "desc": "Epidemiological sex category (1 = Male, 0 = Female)"},
    "Age": {"label": "Age (Years)", "category": "Demographic", "desc": "Chronological verified patient age in years"},
}

def load_all_diagnostics():
    data = pd.read_csv(DATA_PATH)
    features = data[FEATURES]
    labels = data["Heart_Risk"].astype(int)
    predictions = model.predict(features).astype(int)
    probabilities = model.predict_proba(features)[:, 1]

    # Confusion Matrix
    cm = confusion_matrix(labels, predictions)
    tn, fp, fn, tp = cm.ravel()

    # Core Metrics
    acc = accuracy_score(labels, predictions) * 100
    prec = precision_score(labels, predictions) * 100
    rec = recall_score(labels, predictions) * 100
    f1 = f1_score(labels, predictions) * 100
    auc = roc_auc_score(labels, probabilities) * 100
    spec = (tn / (tn + fp)) * 100
    npv = (tn / (tn + fn)) * 100
    ce_loss = log_loss(labels, probabilities)

    metrics = {
        "records": len(data),
        "positive_rate": round(float(labels.mean() * 100), 2),
        "accuracy": round(float(acc), 2),
        "precision": round(float(prec), 2),
        "recall": round(float(rec), 2),
        "specificity": round(float(spec), 2),
        "npv": round(float(npv), 2),
        "f1": round(float(f1), 2),
        "roc_auc": round(float(auc), 2),
        "log_loss": round(float(ce_loss), 4),
        "true_positives": int(tp),
        "true_negatives": int(tn),
        "false_positives": int(fp),
        "false_negatives": int(fn),
    }

    # ROC Curve
    fpr, tpr, _ = roc_curve(labels, probabilities)
    step = max(1, len(fpr) // 100)
    fpr_down = [round(float(v), 4) for v in fpr[::step]]
    tpr_down = [round(float(v), 4) for v in tpr[::step]]
    if fpr_down[-1] != 1.0:
        fpr_down.append(1.0)
        tpr_down.append(1.0)

    # Precision-Recall Curve
    pr_prec, pr_rec, _ = precision_recall_curve(labels, probabilities)
    pr_step = max(1, len(pr_prec) // 100)
    pr_curve = {
        "precision": [round(float(v), 4) for v in pr_prec[::pr_step]],
        "recall": [round(float(v), 4) for v in pr_rec[::pr_step]],
    }

    # Sigmoid Curve
    sigmoid_x = [-6 + (12 * index / 60) for index in range(61)]
    sigmoid_y = [1 / (1 + math.exp(-val)) for val in sigmoid_x]

    # Prevalence by outcome
    binary_features = [feature for feature in FEATURES if feature != "Age"]
    prevalence = data.groupby("Heart_Risk")[binary_features].mean().T.reset_index()
    prevalence.columns = ["feature", "lower_risk", "heart_risk"]

    # Probability Distribution
    probability_bins = pd.cut(probabilities * 100, bins=[0, 25, 50, 75, 100], include_lowest=True)
    distribution = probability_bins.value_counts().sort_index()

    charts = {
        "class_balance": {"lower_risk": int(tn + fp), "heart_risk": int(tp + fn)},
        "prevalence": [
            {
                "feature": FEATURE_METADATA.get(row.feature, {}).get("label", row.feature.replace("_", " ")),
                "raw_key": row.feature,
                "lower_risk": round(float(row.lower_risk * 100), 2),
                "heart_risk": round(float(row.heart_risk * 100), 2),
            }
            for row in prevalence.itertuples()
        ],
        "confusion_matrix": cm.tolist(),
        "probability_distribution": {str(interval): int(count) for interval, count in distribution.items()},
        "roc_curve": {"false_positive_rate": fpr_down, "true_positive_rate": tpr_down},
        "precision_recall_curve": pr_curve,
        "sigmoid_curve": {"x": sigmoid_x, "y": [round(val, 4) for val in sigmoid_y]},
    }

    # Feature Coefficients & Odds Ratios
    coefficients = model.coef_[0]
    intercept = float(model.intercept_[0])

    feature_analysis = []
    for feat, coef in zip(FEATURES, coefficients):
        meta = FEATURE_METADATA.get(feat, {"label": feat, "category": "General", "desc": ""})
        or_val = math.exp(coef)
        feature_analysis.append({
            "key": feat,
            "label": meta["label"],
            "category": meta["category"],
            "description": meta["desc"],
            "coefficient": round(float(coef), 4),
            "odds_ratio": round(float(or_val), 2),
            "abs_impact": round(abs(float(coef)), 4),
        })

    # Sort features by odds ratio descending
    feature_analysis.sort(key=lambda item: item["odds_ratio"], reverse=True)

    # Decision Threshold Sensitivity Analysis
    thresholds = [round(t, 2) for t in np.arange(0.10, 0.95, 0.05)]
    threshold_results = []
    for t in thresholds:
        t_preds = (probabilities >= t).astype(int)
        t_prec = precision_score(labels, t_preds, zero_division=0) * 100
        t_rec = recall_score(labels, t_preds, zero_division=0) * 100
        t_f1 = f1_score(labels, t_preds, zero_division=0) * 100
        t_spec = ((labels == 0) & (t_preds == 0)).sum() / (labels == 0).sum() * 100
        threshold_results.append({
            "threshold": t,
            "precision": round(float(t_prec), 2),
            "recall": round(float(t_rec), 2),
            "specificity": round(float(t_spec), 2),
            "f1": round(float(t_f1), 2),
        })

    model_analysis = {
        "algorithm": "Regularized L2 Logistic Regression",
        "framework": "Scikit-Learn (Clinical Calibration)",
        "dataset_name": "EarlyMed Cardiovascular Risk Cohort",
        "dataset_records": len(data),
        "intercept": round(intercept, 4),
        "metrics": metrics,
        "features": feature_analysis,
        "threshold_analysis": threshold_results,
    }

    return metrics, charts, model_analysis

METRICS, CHART_DATA, MODEL_ANALYSIS = load_all_diagnostics()

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

app = FastAPI(title="CardioPulse Clinical Intelligence API", version="2.0.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")

@app.get("/", include_in_schema=False)
def dashboard() -> FileResponse:
    return FileResponse(BASE_DIR / "static" / "index.html")

@app.get("/api/metrics")
def get_metrics() -> dict:
    return METRICS

@app.get("/api/health")
def health() -> dict:
    return {
        "status": "healthy",
        "model": MODEL_PATH.name,
        "algorithm": "Regularized Logistic Regression",
        "accuracy": METRICS["accuracy"],
        "roc_auc": METRICS["roc_auc"],
        "features_count": len(FEATURES),
        "records": METRICS["records"],
    }

@app.get("/api/charts")
def get_charts() -> dict:
    return CHART_DATA

@app.get("/api/model-analysis")
def get_model_analysis() -> dict:
    return MODEL_ANALYSIS

@app.post("/api/predict")
def predict(request: RiskRequest) -> dict:
    try:
        values = request.model_dump()
        row = pd.DataFrame([[values[feature] for feature in FEATURES]], columns=FEATURES)
        probability = float(model.predict_proba(row)[0][1])
        prediction = int(model.predict(row)[0])

        # Calculate exact log-odds contribution
        intercept = float(model.intercept_[0])
        log_odds = intercept
        contributions = []
        for feat, coef in zip(FEATURES, model.coef_[0]):
            val = values[feat]
            effect = float(val * coef)
            log_odds += effect
            if (feat not in ["Age", "Gender"] and val == 1) or (feat == "Age" and effect > 0):
                contributions.append({
                    "feature": feat,
                    "label": FEATURE_METADATA.get(feat, {}).get("label", feat),
                    "effect": round(effect, 3),
                    "odds_ratio": round(math.exp(float(coef)), 2),
                })

        contributions.sort(key=lambda x: x["effect"], reverse=True)

        return {
            "prediction": prediction,
            "risk_probability": round(probability * 100, 1),
            "risk_band": "High risk" if probability >= 0.5 else "Lower risk",
            "log_odds": round(log_odds, 4),
            "top_drivers": contributions[:5],
        }
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {error}") from error

@app.post("/api/simulate")
def simulate(request: RiskRequest) -> dict:
    return predict(request)
