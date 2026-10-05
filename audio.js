/* ==========================================================
   audio.js — dua kanal suara yang terpisah
   ----------------------------------------------------------
   • Efek suara (SFX): klik, benar, lanjut, suara perintah. On/off + volume sendiri.
   • Backsound (BGM): gending Kebo Giro (assets/audio/kebo-giro.mp3), diputar berulang.
     On/off + volume sendiri. Bila berkas tidak ditemukan, dipakai gamelan sintetis
     sederhana sebagai cadangan (bukan rekaman Kebo Giro).
   Audio baru bunyi setelah klik pertama siswa (aturan autoplay browser).
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});
  const FILE = 'assets/audio/kebo-giro.mp3';

  let ctx = null, sfxGain = null, bgmGain = null;
  let sfxOn = true, bgmOn = true, sfxVol = 0.7, bgmVol = 0.4;
  let fileEl = null, fileBad = false, synthTimer = null, nextTime = 0, beat = 0;

  // ---------- gamelan sintetis (cadangan) ----------
  const BASE = 293.66, CENTS = [0, 240, 480, 720, 960];
  const hz = (d, oct) => BASE * Math.pow(2, (CENTS[(d - 1) % 5] + (d > 5 ? 1200 : 0)) / 1200) * (oct || 1);
  const BALUNGAN = [2, 3, 5, 6, 5, 3, 2, 3, 5, 6, 5, 3, 2, 3, 2, 1];
  const BEAT = 0.82;

  function applyGains() {
    if (sfxGain) sfxGain.gain.value = sfxVol * 2;
    if (bgmGain) bgmGain.gain.value = bgmVol * 1.35;
    if (fileEl) fileEl.volume = bgmVol;
  }
  function ensure() {
    if (ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
      sfxGain = ctx.createGain(); sfxGain.connect(ctx.destination);
      bgmGain = ctx.createGain(); bgmGain.connect(ctx.destination);
      applyGains();
    } catch (e) { ctx = null; return false; }
    return true;
  }
  function bronze(freq, when, dur, vol, partials) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    g.connect(bgmGain);
    (partials || [[1, 1], [2.76, 0.28], [5.4, 0.1]]).forEach((p) => {
      const o = ctx.createOscillator(), pg = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq * p[0]; pg.gain.value = p[1];
      o.connect(pg); pg.connect(g); o.start(when); o.stop(when + dur + 0.05);
    });
  }
  function tick(when) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'square'; o.frequency.value = 1500;
    g.gain.setValueAtTime(0.025, when); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
    o.connect(g); g.connect(bgmGain); o.start(when); o.stop(when + 0.06);
  }
  function scheduleBeat(i, t) {
    const pos = i % 16, d = BALUNGAN[pos];
    bronze(hz(d), t, 1.5, 0.07); bronze(hz(d, 2), t, 0.8, 0.03); bronze(hz(d, 2), t + BEAT / 2, 0.8, 0.03);
    if (pos % 2 === 1) tick(t + 0.02);
    if (pos % 4 === 3) bronze(hz(d, 0.5), t, 2.6, 0.06);
    if (pos === 7 || pos === 11) bronze(hz(d, 0.5), t, 3, 0.05, [[1, 1], [2.1, 0.2]]);
    if (pos === 15) bronze(hz(1, 0.25), t, 7.5, 0.16, [[1, 1], [2.02, 0.35], [3.1, 0.12]]);
  }
  function pump() {
    if (!bgmOn || !ctx) return;
    if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 1.2) { scheduleBeat(beat++, nextTime); nextTime += BEAT; }
  }
  function startSynth() {
    if (synthTimer || !ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    nextTime = ctx.currentTime + 0.1; beat = 0; pump(); synthTimer = setInterval(pump, 250);
  }
  function stopSynth() { clearInterval(synthTimer); synthTimer = null; }

  // ---------- backsound utama: berkas mp3 ----------
  function startFile() {
    if (fileBad) { startSynth(); return; }
    if (!fileEl) {
      fileEl = new Audio(FILE); fileEl.loop = true; fileEl.volume = bgmVol; fileEl.preload = 'auto';
      fileEl.addEventListener('error', () => { fileBad = true; fileEl = null; if (bgmOn) startSynth(); });
    }
    const pr = fileEl.play();
    if (pr && pr.catch) pr.catch((e) => { if (e && e.name !== 'AbortError' && e.name !== 'NotAllowedError') { fileBad = true; fileEl = null; if (bgmOn) startSynth(); } });
  }
  function stopBgm() { stopSynth(); if (fileEl) fileEl.pause(); }

  // ---------- efek suara ----------
  function tone(freq, when, dur, vol, type) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(vol, when + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g); g.connect(sfxGain); o.start(when); o.stop(when + dur + 0.05);
  }
  function sfx(fn) { if (!sfxOn || !ensure()) return; if (ctx.state === 'suspended') ctx.resume(); fn(ctx.currentTime); }

  const audio = {
    /* --- pengaturan --- */
    setSfx(on) { sfxOn = !!on; },
    setBgm(on) { bgmOn = !!on; if (bgmOn) startFile(); else stopBgm(); },
    setSfxVolume(v) { sfxVol = Math.max(0, Math.min(1, v)); applyGains(); },
    setBgmVolume(v) { bgmVol = Math.max(0, Math.min(1, v)); applyGains(); },
    /** Atur status awal tanpa memutar apa pun (dipanggil saat halaman dimuat) */
    prime(sfx, bgm) { sfxOn = !!sfx; bgmOn = !!bgm; },
    isBgmOn() { return bgmOn; },
    /* --- efek --- */
    click() { sfx((t) => tone(660, t, 0.12, 0.08, 'triangle')); },                                   // klik
    next() { sfx((t) => { tone(523.25, t, 0.14, 0.08, 'triangle'); tone(783.99, t + 0.1, 0.22, 0.08, 'triangle'); }); }, // lanjut
    prompt() { sfx((t) => { tone(392, t, 0.4, 0.07, 'sine'); tone(587.33, t + 0.09, 0.5, 0.05, 'sine'); }); },        // perintah / petunjuk
    success() { sfx((t) => [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.14, 0.9, 0.09, 'sine'))); }, // benar
    soft() { sfx((t) => tone(330, t, 0.25, 0.05, 'sine')); },                                       // belum tepat (lembut)
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden && ctx && ctx.state === 'suspended') ctx.resume(); });
  PAJ.audio = audio;
})();
