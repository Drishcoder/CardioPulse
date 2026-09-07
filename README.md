# CardioPulse

A FastAPI dashboard for the saved `heart_risk_model.pkl` logistic-regression model.

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
