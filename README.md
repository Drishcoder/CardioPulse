# CardioPulse

A FastAPI dashboard for the saved `heart_risk_model.pkl` logistic-regression model.

## Run

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Open http://127.0.0.1:8000. The API docs are available at http://127.0.0.1:8000/docs.

The dashboard reads the feature order directly from the pickle metadata and calculates the displayed reference metrics from the included CSV.
