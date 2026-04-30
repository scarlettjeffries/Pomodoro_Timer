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
  const changeBgBtn = $('changebg');

  // Background images from folder
  const bgImages = [
    'Totoro_and_Mei.gif',
    'Howls_Footsteps.gif',
    'Kiki_In_Grass.gif',
    'The_Wind_Rises.gif',
  ];

  // initialize background from saved index
  const BG_KEY = 'studyTimer.bgIndex';
  let bgIndex = parseInt(localStorage.getItem(BG_KEY), 10);
  if (!Number.isFinite(bgIndex) || bgIndex < 0 || bgIndex >= bgImages.length) bgIndex = 0;
  function applyBackground(index) {
    const name = bgImages[index];
    if (!name) return;
    document.body.style.backgroundImage = `url("images/${name}")`;
    localStorage.setItem(BG_KEY, index.toString());
  }

  if (bgImages.length > 0) applyBackground(bgIndex);

  // Open background picker
  function openBgPicker() {
    // prevent multiple overlays
    if (document.getElementById('bg-picker-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'bg-picker-overlay';

    const box = document.createElement('div');
    box.className = 'bg-picker';

    const title = document.createElement('h3');
    title.textContent = 'Choose a background';
    box.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'bg-list';
    bgImages.forEach((filename, i) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'bg-option';
      btn.type = 'button';
      const label = filename.replace(/\.[^.]+$/, '');
      btn.dataset.index = i;
      btn.innerHTML = `<img class="bg-thumb" src="images/${filename}" alt="${label}" loading="lazy"><span class="bg-label">${label}</span>`;
      btn.addEventListener('click', () => {
        bgIndex = i;
        applyBackground(bgIndex);
        close();
      });
      // highlight current selection
      if (i === bgIndex) btn.classList.add('active');
      li.appendChild(btn);
      list.appendChild(li);
    });
    box.appendChild(list);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'bg-close';
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', close);
    box.appendChild(closeBtn);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function escHandler(e) { if (e.key === 'Escape') close(); }
    function close() {
      const el = document.getElementById('bg-picker-overlay');
      if (el) document.body.removeChild(el);
      window.removeEventListener('keydown', escHandler);
    }

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    window.addEventListener('keydown', escHandler);

    // focus first option for accessibility
    const first = overlay.querySelector('.bg-option');
    if (first) first.focus();
  }

  if (changeBgBtn) changeBgBtn.addEventListener('click', openBgPicker);

  // Timer functions
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
