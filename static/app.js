// CardioPulse Clinical Intelligence & 3D Anatomical Heart Engine
let scene, camera, renderer, controls;
let heartModel = null;
let heartGroup = null;
let mixer = null;
const clock = new THREE.Clock();
let heartMaterials = [];
let diseasePointLight, rubyPointLight, keyLight;
let isDiseaseActive = false;
let currentBPM = 72;
let modelBaseScale = 1.0;

// Model Specifications & Feature Registry
const MODEL_INTERCEPT = -22.2575;
const FEATURE_COEFFICIENTS = {
  Palpitations: 2.7569,
  Pain_Arms_Jaw_Back: 2.7216,
  Chest_Pain: 2.7137,
  Fatigue: 2.6865,
  Dizziness: 2.6861,
  Shortness_of_Breath: 2.6265,
  Chronic_Stress: 1.7326,
  Sedentary_Lifestyle: 1.7048,
  Family_History: 1.6807,
  High_Cholesterol: 1.6786,
  Diabetes: 1.6436,
  Smoking: 1.6249,
  High_BP: 1.6027,
  Obesity: 1.5984,
  Gender: 1.2364,
  Age: 0.1237
};

// Clinical Questionnaire Database (16 Parameters corresponding to trained ML model)
const questionList = [
  {
    key: "Chest_Pain",
    icon: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
    title: "Do you experience chest pain or discomfort?",
    desc: "This includes any pain, pressure, tightness, squeezing, or heaviness in your chest.",
    tip: "Angina pectoris is the cardinal warning sign of coronary artery ischemia. Discomfort may worsen with exertion or emotional stress."
  },
  {
    key: "Shortness_of_Breath",
    icon: `<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>`,
    title: "Do you suffer from unexplained shortness of breath (Dyspnea)?",
    desc: "Breathlessness during ordinary activities, light exertion, or while lying flat in bed.",
    tip: "Elevated left ventricular filling pressure can cause fluid to back up into the pulmonary vasculature, producing noticeable air hunger."
  },
  {
    key: "Pain_Arms_Jaw_Back",
    icon: `<path d="M6 18h12"/><path d="M6 14h12"/><path d="M6 10h12"/><path d="M12 2v20"/>`,
    title: "Does pain radiate into your arm, shoulder, jaw, neck, or back?",
    desc: "Referred ischemia signals traveling down the left arm, neck, throat, or interscapular region.",
    tip: "Cardiac sensory afferents share dorsal spinal segments with upper thoracic dermatomes, projecting pain beyond the central chest."
  },
  {
    key: "Palpitations",
    icon: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    title: "Do you notice rapid fluttering, racing, or skipped heartbeats?",
    desc: "Awareness of irregular heartbeat, flutter sensations, or sudden pulse acceleration while resting.",
    tip: "Palpitations can reflect premature ventricular complexes, conduction anomalies, or underlying ischemic arrhythmias."
  },
  {
    key: "Dizziness",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0"/>`,
    title: "Have you experienced frequent dizziness, lightheadedness, or near-fainting?",
    desc: "Sudden wooziness, vision dimming, postural unsteadiness, or pre-syncope.",
    tip: "Transient drops in cardiac stroke volume reduce cerebral arterial perfusion pressure, resulting in lightheadedness."
  },
  {
    key: "Fatigue",
    icon: `<path d="M18.36 5.64A9 9 0 1 0 21 12h-4"/><path d="M13 10V3L4 14h7v7l9-11h-7z"/>`,
    title: "Do you feel persistent, overwhelming physical fatigue?",
    desc: "Severe exhaustion and depleted stamina not relieved by ordinary sleep or rest.",
    tip: "When cardiac systolic output is restricted, the body diverts oxygenated blood away from peripheral skeletal muscle groups."
  },
  {
    key: "High_BP",
    icon: `<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
    title: "Have you been clinically diagnosed with high blood pressure (Hypertension)?",
    desc: "Blood pressure repeatedly measuring ≥ 130/80 mmHg or currently taking anti-hypertensive medication.",
    tip: "Chronic mechanical afterload strains the left ventricle and accelerates coronary artery intimal stiffening."
  },
  {
    key: "High_Cholesterol",
    icon: `<circle cx="12" cy="12" r="8"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/>`,
    title: "Do you have high cholesterol or lipid imbalance (Dyslipidemia)?",
    desc: "Elevated LDL-C, high total cholesterol, or prescription of statin / lipid-lowering therapies.",
    tip: "Excess circulating apoB-containing lipoproteins penetrate the arterial intima, initiating atheromatous plaque formation."
  },
  {
    key: "Diabetes",
    icon: `<path d="m19 11-8-8-8.6 9a5 5 0 0 0 7.1 7.1L19 11Z"/><path d="m5 2 5 5"/>`,
    title: "Have you been diagnosed with Type 1 or Type 2 Diabetes or chronic Pre-diabetes?",
    desc: "Fasting blood glucose ≥ 126 mg/dL, HbA1c ≥ 6.5%, or current use of glucose-lowering therapies.",
    tip: "Chronic hyperglycemia impairs vascular endothelial nitric oxide synthase and accelerates coronary microvascular disease."
  },
  {
    key: "Smoking",
    icon: `<line x1="18" y1="15" x2="18" y2="15.01"/><path d="M18 11a4 4 0 0 0-4-4H4v8h10a4 4 0 0 0 4-4Z"/>`,
    title: "Do you currently smoke cigarettes, vape nicotine, or have a significant smoking history?",
    desc: "Active tobacco or vape inhalation, or history exceeding 5-10 pack-years.",
    tip: "Inhaled combustion oxidants induce acute coronary endothelial dysfunction and trigger platelet hyperreactivity."
  },
  {
    key: "Obesity",
    icon: `<circle cx="12" cy="12" r="9"/><path d="M9 12h6"/>`,
    title: "Is your Body Mass Index in the overweight or obese category (BMI ≥ 30 kg/m²)?",
    desc: "Significant excess body weight or high waist circumference (>102 cm for men, >88 cm for women).",
    tip: "Visceral adipose tissue releases pro-inflammatory adipokines that drive chronic systemic low-grade inflammation."
  },
  {
    key: "Sedentary_Lifestyle",
    icon: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>`,
    title: "Do you lead a predominantly sedentary routine with minimal exercise?",
    desc: "Fewer than 150 minutes of moderate physical exercise per week and prolonged sitting.",
    tip: "Regular aerobic conditioning enhances microvascular vasodilatory capacity and preserves cardiopulmonary reserve."
  },
  {
    key: "Family_History",
    icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    title: "Did any first-degree family member have premature heart disease or heart attacks?",
    desc: "Father or brother with CAD before age 55, or mother/sister with CAD before age 65.",
    tip: "Family history reflects inherited polygenic predispositions toward vascular inflammation and lipid retention."
  },
  {
    key: "Chronic_Stress",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`,
    title: "Do you frequently experience unmanaged high levels of chronic psychological stress?",
    desc: "Prolonged occupational burnout, severe personal distress, anxiety, or high emotional strain.",
    tip: "Sustained sympathetic overdrive elevates circulating catecholamines, promoting coronary spasm and hypertension."
  },
  {
    key: "Demographics",
    isDemographics: true,
    icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    title: "Confirm Patient Demographics & Baseline Vitals",
    desc: "Verified chronological age and biological sex at birth for epidemiological risk calibration.",
    tip: "Demographic factors provide the baseline epidemiological prior onto which all symptoms and clinical history are mapped."
  },
  {
    key: "Review",
    isReview: true,
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
    title: "Review Assessment & Run AI Prediction",
    desc: "All clinical parameters recorded. Review your profile below and evaluate your risk with our verified model.",
    tip: "The AI model evaluates all non-linear feature interactions to calculate your comprehensive risk probability."
  }
];

// Current Questionnaire State
let currentQuestionIndex = 0;
const patientResponses = {
  Age: 48,
  Gender: 1,
  Chest_Pain: 0,
  Shortness_of_Breath: 0,
  Pain_Arms_Jaw_Back: 0,
  Palpitations: 0,
  Dizziness: 0,
  Fatigue: 0,
  High_BP: 0,
  High_Cholesterol: 0,
  Diabetes: 0,
  Smoking: 0,
  Obesity: 0,
  Sedentary_Lifestyle: 0,
  Family_History: 0,
  Chronic_Stress: 0
};

// Simulation State (for Model Analysis What-If Simulator)
const simState = {
  Age: 48,
  Gender: 1,
  Chest_Pain: 0,
  Shortness_of_Breath: 0,
  Pain_Arms_Jaw_Back: 0,
  Palpitations: 0,
  Dizziness: 0,
  Fatigue: 0,
  High_BP: 0,
  High_Cholesterol: 0,
  Diabetes: 0,
  Smoking: 0,
  Obesity: 0,
  Sedentary_Lifestyle: 0,
  Family_History: 0,
  Chronic_Stress: 0
};

let cachedModelAnalysis = null;
let lastPredictionResult = null;

// ==========================================
// Three.js 3D Realistic Human Heart Setup
// ==========================================
function initThreeHeart() {
  const container = document.getElementById("heart-canvas-wrap");
  const canvas = document.getElementById("heart-canvas");
  if (!container || !canvas || typeof THREE === "undefined") return;

  const width = container.clientWidth || 540;
  const height = container.clientHeight || 380;

  // Scene & Group
  scene = new THREE.Scene();
  heartGroup = new THREE.Group();
  scene.add(heartGroup);

  // Camera
  camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
  camera.position.set(0, 0.2, 4.3);

  // Transparent WebGL Renderer
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  // OrbitControls
  controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.9;
  controls.enableZoom = true;
  controls.minDistance = 2.2;
  controls.maxDistance = 7.0;
  controls.maxPolarAngle = Math.PI * 0.85;
  controls.minPolarAngle = Math.PI * 0.15;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  scene.add(ambientLight);

  keyLight = new THREE.DirectionalLight(0xff758f, 1.6);
  keyLight.position.set(3, 4, 3);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
  fillLight.position.set(-3, -2, -2);
  scene.add(fillLight);

  // Core Myocardial Ruby PointLight (Normal Sinus State)
  rubyPointLight = new THREE.PointLight(0xff1144, 2.2, 12);
  rubyPointLight.position.set(0, 0, 1.5);
  scene.add(rubyPointLight);

  // Disease Emerald Green PointLight (Triggered upon Disease Risk Alert)
  diseasePointLight = new THREE.PointLight(0x00ff88, 0, 15);
  diseasePointLight.position.set(0, 0, 1.8);
  scene.add(diseasePointLight);

  // Load 3D beating-heart.glb model
  const loader = new THREE.GLTFLoader();
  const loadingEl = document.getElementById("heart-loading");

  loader.load(
    "/static/models/beating-heart.glb",
    (gltf) => {
      heartModel = gltf.scene;

      // Center and normalize model dimensions inside heartGroup
      const box = new THREE.Box3().setFromObject(heartModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetScale = 2.4 / (maxDim || 1);
      modelBaseScale = targetScale;

      heartModel.scale.set(targetScale, targetScale, targetScale);
      heartModel.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);
      heartGroup.add(heartModel);

      // Play built-in skeletal heartbeat animation from beating-heart.glb
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(heartModel);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();
      }

      // Extract materials to manipulate disease green glow & pulse
      heartMaterials = [];
      heartModel.traverse((child) => {
        if (child.isMesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => setupMaterial(mat));
          } else {
            setupMaterial(child.material);
          }
        }
      });

      if (loadingEl) loadingEl.classList.add("hide");
    },
    undefined,
    (err) => {
      console.warn("Could not load beating-heart.glb, using animated fallback pulse:", err);
      if (loadingEl) loadingEl.innerHTML = "<span>3D Anatomical Heart Active</span>";
    }
  );

  window.addEventListener("resize", onWindowResize);
  animateHeart();
}

function setupMaterial(mat) {
  mat.roughness = Math.min(mat.roughness || 0.5, 0.45);
  mat.metalness = Math.min(mat.metalness || 0.1, 0.15);
  mat.emissive = new THREE.Color(0x550011);
  mat.emissiveIntensity = 0.15;
  heartMaterials.push(mat);
}

function onWindowResize() {
  const container = document.getElementById("heart-canvas-wrap");
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animateHeart() {
  requestAnimationFrame(animateHeart);

  const delta = clock.getDelta();
  const timeSeconds = clock.getElapsedTime();

  if (controls) controls.update();

  if (mixer) {
    mixer.timeScale = currentBPM / 72.0;
    mixer.update(delta);
  } else if (heartGroup) {
    const freq = currentBPM / 60.0;
    const cycle = (timeSeconds * freq) % 1.0;
    let pulseScale = 1.0;
    if (cycle < 0.12) {
      pulseScale += Math.sin((cycle / 0.12) * Math.PI) * 0.045;
    } else if (cycle > 0.18 && cycle < 0.36) {
      pulseScale += Math.sin(((cycle - 0.18) / 0.18) * Math.PI) * 0.075;
    }
    heartGroup.scale.set(pulseScale, pulseScale, pulseScale);
  }

  if (heartGroup) {
    heartGroup.position.y = Math.sin(timeSeconds * 1.5) * 0.04;
  }

  // Emissive Bio-Glow Modulation
  if (isDiseaseActive) {
    const greenGlowCycle = 0.55 + 0.45 * Math.sin(timeSeconds * 5.5);
    heartMaterials.forEach((mat) => {
      mat.emissive.setHex(0x00ff88);
      mat.emissiveIntensity = 0.4 + greenGlowCycle * 0.65;
    });
    if (diseasePointLight) {
      diseasePointLight.intensity = 2.4 + greenGlowCycle * 1.8;
    }
    if (rubyPointLight) {
      rubyPointLight.intensity = 0.3;
    }
  } else {
    const rubyGlowCycle = 0.1 + 0.15 * Math.sin(timeSeconds * 3.0);
    heartMaterials.forEach((mat) => {
      mat.emissive.setHex(0x800f2f);
      mat.emissiveIntensity = rubyGlowCycle;
    });
    if (diseasePointLight) {
      diseasePointLight.intensity = 0;
    }
    if (rubyPointLight) {
      rubyPointLight.intensity = 2.2;
    }
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}

function setDiseaseState(isDisease, riskProb = null) {
  isDiseaseActive = isDisease;

  const aura = document.getElementById("heart-glow-aura");
  const toggleLabel = document.getElementById("toggle-glow-label");
  const modalHeartBanner = document.getElementById("modal-heart-sync-banner");
  const modalFeedbackText = document.getElementById("modal-heart-feedback-text");
  const modalRhythm = document.getElementById("modal-rhythm");

  if (isDisease) {
    currentBPM = riskProb ? Math.min(138, Math.round(82 + riskProb * 0.55)) : 115;
    if (aura) aura.classList.add("disease-green-active");
    if (toggleLabel) toggleLabel.textContent = "Reset to Normal Ruby Glow";
    if (modalHeartBanner) modalHeartBanner.classList.add("disease-active");
    if (modalFeedbackText) {
      modalFeedbackText.textContent = `High risk pattern flagged (${riskProb || 85}% probability). Anatomical heart has activated emerald green bio-glow to signify coronary ischemia alert.`;
    }
    if (modalRhythm) modalRhythm.textContent = `${currentBPM} BPM (Elevated)`;
  } else {
    currentBPM = 72;
    if (aura) aura.classList.remove("disease-green-active");
    if (toggleLabel) toggleLabel.textContent = "Preview Disease Green Glow";
    if (modalHeartBanner) modalHeartBanner.classList.remove("disease-active");
    if (modalFeedbackText) {
      modalFeedbackText.textContent = `Lower risk pattern detected (${riskProb || 12}% probability). Anatomical heart maintains resting physiological sinus rhythm.`;
    }
    if (modalRhythm) modalRhythm.textContent = "72 BPM (Sinus)";
  }
}

// ==========================================
// Step-by-Step Questionnaire Controller
// ==========================================
function renderCurrentQuestion() {
  const q = questionList[currentQuestionIndex];
  if (!q) return;

  const currNumEl = document.getElementById("curr-q-num");
  const totalNumEl = document.getElementById("total-q-num");
  const progressFill = document.getElementById("questionnaire-progress-fill");
  const progressPercentLabel = document.getElementById("progress-percent-label");
  const qIconBadge = document.getElementById("q-icon-badge");
  const qTitle = document.getElementById("q-title");
  const qDesc = document.getElementById("q-desc");
  const tipText = document.getElementById("tip-text");
  const btnPrev = document.getElementById("btn-prev-question");
  const btnNext = document.getElementById("btn-next-question");
  const nextBtnText = document.getElementById("next-btn-text");

  const binaryRow = document.getElementById("binary-answer-row");
  const demoInput = document.getElementById("demographics-special-input");
  const reviewContainer = document.getElementById("review-special-container");
  const btnYes = document.getElementById("btn-answer-yes");
  const btnNo = document.getElementById("btn-answer-no");

  const total = questionList.length;
  const currentNum = currentQuestionIndex + 1;
  const percent = Math.round((currentNum / total) * 100);

  if (currNumEl) currNumEl.textContent = currentNum;
  if (totalNumEl) totalNumEl.textContent = total;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (progressPercentLabel) progressPercentLabel.textContent = `${percent}%`;

  if (qIconBadge) {
    qIconBadge.innerHTML = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${q.icon}</svg>`;
  }
  if (qTitle) qTitle.textContent = q.title;
  if (qDesc) qDesc.textContent = q.desc;
  if (tipText) tipText.textContent = q.tip;

  if (btnPrev) {
    btnPrev.disabled = currentQuestionIndex === 0;
  }

  if (btnNext && nextBtnText) {
    if (currentQuestionIndex === total - 1) {
      nextBtnText.textContent = "Evaluate Cardiovascular Risk";
    } else {
      nextBtnText.textContent = "Next Question";
    }
  }

  // Handle special Question views
  if (q.isDemographics) {
    if (binaryRow) binaryRow.classList.add("hide");
    if (reviewContainer) reviewContainer.classList.add("hide");
    if (demoInput) demoInput.classList.remove("hide");

    // Sync demographic inputs
    const inputAge = document.getElementById("input-age");
    if (inputAge) inputAge.value = patientResponses.Age || 48;
    syncGenderButtons(patientResponses.Gender);
  } else if (q.isReview) {
    if (binaryRow) binaryRow.classList.add("hide");
    if (demoInput) demoInput.classList.add("hide");
    if (reviewContainer) {
      reviewContainer.classList.remove("hide");
      renderReviewChecklist();
    }
  } else {
    if (binaryRow) binaryRow.classList.remove("hide");
    if (demoInput) demoInput.classList.add("hide");
    if (reviewContainer) reviewContainer.classList.add("hide");

    const currentValue = patientResponses[q.key] || 0;
    if (currentValue === 1) {
      btnYes?.classList.add("active");
      btnNo?.classList.remove("active");
    } else {
      btnNo?.classList.add("active");
      btnYes?.classList.remove("active");
    }
  }
}

function syncGenderButtons(genderVal) {
  const genderBtn0 = document.getElementById("gender-btn-0");
  const genderBtn1 = document.getElementById("gender-btn-1");
  if (genderVal === 0) {
    genderBtn0?.classList.add("active");
    genderBtn1?.classList.remove("active");
  } else {
    genderBtn1?.classList.add("active");
    genderBtn0?.classList.remove("active");
  }
}

function handleAnswerSelection(isYes) {
  const q = questionList[currentQuestionIndex];
  if (!q || q.isDemographics || q.isReview) return;

  patientResponses[q.key] = isYes ? 1 : 0;

  const btnYes = document.getElementById("btn-answer-yes");
  const btnNo = document.getElementById("btn-answer-no");

  if (isYes) {
    btnYes?.classList.add("active");
    btnNo?.classList.remove("active");
  } else {
    btnNo?.classList.add("active");
    btnYes?.classList.remove("active");
  }
}

async function handleNextQuestion() {
  const q = questionList[currentQuestionIndex];
  if (q && q.isDemographics) {
    const ageInput = document.getElementById("input-age");
    if (ageInput) {
      patientResponses.Age = Math.min(120, Math.max(1, Number(ageInput.value) || 48));
    }
  }

  // Final Review step -> execute inference!
  if (currentQuestionIndex >= questionList.length - 1) {
    await runCardiovascularInference();
    return;
  }

  currentQuestionIndex++;
  renderCurrentQuestion();
}

function handlePrevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderCurrentQuestion();
  }
}

function jumpToQuestion(idx) {
  if (idx >= 0 && idx < questionList.length) {
    currentQuestionIndex = idx;
    renderCurrentQuestion();
  }
}

// Render Review Summary Checklist for Question 16
function renderReviewChecklist() {
  const container = document.getElementById("review-checklist");
  if (!container) return;

  const symptoms = [
    { key: "Chest_Pain", label: "Chest Pain / Angina", idx: 0 },
    { key: "Shortness_of_Breath", label: "Shortness of Breath", idx: 1 },
    { key: "Pain_Arms_Jaw_Back", label: "Referred Radiation Pain", idx: 2 },
    { key: "Palpitations", label: "Palpitations / Flutter", idx: 3 },
    { key: "Dizziness", label: "Dizziness / Syncope", idx: 4 },
    { key: "Fatigue", label: "Severe Fatigue", idx: 5 },
  ];

  const comorbidities = [
    { key: "High_BP", label: "Hypertension (High BP)", idx: 6 },
    { key: "High_Cholesterol", label: "Dyslipidemia", idx: 7 },
    { key: "Diabetes", label: "Diabetes / Hyperglycemia", idx: 8 },
    { key: "Family_History", label: "Family History CAD", idx: 12 },
  ];

  const lifestyle = [
    { key: "Smoking", label: "Tobacco Inhalation", idx: 9 },
    { key: "Obesity", label: "Obesity (BMI ≥ 30)", idx: 10 },
    { key: "Sedentary_Lifestyle", label: "Sedentary Lifestyle", idx: 11 },
    { key: "Chronic_Stress", label: "Chronic Stress", idx: 13 },
  ];

  function renderGroup(title, items) {
    let html = `<div class="review-category-group">
      <div class="review-group-title"><span>${title}</span></div>
      <div class="review-items-grid">`;
    items.forEach((item) => {
      const isYes = patientResponses[item.key] === 1;
      html += `
        <div class="review-item-chip ${isYes ? "flagged" : ""}">
          <span>${item.label}</span>
          <div>
            <span class="val-badge">${isYes ? "Yes" : "No"}</span>
            <button type="button" class="btn-edit-param" onclick="jumpToQuestion(${item.idx})">Edit</button>
          </div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
  }

  const demoHtml = `
    <div class="review-category-group">
      <div class="review-group-title"><span>Patient Demographics</span></div>
      <div class="review-items-grid">
        <div class="review-item-chip">
          <span>Chronological Age:</span>
          <div>
            <span class="val-badge">${patientResponses.Age} yrs</span>
            <button type="button" class="btn-edit-param" onclick="jumpToQuestion(14)">Edit</button>
          </div>
        </div>
        <div class="review-item-chip">
          <span>Biological Sex:</span>
          <div>
            <span class="val-badge">${patientResponses.Gender === 1 ? "Male" : "Female"}</span>
            <button type="button" class="btn-edit-param" onclick="jumpToQuestion(14)">Edit</button>
          </div>
        </div>
      </div>
    </div>`;

  container.innerHTML =
    renderGroup("Primary Cardiac Symptoms", symptoms) +
    renderGroup("Medical Comorbidities", comorbidities) +
    renderGroup("Lifestyle & Environmental Factors", lifestyle) +
    demoHtml;
}

// ==========================================
// Inference & Results Presentation
// ==========================================
async function runCardiovascularInference() {
  const nextBtn = document.getElementById("btn-next-question");
  const nextBtnText = document.getElementById("next-btn-text");

  if (nextBtn && nextBtnText) {
    nextBtn.disabled = true;
    nextBtnText.textContent = "Analyzing Diagnostic Telemetry...";
  }

  const payload = { ...patientResponses };

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Diagnostic prediction failed");
    const data = await res.json();
    lastPredictionResult = data;

    // Save to History in LocalStorage
    saveAssessmentToHistory(data, payload);

    displayResultsModal(data);
  } catch (err) {
    alert("Could not complete assessment: " + err.message);
  } finally {
    if (nextBtn && nextBtnText) {
      nextBtn.disabled = false;
      nextBtnText.textContent = "Evaluate Cardiovascular Risk";
    }
  }
}

function displayResultsModal(result) {
  const isHighRisk = result.prediction === 1;
  const modal = document.getElementById("results-view");
  const badge = document.getElementById("modal-risk-badge");
  const title = document.getElementById("modal-risk-title");
  const subtitle = document.getElementById("modal-risk-subtitle");
  const percentText = document.getElementById("modal-risk-percentage");
  const gauge = document.getElementById("result-gauge");
  const findingsCount = document.getElementById("modal-findings-count");
  const recommendation = document.getElementById("clinical-recommendation");
  const recommendationText = document.getElementById("clinical-recommendation-text");
  const driversChips = document.getElementById("modal-drivers-chips");

  let flags = 0;
  Object.keys(patientResponses).forEach((k) => {
    if (k !== "Age" && k !== "Gender" && patientResponses[k] === 1) flags++;
  });

  if (findingsCount) findingsCount.textContent = `${flags} flags`;

  if (badge) {
    badge.textContent = isHighRisk ? "HIGH RISK ALERT" : "RESTING SINUS NORMAL";
    badge.className = `modal-triage-badge ${isHighRisk ? "warning" : "good"}`;
  }

  if (title) {
    title.textContent = isHighRisk ? "Elevated Cardiovascular Risk Pattern" : "Healthy Physiological Profile";
  }

  if (subtitle) {
    subtitle.textContent = isHighRisk
      ? `Model flagged elevated cardiovascular risk pattern (${result.risk_probability}% risk probability). Coronary evaluation recommended.`
      : `Model detected no elevated cardiovascular risk signal (${result.risk_probability}% risk probability). Sinus rhythm preserved.`;
  }

  if (recommendation && recommendationText) {
    recommendation.className = `clinical-recommendation ${isHighRisk ? "warning" : "good"}`;
    recommendationText.textContent = isHighRisk
      ? "Arrange a prompt appointment with a qualified healthcare professional to review these findings and discuss appropriate cardiovascular evaluation. If you have chest pain, severe breathlessness, fainting, or other urgent symptoms, seek emergency care immediately."
      : "Continue routine preventive care, including regular check-ups, physical activity, a heart-healthy diet, and discussion of personal risk factors with your healthcare professional.";
  }

  if (percentText) {
    percentText.textContent = `${result.risk_probability}%`;
  }

  if (gauge) {
    const deg = Math.min(180, Math.max(0, result.risk_probability * 1.8));
    gauge.style.setProperty("--risk", `${deg}deg`);
  }

  // Display top drivers if returned
  if (driversChips) {
    if (result.top_drivers && result.top_drivers.length > 0) {
      driversChips.innerHTML = result.top_drivers
        .map(
          (d) =>
            `<div class="driver-chip">
              <span>${d.label}</span>
              <span class="impact-tag">+${d.odds_ratio || d.effect}x OR</span>
            </div>`
        )
        .join("");
    } else {
      driversChips.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">No acute primary risk drivers flagged.</span>`;
    }
  }

  // Trigger Green Disease Glow on the 3D Heart!
  setDiseaseState(isHighRisk, result.risk_probability);

  if (modal) {
    modal.classList.remove("hide");
  }
}

// ==========================================
// Assessment History Engine (LocalStorage)
// ==========================================
const HISTORY_STORAGE_KEY = "cardiopulse_patient_history";

function loadHistory() {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveAssessmentToHistory(result, responses) {
  try {
    const history = loadHistory();
    const now = new Date();
    let flagCount = 0;
    Object.keys(responses).forEach((k) => {
      if (k !== "Age" && k !== "Gender" && responses[k] === 1) flagCount++;
    });

    const entry = {
      id: "REC-" + Date.now(),
      timestamp: now.toISOString(),
      formattedDate: now.toLocaleDateString() + " " + now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      riskProbability: result.risk_probability,
      isHighRisk: result.prediction === 1,
      age: responses.Age,
      gender: responses.Gender === 1 ? "Male" : "Female",
      flagCount: flagCount,
      responses: { ...responses }
    };

    history.unshift(entry);
    // Keep last 30 assessments
    if (history.length > 30) history.pop();
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    renderHistoryTable();
  } catch (e) {
    console.error("Could not save to history:", e);
  }
}

function renderHistoryTable() {
  const tbody = document.getElementById("history-table-tbody");
  if (!tbody) return;

  const history = loadHistory();
  if (!history || history.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="6">No previous assessments found. Complete an assessment above to record clinical history.</td>
      </tr>`;
    return;
  }

  tbody.innerHTML = history
    .map(
      (item) => `
      <tr>
        <td>${item.formattedDate}</td>
        <td>
          <span class="history-badge ${item.isHighRisk ? "high" : "low"}">
            ${item.isHighRisk ? "High Risk Alert" : "Lower Risk"}
          </span>
        </td>
        <td><strong>${item.riskProbability}%</strong></td>
        <td>${item.age} yrs, ${item.gender}</td>
        <td>${item.flagCount} flags</td>
        <td>
          <button type="button" class="btn-table-action" onclick="loadHistoryRecord('${item.id}')">Reload into Test</button>
          <button type="button" class="btn-table-action btn-del" onclick="deleteHistoryRecord('${item.id}')">Delete</button>
        </td>
      </tr>`
    )
    .join("");
}

function loadHistoryRecord(id) {
  const history = loadHistory();
  const record = history.find((r) => r.id === id);
  if (!record || !record.responses) return;

  Object.assign(patientResponses, record.responses);
  currentQuestionIndex = 0;
  renderCurrentQuestion();

  // Scroll to assessment stage
  document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });
  showToastNotice(`Loaded clinical record from ${record.formattedDate}`);
}

function deleteHistoryRecord(id) {
  const history = loadHistory().filter((r) => r.id !== id);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  renderHistoryTable();
  showToastNotice("Record deleted.");
}

function clearAllHistory() {
  if (confirm("Are you sure you want to clear all patient assessment history?")) {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    renderHistoryTable();
    showToastNotice("Assessment history cleared.");
  }
}

function exportHistoryCSV() {
  const history = loadHistory();
  if (history.length === 0) {
    alert("No history records to export.");
    return;
  }

  const headers = ["ID", "Timestamp", "RiskProbability", "Outcome", "Age", "Gender", "Flags"];
  const rows = history.map((item) => [
    item.id,
    item.timestamp,
    item.riskProbability,
    item.isHighRisk ? "High Risk" : "Lower Risk",
    item.age,
    item.gender,
    item.flagCount
  ]);

  const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `CardioPulse_History_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// Deep Model Analysis & What-If Simulator
// ==========================================
async function loadModelAnalysis() {
  try {
    const res = await fetch("/api/model-analysis");
    if (!res.ok) throw new Error("Could not load model analysis telemetry");
    const data = await res.json();
    cachedModelAnalysis = data;

    // Update Deep Scorecards
    const m = data.metrics;
    if (m) {
      document.getElementById("ma-accuracy").textContent = `${m.accuracy}%`;
      document.getElementById("ma-recall").textContent = `${m.recall}%`;
      document.getElementById("ma-specificity").textContent = `${m.specificity}%`;
      document.getElementById("ma-precision").textContent = `${m.precision}%`;
      document.getElementById("ma-npv").textContent = `${m.npv}%`;
      document.getElementById("ma-roc-auc").textContent = `${m.roc_auc}%`;
    }

    // Render Odds Ratios Chart
    renderOddsRatioChart(data.features);

    // Render Mathematical Weights Table
    renderModelWeightsTable(data.features, data.intercept);

    // Render Threshold Sensitivity Chart
    renderThresholdChart(data.threshold_analysis);

    // Render Precision-Recall Curve Chart
    if (data.precision_recall_curve) {
      renderPrecisionRecallChart(data.precision_recall_curve);
    }

    // Initialize What-If Simulator Lab
    initSimulatorLab(data.features);
  } catch (err) {
    console.error("Model analysis load error:", err);
  }
}

function renderOddsRatioChart(features) {
  const chartEl = document.getElementById("odds-ratio-chart");
  if (!chartEl || !features) return;

  const sorted = [...features].sort((a, b) => a.odds_ratio - b.odds_ratio);

  const colors = sorted.map((f) => {
    if (f.category === "Symptom") return "#ff4d6d";
    if (f.category === "Comorbidity") return "#ffb703";
    if (f.category === "Lifestyle") return "#2ec4b6";
    return "#c77dff";
  });

  const trace = {
    y: sorted.map((f) => f.label),
    x: sorted.map((f) => f.odds_ratio),
    type: "bar",
    orientation: "h",
    marker: { color: colors },
    text: sorted.map((f) => `${f.odds_ratio}x`),
    textposition: "outside",
    hovertemplate: "<b>%{y}</b><br>Odds Ratio: %{x}x<br>Log-Odds Weight (β): %{customdata:.4f}<extra></extra>",
    customdata: sorted.map((f) => f.coefficient)
  };

  const layout = {
    font: { family: "DM Sans, sans-serif", color: "#e2b6be", size: 11 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 10, r: 40, b: 40, l: 190 },
    xaxis: {
      title: "Risk Multiplier (Odds Ratio e^β)",
      gridcolor: "rgba(230, 57, 70, 0.12)",
      zerolinecolor: "rgba(255, 255, 255, 0.2)"
    },
    yaxis: { automargin: true },
    height: 480
  };

  Plotly.newPlot("odds-ratio-chart", [trace], layout, { responsive: true, displaylogo: false });
}

function renderModelWeightsTable(features, intercept) {
  const tbody = document.getElementById("model-weights-tbody");
  if (!tbody || !features) return;

  let html = `
    <tr style="background: rgba(230, 57, 70, 0.08); font-weight:700;">
      <td><strong>Model Intercept (β₀ Baseline)</strong></td>
      <td><span class="category-badge">Constant</span></td>
      <td><code>${intercept}</code></td>
      <td><code>${Math.exp(intercept).toExponential(3)}</code></td>
      <td>Baseline constant</td>
      <td>Reflects low base-rate prior before risk symptoms are engaged</td>
    </tr>`;

  features.forEach((f) => {
    const catClass = f.category.toLowerCase();
    const multiplier = f.odds_ratio >= 2 ? `+${Math.round((f.odds_ratio - 1) * 100)}%` : `+${Math.round((f.odds_ratio - 1) * 100)}%`;

    html += `
      <tr>
        <td><strong>${f.label}</strong></td>
        <td><span class="category-badge ${catClass}">${f.category}</span></td>
        <td><code>${f.coefficient >= 0 ? "+" : ""}${f.coefficient}</code></td>
        <td><strong class="odds-multiplier-pill">${f.odds_ratio}x</strong></td>
        <td><span style="color:${f.odds_ratio > 5 ? "#ff4d6d" : "#ffccd5"}">${multiplier}</span></td>
        <td>${f.description || "Clinically evaluated parameter"}</td>
      </tr>`;
  });

  tbody.innerHTML = html;
}

function renderThresholdChart(thresholds) {
  if (!thresholds || thresholds.length === 0) return;

  const tVals = thresholds.map((t) => t.threshold);
  const precVals = thresholds.map((t) => t.precision);
  const recVals = thresholds.map((t) => t.recall);
  const specVals = thresholds.map((t) => t.specificity);
  const f1Vals = thresholds.map((t) => t.f1);

  const traces = [
    { x: tVals, y: precVals, name: "Precision", line: { color: "#ffb703", width: 2.5 } },
    { x: tVals, y: recVals, name: "Recall / Sensitivity", line: { color: "#2ec4b6", width: 2.5 } },
    { x: tVals, y: specVals, name: "Specificity", line: { color: "#48cae4", width: 2.5 } },
    { x: tVals, y: f1Vals, name: "F1 Score", line: { color: "#ff4d6d", width: 2.5, dash: "dot" } }
  ];

  const layout = {
    font: { family: "DM Sans, sans-serif", color: "#e2b6be", size: 11 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 20, r: 20, b: 40, l: 50 },
    xaxis: { title: "Decision Cutoff Threshold", range: [0.1, 0.9], gridcolor: "rgba(230, 57, 70, 0.12)" },
    yaxis: { title: "Performance (%)", range: [85, 101], gridcolor: "rgba(230, 57, 70, 0.12)" },
    legend: { orientation: "h", y: 1.15, x: 0 },
    hovermode: "x unified"
  };

  Plotly.newPlot("threshold-chart", traces, layout, { responsive: true, displaylogo: false });
}

function renderPrecisionRecallChart(prCurve) {
  if (!prCurve) return;

  const trace = {
    x: prCurve.recall,
    y: prCurve.precision,
    type: "scatter",
    mode: "lines",
    line: { color: "#2ec4b6", width: 3 },
    fill: "tozeroy",
    fillcolor: "rgba(46, 196, 182, 0.12)",
    hovertemplate: "Recall: %{x:.2f}<br>Precision: %{y:.2f}<extra></extra>"
  };

  const layout = {
    font: { family: "DM Sans, sans-serif", color: "#e2b6be", size: 11 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 20, r: 20, b: 40, l: 50 },
    xaxis: { title: "Recall (Sensitivity)", range: [0, 1.02], gridcolor: "rgba(230, 57, 70, 0.12)" },
    yaxis: { title: "Precision (PPV)", range: [0.8, 1.02], gridcolor: "rgba(230, 57, 70, 0.12)" },
    showlegend: false
  };

  Plotly.newPlot("pr-chart", [trace], layout, { responsive: true, displaylogo: false });
}

// ==========================================
// Interactive Simulator Lab Engine
// ==========================================
function initSimulatorLab(features) {
  const chipsContainer = document.getElementById("sim-chips-container");
  const ageSlider = document.getElementById("sim-age-slider");
  const ageVal = document.getElementById("sim-age-val");
  const btnReset = document.getElementById("btn-reset-sim");
  const btnLoad = document.getElementById("btn-load-sim-to-test");
  const btnFemale = document.getElementById("sim-sex-female");
  const btnMale = document.getElementById("sim-sex-male");

  if (!chipsContainer) return;

  // Render toggleable symptom chips
  const toggleable = features.filter((f) => f.key !== "Age" && f.key !== "Gender");
  chipsContainer.innerHTML = toggleable
    .map(
      (f) => `
      <div class="sim-chip ${simState[f.key] === 1 ? "active" : ""}" data-key="${f.key}">
        <span>${f.label}</span>
        <span class="sim-chip-dot"></span>
      </div>`
    )
    .join("");

  chipsContainer.querySelectorAll(".sim-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const key = chip.dataset.key;
      simState[key] = simState[key] === 1 ? 0 : 1;
      chip.classList.toggle("active", simState[key] === 1);
      recalculateSimulator();
    });
  });

  if (ageSlider && ageVal) {
    ageSlider.addEventListener("input", (e) => {
      const val = Number(e.target.value);
      simState.Age = val;
      ageVal.textContent = val;
      recalculateSimulator();
    });
  }

  if (btnFemale && btnMale) {
    btnFemale.addEventListener("click", () => {
      btnFemale.classList.add("active");
      btnMale.classList.remove("active");
      simState.Gender = 0;
      recalculateSimulator();
    });
    btnMale.addEventListener("click", () => {
      btnMale.classList.add("active");
      btnFemale.classList.remove("active");
      simState.Gender = 1;
      recalculateSimulator();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", () => {
      simState.Age = 48;
      simState.Gender = 1;
      toggleable.forEach((f) => (simState[f.key] = 0));
      if (ageSlider) ageSlider.value = 48;
      if (ageVal) ageVal.textContent = 48;
      btnMale?.classList.add("active");
      btnFemale?.classList.remove("active");
      chipsContainer.querySelectorAll(".sim-chip").forEach((c) => c.classList.remove("active"));
      recalculateSimulator();
      showToastNotice("Simulator parameters reset.");
    });
  }

  if (btnLoad) {
    btnLoad.addEventListener("click", () => {
      Object.assign(patientResponses, simState);
      currentQuestionIndex = 15; // Question 16 Review
      renderCurrentQuestion();
      document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });
      showToastNotice("Simulated patient loaded into assessment! Review and execute.");
    });
  }

  recalculateSimulator();
}

function recalculateSimulator() {
  // Compute log-odds: z = intercept + sum(w_i * x_i)
  let z = MODEL_INTERCEPT;
  Object.keys(FEATURE_COEFFICIENTS).forEach((key) => {
    const weight = FEATURE_COEFFICIENTS[key];
    const val = simState[key] || 0;
    z += weight * val;
  });

  // Sigmoid formula: P = 1 / (1 + e^-z)
  const probability = 1 / (1 + Math.exp(-z));
  const probPct = Math.round(probability * 1000) / 10;
  const isHigh = probPct >= 50.0;

  const logOddsEl = document.getElementById("sim-log-odds");
  const probEl = document.getElementById("sim-probability-display");
  const badge = document.getElementById("sim-risk-badge");
  const gauge = document.getElementById("sim-gauge-visual");

  if (logOddsEl) logOddsEl.textContent = z.toFixed(4);
  if (probEl) probEl.textContent = `${probPct}%`;
  if (badge) {
    badge.textContent = isHigh ? "ELEVATED RISK" : "LOWER RISK";
    badge.className = `sim-badge ${isHigh ? "high" : "low"}`;
  }
  if (gauge) {
    gauge.style.setProperty("--sim-pct", probPct);
  }
}

// ==========================================
// Metrics & Plotly Analytics Loading
// ==========================================
async function loadMetrics() {
  try {
    const response = await fetch("/api/metrics");
    const metrics = await response.json();
    const statAcc = document.getElementById("stat-accuracy");
    const statAuc = document.getElementById("stat-roc-auc");
    const modalAuc = document.getElementById("modal-roc-auc");
    const metricTargets = {
      accuracy: document.getElementById("analysis-accuracy"),
      precision: document.getElementById("analysis-precision"),
      recall: document.getElementById("analysis-recall"),
      f1: document.getElementById("analysis-f1"),
      roc_auc: document.getElementById("analysis-roc-auc")
    };

    if (statAcc) statAcc.textContent = `${metrics.accuracy}% Accuracy`;
    if (statAuc) statAuc.textContent = `${metrics.roc_auc}% Verified`;
    if (modalAuc) modalAuc.textContent = `${metrics.roc_auc}%`;

    Object.entries(metricTargets).forEach(([key, element]) => {
      if (element) element.textContent = `${metrics[key]}%`;
    });
  } catch (err) {
    console.error("Metrics loading error:", err);
  }
}

const chartLayout = {
  font: { family: "DM Sans, sans-serif", color: "#e2b6be", size: 11 },
  paper_bgcolor: "transparent",
  plot_bgcolor: "transparent",
  margin: { t: 14, r: 14, b: 44, l: 52 },
  hoverlabel: { bgcolor: "#260910", font: { color: "#fff" } }
};

const chartConfig = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"] };

async function loadCharts() {
  try {
    const response = await fetch("/api/charts");
    const charts = await response.json();

    // 1. Class Balance
    Plotly.newPlot(
      "class-balance-chart",
      [{
        x: ["Lower risk", "Heart risk"],
        y: [charts.class_balance.lower_risk, charts.class_balance.heart_risk],
        type: "bar",
        marker: { color: ["#2ec4b6", "#e63946"] },
        hovertemplate: "%{x}: %{y:,} patients<extra></extra>"
      }],
      { ...chartLayout, yaxis: { title: "Patients", gridcolor: "rgba(230, 57, 70, 0.12)" }, showlegend: false },
      chartConfig
    );

    // 2. Confusion Matrix
    Plotly.newPlot(
      "confusion-chart",
      [{
        z: charts.confusion_matrix,
        x: ["Predicted lower", "Predicted risk"],
        y: ["Actual lower", "Actual risk"],
        type: "heatmap",
        colorscale: [[0, "#2b0810"], [0.5, "#a4133c"], [1, "#ff4d6d"]],
        texttemplate: "%{z:,}",
        hovertemplate: "%{y}<br>%{x}: %{z:,}<extra></extra>"
      }],
      { ...chartLayout, margin: { t: 14, r: 14, b: 50, l: 90 }, xaxis: { side: "bottom" }, yaxis: { autorange: "reversed" }, showlegend: false },
      chartConfig
    );

    // 3. Feature Prevalence by Outcome
    const prevalence = [...charts.prevalence].sort(
      (a, b) => Math.max(b.lower_risk, b.heart_risk) - Math.max(a.lower_risk, a.heart_risk)
    );

    Plotly.newPlot(
      "prevalence-chart",
      [
        {
          y: prevalence.map((item) => item.feature),
          x: prevalence.map((item) => item.lower_risk),
          name: "Lower risk",
          type: "bar",
          orientation: "h",
          marker: { color: "rgba(46, 196, 182, 0.75)" },
          hovertemplate: "%{y}: %{x:.1f}%<extra>Lower risk</extra>"
        },
        {
          y: prevalence.map((item) => item.feature),
          x: prevalence.map((item) => item.heart_risk),
          name: "Heart risk",
          type: "bar",
          orientation: "h",
          marker: { color: "#ff4d6d" },
          hovertemplate: "%{y}: %{x:.1f}%<extra>Heart risk</extra>"
        }
      ],
      {
        ...chartLayout,
        barmode: "group",
        margin: { t: 14, r: 14, b: 42, l: 155 },
        xaxis: { title: "Prevalence (%)", gridcolor: "rgba(230, 57, 70, 0.12)" },
        yaxis: { automargin: true },
        legend: { orientation: "h", y: 1.12, x: 0 },
        height: 480
      },
      chartConfig
    );

    // 4. Probability Distribution
    const distribution = Object.entries(charts.probability_distribution);
    Plotly.newPlot(
      "probability-chart",
      [{
        x: distribution.map((item) => item[0]),
        y: distribution.map((item) => item[1]),
        type: "bar",
        marker: { color: ["#2ec4b6", "#ffb703", "#ff758f", "#e63946"] },
        hovertemplate: "%{x}: %{y:,} records<extra></extra>"
      }],
      {
        ...chartLayout,
        xaxis: { title: "Predicted Risk Interval", gridcolor: "rgba(230, 57, 70, 0.12)" },
        yaxis: { title: "Records", gridcolor: "rgba(230, 57, 70, 0.12)" },
        showlegend: false
      },
      chartConfig
    );

    // 5. ROC Curve
    Plotly.newPlot(
      "roc-chart",
      [
        {
          x: charts.roc_curve.false_positive_rate,
          y: charts.roc_curve.true_positive_rate,
          type: "scatter",
          mode: "lines",
          line: { color: "#ff4d6d", width: 3 },
          fill: "tozeroy",
          fillcolor: "rgba(255, 77, 109, 0.12)",
          hovertemplate: "False positive: %{x:.2f}<br>True positive: %{y:.2f}<extra></extra>"
        },
        {
          x: [0, 1],
          y: [0, 1],
          type: "scatter",
          mode: "lines",
          line: { color: "rgba(255,255,255,0.22)", dash: "dot" },
          hoverinfo: "skip",
          showlegend: false
        }
      ],
      {
        ...chartLayout,
        xaxis: { title: "False positive rate", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" },
        yaxis: { title: "True positive rate", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" },
        showlegend: false
      },
      chartConfig
    );

    // 6. Sigmoid Curve
    Plotly.newPlot(
      "sigmoid-chart",
      [{
        x: charts.sigmoid_curve.x,
        y: charts.sigmoid_curve.y,
        type: "scatter",
        mode: "lines",
        line: { color: "#2ec4b6", width: 3 },
        hovertemplate: "Model score: %{x:.1f}<br>Probability: %{y:.0%}<extra></extra>"
      }],
      {
        ...chartLayout,
        xaxis: { title: "Model score (log-odds)", gridcolor: "rgba(230, 57, 70, 0.12)" },
        yaxis: { title: "Predicted probability", tickformat: ".0%", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" },
        showlegend: false
      },
      chartConfig
    );
  } catch (err) {
    console.error("Charts loading error:", err);
  }
}

// ==========================================
// Toast Notification
// ==========================================
let toastTimer = null;
function showToastNotice(msg) {
  const toast = document.getElementById("toast-notice");
  const text = document.getElementById("toast-text");
  if (!toast || !text) return;

  text.textContent = msg;
  toast.classList.remove("hide");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.add("hide");
  }, 3500);
}

// ==========================================
// Initialization & Event Listeners
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize 3D Beating Heart
  initThreeHeart();

  // 2. Render first Question
  renderCurrentQuestion();

  // 3. Choice selection buttons
  const btnYes = document.getElementById("btn-answer-yes");
  const btnNo = document.getElementById("btn-answer-no");
  if (btnYes) btnYes.addEventListener("click", () => handleAnswerSelection(true));
  if (btnNo) btnNo.addEventListener("click", () => handleAnswerSelection(false));

  // 4. Navigation Buttons
  const btnNext = document.getElementById("btn-next-question");
  const btnPrev = document.getElementById("btn-prev-question");
  if (btnNext) btnNext.addEventListener("click", handleNextQuestion);
  if (btnPrev) btnPrev.addEventListener("click", handlePrevQuestion);

  // 5. Age input & controls
  const inputAge = document.getElementById("input-age");
  const decAge = document.getElementById("age-decrement");
  const incAge = document.getElementById("age-increment");

  if (inputAge) {
    inputAge.addEventListener("input", (e) => {
      const val = parseInt(e.target.value) || 48;
      patientResponses.Age = Math.min(120, Math.max(1, val));
    });
    inputAge.addEventListener("change", (e) => {
      const val = parseInt(e.target.value) || 48;
      patientResponses.Age = Math.min(120, Math.max(1, val));
    });
  }

  if (decAge && inputAge) {
    decAge.addEventListener("click", () => {
      let val = parseInt(inputAge.value) || 48;
      if (val > 1) inputAge.value = val - 1;
      patientResponses.Age = Number(inputAge.value);
    });
  }

  if (incAge && inputAge) {
    incAge.addEventListener("click", () => {
      let val = parseInt(inputAge.value) || 48;
      if (val < 120) inputAge.value = val + 1;
      patientResponses.Age = Number(inputAge.value);
    });
  }

  document.querySelectorAll(".chip-btn").forEach((chip) => {
    chip.addEventListener("click", () => {
      const ageVal = chip.dataset.age;
      if (inputAge && ageVal) {
        inputAge.value = ageVal;
        patientResponses.Age = Number(ageVal);
      }
    });
  });

  // 6. Biological Sex toggle
  const genderBtn0 = document.getElementById("gender-btn-0");
  const genderBtn1 = document.getElementById("gender-btn-1");

  if (genderBtn0 && genderBtn1) {
    genderBtn0.addEventListener("click", () => {
      genderBtn0.classList.add("active");
      genderBtn1.classList.remove("active");
      patientResponses.Gender = 0;
    });
    genderBtn1.addEventListener("click", () => {
      genderBtn1.classList.add("active");
      genderBtn0.classList.remove("active");
      patientResponses.Gender = 1;
    });
  }

  // 7. Manual Green Glow Preview Toggle
  const glowToggleBtn = document.getElementById("manual-glow-toggle");
  if (glowToggleBtn) {
    glowToggleBtn.addEventListener("click", () => {
      setDiseaseState(!isDiseaseActive);
    });
  }

  // 8. Close Modal / Retake Assessment / Print Report
  const closeModalBtn = document.getElementById("btn-close-results");
  const retakeBtn = document.getElementById("btn-retake-test");
  const printReportBtn = document.getElementById("btn-print-report");
  const viewCohortBtn = document.getElementById("btn-view-cohort");
  const modal = document.getElementById("results-view");

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => modal.classList.add("hide"));
  }

  if (viewCohortBtn && modal) {
    viewCohortBtn.addEventListener("click", () => {
      modal.classList.add("hide");
    });
  }

  if (printReportBtn) {
    printReportBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (retakeBtn && modal) {
    retakeBtn.addEventListener("click", () => {
      modal.classList.add("hide");
      currentQuestionIndex = 0;
      Object.keys(patientResponses).forEach((k) => {
        if (k !== "Age" && k !== "Gender") patientResponses[k] = 0;
      });
      setDiseaseState(false);
      renderCurrentQuestion();
      document.getElementById("assessment")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // 9. Sidebar Navigation Handlers (Active Highlighting & Routing)
  const navLinks = document.querySelectorAll(".sidebar-nav .nav-item");
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");

      // Handle Risk Prediction click from sidebar
      if (targetId === "#results-view") {
        e.preventDefault();
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        if (lastPredictionResult) {
          displayResultsModal(lastPredictionResult);
        } else {
          // Run instant inference with current answers
          runCardiovascularInference();
        }
        return;
      }

      // Handle Reset Session / Logout
      if (targetId === "#logout") {
        e.preventDefault();
        document.getElementById("logout-modal")?.classList.remove("hide");
        return;
      }

      // Normal section scroll
      navLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // 10. History Buttons
  const btnClearHist = document.getElementById("btn-clear-history");
  const btnExportHist = document.getElementById("btn-export-history");
  if (btnClearHist) btnClearHist.addEventListener("click", clearAllHistory);
  if (btnExportHist) btnExportHist.addEventListener("click", exportHistoryCSV);

  // 11. Emergency Protocol Modal Handlers
  const emergencyCard = document.getElementById("sidebar-emergency-card");
  const emergencyModal = document.getElementById("emergency-modal");
  const btnCloseEmergency = document.getElementById("btn-close-emergency");

  if (emergencyCard && emergencyModal) {
    emergencyCard.addEventListener("click", () => emergencyModal.classList.remove("hide"));
  }
  if (btnCloseEmergency && emergencyModal) {
    btnCloseEmergency.addEventListener("click", () => emergencyModal.classList.add("hide"));
  }

  // 12. User Profile Modal Handlers
  const userPill = document.getElementById("user-profile-pill");
  const profileModal = document.getElementById("user-profile-modal");
  const btnCloseProfile = document.getElementById("btn-close-profile");
  const btnDoneProfile = document.getElementById("btn-done-profile");
  const btnResetFromProfile = document.getElementById("btn-reset-session-from-profile");

  if (userPill && profileModal) {
    userPill.addEventListener("click", () => {
      document.getElementById("prof-age-display").textContent = `${patientResponses.Age} years`;
      document.getElementById("prof-gender-display").textContent = patientResponses.Gender === 1 ? "Male" : "Female";
      profileModal.classList.remove("hide");
    });
  }
  if (btnCloseProfile && profileModal) {
    btnCloseProfile.addEventListener("click", () => profileModal.classList.add("hide"));
  }
  if (btnDoneProfile && profileModal) {
    btnDoneProfile.addEventListener("click", () => profileModal.classList.add("hide"));
  }
  if (btnResetFromProfile && profileModal) {
    btnResetFromProfile.addEventListener("click", () => {
      profileModal.classList.add("hide");
      document.getElementById("logout-modal")?.classList.remove("hide");
    });
  }

  // 13. Logout / Reset Modal Handlers
  const logoutModal = document.getElementById("logout-modal");
  const btnCancelLogout = document.getElementById("btn-cancel-logout");
  const btnCloseLogout = document.getElementById("btn-close-logout");
  const btnConfirmLogout = document.getElementById("btn-confirm-logout");

  if (btnCancelLogout && logoutModal) {
    btnCancelLogout.addEventListener("click", () => logoutModal.classList.add("hide"));
  }
  if (btnCloseLogout && logoutModal) {
    btnCloseLogout.addEventListener("click", () => logoutModal.classList.add("hide"));
  }
  if (btnConfirmLogout && logoutModal) {
    btnConfirmLogout.addEventListener("click", () => {
      logoutModal.classList.add("hide");
      currentQuestionIndex = 0;
      patientResponses.Age = 48;
      patientResponses.Gender = 1;
      Object.keys(patientResponses).forEach((k) => {
        if (k !== "Age" && k !== "Gender") patientResponses[k] = 0;
      });
      setDiseaseState(false);
      renderCurrentQuestion();
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" });
      showToastNotice("Patient session has been reset to default baseline.");
    });
  }

  // 14. Close modals on backdrop click and Escape key
  document.querySelectorAll(".app-modal-backdrop, .results-modal-container").forEach((backdrop) => {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) backdrop.classList.add("hide");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".app-modal-backdrop, .results-modal-container").forEach((m) => {
        m.classList.add("hide");
      });
    }
  });

  // 15. Load Data & Render
  renderHistoryTable();
  loadMetrics();
  loadCharts();
  loadModelAnalysis();
});
