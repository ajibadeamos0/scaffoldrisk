// ScaffoldRisk v1.0 — Frontend Logic (Premium Edition)

// ── State ─────────────────────────────────────────────────────────────────
const assessmentLog = [];
let lastResult      = null;
let lastInputs      = null;

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

const btnAssess      = document.getElementById('btn-assess');
const btnReport      = document.getElementById('btn-report');
const gaugeNeedle    = document.getElementById('gauge-needle');
const gaugeNeedleShadow = document.getElementById('gauge-needle-shadow');
const gaugeNeedleTip = document.getElementById('gauge-needle-tip');
const gaugeScore     = document.getElementById('gauge-score');
const gaugePulseRing = document.getElementById('gauge-pulse-ring');
const riskBadge      = document.getElementById('risk-badge');
const directivePanel = document.getElementById('directive-panel');
const directiveText  = document.getElementById('directive-text');
const summaryGrid    = document.getElementById('summary-grid');
const linguisticGrid = document.getElementById('linguistic-grid');
const sfValue        = document.getElementById('sf-value');
const sfLabel        = document.getElementById('sf-label');
const logTbody       = document.getElementById('log-tbody');
const logEmptyRow    = document.getElementById('log-empty-row');
const logCount       = document.getElementById('log-count');
const scaffoldWrap   = document.getElementById('scaffold-wrap');
const scaffoldLabel  = document.getElementById('scaffold-label');

// ── Slider track fill ─────────────────────────────────────────────────────
function updateSliderFill(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const val = parseFloat(slider.value);
    const pct = ((val - min) / (max - min)) * 100;
    slider.style.background =
        `linear-gradient(to right, #facc15 0%, #facc15 ${pct}%, #1f2937 ${pct}%)`;
}

Object.values(sliders).forEach(s => {
    updateSliderFill(s);
    s.addEventListener('input', () => updateSliderFill(s));
});

// ── Tooltip Content ───────────────────────────────────────────────────────
function getWindTip(v) {
    if (v <= 10) return `${v} km/h — Beaufort 0–2: Calm to Light Breeze. No structural concern.`;
    if (v <= 20) return `${v} km/h — Beaufort 3: Gentle Breeze. Safe for all operations.`;
    if (v <= 30) return `${v} km/h — Beaufort 4: Moderate Breeze. Monitor sheeting.`;
    if (v <= 40) return `${v} km/h — Beaufort 5: Fresh Breeze. Check tie spacing.`;
    if (v <= 50) return `${v} km/h — Beaufort 6: Strong Breeze. Caution zone — reduce operations.`;
    if (v <= 58) return `${v} km/h — Beaufort 7: Near Gale. High lateral load risk on sheeted scaffolds.`;
    return `${v} km/h — NEAR GALE: BS EN 12811-1 requires immediate cessation of scaffold operations.`;
}

function getHeightTip(v) {
    if (v <= 6)  return `${v}m — Very low platform. Minimal slenderness concern.`;
    if (v <= 15) return `${v}m — Low rise. Standard inspection protocol applies.`;
    if (v <= 30) return `${v}m — Mid rise. Significant slenderness ratio effects present.`;
    if (v <= 45) return `${v}m — High rise. Critical buckling and wind zone.`;
    return `${v}m — Near maximum height. Extreme structural risk — engineer sign-off required.`;
}

function getFoundTip(v) {
    if (v <= 2) return `${v}/10 — POOR: Waterlogged/soft soil, no base plates. High differential settlement risk.`;
    if (v <= 4) return `${v}/10 — FAIR: Moderate soil, partial sole boards. Minor tilt possible.`;
    if (v <= 6) return `${v}/10 — GOOD: Firm soil, full sole boards present. No visible settlement.`;
    if (v <= 8) return `${v}/10 — VERY GOOD: Compacted substrate with correctly sized base plates.`;
    return `${v}/10 — EXCELLENT: Engineered foundation. Zero differential settlement risk.`;
}

function getLoadTip(v) {
    if (v <= 0.75) return `${v} kN/m² — BS EN 12811-1 Class 1: Inspection only — single operative.`;
    if (v <= 1.5)  return `${v} kN/m² — Class 2: Light building work, minimal materials.`;
    if (v <= 2.5)  return `${v} kN/m² — Class 3: General building work, small tools.`;
    if (v <= 3.0)  return `${v} kN/m² — Class 4: Masonry, moderate material storage.`;
    if (v <= 4.5)  return `${v} kN/m² — Class 5: Heavy masonry, significant material staging.`;
    if (v <= 6.0)  return `${v} kN/m² — Class 6: Heavy stonework and cladding.`;
    return `${v} kN/m² — BEYOND CLASS 6: Platform overloaded. Immediate offload required.`;
}

function getAssembTip(v) {
    if (v <= 2) return `${v}/10 — POOR: Severe corrosion, missing bracing, no guardrails. Immediate action required.`;
    if (v <= 4) return `${v}/10 — FAIR: Moderate deficiencies, partial bracing present.`;
    if (v <= 6) return `${v}/10 — GOOD: Minor deficiencies, full bracing, guardrails present.`;
    if (v <= 8) return `${v}/10 — VERY GOOD: Full compliance, minor surface corrosion only.`;
    return `${v}/10 — EXCELLENT: Full compliance, no corrosion, PPE fully compliant.`;
}

// ── Linguistic classification ─────────────────────────────────────────────
function getLinguistic(varName, value) {
    if (varName === 'wind') {
        if (value <= 10) return ['VL', 'Very Low'];
        if (value <= 20) return ['L',  'Low'];
        if (value <= 40) return ['M',  'Moderate'];
        if (value <= 55) return ['H',  'High'];
        return ['VH', 'Very High'];
    }
    if (varName === 'height') {
        if (value <= 6)  return ['VL', 'Very Low'];
        if (value <= 15) return ['L',  'Low'];
        if (value <= 35) return ['M',  'Moderate'];
        if (value <= 50) return ['H',  'High'];
        return ['VH', 'Very High'];
    }
    if (varName === 'found' || varName === 'assemb') {
        if (value <= 2) return ['P',  'Poor'];
        if (value <= 4) return ['F',  'Fair'];
        if (value <= 6) return ['G',  'Good'];
        if (value <= 8) return ['VG', 'Very Good'];
        return ['E', 'Excellent'];
    }
    if (varName === 'load') {
        if (value <= 0.75) return ['VL', 'Very Low'];
        if (value <= 2.5)  return ['L',  'Low'];
        if (value <= 4.5)  return ['M',  'Moderate'];
        if (value <= 6.0)  return ['H',  'High'];
        return ['VH', 'Very High'];
    }
    return ['—', '—'];
}

// ── Slider event listeners ────────────────────────────────────────────────
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

// ── Gauge update with animated needle ────────────────────────────────────
function updateGauge(score) {
    // Map 0-10 to -90 to +90 degrees
    const angle = (score / 10) * 180 - 90;
    const transform = `rotate(${angle}, 150, 150)`;
    gaugeNeedle.setAttribute('transform', transform);
    gaugeNeedleShadow.setAttribute('transform', transform);
    gaugeNeedleTip.setAttribute('transform', transform);

    // Color needle tip by risk zone
    const color = score <= 2 ? '#4ade80' :
                  score <= 4 ? '#86efac' :
                  score <= 6 ? '#fde047' :
                  score <= 8 ? '#fb923c' : '#f87171';
    gaugeNeedleTip.setAttribute('fill', color);
    gaugeNeedle.setAttribute('stroke', color);

    // Pulse ring for critical
    if (score > 8) {
        gaugePulseRing.style.animation =
            'gauge-ring-pulse 1.2s ease-out infinite';
        gaugePulseRing.setAttribute('opacity', '0.6');
    } else {
        gaugePulseRing.style.animation = 'none';
        gaugePulseRing.setAttribute('opacity', '0');
    }
}

// ── Score count-up animation ──────────────────────────────────────────────
function animateScore(targetScore) {
    const duration = 1200;
    const start    = performance.now();
    const from     = 0;

    gaugeScore.classList.remove('score-pop');

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = from + (targetScore - from) * eased;
        gaugeScore.textContent = current.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            gaugeScore.textContent = targetScore.toFixed(2);
            gaugeScore.classList.add('score-pop');
        }
    }
    requestAnimationFrame(step);
}

// ── Badge update ──────────────────────────────────────────────────────────
function updateBadge(category) {
    const map = {
        'Very Low':  { cls: 'badge-vl', icon: 'fa-circle-check',    text: 'Very Low Risk'  },
        'Low':       { cls: 'badge-l',  icon: 'fa-circle-check',    text: 'Low Risk'        },
        'Moderate':  { cls: 'badge-m',  icon: 'fa-triangle-exclamation', text: 'Moderate Risk' },
        'High':      { cls: 'badge-h',  icon: 'fa-circle-exclamation',   text: 'High Risk'     },
        'Very High': { cls: 'badge-vh', icon: 'fa-skull-crossbones',     text: 'CRITICAL RISK' },
    };
    const item = map[category] || { cls: '', icon: 'fa-circle-question', text: category };
    riskBadge.className =
        `risk-badge-default ${item.cls}`;
    riskBadge.innerHTML =
        `<i class="fa-solid ${item.icon} mr-1"></i>${item.text}`;
}

// ── Directive update ──────────────────────────────────────────────────────
function updateDirective(category, action) {
    const clsMap = {
        'Very Low':  'directive-safe',
        'Low':       'directive-low',
        'Moderate':  'directive-moderate',
        'High':      'directive-high',
        'Very High': 'directive-critical',
    };
    const iconMap = {
        'Very Low':  'fa-circle-check text-green-400',
        'Low':       'fa-circle-check text-green-400',
        'Moderate':  'fa-triangle-exclamation text-yellow-400',
        'High':      'fa-circle-exclamation text-orange-400',
        'Very High': 'fa-skull-crossbones text-red-400',
    };
    directivePanel.className =
        `directive-panel ${clsMap[category] || ''}`;
    directiveText.innerHTML =
        `<i class="fa-solid ${iconMap[category] || 'fa-info'} mr-2"></i>${action}`;
    directiveText.className = 'directive-body text-white font-medium';
}

// ── Scaffold SVG colour update ────────────────────────────────────────────
function updateScaffold(category) {
    scaffoldWrap.classList.remove(
        'scaffold-safe', 'scaffold-moderate', 'scaffold-critical'
    );
    // Also remove from parent stage element
    const stage = document.getElementById('scaffold-wrap');
    stage.classList.remove(
        'scaffold-safe', 'scaffold-moderate', 'scaffold-critical'
    );

    const labelMap = {
        'Very Low':  { cls: 'scaffold-safe',     txt: '<i class="fa-solid fa-circle-check mr-1"></i>Structurally Safe' },
        'Low':       { cls: 'scaffold-safe',     txt: '<i class="fa-solid fa-circle-check mr-1"></i>Low Risk — Monitor' },
        'Moderate':  { cls: 'scaffold-moderate', txt: '<i class="fa-solid fa-triangle-exclamation mr-1"></i>Moderate Risk — Act' },
        'High':      { cls: 'scaffold-critical', txt: '<i class="fa-solid fa-circle-exclamation mr-1"></i>High Risk — Suspend Ops' },
        'Very High': { cls: 'scaffold-critical', txt: '<i class="fa-solid fa-skull-crossbones mr-1"></i>CRITICAL — Evacuate Now' },
    };

    const item = labelMap[category];
    if (item) {
        scaffoldWrap.classList.add(item.cls);
        scaffoldLabel.innerHTML = item.txt;
    }
}

// ── Summary update ────────────────────────────────────────────────────────
function updateSummary(inputs, score) {
    summaryGrid.innerHTML = `
        <div class="summary-item">
            <div class="s-label"><i class="fa-solid fa-wind mr-1"></i>Wind Speed</div>
            <div class="s-value">${inputs.wind} <span style="font-size:0.65rem;color:#6b7280">km/h</span></div>
        </div>
        <div class="summary-item">
            <div class="s-label"><i class="fa-solid fa-ruler-vertical mr-1"></i>Height</div>
            <div class="s-value">${inputs.height} <span style="font-size:0.65rem;color:#6b7280">m</span></div>
        </div>
        <div class="summary-item">
            <div class="s-label"><i class="fa-solid fa-layer-group mr-1"></i>Foundation</div>
            <div class="s-value">${inputs.found} <span style="font-size:0.65rem;color:#6b7280">/ 10</span></div>
        </div>
        <div class="summary-item">
            <div class="s-label"><i class="fa-solid fa-weight-hanging mr-1"></i>Service Load</div>
            <div class="s-value">${inputs.load} <span style="font-size:0.65rem;color:#6b7280">kN/m²</span></div>
        </div>
        <div class="summary-item">
            <div class="s-label"><i class="fa-solid fa-screwdriver-wrench mr-1"></i>Assembly</div>
            <div class="s-value">${inputs.assemb} <span style="font-size:0.65rem;color:#6b7280">/ 10</span></div>
        </div>
        <div class="summary-item" style="border:1px solid #374151">
            <div class="s-label"><i class="fa-solid fa-gauge-high mr-1"></i>Risk Index</div>
            <div class="s-value" style="font-size:1.3rem">${score.toFixed(2)}</div>
        </div>
    `;
}

// ── Linguistic classification update ─────────────────────────────────────
function updateLinguistic(inputs) {
    const vars = [
        { key: 'wind',   label: 'Wind Speed',   val: inputs.wind   },
        { key: 'height', label: 'Height',        val: inputs.height },
        { key: 'found',  label: 'Foundation',    val: inputs.found  },
        { key: 'load',   label: 'Service Load',  val: inputs.load   },
        { key: 'assemb', label: 'Assembly',      val: inputs.assemb },
    ];

    linguisticGrid.innerHTML = vars.map(v => {
        const [code, name] = getLinguistic(v.key, v.val);
        const cls = `ling-${code.toLowerCase()}`;
        return `
            <div class="ling-item">
                <span class="ling-var">${v.label}</span>
                <span class="ling-val ${cls}">${name}</span>
            </div>
        `;
    }).join('');
}

// ── Safety Factor update ──────────────────────────────────────────────────
function updateSafetyFactor(score) {
    // Safety factor: inverse relationship — higher score = lower SF
    const sf = score > 0 ? Math.max(0.1, (10 / (score + 0.5))).toFixed(2) : '—';
    sfValue.textContent = sf;

    if (score <= 2) {
        sfValue.style.color = '#4ade80';
        sfLabel.textContent = 'Excellent margin — safe to proceed';
        sfLabel.style.color = '#4ade80';
    } else if (score <= 4) {
        sfValue.style.color = '#86efac';
        sfLabel.textContent = 'Adequate margin — monitor conditions';
        sfLabel.style.color = '#86efac';
    } else if (score <= 6) {
        sfValue.style.color = '#fde047';
        sfLabel.textContent = 'Reduced margin — take corrective action';
        sfLabel.style.color = '#fde047';
    } else if (score <= 8) {
        sfValue.style.color = '#fb923c';
        sfLabel.textContent = 'Low margin — suspend non-essential ops';
        sfLabel.style.color = '#fb923c';
    } else {
        sfValue.style.color = '#f87171';
        sfLabel.textContent = 'Below acceptable — evacuate immediately';
        sfLabel.style.color = '#f87171';
    }
}

// ── Log table update ──────────────────────────────────────────────────────
function addLogEntry(inputs, score, category) {
    const statusMap = {
        'Very Low':  { cls: 'status-vl', icon: '🟢', dot: '●' },
        'Low':       { cls: 'status-l',  icon: '🟢', dot: '●' },
        'Moderate':  { cls: 'status-m',  icon: '🟡', dot: '●' },
        'High':      { cls: 'status-h',  icon: '🟠', dot: '●' },
        'Very High': { cls: 'status-vh', icon: '🔴', dot: '●' },
    };

    const now  = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const date = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

    assessmentLog.push({
        date, time,
        wind: inputs.wind, height: inputs.height,
        found: inputs.found, load: inputs.load,
        assemb: inputs.assemb, score, category,
        linguistic: {
            wind:   getLinguistic('wind',   inputs.wind)[1],
            height: getLinguistic('height', inputs.height)[1],
            found:  getLinguistic('found',  inputs.found)[1],
            load:   getLinguistic('load',   inputs.load)[1],
            assemb: getLinguistic('assemb', inputs.assemb)[1],
        }
    });

    // Remove empty row
    if (logEmptyRow) logEmptyRow.remove();

    // Update count badge
    logCount.textContent = assessmentLog.length;

    const s = statusMap[category] || { cls: '', icon: '⚪', dot: '●' };

    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${time}<br><span style="font-size:0.6rem;color:#4b5563">${date}</span></td>
        <td>${inputs.wind} km/h</td>
        <td>${inputs.height} m</td>
        <td>${inputs.found}</td>
        <td>${inputs.load} kN/m²</td>
        <td>${inputs.assemb}</td>
        <td style="font-weight:800;color:white">${score.toFixed(2)}</td>
        <td>
            <span class="log-status-badge ${s.cls}">
                ${s.icon} ${category}
            </span>
        </td>
    `;
    logTbody.insertBefore(tr, logTbody.firstChild);
}

// ── PDF Report Generator ──────────────────────────────────────────────────
btnReport.addEventListener('click', () => {
    if (assessmentLog.length === 0) {
        alert('No assessments to report yet. Run at least one assessment first.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210; const H = 297;
    const latest = assessmentLog[assessmentLog.length - 1];

    // ── Cover / Header ──
    doc.setFillColor(6, 10, 16);
    doc.rect(0, 0, W, H, 'F');

    // Header bar
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, W, 38, 'F');
    doc.setDrawColor(250, 204, 21);
    doc.setLineWidth(0.8);
    doc.line(0, 38, W, 38);

    // Title
    doc.setTextColor(250, 204, 21);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SCAFFOLDRISK v1.0', 15, 16);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('INTELLIGENT SCAFFOLDING SAFETY ASSESSMENT REPORT', 15, 23);
    doc.text('Mamdani Fuzzy Inference System  ·  BS EN 12811-1 Calibrated  ·  63 Expert Rules', 15, 29);

    // Report metadata right side
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(7);
    doc.text(`Report Generated: ${latest.date}  ${latest.time}`, W - 15, 16, { align: 'right' });
    doc.text(`Total Assessments in Session: ${assessmentLog.length}`, W - 15, 22, { align: 'right' });
    doc.text('Federal University of Technology Akure (FUTA)', W - 15, 28, { align: 'right' });
    doc.text('CVE/20/5531 — Ajayi Amos Ajibade', W - 15, 34, { align: 'right' });

    let y = 50;

    // ── Risk Score Banner ──
    const riskColor = latest.score <= 2  ? [22, 163, 74]  :
                      latest.score <= 4  ? [74, 222, 128] :
                      latest.score <= 6  ? [202, 138, 4]  :
                      latest.score <= 8  ? [234, 88, 12]  :
                                           [220, 38, 38];

    doc.setFillColor(...riskColor);
    doc.roundedRect(15, y, W - 30, 28, 4, 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(latest.score.toFixed(2), 35, y + 19);

    doc.setFontSize(9);
    doc.text('RISK INDEX', 35, y + 25);

    doc.setFontSize(16);
    doc.text(latest.category.toUpperCase() + ' RISK', W / 2 + 10, y + 14,
             { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const directive = latest.score <= 2  ?
        'Safe to proceed. Maintain routine inspection schedule.' :
        latest.score <= 4 ?
        'Low risk. Increase inspection frequency to every 4 hours.' :
        latest.score <= 6 ?
        'Moderate risk. Implement corrective measures immediately.' :
        latest.score <= 8 ?
        'High risk. Suspend non-essential operations immediately.' :
        'CRITICAL: Evacuate scaffold. Structural engineer sign-off required.';

    const splitDir = doc.splitTextToSize(directive, W - 80);
    doc.text(splitDir, W / 2 + 10, y + 21, { align: 'center' });

    y += 38;

    // ── Section: Input Parameters ──
    doc.setTextColor(250, 204, 21);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SITE INPUT PARAMETERS', 15, y);
    doc.setDrawColor(250, 204, 21);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, W - 15, y + 2);
    y += 8;

    const params = [
        {
            label: 'Wind Speed',
            value: `${latest.wind} km/h`,
            ling:  latest.linguistic.wind,
            note:  getWindTip(latest.wind),
            icon:  '~'
        },
        {
            label: 'Scaffold Height',
            value: `${latest.height} m`,
            ling:  latest.linguistic.height,
            note:  getHeightTip(latest.height),
            icon:  '|'
        },
        {
            label: 'Foundation Stability',
            value: `${latest.found} / 10`,
            ling:  latest.linguistic.found,
            note:  getFoundTip(latest.found),
            icon:  '='
        },
        {
            label: 'Service Load',
            value: `${latest.load} kN/m²`,
            ling:  latest.linguistic.load,
            note:  getLoadTip(latest.load),
            icon:  'W'
        },
        {
            label: 'Assembly Integrity',
            value: `${latest.assemb} / 10`,
            ling:  latest.linguistic.assemb,
            note:  getAssembTip(latest.assemb),
            icon:  '#'
        },
    ];


    params.forEach((p, i) => {
        const rowY = y + i * 26;

        // Row background
        doc.setFillColor(13, 17, 23);
        doc.roundedRect(15, rowY, W - 30, 23, 2, 2, 'F');
        doc.setDrawColor(31, 41, 55);
        doc.setLineWidth(0.2);
        doc.roundedRect(15, rowY, W - 30, 23, 2, 2, 'S');

        // Label
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(p.label.toUpperCase(), 22, rowY + 7);

        // Value
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(p.value, 22, rowY + 15);

        // Note text — now placed below value, constrained to left side
        doc.setTextColor(75, 85, 99);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        const splitNote = doc.splitTextToSize(p.note, 110);
        doc.text(splitNote[0], 22, rowY + 21);

        // Linguistic badge — right side
        const lingColor = p.ling === 'Poor'      || p.ling === 'Very High' ? [69, 10, 10]  :
                          p.ling === 'Fair'      || p.ling === 'High'      ? [67, 20, 7]   :
                          p.ling === 'Good'      || p.ling === 'Moderate'  ? [66, 32, 6]   :
                          p.ling === 'Very Good' || p.ling === 'Low'       ? [26, 58, 26]  :
                          [20, 83, 45];

        doc.setFillColor(...lingColor);
        doc.roundedRect(W - 55, rowY + 6, 38, 12, 3, 3, 'F');

        const lingTextColor =
            p.ling === 'Poor'      || p.ling === 'Very High' ? [248, 113, 113] :
            p.ling === 'Fair'      || p.ling === 'High'      ? [251, 146, 60]  :
            p.ling === 'Good'      || p.ling === 'Moderate'  ? [253, 224, 71]  :
            p.ling === 'Very Good' || p.ling === 'Low'       ? [134, 239, 172] :
            [74, 222, 128];

        doc.setTextColor(...lingTextColor);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.text(p.ling.toUpperCase(), W - 36, rowY + 13.5,
                 { align: 'center' });
    });

    y += params.length * 26 + 8;

    // ── Section: FIS Analysis ──
    doc.setTextColor(250, 204, 21);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FUZZY INFERENCE SYSTEM ANALYSIS', 15, y);
    doc.setDrawColor(250, 204, 21);
    doc.setLineWidth(0.3);
    doc.line(15, y + 2, W - 15, y + 2);
    y += 8;

    const fisRows = [
        ['Inference Method',  'Mamdani-Type Fuzzy Inference System'],
        ['Input Variables',   '5 (Wind Speed, Scaffold Height, Foundation Stability, Service Load, Assembly Integrity)'],
        ['Output Variable',   'Risk Index (0.0 – 10.0 continuous scale)'],
        ['Rule Base',         '63 expert-derived IF-THEN rules across 5 risk categories'],
        ['Defuzzification',   'Centroid Method (Center of Gravity)'],
        ['Regulatory Basis',  'BS EN 12811-1: Scaffolds — Performance Requirements and General Design'],
        ['Risk Index Score',  `${latest.score.toFixed(2)} / 10.00`],
        ['Risk Category',     `${latest.category} Risk`],
        ['Safety Factor',     `${latest.score > 0 ? Math.max(0.1, 10 / (latest.score + 0.5)).toFixed(2) : 'N/A'}`],
    ];

    fisRows.forEach(([label, value], i) => {
        const rowY = y + i * 8;
        if (i % 2 === 0) {
            doc.setFillColor(13, 17, 23);
            doc.rect(15, rowY - 3, W - 30, 8, 'F');
        }
        doc.setTextColor(107, 114, 128);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, rowY + 2);

        doc.setTextColor(209, 213, 219);
        doc.setFont('helvetica', 'normal');
        const splitVal = doc.splitTextToSize(value, 110);
        doc.text(splitVal[0], 80, rowY + 2);
    });

    y += fisRows.length * 8 + 10;

    // ── Section: Site Directive ──
    doc.setTextColor(250, 204, 21);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SITE DIRECTIVE & RECOMMENDED ACTIONS', 15, y);
    doc.setDrawColor(250, 204, 21);
    doc.line(15, y + 2, W - 15, y + 2);
    y += 8;

    doc.setFillColor(...riskColor.map(c => Math.min(c + 180, 255)),
                     0.1);
    doc.setFillColor(13, 17, 23);
    doc.roundedRect(15, y, W - 30, 55, 3, 3, 'F');
    doc.setDrawColor(...riskColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, y, W - 30, 55, 3, 3, 'S');

    doc.setTextColor(...riskColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PRIMARY DIRECTIVE:', 22, y + 9);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const fullDirective = latest.score <= 2 ?
        'Scaffold is within safe operational parameters. Proceed with routine inspection schedule. Maintain current safety protocols.' :
        latest.score <= 4 ?
        'Low risk detected. Monitor site conditions closely. Increase inspection frequency to every 4 hours. Document all observations.' :
        latest.score <= 6 ?
        'Moderate risk identified. Implement corrective measures immediately. Address the highest-scoring input variable. Re-assess within 2 hours.' :
        latest.score <= 8 ?
        'High risk confirmed. Suspend all non-essential scaffold operations immediately. Reinforce bracing systems. Reassess foundation conditions. Notify site manager.' :
        'CRITICAL RISK: Evacuate scaffold platform immediately. Remove all personnel. Do not resume operations until a qualified structural engineer has conducted a full inspection and issued written clearance.';

    const splitFull = doc.splitTextToSize(fullDirective, W - 46);
    doc.text(splitFull, 22, y + 17);

    // Recommended actions list
    doc.setTextColor(156, 163, 175);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDED ACTIONS:', 22, y + 35);

    const actions = latest.score <= 2 ? [
        '1. Continue normal scaffold operations',
        '2. Maintain scheduled weekly safety inspections',
        '3. Log this assessment for site safety records',
    ] : latest.score <= 4 ? [
        '1. Increase inspection frequency to every 4 hours',
        '2. Check all coupler torque levels (target: 50 Nm)',
        '3. Verify tie spacing compliance with BS EN 12811-1',
    ] : latest.score <= 6 ? [
        '1. Identify and address the highest-risk input variable immediately',
        '2. Check and reinforce all bracing panels',
        '3. Re-assess foundation bearing conditions',
        '4. Reduce service loading to Class 3 or below',
    ] : latest.score <= 8 ? [
        '1. Suspend non-essential scaffold operations immediately',
        '2. Reinforce all facade bracing and wall tie connections',
        '3. Inspect and re-torque all couplers',
        '4. Assess foundation for differential settlement',
        '5. Notify site manager and safety officer',
    ] : [
        '1. EVACUATE all personnel from scaffold platform immediately',
        '2. Cordon off the scaffold — no access until cleared',
        '3. Contact a qualified structural engineer without delay',
        '4. Document all current site conditions with photographs',
        '5. Do not resume operations without written engineer clearance',
        '6. Report incident to relevant regulatory authority if collapse has occurred',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(209, 213, 219);
    actions.forEach((a, i) => {
        doc.text(a, 22, y + 42 + i * 5);
    });

    y += 65;

    // ── Assessment History Table ──
    if (assessmentLog.length > 1) {
        if (y > 220) {
            doc.addPage();
            doc.setFillColor(6, 10, 16);
            doc.rect(0, 0, W, H, 'F');
            y = 20;
        }

        doc.setTextColor(250, 204, 21);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('SESSION ASSESSMENT HISTORY', 15, y);
        doc.setDrawColor(250, 204, 21);
        doc.line(15, y + 2, W - 15, y + 2);
        y += 8;

        // Table header
        doc.setFillColor(31, 41, 55);
        doc.rect(15, y, W - 30, 8, 'F');
        doc.setTextColor(156, 163, 175);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');

        const cols = [17, 32, 60, 85, 110, 135, 158, 175];
        const heads = ['#', 'Time', 'Wind', 'Height', 'Found.', 'Load', 'Assembly', 'Score', 'Category'];
        const colW  = [8,   22,    20,     20,      20,      18,    15,       20];

        heads.forEach((h, i) => doc.text(h, cols[i] || 17 + i * 18, y + 5.5));
        y += 10;

        assessmentLog.slice().reverse().forEach((e, i) => {
            if (y > 270) return;
            if (i % 2 === 0) {
                doc.setFillColor(13, 17, 23);
                doc.rect(15, y - 3, W - 30, 7, 'F');
            }
            doc.setTextColor(156, 163, 175);
            doc.setFontSize(6.5);
            doc.setFont('helvetica', 'normal');
            doc.text(`${assessmentLog.length - i}`, cols[0], y + 1);
            doc.text(e.time, cols[1], y + 1);
            doc.text(`${e.wind} km/h`, cols[2], y + 1);
            doc.text(`${e.height} m`, cols[3], y + 1);
            doc.text(`${e.found}`, cols[4], y + 1);
            doc.text(`${e.load} kN/m²`, cols[5], y + 1);
            doc.text(`${e.assemb}`, cols[6], y + 1);
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.text(`${e.score.toFixed(2)}`, cols[7], y + 1);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(156, 163, 175);
            doc.text(e.category, cols[7] + 18, y + 1);
            y += 7;
        });
    }

    // ── Footer ──
    doc.setFillColor(13, 17, 23);
    doc.rect(0, H - 14, W, 14, 'F');
    doc.setDrawColor(31, 41, 55);
    doc.setLineWidth(0.3);
    doc.line(0, H - 14, W, H - 14);

    doc.setTextColor(75, 85, 99);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(
        'ScaffoldRisk v1.0  ·  Final Year Project  ·  Civil & Environmental Engineering, FUTA  ·  2026',
        W / 2, H - 8, { align: 'center' }
    );
    doc.text(
        'All calculations based on Mamdani FIS  ·  BS EN 12811-1 Calibrated  ·  63 Expert Rules  ·  Ajayi Amos Ajibade CVE/20/5531',
        W / 2, H - 4, { align: 'center' }
    );

    // Save
    doc.save(`ScaffoldRisk_Report_${Date.now()}.pdf`);
});

// ── Main Assessment Function ──────────────────────────────────────────────
btnAssess.addEventListener('click', async () => {
    const inputs = {
        wind:   parseFloat(sliders.wind.value),
        height: parseFloat(sliders.height.value),
        found:  parseFloat(sliders.found.value),
        load:   parseFloat(sliders.load.value),
        assemb: parseFloat(sliders.assemb.value),
    };

    // Loading state
    btnAssess.disabled   = true;
    btnAssess.innerHTML  = '<span class="spinner"></span> Computing FIS...';

    try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('/assess', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wind_speed:           inputs.wind,
                scaffold_height:      inputs.height,
                foundation_stability: inputs.found,
                service_load:         inputs.load,
                assembly_integrity:   inputs.assemb,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);
        const result = await response.json();

        if (result.success) {
            lastResult = result;
            lastInputs = inputs;

            updateGauge(result.score);
            animateScore(result.score);
            updateBadge(result.category);
            updateDirective(result.category, result.action);
            updateSummary(inputs, result.score);
            updateLinguistic(inputs);
            updateSafetyFactor(result.score);
            updateScaffold(result.category);
            addLogEntry(inputs, result.score, result.category);
        } else {
            directiveText.textContent = `Assessment error: ${result.error}`;
        }

    } catch (err) {
        directiveText.textContent =
            err.name === 'AbortError'
                ? 'Request timed out. The server is waking up — please try again in 30 seconds.'
                : `Connection error: ${err.message}`;
    } finally {
        btnAssess.disabled  = false;
        btnAssess.innerHTML =
            '<i class="fa-solid fa-bolt"></i> Run Risk Assessment';
    }
});

// ── Wind Map Modal ────────────────────────────────────────────────────────
const btnWindMap      = document.getElementById('btn-wind-map');
const windMapModal    = document.getElementById('wind-map-modal');
const closeWindModal  = document.getElementById('close-wind-modal');

btnWindMap.addEventListener('click', () => {
    windMapModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
});

closeWindModal.addEventListener('click', () => {
    windMapModal.style.display = 'none';
    document.body.style.overflow = '';
});

// Close on overlay click (outside the modal box)
windMapModal.addEventListener('click', (e) => {
    if (e.target === windMapModal) {
        windMapModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && windMapModal.style.display === 'flex') {
        windMapModal.style.display = 'none';
        document.body.style.overflow = '';
    }
});
