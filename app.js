/* ═══════════════════════════════════════════
   SLUMBER — app.js
   Sleep Journal & Wind-Down Lab
   ═══════════════════════════════════════════ */

// ─── State ─────────────────────────────────
let state = {
  logs: [],           // [{date, bedtime, waketime, duration, quality, mood, note, usedWindDown}]
  routine: null,      // {targetBedtime, duration, prefs, steps}
  checklist: {},      // {date: {stepIndex: bool}}
  theme: 'dark',      // 'dark' | 'light'
  selectedQuality: 0,
  selectedMood: 0,
  routineDuration: 60,
};

// ─── Persistence ───────────────────────────
function save() {
  localStorage.setItem('slumber_v2', JSON.stringify({
    logs: state.logs,
    routine: state.routine,
    checklist: state.checklist,
    theme: state.theme,
  }));
}

function load() {
  try {
    const raw = localStorage.getItem('slumber_v2');
    if (!raw) return;
    const d = JSON.parse(raw);
    state.logs      = d.logs      || [];
    state.routine   = d.routine   || null;
    state.checklist = d.checklist || {};
    state.theme     = d.theme     || 'dark';
  } catch(e) { console.warn('Slumber: load error', e); }
}

// ─── Stars ─────────────────────────────────
function buildStars() {
  const container = document.getElementById('starsContainer');
  if (!container) return;
  const count = window.innerWidth < 600 ? 60 : 120;
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random()*100}%;
      left:${Math.random()*100}%;
      --dur:${(Math.random()*4+2).toFixed(1)}s;
      --delay:${(Math.random()*4).toFixed(1)}s;
    `;
    container.appendChild(s);
  }
}

// ─── Theme ─────────────────────────────────
function applyTheme() {
  const html = document.documentElement;
  if (state.theme === 'light') {
    html.classList.add('light');
    html.classList.remove('dark');
    document.getElementById('themeToggle').textContent = '☀️';
  } else {
    html.classList.add('dark');
    html.classList.remove('light');
    document.getElementById('themeToggle').textContent = '🌙';
  }
}

document.getElementById('themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  save();
});

// ─── Tabs ───────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.add('hidden'));
  document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  const section = document.getElementById(`tab-${tabId}`);
  section.classList.remove('hidden');
  section.style.animation = 'none';
  section.offsetHeight; // reflow
  section.style.animation = '';

  if (tabId === 'chart') renderChart();
  if (tabId === 'routine') restoreRoutineUI();
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ─── Duration calculator ────────────────────
function calcDuration(bed, wake) {
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let mins = (wh * 60 + wm) - (bh * 60 + bm);
  if (mins < 0) mins += 1440;
  return mins;
}

function fmtDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function durationEmoji(mins) {
  if (mins < 300) return '😵';
  if (mins < 390) return '😩';
  if (mins < 420) return '😟';
  if (mins < 480) return '😐';
  if (mins < 540) return '😊';
  return '🌟';
}

function updateDurationDisplay() {
  const bed  = document.getElementById('bedtime').value;
  const wake = document.getElementById('waketime').value;
  if (!bed || !wake) return;
  const mins = calcDuration(bed, wake);
  document.getElementById('durationDisplay').textContent = fmtDuration(mins);
  document.getElementById('durationEmoji').textContent   = durationEmoji(mins);

  const disp = document.getElementById('durationDisplay');
  if (mins < 420) disp.className = 'text-2xl font-display font-bold text-red-400';
  else if (mins < 480) disp.className = 'text-2xl font-display font-bold text-yellow-400';
  else disp.className = 'text-2xl font-display font-bold text-aurora-400';
}

document.getElementById('bedtime').addEventListener('change', updateDurationDisplay);
document.getElementById('waketime').addEventListener('change', updateDurationDisplay);
updateDurationDisplay();

// ─── Quality buttons ────────────────────────
document.querySelectorAll('.quality-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.selectedQuality = parseInt(btn.dataset.val);
    document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.selectedMood = parseInt(btn.dataset.val);
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  });
});

// ─── Save log ───────────────────────────────
document.getElementById('saveLog').addEventListener('click', () => {
  const bed  = document.getElementById('bedtime').value;
  const wake = document.getElementById('waketime').value;

  if (!bed || !wake) { toast('⏰ Please enter bedtime and wake time.'); return; }
  if (!state.selectedQuality) { toast('Please rate your sleep quality!'); return; }
  if (!state.selectedMood)    { toast('Please rate your morning mood!'); return; }

  const today = todayKey();
  // Remove existing entry for today
  state.logs = state.logs.filter(l => l.date !== today);

  state.logs.push({
    date:         today,
    bedtime:      bed,
    waketime:     wake,
    duration:     calcDuration(bed, wake),
    quality:      state.selectedQuality,
    mood:         state.selectedMood,
    note:         document.getElementById('sleepNote').value.trim(),
    usedWindDown: document.getElementById('usedWindDown').checked,
  });

  // Keep last 90 entries
  if (state.logs.length > 90) state.logs = state.logs.slice(-90);

  save();

  const succ = document.getElementById('saveSuccess');
  succ.classList.remove('hidden');
  setTimeout(() => succ.classList.add('hidden'), 3000);

  updateStreak();
  toast('🌙 Night logged! Sweet dreams incoming.');
});

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

// ─── Streak ─────────────────────────────────
function updateStreak() {
  const count = state.logs.length;
  document.getElementById('streakCount').textContent = count;

  const emojis = ['🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘'];
  const phase   = Math.min(Math.floor(count / 7 * 7), 7);
  document.getElementById('streakEmoji').textContent = emojis[phase];

  const goal = 7;
  const pct  = Math.min((count % goal) / goal * 100, 100);
  document.getElementById('streakBar').style.width = pct + '%';

  const remaining = goal - (count % goal);
  document.getElementById('streakGoal').textContent =
    count > 0 && remaining === goal
      ? `🎉 ${Math.floor(count / goal)} week${Math.floor(count/goal)>1?'s':''} complete!`
      : `${remaining} more to hit ${goal}-night goal`;

  // Set log date label
  document.getElementById('logDate').textContent = new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}

// ─── Chart ──────────────────────────────────
function renderChart() {
  const last14 = state.logs.slice(-14);

  if (last14.length === 0) {
    document.getElementById('chartEmpty').classList.remove('hidden');
    document.getElementById('sleepChart').classList.add('hidden');
    return;
  }
  document.getElementById('chartEmpty').classList.add('hidden');
  document.getElementById('sleepChart').classList.remove('hidden');

  // Stats
  const avgSleepMins = Math.round(last14.reduce((s,l) => s+l.duration, 0) / last14.length);
  const avgQ = (last14.reduce((s,l) => s+l.quality, 0) / last14.length).toFixed(1);
  const avgM = (last14.reduce((s,l) => s+l.mood, 0) / last14.length).toFixed(1);

  document.getElementById('avgSleep').textContent    = fmtDuration(avgSleepMins);
  document.getElementById('avgQuality').textContent  = avgQ + '/5';
  document.getElementById('avgMood').textContent     = avgM + '/5';

  // Bar chart
  const chartEl = document.getElementById('sleepChart');
  const labelEl = document.getElementById('chartLabels');
  chartEl.innerHTML = '';
  labelEl.innerHTML = '';

  const maxMins = Math.max(600, ...last14.map(l => l.duration));

  last14.forEach((log, i) => {
    const pct    = (log.duration / maxMins * 100);
    const isGood = log.duration >= 480;
    const isOk   = log.duration >= 420;
    const barClass = isGood ? 'bar-good' : isOk ? 'bar-ok' : 'bar-low';

    const bar = document.createElement('div');
    bar.className = `sleep-bar ${barClass}`;
    bar.style.height = pct + '%';

    const tt = document.createElement('div');
    tt.className = 'sleep-bar-tooltip';
    tt.textContent = `${fmtDuration(log.duration)} • Q:${log.quality}/5`;
    bar.appendChild(tt);
    chartEl.appendChild(bar);

    // Labels: show every other for mobile
    if (i % 2 === 0 || last14.length <= 7) {
      const d    = new Date(log.date + 'T12:00:00');
      const span = document.createElement('span');
      span.textContent = d.toLocaleDateString('en-US', {weekday:'short'}).slice(0,2);
      span.style.fontSize = '10px';
      span.style.color = '#555577';
      labelEl.appendChild(span);
    } else {
      labelEl.appendChild(document.createElement('span'));
    }
  });

  // Bedtime dots
  renderBedtimeDots(last14);

  // Insight
  renderInsight(last14);
}

function renderBedtimeDots(logs) {
  const container = document.getElementById('bedtimeDots');
  container.innerHTML = '';

  const targetBed = state.routine?.targetBedtime || '23:00';
  const [th, tm] = targetBed.split(':').map(Number);
  const targetMins = th * 60 + tm;

  logs.forEach(log => {
    const [bh, bm] = log.bedtime.split(':').map(Number);
    let bedMins = bh * 60 + bm;
    // normalize: treat post-midnight as late (add 1440 if < 12hr)
    if (bedMins < 720) bedMins += 1440;
    let targetN = targetMins < 720 ? targetMins + 1440 : targetMins;

    const diff = bedMins - targetN; // positive = late

    const d   = new Date(log.date + 'T12:00:00');
    const lbl = d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1);

    let cls = 'dot-target';
    if (diff < -30) cls = 'dot-early';
    else if (diff > 60) cls = 'dot-very-late';
    else if (diff > 20) cls = 'dot-late';

    const dot = document.createElement('div');
    dot.className = `bedtime-dot ${cls}`;
    dot.textContent = lbl;
    dot.title = `${log.date}: bed ${log.bedtime}`;
    container.appendChild(dot);
  });

  const lateCount = logs.filter(l => {
    const [bh, bm] = l.bedtime.split(':').map(Number);
    let bMins = bh * 60 + bm; if (bMins < 720) bMins += 1440;
    let tMins = targetMins < 720 ? targetMins + 1440 : targetMins;
    return bMins - tMins > 20;
  }).length;

  const insight = document.getElementById('bedtimeInsight');
  if (logs.length < 3) {
    insight.textContent = 'Log more nights to see your bedtime pattern.';
  } else if (lateCount === 0) {
    insight.textContent = `🌟 Rock-solid bedtime consistency! That's the #1 sleep superpower.`;
  } else if (lateCount / logs.length > 0.6) {
    insight.textContent = `⚠️ You're going to bed late ${lateCount} of ${logs.length} tracked nights — your body's rhythm needs a consistent anchor.`;
  } else {
    insight.textContent = `You hit your target bedtime most nights. ${lateCount} late outlier${lateCount>1?'s':''} may be dragging your quality down.`;
  }
}

function renderInsight(logs) {
  const el = document.getElementById('insightText');
  if (logs.length < 3) { el.textContent = 'Log at least 3 nights to unlock your personalized insight.'; return; }

  const avgQ = logs.reduce((s,l) => s+l.quality,0) / logs.length;
  const avgD = logs.reduce((s,l) => s+l.duration,0) / logs.length;
  const windDownLogs = logs.filter(l => l.usedWindDown);
  const windDownAvgQ = windDownLogs.length > 0
    ? windDownLogs.reduce((s,l) => s+l.quality,0) / windDownLogs.length
    : null;

  let parts = [];

  if (avgD < 420) {
    parts.push(`You're averaging ${fmtDuration(Math.round(avgD))} — well below the 7h minimum. Even small earlier-bedtime wins add up fast.`);
  } else if (avgD >= 480) {
    parts.push(`Solid! You're averaging ${fmtDuration(Math.round(avgD))} — right in the sweet spot.`);
  } else {
    parts.push(`You're averaging ${fmtDuration(Math.round(avgD))}. Creeping toward 7h30m would likely shift your mornings noticeably.`);
  }

  if (avgQ < 3) {
    parts.push(`Quality is averaging ${avgQ.toFixed(1)}/5 — duration alone isn't the issue. Stress, screens, or inconsistent timing may be the culprit.`);
  } else if (avgQ >= 4) {
    parts.push(`Quality is strong at ${avgQ.toFixed(1)}/5 — your sleep architecture seems healthy.`);
  }

  if (windDownLogs.length >= 2 && windDownAvgQ !== null) {
    const base = logs.filter(l => !l.usedWindDown);
    const baseAvgQ = base.length > 0 ? base.reduce((s,l) => s+l.quality,0) / base.length : null;
    if (baseAvgQ !== null) {
      const diff = windDownAvgQ - baseAvgQ;
      if (diff > 0.4) {
        parts.push(`🌟 Your wind-down routine is working — quality is ${diff.toFixed(1)} points higher on nights you used it!`);
      } else if (diff < -0.2) {
        parts.push(`Your wind-down routine might need tuning — consider adjusting the timing or activities.`);
      }
    }
  } else if (windDownLogs.length === 0 && logs.length >= 5) {
    parts.push(`You haven't tried the wind-down routine yet. Users who follow one consistently report +0.8–1.2pts better quality.`);
  }

  el.textContent = parts.join(' ');
}

// ─── Routine generator ───────────────────────
const ROUTINE_STEPS = {
  screens:   { icon:'📵', label:'Screen cutoff',    desc:'Put down all screens — phone, TV, laptop. Blue light suppresses melatonin for 90+ minutes after exposure.' },
  stretch:   { icon:'🧘', label:'Light stretching',  desc:'5–10 min of gentle neck rolls, hip openers, and forward folds. Releases held tension from the day.' },
  journal:   { icon:'📓', label:'Brain dump',        desc:'Write down tomorrow\'s worries, to-do\'s, and anything rattling around your head. Emptying your mind prevents midnight spiraling.' },
  tea:       { icon:'🍵', label:'Herbal tea',         desc:'Brew chamomile, passionflower, or lemon balm. The ritual itself signals wind-down — the warmth lowers your core temp slightly (counterintuitively helping sleep).' },
  reading:   { icon:'📖', label:'Physical book',     desc:'Read fiction or something non-work-related. Avoid e-readers if possible — backlit screens are stimulating.' },
  breathing: { icon:'🌬', label:'4-7-8 breathing',   desc:'Inhale 4s, hold 7s, exhale 8s. Repeat 4 cycles. Activates the parasympathetic nervous system — your body\'s sleep-on-ramp.' },
  bath:      { icon:'🛁', label:'Warm shower/bath',  desc:'20 min before bed. Your core temperature drops sharply after stepping out, mimicking the natural temperature dip that triggers sleep onset.' },
  gratitude: { icon:'🙏', label:'Gratitude list',    desc:'Write 3 specific things you\'re grateful for. Shifts your emotional state away from stress and anxiety before sleep.' },
};

const DEFAULT_STEPS = [
  { icon:'💡', label:'Dim the lights', desc:'Switch to warm, low lighting throughout your home. Bright overhead lights tell your brain it\'s still daytime.' },
  { icon:'🌡', label:'Cool your room',  desc:'Set your thermostat to 65–68°F (18–20°C). Core body temperature needs to drop by ~2°F to initiate sleep.' },
  { icon:'🔕', label:'Phone on silent', desc:'Put your phone face-down and on Do Not Disturb. Out of sight, out of mind — no last-minute scroll spirals.' },
];

document.querySelectorAll('.duration-select').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.duration-select').forEach(b => b.classList.remove('active-duration'));
    btn.classList.add('active-duration');
    state.routineDuration = parseInt(btn.dataset.min);
    updateRoutineStart();
  });
});

document.getElementById('targetBedtime').addEventListener('change', updateRoutineStart);

function updateRoutineStart() {
  const bed  = document.getElementById('targetBedtime').value;
  const dur  = state.routineDuration;
  if (!bed) return;
  const [h, m] = bed.split(':').map(Number);
  let startMins = h * 60 + m - dur;
  if (startMins < 0) startMins += 1440;
  const sh = Math.floor(startMins / 60) % 24;
  const sm = startMins % 60;
  const fmtd = `${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`;
  document.getElementById('routineStartTime').textContent = `starts at ${fmt12(fmtd)}`;
}

function fmt12(time24) {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

document.getElementById('generateRoutine').addEventListener('click', () => {
  const bed    = document.getElementById('targetBedtime').value;
  const dur    = state.routineDuration;
  const prefs  = [...document.querySelectorAll('.pref-check:checked')].map(c => c.value);

  if (prefs.length === 0) { toast('Select at least one activity!'); return; }

  const [h, m] = bed.split(':').map(Number);
  let startMins = h * 60 + m - dur;
  if (startMins < 0) startMins += 1440;

  // Always include defaults + selected prefs
  const allKeys = [...new Set(['screens', ...prefs])];
  const timePerStep = Math.floor(dur / (allKeys.length + DEFAULT_STEPS.length));
  const minTime  = 5;
  const stepMins = Math.max(minTime, timePerStep);

  const steps = [];

  // Lights + cooling always first
  DEFAULT_STEPS.forEach((s, i) => {
    const mins = startMins + i * stepMins;
    steps.push({ time: minsToTime(mins % 1440), ...s });
  });

  allKeys.forEach((key, i) => {
    const def  = ROUTINE_STEPS[key];
    const mins = startMins + (DEFAULT_STEPS.length + i) * stepMins;
    if (def) steps.push({ time: minsToTime(mins % 1440), ...def });
  });

  // Add final "lights out" step
  steps.push({ time: fmt12(bed), icon:'🌙', label:'Lights out', desc:'You\'ve earned this. Same time tomorrow — your circadian rhythm is now being trained.' });

  state.routine = { targetBedtime: bed, duration: dur, prefs, steps };
  save();

  renderRoutineOutput(steps);
  buildChecklist(steps);
  toast('✨ Your routine is ready!');
});

function minsToTime(totalMins) {
  const h = Math.floor(totalMins / 60) % 24;
  const m = totalMins % 60;
  return fmt12(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
}

function renderRoutineOutput(steps) {
  const output = document.getElementById('routineOutput');
  const stepsEl = document.getElementById('routineSteps');
  stepsEl.innerHTML = '';

  steps.forEach((step, i) => {
    const el = document.createElement('div');
    el.className = 'routine-step';
    el.style.animationDelay = (i * 60) + 'ms';
    el.innerHTML = `
      <span class="routine-step-icon">${step.icon}</span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-0.5">
          <span class="routine-step-time">${step.time}</span>
          <span class="font-medium text-sm text-white/90">${step.label}</span>
        </div>
        <p class="routine-step-text">${step.desc}</p>
      </div>`;
    stepsEl.appendChild(el);
  });

  const bed = document.getElementById('targetBedtime').value;
  document.getElementById('routineFooter').textContent =
    `Do this every night and your brain will start feeling sleepy at ${fmt12(bed)} automatically.`;

  output.classList.remove('hidden');
  output.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function buildChecklist(steps) {
  const todayKey_ = todayKey();
  if (!state.checklist[todayKey_]) state.checklist[todayKey_] = {};

  const container = document.getElementById('checklistItems');
  container.innerHTML = '';

  steps.forEach((step, i) => {
    const done = !!state.checklist[todayKey_][i];
    const item = document.createElement('div');
    item.className = `checklist-item${done ? ' done' : ''}`;
    item.dataset.idx = i;
    item.innerHTML = `
      <div class="checklist-cb">${done ? '✓' : ''}</div>
      <span class="routine-step-icon">${step.icon}</span>
      <span>${step.label} <span class="text-xs opacity-50">${step.time}</span></span>`;
    item.addEventListener('click', () => toggleCheck(i, steps));
    container.appendChild(item);
  });

  document.getElementById('totalCount').textContent = steps.length;
  updateChecklistProgress(steps.length);

  document.getElementById('tonightChecklist').classList.remove('hidden');
}

function toggleCheck(idx, steps) {
  const today = todayKey();
  if (!state.checklist[today]) state.checklist[today] = {};
  state.checklist[today][idx] = !state.checklist[today][idx];
  save();
  buildChecklist(steps);
}

function updateChecklistProgress(total) {
  const today  = todayKey();
  const checks = state.checklist[today] || {};
  const done   = Object.values(checks).filter(Boolean).length;
  document.getElementById('checkedCount').textContent = done;
  document.getElementById('checklistProgress').style.width = (done / total * 100) + '%';
  if (done === total && total > 0) toast('🎉 Full routine complete! You\'re going to sleep great tonight.');
}

function restoreRoutineUI() {
  updateRoutineStart();
  if (!state.routine) return;

  // Restore target bedtime
  document.getElementById('targetBedtime').value = state.routine.targetBedtime;

  // Restore duration
  state.routineDuration = state.routine.duration;
  document.querySelectorAll('.duration-select').forEach(b => {
    b.classList.toggle('active-duration', parseInt(b.dataset.min) === state.routine.duration);
  });

  // Restore prefs
  document.querySelectorAll('.pref-check').forEach(cb => {
    cb.checked = state.routine.prefs?.includes(cb.value) ?? false;
  });

  renderRoutineOutput(state.routine.steps);
  buildChecklist(state.routine.steps);
  updateRoutineStart();
}

// Copy routine
document.getElementById('copyRoutine').addEventListener('click', () => {
  if (!state.routine) return;
  const text = state.routine.steps
    .map(s => `${s.time} — ${s.icon} ${s.label}: ${s.desc}`)
    .join('\n\n');
  const full = `🌙 My Slumber Wind-Down Routine\nBedtime: ${fmt12(state.routine.targetBedtime)}\n\n${text}\n\nMade with Slumber`;
  navigator.clipboard.writeText(full).then(() => toast('📋 Routine copied!'));
});

// ─── Toast ───────────────────────────────────
function toast(msg, ms = 3000) {
  const el  = document.getElementById('toast');
  const msg_el = document.getElementById('toastMsg');
  msg_el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), ms);
}

// ─── Pre-fill today if already logged ─────────
function prefillTodayLog() {
  const today = todayKey();
  const existing = state.logs.find(l => l.date === today);
  if (!existing) return;

  document.getElementById('bedtime').value  = existing.bedtime;
  document.getElementById('waketime').value = existing.waketime;
  document.getElementById('sleepNote').value = existing.note || '';
  document.getElementById('usedWindDown').checked = existing.usedWindDown;

  // Re-select quality & mood
  state.selectedQuality = existing.quality;
  state.selectedMood    = existing.mood;
  document.querySelectorAll('.quality-btn').forEach(b => {
    b.classList.toggle('selected', parseInt(b.dataset.val) === existing.quality);
  });
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('selected', parseInt(b.dataset.val) === existing.mood);
  });
  updateDurationDisplay();
}

// ─── Init ────────────────────────────────────
function init() {
  load();
  applyTheme();
  buildStars();
  updateStreak();
  prefillTodayLog();

  // Lazy-render chart on first chart tab open
  // (already wired to tab switch)
}

init();
