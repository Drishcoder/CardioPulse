const questionCatalog = {
  Age: {
    category: "Demographics",
    number: "Q1",
    question: "What is the patient's age?",
    subtitle: "Baseline chronological age in years.",
    description: "Age is one of the strongest non-modifiable cardiovascular risk markers. Arterial elasticity decreases with advancing decades, and cumulative exposure to metabolic stressors gradually rises.",
    signs: [
      "Vascular stiffening and reduced arterial compliance",
      "Cumulative exposure to blood pressure and lipid stressors",
      "Higher epidemiological baseline incidence of coronary artery disease"
    ],
    tip: "Enter the patient's current verified age (1 to 120).",
    impact: "Baseline Factor",
    type: "number"
  },
  Gender: {
    category: "Demographics",
    number: "Q2",
    question: "What is the patient's biological sex?",
    subtitle: "Baseline epidemiological risk differentiation.",
    description: "Biological males statistically experience earlier coronary disease onset, whereas females often show increased risk post-menopause with atypical symptom manifestations.",
    signs: [
      "Earlier statistical onset in biological males",
      "Atypical microvascular presentation more common in females",
      "Post-menopausal hormonal cardioprotective transitions"
    ],
    tip: "Select Male (1) or Female (0) based on biological sex.",
    impact: "Demographic Marker",
    type: "gender"
  },
  Chest_Pain: {
    category: "Symptom Screening",
    number: "Q3",
    question: "Do you experience chest pain, pressure, or tightness?",
    subtitle: "Evaluates myocardial ischemia and coronary artery stress signals.",
    description: "Chest pain (angina pectoris) is the cardinal indicator of restricted oxygenated blood flow to the heart muscle. The discomfort may feel like crushing pressure, fullness, squeezing, or a dull persistent ache.",
    signs: [
      "Pressure, heaviness, squeezing, or burning behind the breastbone",
      "Pain triggered or worsened by exertion, cold weather, or emotional stress",
      "Discomfort that eases after a few minutes of rest or sublingual nitroglycerin"
    ],
    tip: "Select 'Yes' if the patient experiences recurrent, exertional, or unexplained chest discomfort.",
    impact: "Primary Clinical Alert"
  },
  Shortness_of_Breath: {
    category: "Symptom Screening",
    number: "Q4",
    question: "Do you suffer from unexplained shortness of breath (Dyspnea)?",
    subtitle: "Breathlessness during ordinary activities or while at rest.",
    description: "Dyspnea occurs when the heart cannot pump blood forward efficiently, causing pressure and fluid to back up in the lungs, reducing effective gas exchange.",
    signs: [
      "Breathlessness upon climbing stairs, walking short distances, or mild chores",
      "Orthopnea: needing multiple pillows to elevate the head to breathe comfortably in bed",
      "Paroxysmal nocturnal dyspnea: waking up suddenly gasping for air"
    ],
    tip: "Select 'Yes' if you experience breathlessness disproportionate to the physical exertion level.",
    impact: "Primary Clinical Alert"
  },
  Fatigue: {
    category: "Symptom Screening",
    number: "Q5",
    question: "Do you feel persistent, unexplained fatigue or exhaustion?",
    subtitle: "Severe lack of stamina unrelated to sleep duration.",
    description: "Cardiac-related fatigue stems from diminished cardiac stroke volume, meaning working muscles and brain tissue receive lower perfusion of oxygen and critical nutrients.",
    signs: [
      "Feeling utterly drained by mundane tasks like grooming, cooking, or grocery shopping",
      "Unrefreshed awakening despite getting full sleep",
      "Heavy, leaden sensations in limbs during routine movement"
    ],
    tip: "Select 'Yes' if chronic unshakeable fatigue impairs your daily activities.",
    impact: "Moderate Indicator"
  },
  Palpitations: {
    category: "Symptom Screening",
    number: "Q6",
    question: "Do you notice rapid, fluttering, or irregular heartbeats?",
    subtitle: "Sensations of pounding, racing, or skipped cardiac beats.",
    description: "Palpitations indicate cardiac rhythm irregularities (arrhythmias such as atrial fibrillation or premature contractions) or autonomic nervous system hyperarousal.",
    signs: [
      "Fluttering, thumping, or 'flip-flop' sensations in the chest or throat",
      "Sudden acceleration of heart rate while sitting quietly",
      "Noticeable dropped or skipped beats followed by a hard compensatory beat"
    ],
    tip: "Select 'Yes' if you frequently notice noticeable irregular, rapid, or skipped beats.",
    impact: "Moderate Indicator"
  },
  Dizziness: {
    category: "Symptom Screening",
    number: "Q7",
    question: "Do you frequently experience dizziness or lightheadedness?",
    subtitle: "Episodes of feeling faint, woozy, or losing balance.",
    description: "Lightheadedness and presyncope reflect transient reductions in cerebral blood flow caused by cardiac rhythm disturbances, valve anomalies, or abrupt blood pressure fluctuations.",
    signs: [
      "Sudden head-rush, wooziness, or room spinning when standing up",
      "Near-fainting episodes or graying-out of vision during exertion",
      "Unsteadiness paired with sweating or sudden cold clamminess"
    ],
    tip: "Select 'Yes' if you suffer from recurrent episodes of lightheadedness or near-fainting.",
    impact: "Moderate Indicator"
  },
  Pain_Arms_Jaw_Back: {
    category: "Symptom Screening",
    number: "Q8",
    question: "Do you have radiating pain in your arms, jaw, neck, or back?",
    subtitle: "Referred ischemia radiating beyond the chest area.",
    description: "Cardiac ischemia often sends referred pain through shared sensory spinal pathways, projecting discomfort to the left arm, shoulders, upper back, neck, or lower jaw.",
    signs: [
      "Ache, heaviness, or numbness spreading down one or both arms",
      "Discomfort focused along the lower jaw, throat, or between shoulder blades",
      "Upper torso pain triggered simultaneously with shortness of breath"
    ],
    tip: "Select 'Yes' if you experience unexplained aching or pain radiating in these upper body areas.",
    impact: "Primary Clinical Alert"
  },
  High_BP: {
    category: "Medical History",
    number: "Q9",
    question: "Have you been diagnosed with High Blood Pressure (Hypertension)?",
    subtitle: "Sustained arterial pressure ≥ 130/80 mmHg or on medication.",
    description: "Chronic high pressure forces the heart's left ventricle to pump harder against high systemic resistance, causing ventricular hypertrophy and accelerated arterial wall hardening.",
    signs: [
      "Systolic blood pressure ≥ 130 mmHg or diastolic ≥ 80 mmHg on multiple checks",
      "Prescription of antihypertensive medications (ACE-inhibitors, ARBs, beta-blockers, CCBs)",
      "Occasional morning occipital headaches or facial flushing"
    ],
    tip: "Select 'Yes' if you have been medically diagnosed with hypertension or take BP medication.",
    impact: "Major Chronic Risk"
  },
  High_Cholesterol: {
    category: "Medical History",
    number: "Q10",
    question: "Do you have high cholesterol or lipid imbalance (Dyslipidemia)?",
    subtitle: "Elevated LDL, high total cholesterol, or statin treatment.",
    description: "Excess low-density lipoprotein (LDL) cholesterol infiltrates the sub-endothelial space of coronary arteries, creating atherosclerotic plaques that restrict blood flow.",
    signs: [
      "Lab reports showing LDL > 100 mg/dL or Total Cholesterol > 200 mg/dL",
      "Current prescription of cholesterol-lowering medication (e.g. Atorvastatin, Rosuvastatin)",
      "Low protective HDL levels or high triglyceride readings"
    ],
    tip: "Select 'Yes' if blood tests showed high cholesterol or you use cholesterol medication.",
    impact: "Major Chronic Risk"
  },
  Diabetes: {
    category: "Medical History",
    number: "Q11",
    question: "Have you been diagnosed with Diabetes or Pre-diabetes?",
    subtitle: "Impaired blood glucose metabolism & vascular microdamage.",
    description: "Elevated blood glucose levels cause extensive microvascular and macrovascular damage, accelerating coronary plaque formation and doubling cardiovascular mortality risk.",
    signs: [
      "Fasting blood glucose ≥ 126 mg/dL or HbA1c ≥ 6.5%",
      "Diagnosed with Type 1, Type 2, or borderline pre-diabetes",
      "Taking oral hypoglycemic agents (Metformin) or insulin injections"
    ],
    tip: "Select 'Yes' if you have diagnosed diabetes, pre-diabetes, or take blood sugar medication.",
    impact: "Major Chronic Risk"
  },
  Smoking: {
    category: "Lifestyle & Habits",
    number: "Q12",
    question: "Do you currently smoke or have a significant smoking history?",
    subtitle: "Tobacco exposure, coronary vasoconstriction, and thrombotic risk.",
    description: "Tobacco smoke contains chemicals that directly damage the endothelial lining of arteries, promote dangerous platelet aggregation (clots), and trigger acute arterial spasms.",
    signs: [
      "Current regular use of cigarettes, bidis, cigars, pipes, or vape devices",
      "History of cumulative heavy smoking (>10 pack-years) even if recently ceased",
      "Frequent inhalation of high-density secondhand smoke"
    ],
    tip: "Select 'Yes' if you are an active tobacco user or have a substantial past history.",
    impact: "High Modifiable Risk"
  },
  Obesity: {
    category: "Lifestyle & Habits",
    number: "Q13",
    question: "Is your Body Mass Index (BMI) in the overweight or obese range?",
    subtitle: "Adiposity and metabolic overload on cardiac stroke volume.",
    description: "Excess body weight increases circulatory volume demands, promotes systemic low-grade inflammation, and is strongly correlated with obstructive sleep apnea and hypertension.",
    signs: [
      "Body Mass Index (BMI) calculated at 30 kg/m² or greater",
      "Excess abdominal/visceral adiposity (waist > 40 inches for men, > 35 for women)",
      "Joint strain and rapid fatigue during short walks"
    ],
    tip: "Select 'Yes' if your BMI is categorized as obese or you carry significant excess weight.",
    impact: "Moderate Chronic Risk"
  },
  Sedentary_Lifestyle: {
    category: "Lifestyle & Habits",
    number: "Q14",
    question: "Do you lead a mostly sedentary lifestyle with minimal exercise?",
    subtitle: "Lack of regular aerobic physical activity and prolonged sitting.",
    description: "Lack of regular cardiovascular exercise weakens myocardial contractile efficiency, lowers protective HDL cholesterol, and impairs systemic vascular tone.",
    signs: [
      "Fewer than 150 minutes of moderate aerobic activity (e.g. brisk walking) per week",
      "Desk-bound occupation with 7+ hours of seated inactivity daily",
      "Rare participation in active sports, swimming, jogging, or cycling"
    ],
    tip: "Select 'Yes' if you do not regularly meet recommended weekly cardio exercise levels.",
    impact: "Modifiable Risk"
  },
  Family_History: {
    category: "Medical History",
    number: "Q15",
    question: "Do you have a family history of premature heart disease?",
    subtitle: "Cardiovascular events in parents or siblings at an early age.",
    description: "Genetic factors significantly amplify cardiovascular risk when first-degree relatives (parents, siblings) experienced heart attacks, coronary stents, or bypass surgery at young ages (<55 in men, <65 in women).",
    signs: [
      "Parent or sibling suffered heart attack or sudden cardiac event before age 55 (male) or 65 (female)",
      "Strong hereditary history of familial hypercholesterolemia",
      "Early stroke or premature cardiovascular interventions in immediate family"
    ],
    tip: "Select 'Yes' if any first-degree family member had early-onset heart problems.",
    impact: "Major Hereditary Risk"
  },
  Chronic_Stress: {
    category: "Lifestyle & Habits",
    number: "Q16",
    question: "Do you experience ongoing high psychological or emotional stress?",
    subtitle: "Sustained sympathetic overdrive and elevated cortisol levels.",
    description: "Prolonged mental and emotional stress produces sustained surges in cortisol and catecholamines (adrenaline), driving persistent vasoconstriction and inflammatory cardiovascular stress.",
    signs: [
      "High workplace burnout, intense caregiving stress, or persistent severe anxiety",
      "Difficulty relaxing, chronic tension headaches, or stress-related insomnia",
      "Frequent feelings of being overwhelmed or unable to cope with daily pressures"
    ],
    tip: "Select 'Yes' if persistent severe emotional or workplace stress is part of your daily routine.",
    impact: "Contributing Factor"
  }
};

const symptomKeys = [
  "Chest_Pain", "Shortness_of_Breath", "Fatigue",
  "Palpitations", "Dizziness", "Pain_Arms_Jaw_Back"
];

const factorKeys = [
  "High_BP", "High_Cholesterol", "Diabetes", "Smoking",
  "Obesity", "Sedentary_Lifestyle", "Family_History", "Chronic_Stress"
];

function updateAsideGuide(featureKey) {
  const item = questionCatalog[featureKey];
  if (!item) return;

  const aside = document.getElementById("qna-aside-guide");
  if (!aside) return;

  const catEl = document.getElementById("guide-category");
  const impactEl = document.getElementById("guide-impact");
  const titleEl = document.getElementById("guide-title");
  const subtitleEl = document.getElementById("guide-subtitle");
  const descEl = document.getElementById("guide-description");
  const tipEl = document.getElementById("guide-tip");
  const signsList = document.getElementById("guide-signs");

  if (catEl) catEl.textContent = item.category;
  if (impactEl) impactEl.textContent = item.impact;
  if (titleEl) titleEl.textContent = item.question;
  if (subtitleEl) subtitleEl.textContent = item.subtitle;
  if (descEl) descEl.textContent = item.description;
  if (tipEl) tipEl.textContent = item.tip;

  if (signsList && item.signs) {
    signsList.innerHTML = item.signs.map(sign => `<li>${sign}</li>`).join("");
  }

  // Highlight active question card
  document.querySelectorAll(".qna-card").forEach(card => {
    if (card.dataset.feature === featureKey) {
      card.classList.add("active");
    } else {
      card.classList.remove("active");
    }
  });
}

function renderQuestionCard(key) {
  const item = questionCatalog[key];
  return `
    <div class="qna-card" data-feature="${key}" tabindex="0">
      <div class="qna-card-main">
        <div class="qna-header">
          <span class="qna-badge">${item.category}</span>
          <span class="qna-number">${item.number}</span>
          <span class="qna-impact-tag">${item.impact}</span>
        </div>
        <h4 class="qna-title">${item.question}</h4>
        <p class="qna-desc">${item.subtitle}</p>
        
        <div class="qna-choice-row">
          <label class="qna-choice-opt no-opt">
            <input type="radio" name="${key}" value="0" checked>
            <span class="qna-choice-box">
              <span class="choice-dot"></span>
              <span class="choice-text">No</span>
            </span>
          </label>

          <label class="qna-choice-opt yes-opt">
            <input type="radio" name="${key}" value="1">
            <span class="qna-choice-box">
              <span class="choice-dot"></span>
              <span class="choice-text">Yes</span>
            </span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function updateAnsweredCount() {
  const form = document.getElementById("risk-form");
  if (!form) return;
  const formData = new FormData(form);
  let count = 0;

  if (formData.get("Age")) count++;
  if (formData.get("Gender") !== null) count++;

  [...symptomKeys, ...factorKeys].forEach(key => {
    if (formData.get(key) !== null) {
      count++;
    }
  });

  const countEl = document.getElementById("answered-count");
  if (countEl) countEl.textContent = count;
}

function setText(id, value, suffix = "%") {
  const el = document.getElementById(id);
  if (el) el.textContent = `${value}${suffix}`;
}

async function loadMetrics() {
  const response = await fetch("/api/metrics");
  const metrics = await response.json();
  setText("accuracy", metrics.accuracy);
  setText("precision", metrics.precision);
  setText("recall", metrics.recall);
  const recEl = document.getElementById("records");
  if (recEl) recEl.textContent = metrics.records.toLocaleString();
  setText("f1", metrics.f1);
  setText("roc_auc", metrics.roc_auc);
  setText("positive_rate", metrics.positive_rate);
}

function showResult(result) {
  const isHighRisk = result.prediction === 1;
  const titleEl = document.getElementById("result-title");
  const badgeEl = document.getElementById("result-badge");
  const riskValEl = document.getElementById("risk-value");
  const noteEl = document.getElementById("result-note");
  const gaugeEl = document.querySelector(".gauge");

  if (titleEl) titleEl.textContent = isHighRisk ? "Elevated Risk Signal" : "Lower Risk Signal";
  if (badgeEl) {
    badgeEl.textContent = isHighRisk ? "HIGH RISK" : "STABLE";
    badgeEl.className = `result-badge ${isHighRisk ? "warning" : "good"}`;
  }
  if (riskValEl) riskValEl.textContent = `${result.risk_probability}%`;
  if (noteEl) {
    noteEl.textContent = isHighRisk
      ? "The clinical model identified an elevated cardiovascular risk pattern. A comprehensive clinical evaluation and preventive review is recommended."
      : "The model detected no elevated cardiovascular risk signal in this profile. Continue routine health screening and healthy lifestyle habits.";
  }
  if (gaugeEl) {
    // 0 to 100% maps to 0 to 180deg
    const deg = Math.min(180, Math.max(0, result.risk_probability * 1.8));
    gaugeEl.style.setProperty("--risk", `${deg}deg`);
  }

  if (window.innerWidth < 900) {
    document.querySelector(".result-panel")?.scrollIntoView({ behavior: "smooth" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const symptomContainer = document.getElementById("symptom-questions");
  if (symptomContainer) {
    symptomContainer.innerHTML = symptomKeys.map(key => renderQuestionCard(key)).join("");
  }

  const factorContainer = document.getElementById("factor-questions");
  if (factorContainer) {
    factorContainer.innerHTML = factorKeys.map(key => renderQuestionCard(key)).join("");
  }

  updateAsideGuide("Chest_Pain");
  updateAnsweredCount();

  document.querySelectorAll(".qna-card").forEach(card => {
    const feature = card.dataset.feature;
    if (!feature) return;

    card.addEventListener("click", () => updateAsideGuide(feature));
    card.addEventListener("focusin", () => updateAsideGuide(feature));
  });

  const form = document.getElementById("risk-form");
  form.addEventListener("change", (e) => {
    updateAnsweredCount();
    const targetCard = e.target.closest(".qna-card");
    if (targetCard && targetCard.dataset.feature) {
      updateAsideGuide(targetCard.dataset.feature);
    }
  });

  const resetBtn = document.getElementById("reset-qna-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      form.reset();
      document.getElementById("input-age").value = "48";
      document.querySelectorAll('input[type="radio"][value="0"]').forEach(r => r.checked = true);
      document.querySelector('input[name="Gender"][value="1"]').checked = true;
      updateAnsweredCount();
      updateAsideGuide("Chest_Pain");
    });
  }

  loadMetrics().catch(() => {
    document.querySelectorAll(".metric-card strong").forEach((el) => el.textContent = "N/A");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = event.currentTarget.querySelector(".submit-btn");
    button.disabled = true;
    button.querySelector("span").textContent = "Calculating Risk...";

    const formData = new FormData(event.currentTarget);
    const payload = {};

    [...symptomKeys, ...factorKeys].forEach((name) => {
      payload[name] = Number(formData.get(name) || 0);
    });
    payload.Age = Number(formData.get("Age") || 48);
    payload.Gender = Number(formData.get("Gender") || 1);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Prediction request failed");
      const result = await response.json();
      showResult(result);
    } catch (error) {
      document.getElementById("result-title").textContent = "Assessment Error";
      document.getElementById("result-note").textContent = error.message;
    } finally {
      button.disabled = false;
      button.querySelector("span").textContent = "Calculate Risk Profile";
    }
  });
});
