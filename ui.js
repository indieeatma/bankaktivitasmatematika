/* ==========================================================
   ui.js — ikon, helper tampilan, dan komponen reusable
   Komponen: JavaneseButton, WoodCard, MissionCard, TeamCard, CasePanel,
   DataCard, InputField, ProgressBar, Modal, SuccessModal, HintModal,
   NavigationBar, ReflectionCard
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});

  const IMG = 'assets/images/';
  const imgSrc = (n) => IMG + n; // satu pintu untuk alamat gambar
  const nf = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
  const rp = (n) => (Number.isFinite(n) ? nf.format(Math.round(n)).replace(/\s/g, '') : '-');
  const esc = (s) => String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Ikon (gaya garis, 24×24) ---------- */
  const ICONS = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a9 9 0 0 1 0 14"/>',
    mute: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8"/><path d="M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.4 18.1"/><path d="M7 6h1v4"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    wedding: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
    external: '<path d="M14 3h7v7"/><path d="M21 3 10 14"/><path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  };
  function icon(name, size) {
    return `<svg class="ico" width="${size || 20}" height="${size || 20}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  /* ---------- Komponen dasar ---------- */
  /** variant: navy | gold | wood | ghost */
  function JavaneseButton(o) {
    const cls = ['jbtn', 'jbtn-' + (o.variant || 'navy'), o.big ? 'jbtn-big' : '', o.cls || ''].join(' ');
    const attr = (o.action ? ` data-action="${o.action}"` : '') + (o.data ? ' ' + o.data : '') + (o.id ? ` id="${o.id}"` : '') + (o.disabled ? ' disabled' : '');
    const lead = o.icon ? icon(o.icon, 18) : '';
    const tail = o.arrow ? icon('arrow', 18) : '';
    return `<button type="button" class="${cls}"${attr}>${lead}<span>${o.label}</span>${tail}</button>`;
  }
  function WoodCard(inner, cls) { return `<section class="woodcard ${cls || ''}">${inner}</section>`; }
  function DataCard(label, value, ico, cls) {
    return `<div class="datacard ${cls || ''}">${ico ? `<span class="dc-ico">${icon(ico, 20)}</span>` : ''}<div><div class="dc-label">${label}</div><div class="dc-value">${value}</div></div></div>`;
  }
  function ProgressBar(done, total) {
    const pct = Math.round((done / total) * 100);
    return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="Progres misi">
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-text"><strong>${done} / ${total}</strong> Misi Selesai <span class="progress-pct">${pct}%</span></div></div>`;
  }
  /** Field input. type: money | number | text | area */
  function InputField(o) {
    const id = o.id, st = o.status ? ' is-' + o.status : '';
    const common = `id="${id}" name="${id}" ${o.disabled ? 'disabled' : ''} ${o.live ? `data-input="${o.live}"` : ''} autocomplete="off"`;
    let ctl;
    if (o.type === 'area') ctl = `<textarea ${common} rows="${o.rows || 5}" placeholder="${esc(o.placeholder || '')}">${esc(o.value || '')}</textarea>`;
    else ctl = `<div class="field-row">${o.prefix ? `<span class="affix">${o.prefix}</span>` : ''}<input ${common} type="text" inputmode="${o.type === 'money' ? 'decimal' : 'decimal'}" placeholder="${esc(o.placeholder || '')}" value="${esc(o.value || '')}">${o.suffix ? `<span class="affix">${o.suffix}</span>` : ''}</div>`;
    return `<div class="field${st}" data-field="${id}"><label for="${id}">${o.label}</label>${ctl}
      ${o.preview ? `<div class="field-preview" id="${id}-prev" aria-live="polite"></div>` : ''}
      <div class="field-msg" id="${id}-msg" aria-live="polite">${o.message || ''}</div></div>`;
  }
  function TeamCard(t, selected, progress) {
    const c = PAJ.data.cases[PAJ.data.teamCaseMap[t]];
    const done = progress ? PAJ.state.completedCount(progress) : 0;
    return `<button type="button" class="teamcard${selected ? ' is-selected' : ''}" data-action="pick-team" data-team="${t}" aria-pressed="${selected}">
      <span class="tc-ico">${icon(c.icon, 26)}</span>
      <span class="tc-team">TIM ${t}</span>
      <span class="tc-case">KASUS ${c.id}</span>
      <span class="tc-name">${esc(c.title)}</span>
      ${progress ? `<span class="tc-prog">${done > 0 ? done + ' / 4 misi' : 'Sudah dipilih'}</span>` : ''}</button>`;
  }
  function CasePanel(c) {
    return WoodCard(`<header class="panel-head"><span class="ribbon">KASUS ${c.id}</span><h2>${esc(c.title)}</h2></header>
      <div class="panel-body">${c.story.map((p) => `<p>${esc(p)}</p>`).join('')}${c.note ? `<p class="callout">${icon('lightbulb', 18)}<span>${esc(c.note)}</span></p>` : ''}</div>`, 'casepanel');
  }
  const STATUS_LABEL = { locked: 'TERKUNCI', open: 'TERBUKA', completed: 'SELESAI' };
  function MissionCard(m, status) {
    const ico = status === 'locked' ? 'lock' : status === 'completed' ? 'check' : m.icon;
    return `<button type="button" class="missioncard is-${status}" data-action="open-mission" data-route="${m.route}" aria-disabled="${status === 'locked'}">
      <span class="mc-no">${m.no ? m.no : ''}</span>
      <span class="mc-ico">${icon(ico, 28)}</span>
      <span class="mc-name">${m.name}</span>
      <span class="mc-short">${m.short}</span>
      <span class="mc-status">${STATUS_LABEL[status]}</span></button>`;
  }
  /** Satu baris tabel di Reflection Room */
  function ReflectionCard(td, isMine, caseId) {
    const reason = td.reason ? `<details class="reason"><summary>Lihat alasan</summary><p>${esc(td.reason)}</p></details>` : '';
    const first = `<th scope="row">TIM ${esc(td.teamId)}${isMine ? ' <em>(kalian)</em>' : ''}</th>`;
    const dec = `<td class="decision"><strong>${esc(td.decision || '-')}</strong>${reason}</td>`;
    if (caseId === 'C') return `<tr class="${isMine ? 'is-mine' : ''}">${first}<td>${rp(td.annuity24)}</td><td>${rp(td.annuity36)}</td><td>${rp(td.totalInterest24)}</td><td>${rp(td.totalInterest36)}</td>${dec}</tr>`;
    return `<tr class="${isMine ? 'is-mine' : ''}">${first}<td>${rp(td.annuity)}</td><td>${rp(td.interestMonth1)}</td><td>${rp(td.principalMonth1)}</td><td>${rp(td.remainingBalanceMonth1)}</td>${dec}</tr>`;
  }

  /* ---------- Modal ---------- */
  let lastFocus = null, modalCta = null;
  function root() { return document.getElementById('modal-root'); }
  function openModal(o) {
    lastFocus = document.activeElement;
    modalCta = o.onCta || null;
    root().innerHTML = `<div class="modal-backdrop" data-action="modal-close-bg"><div class="modal ${o.cls || ''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      ${o.noClose ? '' : `<button type="button" class="modal-x" data-action="modal-close" aria-label="Tutup">${icon('x', 18)}</button>`}
      ${o.hero || ''}<h2 id="modal-title">${o.title}</h2><div class="modal-body">${o.body || ''}</div>
      <div class="modal-actions">${o.actions || ''}</div></div></div>`;
    root().classList.add('is-open');
    const f = root().querySelector('.modal button:not(.modal-x), .modal input, .modal-x');
    if (f) f.focus();
  }
  function closeModal() {
    root().classList.remove('is-open'); root().innerHTML = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* abaikan */ } }
  }
  function SuccessModal(o) {
    PAJ.audio.success();
    openModal({
      cls: 'modal-success', title: o.title, noClose: true, onCta: o.onCta,
      hero: `<div class="success-mark"><svg viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="23" class="sm-circle"/><path d="M15 27l8 8 15-17" class="sm-check"/></svg></div>`,
      body: `<p>${o.message}</p>`,
      actions: JavaneseButton({ label: o.cta, action: 'modal-cta', arrow: true, big: true }),
    });
  }
  function HintModal(text) {
    openModal({ cls: 'modal-hint', title: 'Petunjuk', hero: `<div class="hint-mark">${icon('lightbulb', 30)}</div>`, body: `<p>${esc(text)}</p>`,
      actions: JavaneseButton({ label: 'MENGERTI', action: 'modal-close', variant: 'gold' }) });
  }
  function runModalCta() { const f = modalCta; closeModal(); if (f) f(); }

  /* ---------- Toast ---------- */
  function toast(msg) {
    const t = document.getElementById('toast-root');
    const el = document.createElement('div'); el.className = 'toast'; el.textContent = msg; t.appendChild(el);
    setTimeout(() => el.classList.add('out'), 2600); setTimeout(() => el.remove(), 3100);
  }

  /* ---------- NavigationBar + strip konteks (UX: selalu tahu posisi) ---------- */
  const PARENT = { teams: 'home', brief: 'teams', dashboard: 'brief', m1: 'dashboard', m2: 'dashboard', m3: 'dashboard', m4: 'dashboard', reflection: 'dashboard', final: 'dashboard' };
  const PAGE_LABEL = {
    teams: 'Pilih Ruang Tim', brief: 'Case Brief', dashboard: 'Dashboard Tim', m1: 'Mission 01 · Memahami Hajat', m2: 'Mission 02 · Menghitung Anuitas',
    m3: 'Mission 03 · Anuitas Lab', m4: 'Mission 04 · Ruang Keputusan', reflection: 'Reflection Room', final: 'Misi Selesai',
  };
  function NavigationBar(route) {
    const S = PAJ.state, t = S.current(), snd = S.sound();
    const c = t ? PAJ.data.cases[t.caseId] : null;
    const back = PARENT[route];
    const next = t && route !== 'home' && route !== 'final' ? nextLabel(t) : '';
    return `<div class="topbar"><div class="tb-left">
        <button type="button" class="roundbtn" data-action="go-home" aria-label="Beranda">${icon('home', 20)}</button>
        ${back ? `<button type="button" class="roundbtn" data-action="go-back" data-route="${back}" aria-label="Kembali">${icon('back', 20)}</button>` : ''}
      </div>
      <div class="tb-brand"><span class="tb-title">PERNIKAHAN ADAT JAWA</span><span class="tb-page">${PAGE_LABEL[route] || ''}</span></div>
      <div class="tb-right">
        <button type="button" class="roundbtn" data-action="open-sound" aria-label="Suara: ${snd ? 'nyala' : 'mati'}">${icon(snd ? 'volume' : 'mute', 20)}</button>
        <button type="button" class="roundbtn" data-action="open-settings" aria-label="Pengaturan">${icon('settings', 20)}</button>
      </div></div>
      ${t && c ? `<div class="ctxstrip"><div class="cs-id"><strong>TIM ${t.teamId} • KASUS ${c.id}</strong><span>${esc(c.title)}</span></div>
        <div class="cs-prog"><div class="cs-bar"><i style="width:${S.percent(t)}%"></i></div><span>${S.completedCount(t)}/4 misi</span></div>
        ${next ? `<div class="cs-next">${icon('arrow', 14)}<span>${next}</span></div>` : ''}</div>` : ''}`;
  }
  function nextLabel(t) {
    const r = PAJ.state.nextRoute(t);
    if (r === 'reflection') return 'Selanjutnya: Reflection Room';
    if (r === 'final') return 'Semua selesai. Buka halaman Misi Selesai.';
    const m = PAJ.data.missions.find((x) => x.key === r);
    return `Selanjutnya: Mission ${m.no}, ${m.name}`;
  }

  PAJ.UI = {
    IMG, imgSrc, rp, esc, icon, JavaneseButton, WoodCard, DataCard, ProgressBar, InputField, TeamCard, CasePanel, MissionCard,
    ReflectionCard, openModal, closeModal, SuccessModal, HintModal, runModalCta, toast, NavigationBar, PARENT,
    actions: {}, inputs: {},
  };
})();
