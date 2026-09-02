const symptoms = [
  ["Chest_Pain", "Chest pain"], ["Shortness_of_Breath", "Shortness of breath"], ["Fatigue", "Fatigue"],
  ["Palpitations", "Palpitations"], ["Dizziness", "Dizziness"], ["Pain_Arms_Jaw_Back", "Pain in arms, jaw or back"]
];
const factors = [
  ["High_BP", "High blood pressure"], ["High_Cholesterol", "High cholesterol"], ["Diabetes", "Diabetes"],
  ["Smoking", "Smoking history"], ["Obesity", "Obesity"], ["Sedentary_Lifestyle", "Sedentary lifestyle"],
  ["Family_History", "Family history"], ["Chronic_Stress", "Chronic stress"]
];

function renderToggles(targetId, fields) {
  document.getElementById(targetId).innerHTML = fields.map(([name, label]) => `
    <label class="toggle-label"><input type="checkbox" name="${name}"><span class="switch"></span><span>${label}</span></label>
  `).join("");
}

function setText(id, value, suffix = "%") { document.getElementById(id).textContent = `${value}${suffix}`; }

async function loadMetrics() {
  const response = await fetch("/api/metrics");
  const metrics = await response.json();
  setText("accuracy", metrics.accuracy);
  setText("precision", metrics.precision);
  setText("recall", metrics.recall);
  document.getElementById("records").textContent = metrics.records.toLocaleString();
  setText("f1", metrics.f1);
  setText("roc_auc", metrics.roc_auc);
  setText("positive_rate", metrics.positive_rate);
}

function showResult(result) {
  const isHighRisk = result.prediction === 1;
  document.getElementById("result-title").textContent = isHighRisk ? "Elevated risk signal" : "Lower risk signal";
  document.getElementById("result-badge").textContent = isHighRisk ? "REVIEW" : "STABLE";
  document.getElementById("result-badge").className = `result-badge ${isHighRisk ? "warning" : "good"}`;
  document.getElementById("risk-value").textContent = `${result.risk_probability}%`;
  document.getElementById("result-note").textContent = isHighRisk
    ? "The model found a meaningful risk signal. Consider clinical follow-up and a full patient review."
    : "The model found no elevated signal in this profile. Continue routine clinical consideration.";
  document.querySelector(".gauge").style.setProperty("--risk", `${result.risk_probability * 3.6}deg`);
}

document.addEventListener("DOMContentLoaded", () => {
  renderToggles("symptom-fields", symptoms);
  renderToggles("factor-fields", factors);
  loadMetrics().catch(() => document.querySelectorAll(".metric-card strong").forEach((el) => el.textContent = "N/A"));
  document.getElementById("risk-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector(".submit-btn");
    button.disabled = true;
    button.querySelector("span").textContent = "Calculating...";
    const formData = new FormData(event.currentTarget);
    const payload = {};
    [...symptoms, ...factors].forEach(([name]) => { payload[name] = formData.has(name) ? 1 : 0; });
    payload.Age = Number(formData.get("Age"));
    payload.Gender = Number(formData.get("Gender"));
    try {
      const response = await fetch("/api/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Prediction request failed");
      showResult(await response.json());
    } catch (error) {
      document.getElementById("result-title").textContent = "Unable to assess";
      document.getElementById("result-note").textContent = error.message;
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = "Calculate risk profile";
    }
  });
});
