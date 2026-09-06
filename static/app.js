// HeartGuard Clinical Intelligence & 3D Anatomical Heart Engine
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
const API_BASE = "http://127.0.0.1:8000";

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
    tip: "Elevated left ventricular pressure can cause fluid to back up into the lungs, producing noticeable air hunger."
  },
  {
    key: "Pain_Arms_Jaw_Back",
    icon: `<path d="M6 18h12"/><path d="M6 14h12"/><path d="M6 10h12"/><path d="M12 2v20"/>`,
    title: "Does pain radiate into your arm, shoulder, jaw, neck, or back?",
    desc: "Referred ischemia signals traveling down the left arm, neck, throat, or interscapular region.",
    tip: "Cardiac sensory nerves share spinal segments with upper body dermatomes, projecting pain beyond the central chest."
  },
  {
    key: "Palpitations",
    icon: `<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>`,
    title: "Do you notice rapid fluttering, racing, or skipped heartbeats?",
    desc: "Awareness of irregular heartbeat, flutter sensations, or sudden pulse acceleration while resting.",
    tip: "Palpitations can reflect premature ventricular contractions, ectopic beats, or underlying arrhythmias."
  },
  {
    key: "Dizziness",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0"/>`,
    title: "Have you experienced frequent dizziness, lightheadedness, or near-fainting?",
    desc: "Sudden wooziness, vision dimming, unsteadiness, or postural near-syncope.",
    tip: "Transient drops in cardiac stroke volume reduce cerebral arterial perfusion pressure."
  },
  {
    key: "Fatigue",
    icon: `<path d="M18.36 5.64A9 9 0 1 0 21 12h-4"/><path d="M13 10V3L4 14h7v7l9-11h-7z"/>`,
    title: "Do you feel persistent, overwhelming physical fatigue?",
    desc: "Severe exhaustion and depleted stamina not relieved by ordinary sleep or rest.",
    tip: "When cardiac output is restricted, the body diverts oxygenated blood away from skeletal muscle groups."
  },
  {
    key: "High_BP",
    icon: `<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
    title: "Have you been clinically diagnosed with high blood pressure (Hypertension)?",
    desc: "Blood pressure repeatedly measuring ≥ 130/80 mmHg or currently taking anti-hypertensive medication.",
    tip: "Chronic mechanical afterload strains the left ventricle and accelerates coronary artery wall stiffening."
  },
  {
    key: "High_Cholesterol",
    icon: `<circle cx="12" cy="12" r="8"/><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/>`,
    title: "Do you have high cholesterol or lipid imbalance (Dyslipidemia)?",
    desc: "Elevated LDL-C, high total cholesterol, or prescription of statin / lipid-lowering therapies.",
    tip: "Excess circulating apoB lipoproteins penetrate the coronary intima, initiating atherosclerotic plaque formation."
  },
  {
    key: "Diabetes",
    icon: `<path d="m19 11-8-8-8.6 9a5 5 0 0 0 7.1 7.1L19 11Z"/><path d="m5 2 5 5"/>`,
    title: "Have you been diagnosed with Type 1 or Type 2 Diabetes or chronic Pre-diabetes?",
    desc: "Fasting blood glucose ≥ 126 mg/dL, HbA1c ≥ 6.5%, or current use of glucose-lowering therapies.",
    tip: "Chronic hyperglycemia impairs vascular nitric oxide release and doubles lifetime coronary risk."
  },
  {
    key: "Smoking",
    icon: `<line x1="18" y1="15" x2="18" y2="15.01"/><path d="M18 11a4 4 0 0 0-4-4H4v8h10a4 4 0 0 0 4-4Z"/>`,
    title: "Do you currently smoke cigarettes, vape nicotine, or have a significant smoking history?",
    desc: "Active tobacco or vape inhalation, or history exceeding 5-10 pack-years.",
    tip: "Inhaled toxic combustion products induce coronary vasoconstriction and trigger acute platelet aggregation."
  },
  {
    key: "Obesity",
    icon: `<circle cx="12" cy="12" r="9"/><path d="M9 12h6"/>`,
    title: "Is your Body Mass Index in the overweight or obese category (BMI ≥ 30 kg/m²)?",
    desc: "Significant excess body weight or high waist circumference (>102 cm for men, >88 cm for women).",
    tip: "Visceral adipose tissue releases pro-inflammatory cytokines that elevate circulatory and metabolic workload."
  },
  {
    key: "Sedentary_Lifestyle",
    icon: `<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6v6H9z"/>`,
    title: "Do you lead a predominantly sedentary routine with minimal exercise?",
    desc: "Fewer than 150 minutes of moderate aerobic exercise per week and prolonged sitting.",
    tip: "Regular aerobic conditioning enhances microvascular vasodilatory capacity and preserves cardiac fitness."
  },
  {
    key: "Family_History",
    icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    title: "Did any first-degree family member have premature heart disease or heart attacks?",
    desc: "Father or brother with CAD before age 55, or mother/sister with CAD before age 65.",
    tip: "Family history reflects polygenic predispositions toward lipid retention and intrinsic arterial biology."
  },
  {
    key: "Chronic_Stress",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>`,
    title: "Do you frequently experience unmanaged high levels of chronic psychological stress?",
    desc: "Prolonged occupational burnout, severe personal distress, anxiety, or high emotional strain.",
    tip: "Sustained sympathetic overdrive elevates cortisol, promotes vascular spasm, and drives hypertension."
  },
  {
    key: "Demographics",
    isDemographics: true,
    icon: `<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`,
    title: "Confirm Patient Demographics & Baseline Vitals",
    desc: "Verified chronological age and biological sex at birth for epidemiological risk calibration.",
    tip: "Demographic factors provide the epidemiological baseline onto which all symptoms and clinical history are mapped."
  },
  {
    key: "Review",
    isReview: true,
    icon: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>`,
    title: "Review Assessment & Run AI Prediction",
    desc: "All clinical parameters recorded. Click below to execute machine learning inference and sync the 3D heart.",
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
  controls.autoRotateSpeed = 1.0;
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
      console.error("Error loading beating-heart.glb:", err);
      if (loadingEl) loadingEl.innerHTML = "<span>3D Heart Model Active</span>";
    }
  );

  // Handle Resize
  window.addEventListener("resize", onWindowResize);

  // Animation Loop
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

// True Anatomical Beating Animation (Skeletal Animation + Dynamic Rate + Green Glow)
function animateHeart() {
  requestAnimationFrame(animateHeart);

  const delta = clock.getDelta();
  const timeSeconds = clock.getElapsedTime();

  if (controls) controls.update();

  // Update built-in skeletal beating animation from beating-heart.glb
  if (mixer) {
    // Normal resting rhythm (72 BPM) = 1.0x timeScale; Tachycardia (120 BPM) = 1.66x timeScale
    mixer.timeScale = currentBPM / 72.0;
    mixer.update(delta);
  } else if (heartGroup) {
    // Fallback pulse contraction
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

  // Gentle floating idle motion
  if (heartGroup) {
    heartGroup.position.y = Math.sin(timeSeconds * 1.5) * 0.04;
  }

  // Emissive Bio-Glow Modulation
  if (isDiseaseActive) {
    // Emerald Green Disease Bio-Luminescence
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
    // Physiological Resting Ruby Warmth
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

// ==========================================
// Disease Green Glow State Manager
// ==========================================
function setDiseaseState(isDisease, riskProb = null) {
  isDiseaseActive = isDisease;

  const aura = document.getElementById("heart-glow-aura");
  const toggleLabel = document.getElementById("toggle-glow-label");
  const modalHeartBanner = document.getElementById("modal-heart-sync-banner");
  const modalFeedbackText = document.getElementById("modal-heart-feedback-text");
  const modalRhythm = document.getElementById("modal-rhythm");

  if (isDisease) {
    // Disease detected -> Green Glow Active!
    currentBPM = riskProb ? Math.min(138, Math.round(82 + riskProb * 0.55)) : 115;

    if (aura) aura.classList.add("disease-green-active");
    if (toggleLabel) toggleLabel.textContent = "Reset to Normal Ruby Glow";
    if (modalHeartBanner) modalHeartBanner.classList.add("disease-active");
    if (modalFeedbackText) {
      modalFeedbackText.textContent = `High risk pattern flagged (${riskProb || 85}% probability). Anatomical heart has activated emerald green bio-glow to signify coronary ischemia alert.`;
    }
    if (modalRhythm) modalRhythm.textContent = `${currentBPM} BPM (Elevated)`;
  } else {
    // Normal Physiology -> Ruby State
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

  // Previous button state
  if (btnPrev) {
    btnPrev.disabled = currentQuestionIndex === 0;
  }

  // Next / Submit button state
  if (btnNext && nextBtnText) {
    if (currentQuestionIndex === total - 1) {
      nextBtnText.textContent = "Evaluate Cardiovascular Risk";
    } else {
      nextBtnText.textContent = "Next Question";
    }
  }

  // Handle special Question types
  if (q.isDemographics) {
    if (binaryRow) binaryRow.classList.add("hide");
    if (demoInput) demoInput.classList.remove("hide");
  } else if (q.isReview) {
    if (binaryRow) binaryRow.classList.add("hide");
    if (demoInput) demoInput.classList.add("hide");
  } else {
    if (binaryRow) binaryRow.classList.remove("hide");
    if (demoInput) demoInput.classList.add("hide");

    // Sync Yes / No selected state
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
  // If we are on the demographics step, save values
  const q = questionList[currentQuestionIndex];
  if (q && q.isDemographics) {
    const ageInput = document.getElementById("input-age");
    if (ageInput) {
      patientResponses.Age = Number(ageInput.value) || 48;
    }
  }

  // If on the final Review step -> execute inference!
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

  // Prepare payload
  const payload = { ...patientResponses };

  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      let detail = "Diagnostic prediction failed";
      try {
        const errorBody = await res.json();
        if (errorBody.detail) detail = errorBody.detail;
      } catch {
        // Keep the generic message when the server does not return JSON.
      }
      throw new Error(detail);
    }
    const data = await res.json();
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

  // Count positive findings
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
      ? `Model flagged elevated cardiovascular pattern (${result.risk_probability}% risk probability). Coronary evaluation recommended.`
      : `Model detected no elevated cardiovascular risk signal (${result.risk_probability}% risk probability). Sinus rhythm preserved.`;
  }

  if (recommendation && recommendationText) {
    recommendation.className = `clinical-recommendation ${isHighRisk ? "warning" : "good"}`;
    recommendationText.textContent = isHighRisk
      ? "Arrange a prompt appointment with a qualified healthcare professional to review these findings and discuss appropriate cardiovascular evaluation. If you have chest pain, severe breathlessness, fainting, or other urgent symptoms, seek emergency care immediately."
      : "Continue routine preventive care, including regular check-ups, physical activity, a heart-healthy diet, and discussion of personal risk factors with your healthcare professional."
  }

  if (percentText) {
    percentText.textContent = `${result.risk_probability}%`;
  }

  if (gauge) {
    const deg = Math.min(180, Math.max(0, result.risk_probability * 1.8));
    gauge.style.setProperty("--risk", `${deg}deg`);
  }

  // Trigger Green Disease Glow on the 3D Heart!
  setDiseaseState(isHighRisk, result.risk_probability);

  // Open modal
  if (modal) {
    modal.classList.remove("hide");
  }
}

// ==========================================
// Metrics & Plotly Analytics
// ==========================================
async function loadMetrics() {
  try {
    const response = await fetch(`${API_BASE}/api/metrics`);
    const metrics = await response.json();
    const statAcc = document.getElementById("stat-accuracy");
    const modalAuc = document.getElementById("modal-roc-auc");
    const metricTargets = {
      accuracy: document.getElementById("analysis-accuracy"),
      precision: document.getElementById("analysis-precision"),
      recall: document.getElementById("analysis-recall"),
      f1: document.getElementById("analysis-f1"),
      roc_auc: document.getElementById("analysis-roc-auc")
    };

    if (statAcc) statAcc.textContent = `${metrics.accuracy}% Accuracy`;
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
    const response = await fetch(`${API_BASE}/api/charts`);
    const charts = await response.json();

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

    Plotly.newPlot(
      "roc-chart",
      [{
        x: charts.roc_curve.false_positive_rate,
        y: charts.roc_curve.true_positive_rate,
        type: "scatter",
        mode: "lines",
        line: { color: "#ff4d6d", width: 3 },
        fill: "tozeroy",
        fillcolor: "rgba(255, 77, 109, 0.12)",
        hovertemplate: "False positive: %{x:.2f}<br>True positive: %{y:.2f}<extra></extra>"
      }, {
        x: [0, 1], y: [0, 1], type: "scatter", mode: "lines",
        line: { color: "rgba(255,255,255,0.22)", dash: "dot" },
        hoverinfo: "skip", showlegend: false
      }],
      { ...chartLayout, xaxis: { title: "False positive rate", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" }, yaxis: { title: "True positive rate", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" }, showlegend: false },
      chartConfig
    );

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
      { ...chartLayout, xaxis: { title: "Model score (log-odds)", gridcolor: "rgba(230, 57, 70, 0.12)" }, yaxis: { title: "Predicted probability", tickformat: ".0%", range: [0, 1], gridcolor: "rgba(230, 57, 70, 0.12)" }, showlegend: false },
      chartConfig
    );
  } catch (err) {
    console.error("Charts loading error:", err);
  }
}

function setupSectionNavigation() {
  const navItems = document.querySelectorAll(".sidebar-nav .nav-item");
  const sections = document.querySelectorAll("#dashboard, #assessment, #results-view, #analytics");

  navItems.forEach((item) => {
    item.addEventListener("click", (event) => {
      const targetSelector = item.getAttribute("href");
      const target = targetSelector ? document.querySelector(targetSelector) : null;

      navItems.forEach((navItem) => navItem.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("nav-highlight"));

      if (target) {
        event.preventDefault();
        item.classList.add("active");
        target.classList.add("nav-highlight");
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
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

  // 5. Age controls in Demographics
  const inputAge = document.getElementById("input-age");
  const decAge = document.getElementById("age-decrement");
  const incAge = document.getElementById("age-increment");

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

  // 8. Close Modal / Retake Assessment
  const closeModalBtn = document.getElementById("btn-close-results");
  const retakeBtn = document.getElementById("btn-retake-test");
  const modal = document.getElementById("results-view");

  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => modal.classList.add("hide"));
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
    });
  }

  setupSectionNavigation();

  // 9. Load metrics & cohort charts
  loadMetrics();
  loadCharts();
});
