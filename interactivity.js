// Timer logic
(function () {
  const $ = id => document.getElementById(id);

  const durations = {
    study: 25 * 60 * 1000,
    shortbreak: 5 * 60 * 1000,
    longbreak: 15 * 60 * 1000,
  };

  let mode = 'study';
  let remaining = durations[mode];
  let running = false;
  let lastTick = null;
  let intervalId = null;

  const display = $('timer-display');
  const startBtn = $('startandstop');
  const resetBtn = $('resetbutton');
  const studyBtn = $('studybutton');
  const shortBtn = $('shortbreak');
  const longBtn = $('longbreak');

  function formatTime(ms) {
    const totalSec = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateDisplay() {
    if (display) display.textContent = formatTime(remaining);
    if (startBtn) startBtn.textContent = running ? 'Pause' : 'Start';
  }

  function setMode(newMode) {
    mode = newMode;
    remaining = durations[mode];
    updateActiveButtons();
    updateDisplay();
  }

  function updateActiveButtons() {
    [studyBtn, shortBtn, longBtn].forEach(b => b && b.classList && b.classList.remove('active'));
    const map = {study: studyBtn, shortbreak: shortBtn, longbreak: longBtn};
    if (map[mode] && map[mode].classList) map[mode].classList.add('active');
  }

  function tick() {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;
    remaining -= delta;
    if (remaining <= 0) {
      remaining = 0;
      stopInterval();
      onComplete();
    }
    updateDisplay();
  }

  function startInterval() {
    if (intervalId) return;
    lastTick = Date.now();
    intervalId = setInterval(tick, 250);
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function start() {
    if (running) return;
    if (remaining <= 0) remaining = durations[mode];
    running = true;
    updateDisplay();
    startInterval();
  }

  function pause() {
    if (!running) return;
    running = false;
    stopInterval();
    updateDisplay();
  }

  function reset() {
    running = false;
    stopInterval();
    remaining = durations[mode];
    updateDisplay();
  }

  function toggleStartPause() {
    if (running) pause(); else start();
  }

  function onComplete() {
    playBeep();
    showNotification(`${capitalize(mode)} finished`);
    startBtn && (startBtn.textContent = 'Start');
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.1;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => { o.stop(); ctx.close(); }, 200);
    } catch (e) {
    }
  }


  // Event wiring
  if (startBtn) startBtn.addEventListener('click', toggleStartPause);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (studyBtn) studyBtn.addEventListener('click', () => { setMode('study'); reset(); });
  if (shortBtn) shortBtn.addEventListener('click', () => { setMode('shortbreak'); reset(); });
  if (longBtn) longBtn.addEventListener('click', () => { setMode('longbreak'); reset(); });


  // initializer
  setMode(mode);
  updateDisplay();

})();
