// ScaffoldRisk v1.0 — Frontend Logic

// ── State ─────────────────────────────────────────────────────────────────
const assessmentLog = [];

// ── Element References ────────────────────────────────────────────────────
const sliders = {
    wind:   document.getElementById('slider-wind'),
    height: document.getElementById('slider-height'),
    found:  document.getElementById('slider-found'),
    load:   document.getElementById('slider-load'),
    assemb: document.getElementById('slider-assemb'),
};

const displays = {
    wind:   document.getElementById('val-wind'),
    height: document.getElementById('val-height'),
    found:  document.getElementById('val-found'),
    load:   document.getElementById('val-load'),
    assemb: document.getElementById('val-assemb'),
};

const tooltips = {
    wind:   document.getElementById('tip-wind'),
    height: document.getElementById('tip-height'),
    found:  document.getElementById('tip-found'),
    load:   document.getElementById('tip-load'),
    assemb: document.getElementById('tip-assemb'),
};

const btnAssess  = document.getElementById('btn-assess');
const btnExport  = document.getElementById('btn-export');
const gaugNeedle = document.getElementById('gauge-needle');
const gaugeScore = document.getElementById('gauge-score');
const riskBadge  = document.getElementById('risk-badge');
const directivePanel = document.getElementById('directive-panel');
const directiveText  = document.getElementById('directive-text');
const summaryGrid    = document.getElementById('summary-grid');
const logContainer   = document.getElementById('log-container');

// ── Tooltip Content ───────────────────────────────────────────────────────
function getWindTip(v) {
    if (v <= 10)  return `${v} km/h — Beaufort 0-2: Calm to Light Breeze. Safe.`;
    if (v <= 20)  return `${v} km/h — Beaufort 3: Gentle Breeze. No structural concern.`;
    if (v <= 30)  return `${v} km/h — Beaufort 4: Moderate Breeze. Monitor sheeting.`;
    if (v <= 40)  return `${v} km/h — Beaufort 5: Fresh Breeze. Check tie spacing.`;
    if (v <= 50)  return `${v} km/h — Beaufort 6: Strong Breeze. Caution zone.`;
    if (v <= 58)  return `${v} km/h — Beaufort 7: Near Gale. High lateral load risk.`;
    return        `${v} km/h — NEAR GALE: Scaffold operations must cease immediately.`;
}

function getHeightTip(v) {
    if (v <= 6)   return `${v}m — Very low platform. Minimal slenderness concern.`;
    if (v <= 15)  return `${v}m — Low rise. Standard inspection applies.`;
    if (v <= 30)  return `${v}m — Mid rise. Significant slenderness effects present.`;
    if (v <= 45)  return `${v}m — High rise. Critical buckling and wind zone.`;
    return        `${v}m — Near maximum height. Extreme structural risk zone.`;
}

function getFoundTip(v) {
    if (v <= 2)   return `${v}/10 — POOR: Waterlogged/soft soil, no base plates. High settlement risk.`;
    if (v <= 4)   return `${v}/10 — FAIR: Moderate soil, partial sole boards. Minor tilt possible.`;
    if (v <= 6)   return `${v}/10 — GOOD: Firm soil, full sole boards present. No visible settlement.`;
    if (v <= 8)   return `${v}/10 — VERY GOOD: Compacted substrate with correct base plates.`;
    return        `${v}/10 — EXCELLENT: Engineered foundation. Zero settlement risk.`;
}

function getLoadTip(v) {
    if (v <= 0.75) return `${v} kN/m² — BS EN 12811-1 Class 1: Inspection only.`;
    if (v <= 1.5)  return `${v} kN/m² — Class 2: Light building work, minimal materials.`;
    if (v <= 2.5)  return `${v} kN/m² — Class 3: General building work, small tools.`;
    if (v <= 3.0)  return `${v} kN/m² — Class 4: Masonry, moderate material storage.`;
    if (v <= 4.5)  return `${v} kN/m² — Class 5: Heavy masonry, significant staging.`;
    if (v <= 6.0)  return `${v} kN/m² — Class 6: Heavy stonework and cladding.`;
    return         `${v} kN/m² — BEYOND CLASS 6: Overloaded. Immediate offload required.`;
}

function getAssembTip(v) {
    if (v <= 2)   return `${v}/10 — POOR: Severe corrosion, missing bracing, no guardrails.`;
    if (v <= 4)   return `${v}/10 — FAIR: Moderate deficiencies, partial bracing present.`;
    if (v <= 6)   return `${v}/10 — GOOD: Minor deficiencies, full bracing, guardrails present.`;
    if (v <= 8)   return `${v}/10 — VERY GOOD: Full compliance, minor surface corrosion only.`;
    return        `${v}/10 — EXCELLENT: Full compliance, no corrosion, PPE compliant.`;
}

// ── Slider Event Listeners ────────────────────────────────────────────────
sliders.wind.addEventListener('input', () => {
    const v = parseFloat(sliders.wind.value);
    displays.wind.textContent = v;
    tooltips.wind.textContent = getWindTip(v);
});

sliders.height.addEventListener('input', () => {
    const v = parseFloat(sliders.height.value);
    displays.height.textContent = v;
    tooltips.height.textContent = getHeightTip(v);
});

sliders.found.addEventListener('input', () => {
    const v = parseFloat(sliders.found.value);
    displays.found.textContent = v.toFixed(1);
    tooltips.found.textContent = getFoundTip(v);
});

sliders.load.addEventListener('input', () => {
    const v = parseFloat(sliders.load.value);
    displays.load.textContent = v.toFixed(1);
    tooltips.load.textContent = getLoadTip(v);
});

sliders.assemb.addEventListener('input', () => {
    const v = parseFloat(sliders.assemb.value);
    displays.assemb.textContent = v.toFixed(1);
    tooltips.assemb.textContent = getAssembTip(v);
});

// ── Gauge Update ──────────────────────────────────────────────────────────
function updateGauge(score) {
    // Map score 0-10 to rotation -90 to +90 degrees
    const angle = (score / 10) * 180 - 90;
    gaugNeedle.setAttribute(
        'transform',
        `rotate(${angle}, 130, 130)`
    );
    gaugeScore.textContent = score.toFixed(2);
}

// ── Badge Update ──────────────────────────────────────────────────────────
function updateBadge(category) {
    const map = {
        'Very Low': { cls: 'badge-vl', text: '✅ Very Low Risk'  },
        'Low':      { cls: 'badge-l',  text: '🟢 Low Risk'       },
        'Moderate': { cls: 'badge-m',  text: '🟡 Moderate Risk'  },
        'High':     { cls: 'badge-h',  text: '🟠 High Risk'      },
        'Very High':{ cls: 'badge-vh', text: '🔴 CRITICAL RISK'  },
    };
    const item = map[category] || { cls: '', text: category };
    riskBadge.className =
        `inline-block px-6 py-2 rounded-full text-sm font-bold ${item.cls}`;
    riskBadge.textContent = item.text;
}

// ── Directive Update ──────────────────────────────────────────────────────
function updateDirective(category, action) {
    const clsMap = {
        'Very Low':  'directive-safe',
        'Low':       'directive-low',
        'Moderate':  'directive-moderate',
        'High':      'directive-high',
        'Very High': 'directive-critical',
    };
    directivePanel.className =
        `bg-gray-900 rounded-2xl p-5 border border-gray-700 ${clsMap[category] || ''}`;
    directiveText.textContent = action;
    directiveText.className   = 'text-sm leading-relaxed font-medium text-white';
}

// ── Summary Update ────────────────────────────────────────────────────────
function updateSummary(inputs, score) {
    summaryGrid.innerHTML = `
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Wind Speed</span>
            <p class="text-white font-semibold">${inputs.wind} km/h</p>
        </div>
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Scaffold Height</span>
            <p class="text-white font-semibold">${inputs.height} m</p>
        </div>
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Foundation Stability</span>
            <p class="text-white font-semibold">${inputs.found} / 10</p>
        </div>
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Service Load</span>
            <p class="text-white font-semibold">${inputs.load} kN/m²</p>
        </div>
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Assembly Integrity</span>
            <p class="text-white font-semibold">${inputs.assemb} / 10</p>
        </div>
        <div class="bg-gray-800 rounded p-2">
            <span class="text-gray-500">Risk Index</span>
            <p class="text-white font-bold text-lg">${score.toFixed(2)}</p>
        </div>
    `;
}

// ── Log Update ────────────────────────────────────────────────────────────
function addLogEntry(inputs, score, category) {
    const logMap = {
        'Very Low':  'log-vl',
        'Low':       'log-l',
        'Moderate':  'log-m',
        'High':      'log-h',
        'Very High': 'log-vh',
    };

    const now  = new Date();
    const time = now.toLocaleTimeString();

    // Add to log array
    assessmentLog.push({ time, ...inputs, score, category });

    // Clear placeholder text
    if (logContainer.querySelector('p')) {
        logContainer.innerHTML = '';
    }

    // Prepend new entry
    const entry = document.createElement('div');
    entry.className = `log-entry ${logMap[category] || ''}`;
    entry.innerHTML = `
        <span>${time} — W:${inputs.wind} H:${inputs.height}
        F:${inputs.found} L:${inputs.load} A:${inputs.assemb}</span>
        <span class="font-bold text-white">${score.toFixed(2)}</span>
    `;
    logContainer.prepend(entry);
}

// ── CSV Export ────────────────────────────────────────────────────────────
btnExport.addEventListener('click', () => {
    if (assessmentLog.length === 0) {
        alert('No assessments to export yet.');
        return;
    }

    const headers = [
        'Time', 'Wind(km/h)', 'Height(m)',
        'Foundation(0-10)', 'Load(kN/m2)',
        'Assembly(0-10)', 'RiskIndex', 'Category'
    ];

    const rows = assessmentLog.map(e =>
        [e.time, e.wind, e.height, e.found,
         e.load, e.assemb, e.score.toFixed(2), e.category].join(',')
    );

    const csv     = [headers.join(','), ...rows].join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `scaffoldrisk_log_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// ── Main Assessment Function ──────────────────────────────────────────────
btnAssess.addEventListener('click', async () => {

    // Read slider values
    const inputs = {
        wind:   parseFloat(sliders.wind.value),
        height: parseFloat(sliders.height.value),
        found:  parseFloat(sliders.found.value),
        load:   parseFloat(sliders.load.value),
        assemb: parseFloat(sliders.assemb.value),
    };

    // Show loading state
    btnAssess.disabled     = true;
    btnAssess.innerHTML    =
        '<span class="spinner"></span> Computing...';

    try {
        const response = await fetch('/assess', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                wind_speed:           inputs.wind,
                scaffold_height:      inputs.height,
                foundation_stability: inputs.found,
                service_load:         inputs.load,
                assembly_integrity:   inputs.assemb,
            }),
        });

        const result = await response.json();

        if (result.success) {
            updateGauge(result.score);
            updateBadge(result.category);
            updateDirective(result.category, result.action);
            updateSummary(inputs, result.score);
            addLogEntry(inputs, result.score, result.category);
        } else {
            directiveText.textContent =
                `Error: ${result.error}`;
        }

    } catch (err) {
        directiveText.textContent =
            `Connection error: Could not reach the assessment server. 
             Make sure the Flask backend is running.`;
    } finally {
        btnAssess.disabled  = false;
        btnAssess.innerHTML = '⚡ Run Risk Assessment';
    }
});