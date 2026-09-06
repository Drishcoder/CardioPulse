# CardioPulse

A FastAPI dashboard for the saved `heart_risk_model.pkl` logistic-regression model.

## Run

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app:app --reload
```

Open http://127.0.0.1:8000. The API docs are available at http://127.0.0.1:8000/docs.

The API uses the permanent port `8000`. If the dashboard is opened with a static
server such as VS Code Live Server, it may use port `3000`; the dashboard still
connects to the API at `http://127.0.0.1:8000`.

The dashboard reads the feature order directly from the pickle metadata and calculates the displayed reference metrics from the included CSV.
