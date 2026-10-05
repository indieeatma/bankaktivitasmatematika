/* ==========================================================
   app.js — router (hash), navigasi, aksi global, modal suara/pengaturan
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});
  const { state: S, UI, views, audio, data, validation: V } = PAJ;
  const $ = (id) => document.getElementById(id);
  let currentRoute = null;

  /* Tema halaman: tan = halaman informasi, wood = halaman misi, scene = Home/Final */
  const THEME = { home: 'scene', final: 'scene', teams: 'tan', brief: 'tan', reflection: 'tan', dashboard: 'wood', m1: 'wood', m2: 'wood', m3: 'wood', m4: 'wood' };
  const DECOR = {
    teams: ['dc-couple|couple-batik.png', 'dc-gunungan|gunungan.png'],
    brief: ['dc-gunungan|gunungan.png'],
    reflection: ['dc-gunungan|gunungan.png'],
    dashboard: ['dc-pendopo|pendopo.png'], m1: ['dc-pendopo|pendopo.png'], m2: ['dc-pendopo|pendopo.png'], m3: ['dc-pendopo|pendopo.png'], m4: ['dc-pendopo|pendopo.png'],
  };
  const ROUTES = ['home', 'teams', 'brief', 'dashboard', 'm1', 'm2', 'm3', 'm4', 'reflection', 'final'];

  PAJ.navigate = function (route) {
    if (location.hash === '#/' + route) render(); else location.hash = '#/' + route;
  };

  /** Penjaga rute: cegah lompat mission & halaman tanpa tim */
  function guard(route) {
    if (!ROUTES.includes(route)) return 'home';
    if (['home', 'teams'].includes(route)) return route;
    if (!S.current()) return 'teams';
    if (!S.canEnter(route)) {
      if (['m1', 'm2', 'm3', 'm4', 'reflection', 'final'].includes(route)) UI.toast('Selesaikan misi sebelumnya dulu.');
      return 'dashboard';
    }
    return route;
  }

  function render() {
    let route = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0];
    const safe = guard(route);
    if (safe !== route) { history.replaceState(null, '', '#/' + safe); route = safe; }
    UI.closeModal();
    const view = views[route]();
    UI.actions = Object.assign({}, GLOBAL_ACTIONS, view.actions || {});
    UI.inputs = Object.assign({ 'money-prev': moneyPreview, 'vol-bgm': (el) => { const v = Number(el.value) / 100; S.setVolume(v); audio.setBgmVolume(v); showVol(el); }, 'vol-sfx': (el, e) => { const v = Number(el.value) / 100; S.setSfxVolume(v); audio.setSfxVolume(v); showVol(el); if (e && e.type === 'change') audio.click(); } }, view.inputs || {});
    document.body.dataset.route = route;
    document.body.dataset.theme = THEME[route] || 'tan';
    $('decor').innerHTML = (DECOR[route] || []).map((d) => { const [c, f] = d.split('|'); return `<img class="${c}" src="${UI.imgSrc(f)}" alt="" draggable="false">`; }).join('');
    $('header').innerHTML = route === 'home' ? '' : UI.NavigationBar(route);
    const stage = $('view');
    stage.classList.remove('enter'); void stage.offsetWidth;
    stage.innerHTML = view.html;
    stage.classList.add('enter');
    window.scrollTo(0, 0);
    currentRoute = route;
    if (view.mount) view.mount();
  }

  /* ---------- Aksi global (header, modal, suara, pengaturan) ---------- */
  function moneyPreview(el) {
    const out = $(el.id + '-prev'); if (!out) return;
    const v = V.normalizeCurrencyInput(el.value);
    out.textContent = Number.isFinite(v) && el.value.trim() ? '= ' + UI.rp(v) : '';
  }

  /* ---------- Panel suara: efek suara & backsound terpisah ---------- */
  function channelCard(id, title, desc, on, vol) {
    return `<div class="audiocard${on ? '' : ' is-off'}" data-channel="${id}">
      <div class="ac-head"><div><h3>${title}</h3><p>${desc}</p></div>
        <button type="button" class="switch${on ? ' is-on' : ''}" role="switch" aria-checked="${on}" aria-label="${title}" data-action="toggle-${id}"><i></i><b>${on ? 'ON' : 'OFF'}</b></button></div>
      <div class="volrow"><label for="vol-${id}">Volume</label>
        <input id="vol-${id}" type="range" min="0" max="100" step="5" value="${Math.round(vol * 100)}" data-input="vol-${id}" ${on ? '' : 'disabled'}>
        <output id="vol-${id}-out">${Math.round(vol * 100)}%</output></div></div>`;
  }
  function audioPanel() {
    return channelCard('sfx', 'Efek suara', 'Suara klik, jawaban benar, lanjut, dan suara perintah.', S.sfx(), S.sfxVolume()) +
      channelCard('bgm', 'Backsound', 'Gamelan gending Kebo Giro, diputar berulang.', S.bgm(), S.volume()) +
      '<p class="small">Kedua pengaturan berdiri sendiri. Suara baru terdengar setelah klik pertama di halaman.</p>';
  }
  function showVol(el) { const o = $(el.id + '-out'); if (o) o.textContent = el.value + '%'; }
  /** Perbarui panel dan ikon header tanpa menutup modal atau memuat ulang halaman */
  function refreshAudioUI() {
    [['sfx', S.sfx()], ['bgm', S.bgm()]].forEach(([id, on]) => {
      const card = document.querySelector(`.audiocard[data-channel="${id}"]`); if (!card) return;
      card.classList.toggle('is-off', !on);
      const sw = card.querySelector('.switch'); sw.classList.toggle('is-on', on); sw.setAttribute('aria-checked', on); sw.querySelector('b').textContent = on ? 'ON' : 'OFF';
      card.querySelector('input[type=range]').disabled = !on;
    });
    const any = S.sound();
    document.querySelectorAll('[data-action="open-sound"]').forEach((b) => {
      b.innerHTML = UI.icon(any ? 'volume' : 'mute', b.classList.contains('rh-btn') ? 26 : 20);
      b.setAttribute('aria-label', 'Suara: ' + (any ? 'nyala' : 'mati'));
    });
  }
  function soundModal() {
    UI.openModal({ cls: 'modal-audio', title: 'Pengaturan Suara', body: audioPanel(), actions: UI.JavaneseButton({ label: 'TUTUP', action: 'modal-close', variant: 'gold' }) });
  }
  function settingsModal() {
    const t = S.current();
    UI.openModal({
      cls: 'modal-audio', title: 'Pengaturan',
      body: `<h3 class="set-sec">Suara</h3>${audioPanel()}
        <h3 class="set-sec">Tim dan data</h3>
        <p class="small">${t ? `Tim aktif: TIM ${t.teamId}, Kasus ${t.caseId}. Progres tersimpan otomatis di perangkat ini.` : 'Belum ada tim yang dipilih.'}</p>
        <div class="stackbtns">
          ${UI.JavaneseButton({ label: 'Ganti tim (progres tetap tersimpan)', action: 'change-team', variant: 'wood', icon: 'users' })}
          ${t ? UI.JavaneseButton({ label: 'Reset progres tim ini', action: 'ask-reset-team', variant: 'ghost' }) : ''}
          ${UI.JavaneseButton({ label: 'Hapus semua data di perangkat ini', action: 'ask-reset-all', variant: 'ghost' })}
        </div>`,
      actions: UI.JavaneseButton({ label: 'TUTUP', action: 'modal-close', variant: 'gold' }),
    });
  }
  function confirmModal(title, text, action) {
    UI.openModal({ cls: 'modal-small', title, body: `<p>${text}</p>`,
      actions: UI.JavaneseButton({ label: 'BATAL', action: 'modal-close', variant: 'ghost' }) + UI.JavaneseButton({ label: 'YA, LANJUTKAN', action, variant: 'navy' }) });
  }
  const GLOBAL_ACTIONS = {
    'go-home'() { PAJ.navigate('home'); },
    'go-back'(el) { PAJ.navigate(el.dataset.route); },
    'modal-close'() { UI.closeModal(); },
    'modal-close-bg'(el, e) { if (e.target === el) UI.closeModal(); },
    'modal-cta'() { UI.runModalCta(); },
    'open-sound'() { soundModal(); },
    'open-settings'() { settingsModal(); },
    'toggle-sfx'() { S.setSfx(!S.sfx()); audio.setSfx(S.sfx()); refreshAudioUI(); if (S.sfx()) audio.click(); },
    'toggle-bgm'() { S.setBgm(!S.bgm()); audio.setBgm(S.bgm()); refreshAudioUI(); },
    'change-team'() { UI.closeModal(); S.clearSelection(); PAJ.navigate('teams'); },
    'ask-reset-team'() { confirmModal('Reset progres tim ini?', 'Semua jawaban dan status misi TIM ini akan dihapus.', 'do-reset-team'); },
    'ask-reset-all'() { confirmModal('Hapus semua data?', 'Progres semua tim di perangkat ini akan dihapus.', 'do-reset-all'); },
    'do-reset-team'() { const t = S.current(); if (t) S.resetTeam(t.teamId); UI.closeModal(); PAJ.navigate('dashboard'); UI.toast('Progres tim direset.'); },
    'do-reset-all'() { S.resetAll(); UI.closeModal(); PAJ.navigate('home'); UI.toast('Semua data dihapus.'); },
  };

  /* Suara tiap aksi: lanjut / perintah / klik biasa */
  const NEXT = new Set(['start', 'to-dashboard', 'go-next', 'open-mission', 'modal-cta', 'refl-done', 'pick-team']);
  const PROMPT = new Set(['hint', 'open-sound', 'open-settings', 'ask-reset-team', 'ask-reset-all', 'sheet-missing', 'm1-retry']);
  function playFor(action) { if (NEXT.has(action)) audio.next(); else if (PROMPT.has(action)) audio.prompt(); else audio.click(); }

  /* ---------- Event delegation ---------- */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.disabled) return;
    const fn = UI.actions[el.dataset.action];
    if (!fn) return;
    playFor(el.dataset.action);
    fn(el, e);
  });
  ['input', 'change'].forEach((ev) => document.addEventListener(ev, (e) => {
    const k = e.target && e.target.dataset && e.target.dataset.input;
    if (k && UI.inputs[k]) UI.inputs[k](e.target, e);
  }));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('modal-root').classList.contains('is-open')) UI.closeModal();
    if (e.key === 'Enter' && e.target.matches && e.target.matches('.field input') && UI.actions) {
      const btn = document.querySelector('.qcard [data-action$="-check"]'); if (btn) btn.click();
    }
  });
  window.addEventListener('hashchange', render);

  /** Mulai */
  function boot() {
    audio.prime(S.sfx(), S.bgm()); audio.setSfxVolume(S.sfxVolume()); audio.setBgmVolume(S.volume());
    render();
    // Backsound menyala bawaan, tetapi baru dimulai setelah interaksi pertama (aturan autoplay browser)
    const unlock = () => {
      document.removeEventListener('pointerdown', unlock); document.removeEventListener('keydown', unlock);
      if (S.bgm()) audio.setBgm(true); // mulai backsound setelah gesture pertama
    };
    document.addEventListener('pointerdown', unlock); document.addEventListener('keydown', unlock);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
