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

const chartLayout = { font: { family: "DM Sans, sans-serif", color: "#172b35", size: 11 }, paper_bgcolor: "transparent", plot_bgcolor: "transparent", margin: { t: 12, r: 12, b: 42, l: 48 }, hoverlabel: { bgcolor: "#153c42", font: { color: "#fff" } } };
const chartConfig = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] };

async function loadCharts() {
  const response = await fetch("/api/charts");
  const charts = await response.json();
  Plotly.newPlot("class-balance-chart", [{ x: ["Lower risk", "Heart risk"], y: [charts.class_balance.lower_risk, charts.class_balance.heart_risk], type: "bar", marker: { color: ["#0c8d86", "#ed715a"] }, hovertemplate: "%{x}: %{y:,} patients<extra></extra>" }], { ...chartLayout, yaxis: { title: "Patients", gridcolor: "#e2e9e6" }, showlegend: false }, chartConfig);
  Plotly.newPlot("confusion-chart", [{ z: charts.confusion_matrix, x: ["Predicted lower", "Predicted heart"], y: ["Actual lower", "Actual heart"], type: "heatmap", colorscale: [[0, "#d8eeea"], [1, "#0c8d86"]], texttemplate: "%{z:,}", hovertemplate: "%{y}<br>%{x}: %{z:,}<extra></extra>" }], { ...chartLayout, margin: { t: 12, r: 12, b: 48, l: 85 }, xaxis: { side: "bottom" }, yaxis: { autorange: "reversed" }, showlegend: false }, chartConfig);
  const prevalence = [...charts.prevalence].sort((a, b) => Math.max(b.lower_risk, b.heart_risk) - Math.max(a.lower_risk, a.heart_risk));
  Plotly.newPlot("prevalence-chart", [{ y: prevalence.map(item => item.feature), x: prevalence.map(item => item.lower_risk), name: "Lower risk", type: "bar", orientation: "h", marker: { color: "#8fc9c1" }, hovertemplate: "%{y}: %{x:.1f}%<extra>Lower risk</extra>" }, { y: prevalence.map(item => item.feature), x: prevalence.map(item => item.heart_risk), name: "Heart risk", type: "bar", orientation: "h", marker: { color: "#ed715a" }, hovertemplate: "%{y}: %{x:.1f}%<extra>Heart risk</extra>" }], { ...chartLayout, barmode: "group", margin: { t: 12, r: 12, b: 42, l: 145 }, xaxis: { title: "Patients (%)", gridcolor: "#e2e9e6" }, yaxis: { automargin: true }, legend: { orientation: "h", y: 1.12, x: 0 }, height: 480 }, chartConfig);
  const distribution = Object.entries(charts.probability_distribution);
  Plotly.newPlot("probability-chart", [{ x: distribution.map(item => item[0]), y: distribution.map(item => item[1]), type: "bar", marker: { color: ["#0c8d86", "#8fc9c1", "#f4c95d", "#ed715a"] }, hovertemplate: "%{x}: %{y:,} records<extra></extra>" }], { ...chartLayout, xaxis: { title: "Predicted probability range", gridcolor: "#e2e9e6" }, yaxis: { title: "Records", gridcolor: "#e2e9e6" }, showlegend: false }, chartConfig);
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
  loadCharts().catch(() => document.querySelectorAll(".chart-card div").forEach((el) => el.textContent = "Chart data unavailable"));
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
