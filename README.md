# CardioPulse

A FastAPI dashboard for a heart-risk prediction model trained from the EarlyMed health dataset.

## Model overview

The app loads a serialized scikit-learn model from `heart_risk_model.pkl` and uses it to estimate whether a patient is in the `Heart_Risk` class.

- Model type: logistic regression classifier
- Prediction target: binary heart-risk status (`0 = lower risk`, `1 = heart risk`)
- Input features: Age, Chest_Pain, Shortness_of_Breath, Fatigue, Palpitations, Dizziness, Pain_Arms_Jaw_Back, High_BP, High_Cholesterol, Diabetes, Smoking, Obesity, Sedentary_Lifestyle, Family_History, Chronic_Stress, Gender
- Output: probability of heart risk plus a class prediction (`High risk` if probability >= 0.5, otherwise `Lower risk`)
- Training data source: `heart_disease_risk_dataset_earlymed.csv`
- Metrics computed in the app from the included dataset:
  - Accuracy: about 98.55%
  - Precision: about 98.52%
  - Recall: about 98.59%
  - F1 score: about 98.55%
  - ROC AUC: about 99.9%

The API schema expects binary numeric fields for symptoms and risk factors, with `Age` as a numeric age value between 1 and 120. All data is processed through the same feature order saved in the model metadata, so the dashboard and prediction endpoint stay aligned.

This model is intended as a clinical decision-support tool for education and exploration, not a replacement for medical diagnosis or professional care. It should be used alongside a clinician’s assessment, not as a standalone diagnostic system.

## Run

```bash
python -m pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Open http://127.0.0.1:8000. The API docs are available at http://127.0.0.1:8000/docs.

For deployment, configure the platform with:

- Install command: `pip install -r requirements.txt`
- Start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

The dashboard uses the same origin for API requests, so it works both locally
and on the deployed domain.

The dashboard reads the feature order directly from the pickle metadata and calculates the displayed reference metrics from the included CSV.
