/* ==========================================================
   views.js — semua halaman (Home → Final)
   Tiap view mengembalikan { html, actions, inputs, mount }.
   `actions` = handler untuk data-action, `inputs` = handler untuk data-input.
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});
  const { data, math: M, validation: V, state: S, UI, charts, audio } = PAJ;
  const { IMG, rp, esc, icon, JavaneseButton: Btn, WoodCard, DataCard, InputField, ProgressBar } = UI;
  const nav = (r) => PAJ.navigate(r);
  const $ = (id) => document.getElementById(id);
  const val = (id) => ($(id) ? $(id).value : '');
  const team = () => S.current();
  const theCase = () => data.cases[team().caseId];
  const img = (n, cls, alt) => `<img class="${cls}" src="${UI.imgSrc(n)}" alt="${alt || ''}" ${alt ? '' : 'aria-hidden="true"'} draggable="false">`;
  const pctText = (v) => String(v).replace('.', ',');

  /** Kepala halaman mission */
  function head(opts) {
    return `<header class="mhead${opts.center ? ' center' : ''}">${img('ornament.png', 'crest')}
      ${opts.ribbon ? `<span class="ribbon">${opts.ribbon}</span>` : ''}<h1>${opts.title}</h1>${opts.lead ? `<p class="lead">${opts.lead}</p>` : ''}</header>`;
  }
  const task = (text) => `<p class="taskline">${icon('arrow', 16)}<span><strong>Tugas kalian:</strong> ${text}</span></p>`;
  const hintBtn = (action) => Btn({ label: 'PETUNJUK', action: action || 'hint', variant: 'gold', icon: 'lightbulb' });

  /** Susun data kasus (Rp) untuk kartu data */
  function caseFacts(c, withLoan) {
    const f = [DataCard('Total kebutuhan', rp(c.totalCost), 'coins'), DataCard('Tabungan', rp(c.savings), 'coins')];
    if (c.additionalFund) f.push(DataCard('Dana tambahan (arisan)', rp(c.additionalFund), 'users'));
    if (withLoan) f.push(DataCard('Pinjaman', rp(c.loan), 'coins', 'is-key'));
    if (c.id === 'C') {
      c.options.forEach((o) => f.push(DataCard('Opsi ' + o.key, `Bunga 1% per bulan, tenor ${o.periods} bulan`, 'calendar')));
    } else {
      f.push(DataCard('Bunga', '1% per bulan', 'chart'), DataCard('Tenor', c.periods + ' bulan', 'calendar'), DataCard('Pembayaran', 'Anuitas bulanan', 'calculator'));
    }
    return f.join('');
  }

  const views = {};

  /* ========================= HOME ========================= */
  views.home = function () {
    const rnd = (a, b) => (a + Math.random() * (b - a)).toFixed(1);
    const leaves = Array.from({ length: 9 }, (_, i) => `<i class="leaf" style="left:${(i * 11 + Math.random() * 8).toFixed(1)}%;animation-delay:${rnd(-18, 0)}s;animation-duration:${rnd(14, 24)}s"></i>`).join('');
    const dots = Array.from({ length: 14 }, () => `<i class="dot" style="left:${rnd(0, 100)}%;top:${rnd(20, 80)}%;animation-delay:${rnd(-6, 0)}s"></i>`).join('');
    const snd = S.sound();
    const ctrl = (cls, action, ico, label) => `<button type="button" class="roundbtn ${cls}" data-action="${action}" aria-label="${label}">${icon(ico, 26)}</button>`;
    const sndLabel = `Suara: ${snd ? 'nyala' : 'mati'}`;
    const html = `<div class="home-wrap">
      <section class="refhome" aria-label="Halaman awal">
        <div class="rh-backdrop" aria-hidden="true"></div>
        <div class="rh-stage">
          <img class="rh-bg" src="${UI.imgSrc('home-bg.jpg')}" alt="Pendopo Jawa, pasangan pengantin, penabuh gamelan, janur, dan gerbang ukir" draggable="false">
          <div class="fx" aria-hidden="true">${leaves}${dots}</div>
          <h1 class="sr-only">Pernikahan Adat Jawa</h1><p class="sr-only">Rencanakan, Hitung, Wujudkan Mimpi Bersama</p>
          ${ctrl('rh-btn rh-home', 'go-home', 'home', 'Beranda')}${ctrl('rh-btn rh-snd', 'open-sound', snd ? 'volume' : 'mute', sndLabel)}${ctrl('rh-btn rh-set', 'open-settings', 'settings', 'Pengaturan')}
          <button type="button" class="startbtn-ref" data-action="start" id="start-btn-ref"><i class="gem"></i><span>Mulai</span>${icon('arrow', 34)}<i class="gem"></i></button>
          <p class="rh-tag"><b>SRAWUNG — Misi Menata Hajat</b><br><em>Merencanakan dengan cermat, menghitung dengan tepat.</em></p>
        </div>
      </section>
      <div class="home">
        <div class="sky"></div><div class="clouds"><i></i><i></i><i></i></div><div class="treeline"></div>
        ${img('pendopo.png', 'h-pendopo')}<div class="h-ground"></div>
        <div class="fx" aria-hidden="true">${leaves}${dots}</div>
        ${img('gate-left.png', 'h-gate h-gate-l')}${img('gate-left.png', 'h-gate h-gate-r')}
        ${img('janur.png', 'h-janur h-janur-l')}${img('janur.png', 'h-janur h-janur-r')}
        ${img('couple.png', 'h-couple', 'Pasangan pengantin Jawa')}${img('gamelan.png', 'h-gamelan', 'Penabuh gamelan')}
        <div class="bush bush-l"></div><div class="bush bush-r"></div>
        <div class="home-top">
          <button type="button" class="roundbtn" data-action="go-home" aria-label="Beranda">${icon('home', 22)}</button>
          <div class="ht-right">
            <button type="button" class="roundbtn" data-action="open-sound" aria-label="${sndLabel}">${icon(snd ? 'volume' : 'mute', 22)}</button>
            <button type="button" class="roundbtn" data-action="open-settings" aria-label="Pengaturan">${icon('settings', 22)}</button>
          </div></div>
        <div class="titleplate">${img('ornament.png', 'tp-crest')}<h1>Pernikahan<br>Adat Jawa</h1>
          <p class="subplate"><b>Rencanakan, Hitung, Wujudkan</b><br>Mimpi Bersama</p></div>
        <div class="startwrap"><button type="button" class="startbtn" data-action="start" id="start-btn"><i class="gem"></i><span>Mulai</span>${icon('arrow', 30)}<i class="gem"></i></button></div>
        <p class="home-tag"><b>SRAWUNG — Misi Menata Hajat</b><br><em>Merencanakan dengan cermat, menghitung dengan tepat.</em></p>
      </div></div>`;
    return {
      html,
      actions: { start() { const t = S.current(); nav(t ? 'dashboard' : 'teams'); } },
      mount() {
        const b = [$('start-btn-ref'), $('start-btn')].find((x) => x && x.offsetParent !== null);
        if (b) b.focus({ preventScroll: true });
      },
    };
  };

  /* ========================= PILIH TIM ========================= */
  views.teams = function () {
    const sel = S.selectedTeamId();
    const cards = data.TEAM_IDS.map((t) => UI.TeamCard(t, t === sel, S.teamProgress(t))).join('');
    const html = `<main class="page page-teams">${img('janur.png', 'deco deco-janur-l')}${img('janur.png', 'deco deco-janur-r')}
      ${head({ center: true, title: 'PILIH RUANG TIM', lead: 'Sembilan tim. Tiga kisah. Satu misi.' })}
      <div class="teamgrid">${cards}</div>
      <p class="note-center">Kasus ditentukan otomatis dari nomor tim. Tim yang sama selalu mendapat kasus yang sama.</p></main>`;
    return {
      html,
      actions: {
        'pick-team'(el) {
          const id = el.dataset.team;
          S.selectTeam(id);
          document.querySelectorAll('.teamcard').forEach((c) => { c.classList.toggle('is-selected', c === el); c.setAttribute('aria-pressed', c === el); });
          const t = S.current();
          setTimeout(() => {
            if (t.briefSeen) { UI.toast(`Selamat datang kembali, TIM ${id}.`); nav('dashboard'); } else nav('brief');
          }, 380);
        },
      },
    };
  };

  /* ========================= CASE BRIEF ========================= */
  views.brief = function () {
    const t = team(), c = theCase();
    const html = `<main class="page page-brief">
      <div class="brief-grid">
        <div>
          <section class="welcome"><h1>Selamat datang, TIM ${t.teamId}.</h1>
            <p>Peran kalian:<br><strong>Tim Perencana Keuangan</strong></p></section>
          ${UI.CasePanel(c)}
        </div>
        <aside class="brief-side">${img('couple-batik.png', 'brief-couple', 'Pasangan pengantin Jawa')}</aside>
      </div>
      ${WoodCard(`<h2 class="sub">Data kasus kalian</h2><div class="datagrid">${caseFacts(c, false)}</div>`)}
      ${WoodCard(`<h2 class="sub">Misi tim kalian</h2><ol class="tasklist">${c.tasks.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`)}
      <div class="actions-center">${Btn({ label: 'MASUK KE DASHBOARD', action: 'to-dashboard', big: true, arrow: true })}</div></main>`;
    return { html, actions: { 'to-dashboard'() { S.markBriefSeen(); nav('dashboard'); } } };
  };

  /* ========================= DASHBOARD ========================= */
  views.dashboard = function () {
    const t = team(), c = theCase();
    const cards = data.missions.map((m) => UI.MissionCard(Object.assign({ route: m.key }, m), S.missionStatus(m.key))).join('') +
      UI.MissionCard({ route: 'reflection', no: '', name: 'REFLECTION ROOM', short: 'Bandingkan cara berpikir dengan tim satu kasus.', icon: 'users' }, S.missionStatus('reflection'));
    const nextR = S.nextRoute();
    const nextName = nextR === 'reflection' ? 'Reflection Room' : nextR === 'final' ? 'Halaman Misi Selesai' : (() => { const m = data.missions.find((x) => x.key === nextR); return `Mission ${m.no}, ${m.name}`; })();
    const html = `<main class="page page-dash">
      <section class="woodcard dash-hero"><div class="dh-id"><span class="dh-brand">PERNIKAHAN ADAT JAWA</span>
        <div class="dh-team">TIM ${t.teamId}</div><div class="dh-case">KASUS ${c.id}</div><h1>“${esc(c.title)}”</h1></div>
        <div class="dh-prog">${ProgressBar(S.completedCount(), 4)}</div></section>
      <div class="nextup">${icon('arrow', 18)}<span>Langkah berikutnya: <strong>${nextName}</strong></span>${Btn({ label: nextR === 'final' ? 'BUKA' : 'LANJUTKAN', action: 'open-mission', data: `data-route="${nextR}"`, variant: 'gold' })}</div>
      <div class="missiongrid">${cards}</div></main>`;
    return {
      html,
      actions: {
        'open-mission'(el) {
          const r = el.dataset.route;
          if (!S.canEnter(r)) {
            const idx = ['m1', 'm2', 'm3', 'm4'].indexOf(r);
            UI.toast(r === 'reflection' ? 'Selesaikan Mission 01–04 dulu untuk membuka Reflection Room.' : `Selesaikan Mission 0${idx} dulu.`);
            audio.soft(); return;
          }
          nav(r);
        },
      },
    };
  };

  /* ========================= MISSION 01 ========================= */
  views.m1 = function () {
    const t = team(), c = theCase(), m = t.missions.m1;
    const expected = M.requiredFunding(c);
    const facts = [DataCard('Total kebutuhan', rp(c.totalCost), 'coins'), DataCard('Tabungan', rp(c.savings), 'coins')];
    if (c.additionalFund) facts.push(DataCard('Dana tambahan (arisan)', rp(c.additionalFund), 'users'));
    const html = `<main class="page page-m">
      ${head({ ribbon: 'MISSION 01', title: 'MEMAHAMI HAJAT', lead: 'Sebelum menghitung cicilan, pastikan dulu berapa dana yang benar-benar dibutuhkan dari pembiayaan.' })}
      <div class="mgrid">
        <aside class="illus">${img('pendopo.png', 'illus-pendopo', 'Pendopo tempat hajat')}${img('couple.png', 'illus-couple', 'Pengantin Jawa')}</aside>
        <div class="stack">
          ${WoodCard(`<h2 class="sub">Data kasus</h2><div class="datagrid">${facts.join('')}</div>${c.note ? `<p class="callout">${icon('lightbulb', 18)}<span>${esc(c.note)}</span></p>` : ''}`)}
          ${WoodCard(`${task('hitung dana yang masih harus dipenuhi keluarga.')}
            <h2 class="q">Berapa dana yang masih harus dipenuhi keluarga melalui pembiayaan?</h2>
            ${InputField({ id: 'm1-a', label: 'Jawaban kalian', prefix: 'Rp', placeholder: 'contoh: 25.000.000', value: m.done ? String(m.answer) : '', disabled: m.done, preview: true, live: 'money-prev' })}
            <div id="m1-fb" class="fb" aria-live="polite">${m.done ? `<div class="fb-ok">${icon('check', 18)} Benar. Kalian telah menemukan kebutuhan pembiayaan.</div>` : ''}</div>
            <div class="btnrow" id="m1-btns">${m.done ? Btn({ label: 'LANJUT KE MISSION 02', action: 'go-next', arrow: true }) : Btn({ label: 'PERIKSA JAWABAN', action: 'm1-check', icon: 'check' }) + hintBtn()}</div>`, 'qcard')}
        </div></div></main>`;
    return {
      html,
      actions: {
        hint() { UI.HintModal(data.hints.m1 + (c.id === 'B' ? ' ' + data.hints.m1B : '')); },
        'go-next'() { nav('m2'); },
        'm1-check'() {
          const v = V.normalizeCurrencyInput(val('m1-a')), fld = document.querySelector('[data-field="m1-a"]'), fb = $('m1-fb');
          if (!Number.isFinite(v)) { fb.innerHTML = `<div class="fb-soft">Isi jawaban kalian dulu, ya.</div>`; return; }
          if (V.withinTolerance(v, expected, 0.5)) {
            S.saveMission('m1', { done: true, answer: v });
            UI.SuccessModal({ title: 'Benar!', message: 'Benar. Kalian telah menemukan kebutuhan pembiayaan.', cta: 'LANJUT KE MISSION 02', onCta: () => nav('m2') });
          } else {
            fld.classList.remove('wobble'); void fld.offsetWidth; fld.classList.add('wobble');
            fb.innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>${data.hints.m1wrong}</span></div>`;
            $('m1-btns').innerHTML = Btn({ label: 'COBA LAGI', action: 'm1-retry', variant: 'wood', icon: 'back' }) + hintBtn();
            audio.soft();
          }
        },
        'm1-retry'() { const i = $('m1-a'); i.value = ''; $('m1-a-prev').textContent = ''; $('m1-fb').innerHTML = ''; $('m1-btns').innerHTML = Btn({ label: 'PERIKSA JAWABAN', action: 'm1-check', icon: 'check' }) + hintBtn(); i.focus(); },
      },
      inputs: {},
    };
  };

  /* ========================= MISSION 02 ========================= */
  views.m2 = function () {
    const t = team(), c = theCase();
    let m = t.missions.m2;
    const isC = c.id === 'C';
    const opts = isC ? c.options : [{ key: '', name: c.periods + ' Bulan', periods: c.periods }];
    let cur = opts[0].key;
    const saved = (k) => (isC ? (m.opts || {})[k] : m.done ? m : null);
    const isDone = (k) => !!(saved(k) && saved(k).done);
    const spec = (k) => opts.find((o) => o.key === k);

    function calcHTML() {
      const o = spec(cur), s = saved(cur), done = isDone(cur), pf = 'm2' + cur + '-';
      const tabs = isC ? `<div class="tabs" role="tablist">${opts.map((x) => `<button type="button" role="tab" class="tab${x.key === cur ? ' is-active' : ''}" data-action="m2-tab" data-opt="${x.key}" aria-selected="${x.key === cur}">Opsi ${x.key} · ${x.name}${isDone(x.key) ? ' ✓' : ''}</button>`).join('')}</div>` : '';
      const f = (id, label, type, extra) => InputField(Object.assign({ id: pf + id, label, disabled: done, value: done && s ? String(s[id]) : '', status: done ? 'ok' : '' }, extra));
      return `${tabs}<div class="calc-facts">${DataCard('Pokok pinjaman', rp(c.loan), 'coins')}${DataCard('Bunga', '1% per bulan', 'chart')}${DataCard('Tenor', o.periods + ' bulan', 'calendar')}</div>
        <div class="calc-grid">
          ${f('p', 'Pokok Pinjaman (M)', 'money', { prefix: 'Rp', placeholder: 'dari Mission 01' })}
          ${f('i', 'Suku Bunga per Bulan (i)', 'number', { suffix: '%', placeholder: 'contoh: 2' })}
          ${f('n', 'Tenor (n)', 'number', { suffix: 'bulan', placeholder: 'jumlah bulan' })}
          ${f('a', 'Besar Anuitas (A)', 'money', { prefix: 'Rp', placeholder: 'hasil perhitungan', preview: true, live: 'money-prev' })}
        </div>
        <div id="m2-fb" class="fb" aria-live="polite">${done ? `<div class="fb-ok">${icon('check', 18)} Anuitas ${isC ? 'Opsi ' + cur : ''} sudah tepat.</div>` : ''}</div>
        <div class="btnrow">${m.done ? Btn({ label: 'LANJUT KE ANUITAS LAB', action: 'go-next', arrow: true }) : done ? '' : Btn({ label: 'PERIKSA ANUITAS', action: 'm2-check', icon: 'check' }) + hintBtn()}</div>`;
    }

    const html = `<main class="page page-m">
      ${head({ ribbon: 'MISSION 02', title: 'MENENTUKAN ANUITAS' })}
      <div class="mgrid mgrid-calc">
        <div class="stack">
          ${WoodCard(`<h2 class="sub">Konsep singkat</h2>
            <p><strong>Anuitas</strong> adalah pembayaran berkala dengan jumlah yang sama selama periode tertentu.</p>
            <div class="formula" role="img" aria-label="A sama dengan M kali i, dibagi satu dikurangi satu tambah i pangkat negatif n">A = <span class="frac"><span>M × i</span><span>1 − (1+i)<sup>−n</sup></span></span></div>
            <dl class="legend"><dt>A</dt><dd>besar anuitas</dd><dt>M</dt><dd>besar pinjaman (pokok pinjaman)</dd><dt>i</dt><dd>suku bunga per periode</dd><dt>n</dt><dd>jumlah periode</dd></dl>`)}
          ${WoodCard(`<h2 class="sub">Kalkulator bantu</h2><p class="small">Bantu hitung bagian-bagian rumus. Hasil akhir anuitas tetap kalian hitung sendiri.</p>
            <div class="helper helper3"><div class="field"><label for="hp-m">M (Rp), boleh dikosongkan</label><input id="hp-m" data-input="helper" type="text" inputmode="decimal" placeholder="mis. 80.000.000"></div>
            <div class="field"><label for="hp-i">i (%)</label><input id="hp-i" data-input="helper" type="text" inputmode="decimal" placeholder="mis. 2"></div>
            <div class="field"><label for="hp-n">n</label><input id="hp-n" data-input="helper" type="text" inputmode="decimal" placeholder="mis. 12"></div></div>
            <ol class="helper-out" id="hp-out" aria-live="polite"><li>M × i = …</li><li>(1 + i)<sup>−n</sup> = …</li><li>1 − (1 + i)<sup>−n</sup> = …</li></ol>
            <p class="small">Terakhir, bagi hasil baris pertama dengan hasil baris ketiga.</p>`, 'helpercard')}
        </div>
        ${WoodCard(`${task('masukkan M, i, n, lalu tentukan besar anuitasnya.')}<div id="m2-calc">${calcHTML()}</div>`, 'qcard')}
      </div></main>`;

    function remount() { $('m2-calc').innerHTML = calcHTML(); }
    function setStatus(id, ok, msg) {
      const f = document.querySelector(`[data-field="${id}"]`); if (!f) return;
      f.classList.remove('is-ok', 'is-bad'); f.classList.add(ok ? 'is-ok' : 'is-bad');
      $(id + '-msg').textContent = ok ? '✓' : msg;
    }
    return {
      html,
      actions: {
        hint() { UI.HintModal(data.hints.m2); },
        'go-next'() { nav('m3'); },
        'm2-tab'(el) { cur = el.dataset.opt; remount(); },
        'm2-check'() {
          const o = spec(cur), pf = 'm2' + cur + '-';
          const p = V.normalizeCurrencyInput(val(pf + 'p')), i = V.parsePercent(val(pf + 'i')), n = V.parsePlainNumber(val(pf + 'n')), a = V.normalizeCurrencyInput(val(pf + 'a'));
          const exp = M.calculateAnnuity(c.loan, c.rate, o.periods);
          const ok = { p: V.withinTolerance(p, c.loan, 1), i: V.withinTolerance(i, c.rate * 100, 0.001), n: n === o.periods, a: V.withinTolerance(a, exp, data.SETTINGS.toleranceAnnuity) };
          setStatus(pf + 'p', ok.p, 'Periksa pokok pinjaman dari hasil Mission 01.');
          setStatus(pf + 'i', ok.i, 'Suku bunga per bulan belum sesuai data kasus.');
          setStatus(pf + 'n', ok.n, 'Tenor belum sesuai data kasus.');
          const near = Number.isFinite(a) && Math.abs(a - exp) / exp < 0.02;
          setStatus(pf + 'a', ok.a, ok.p && ok.i && ok.n ? (near ? data.hints.m2close : 'Anuitas belum tepat. Coba hitung ulang dengan rumus.') : 'Pastikan P, i, dan n benar dulu.');
          const fb = $('m2-fb');
          if (!(ok.p && ok.i && ok.n && ok.a)) { fb.innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>Belum semua tepat. Perhatikan kolom yang bertanda, lalu coba lagi.</span></div>`; audio.soft(); return; }
          const rec = { done: true, p, i, n, a };
          if (isC) {
            const opts2 = Object.assign({}, m.opts || {}); opts2[cur] = rec;
            const all = opts.every((x) => opts2[x.key] && opts2[x.key].done);
            m = S.saveMission('m2', { opts: opts2, done: all });
            if (!all) { UI.toast(`Opsi ${cur} tepat. Lanjut ke opsi berikutnya.`); cur = opts.find((x) => !opts2[x.key] || !opts2[x.key].done).key; remount(); return; }
          } else m = S.saveMission('m2', rec);
          remount();
          UI.SuccessModal({ title: 'Anuitas ditemukan!', message: isC ? 'Kedua anuitas sudah tepat. Sekarang bongkar rinciannya di Anuitas Lab.' : 'Besar cicilan tetap setiap bulan sudah tepat. Sekarang bongkar rinciannya di Anuitas Lab.', cta: 'LANJUT KE MISSION 03', onCta: () => nav('m3') });
        },
      },
      inputs: {
        helper() {
          const f = (v) => v.toLocaleString('id-ID', { maximumFractionDigits: 6 });
          const M0 = V.normalizeCurrencyInput(val('hp-m')), i = V.parsePercent(val('hp-i')) / 100, n = V.parsePlainNumber(val('hp-n'));
          const okI = Number.isFinite(i) && i > -1, okN = Number.isFinite(n) && n >= 0 && n <= 600;
          const pw = okI && okN ? Math.pow(1 + i, -n) : NaN;
          $('hp-out').innerHTML =
            `<li>M × i = <strong>${Number.isFinite(M0) && okI ? rp(M0 * i) : '…'}</strong></li>` +
            `<li>(1 + i)<sup>−n</sup> = <strong>${Number.isFinite(pw) ? f(pw) : '…'}</strong></li>` +
            `<li>1 − (1 + i)<sup>−n</sup> = <strong>${Number.isFinite(pw) ? f(1 - pw) : '…'}</strong></li>`;
        },
      },
    };
  };

  /* ========================= MISSION 03 — ANUITAS LAB ========================= */
  function labModel(c, t) {
    if (c.id === 'C') {
      const s = c.options.map((o) => M.summarize(c.loan, c.rate, o.periods));
      return {
        sums: s,
        fields: [
          { id: 'a24', label: 'Anuitas 24 bulan', exp: s[0].annuity }, { id: 'a36', label: 'Anuitas 36 bulan', exp: s[1].annuity },
          { id: 'tp24', label: 'Total pembayaran (24 bulan)', exp: s[0].totalPayment }, { id: 'tp36', label: 'Total pembayaran (36 bulan)', exp: s[1].totalPayment },
          { id: 'ti24', label: 'Total bunga (24 bulan)', exp: s[0].totalInterest }, { id: 'ti36', label: 'Total bunga (36 bulan)', exp: s[1].totalInterest },
        ],
      };
    }
    const s = M.summarize(c.loan, c.rate, c.periods);
    return {
      sums: [s],
      fields: [
        { id: 'i1', label: '1. Bunga bulan pertama', exp: s.month1.interest }, { id: 'p1', label: '2. Angsuran pokok bulan pertama', exp: s.month1.principal },
        { id: 's1', label: '3. Sisa pinjaman bulan pertama', exp: s.month1.closingBalance }, { id: 'i12', label: '4. Bunga bulan ke-12', exp: s.month12.interest },
        { id: 'p12', label: '5. Angsuran pokok bulan ke-12', exp: s.month12.principal }, { id: 's12', label: '6. Sisa pinjaman bulan ke-12', exp: s.month12.closingBalance },
        { id: 'ti', label: '7. Total bunga', exp: s.totalInterest },
      ],
    };
  }
  function labCharts(c, sums) {
    const col = { gold: '#D9A441', wood: '#70432B', navy: '#17385F' };
    if (c.id === 'C') {
      const ser = (key, f) => sums.map((s, i) => ({ name: c.options[i].name, color: i ? col.gold : col.navy, values: s.schedule.map(f) }));
      return charts.renderChart({ title: 'Bunga per bulan', type: 'line', series: ser('i', (r) => r.interest) }) +
        charts.renderChart({ title: 'Angsuran pokok per bulan', type: 'line', series: ser('p', (r) => r.principal) }) +
        charts.renderChart({ title: 'Sisa pinjaman', type: 'line', series: ser('s', (r) => r.closingBalance) });
    }
    const sc = sums[0].schedule;
    return charts.renderChart({ title: 'Bunga per bulan', type: 'line', series: [{ name: 'Bunga', color: col.gold, values: sc.map((r) => r.interest) }] }) +
      charts.renderChart({ title: 'Angsuran pokok per bulan', type: 'bar', series: [{ name: 'Angsuran pokok', color: col.wood, values: sc.map((r) => r.principal) }] }) +
      charts.renderChart({ title: 'Sisa pinjaman', type: 'line', series: [{ name: 'Sisa pinjaman', color: col.navy, values: sc.map((r) => r.closingBalance) }] });
  }
  function scheduleTable(sum, label) {
    return `<details class="sched"><summary>Tabel amortisasi acuan${label ? ' (' + label + ')' : ''}</summary><div class="tablewrap"><table class="grid">
      <thead><tr><th>Periode</th><th>Saldo Awal</th><th>Anuitas</th><th>Bunga</th><th>Angsuran Pokok</th><th>Sisa Pinjaman</th></tr></thead><tbody>
      ${sum.schedule.map((r) => `<tr><td>${r.period}</td><td>${rp(r.openingBalance)}</td><td>${rp(r.annuity)}</td><td>${rp(r.interest)}</td><td>${rp(r.principal)}</td><td>${rp(r.closingBalance)}</td></tr>`).join('')}
      </tbody></table></div></details>`;
  }

  views.m3 = function () {
    const t = team(), c = theCase(), m = t.missions.m3;
    const model = labModel(c, t), isC = c.id === 'C';
    const urlOk = /^https?:\/\//i.test(spreadsheetURL);
    const pats = isC ? data.patternChecks.C : data.patternChecks.AB;
    const m2 = t.missions.m2;
    const annuityNote = isC ? '' : DataCard('Anuitas (hasil Mission 02)', rp((m2 && m2.a) || 0), 'calculator');
    const sheetBtn = urlOk
      ? `<a class="jbtn jbtn-navy jbtn-big" href="${esc(spreadsheetURL)}" target="_blank" rel="noopener" data-action="sheet-opened">${icon('table', 20)}<span>BUKA SPREADSHEET</span>${icon('external', 18)}</a>`
      : Btn({ label: 'BUKA SPREADSHEET', action: 'sheet-missing', big: true, icon: 'table' });

    const resultsHTML = () => `<div class="lab-results">
      ${WoodCard(`<h2 class="sub">Peta pola cicilan</h2><p>Amati grafik berikut, lalu cocokkan dengan tabel di spreadsheet kalian.</p>
        <div class="chartgrid">${labCharts(c, model.sums)}</div>
        ${model.sums.map((s, i) => scheduleTable(s, isC ? c.options[i].name : '')).join('')}`)}
      ${WoodCard(`<h2 class="sub">Apa pola yang kalian lihat?</h2><div class="patgrid">
        ${pats.map((p) => { const op = p.options || ['naik', 'tetap', 'turun']; const sv = (m.patterns || {})[p.id] || '';
          return `<div class="field" data-field="pat-${p.id}"><label for="pat-${p.id}">${p.label}</label><select id="pat-${p.id}" ${m.done ? 'disabled' : ''}><option value="">Pilih…</option>${op.map((o) => `<option value="${o}"${sv === o ? ' selected' : ''}>${o}</option>`).join('')}</select><div class="field-msg" id="pat-${p.id}-msg"></div></div>`; }).join('')}</div>
        <div id="m3-fb2" class="fb" aria-live="polite"></div>
        <div class="btnrow">${m.done ? Btn({ label: 'LANJUT KE MISSION 04', action: 'go-next', arrow: true }) : Btn({ label: 'SELESAIKAN MISSION 03', action: 'm3-finish', icon: 'check' })}</div>`)}
    </div>`;

    const html = `<main class="page page-m">
      ${head({ ribbon: 'MISSION 03', title: 'ANUITAS LAB', lead: 'Bongkar setiap cicilan.' })}
      ${WoodCard(`<h2 class="sub">Susun tabel di spreadsheet</h2>
        <p>Setiap pembayaran anuitas terdiri dari <strong>bunga</strong> dan <strong>angsuran pokok</strong>. Buka spreadsheet kelas, pilih <strong>sheet tim kalian (TIM ${t.teamId})</strong>, lalu isi tabel berikut.</p>
        <div class="datagrid">${DataCard('Pokok pinjaman', rp(c.loan), 'coins')}${DataCard('Bunga', '1% per bulan', 'chart')}${isC ? DataCard('Tenor', '24 bulan dan 36 bulan', 'calendar') : DataCard('Tenor', c.periods + ' bulan', 'calendar')}${annuityNote}</div>
        ${isC ? `<p class="callout">${icon('lightbulb', 18)}<span>Cukup satu tabel yang tenornya dapat diubah (24 dan 36 bulan). Tidak perlu membuat dua tabel panjang.</span></p>` : ''}
        <div class="tablewrap"><table class="grid formulas"><thead><tr><th>Periode</th><th>Saldo Awal</th><th>Anuitas</th><th>Bunga</th><th>Angsuran Pokok</th><th>Sisa Pinjaman</th></tr></thead><tbody>
          <tr><td>1</td><td>pokok pinjaman</td><td>A</td><td>Saldo Awal × i</td><td>Anuitas − Bunga</td><td>Saldo Awal − Angsuran Pokok</td></tr>
          <tr><td>2</td><td>Sisa Pinjaman periode 1</td><td>A</td><td>Saldo Awal × i</td><td>Anuitas − Bunga</td><td>Saldo Awal − Angsuran Pokok</td></tr>
          <tr><td>…</td><td colspan="5">Lanjutkan sampai periode terakhir. Sisa pinjaman akhir mendekati nol karena pembulatan.</td></tr></tbody></table></div>
        <div class="btnrow">${sheetBtn}${hintBtn()}</div>`, 'labcard')}
      ${WoodCard(`${task('isi hasil dari spreadsheet kalian.')}<h2 class="q">Masukkan hasil analisis kalian.</h2>
        <p class="small">Toleransi pembulatan ±${rp(data.SETTINGS.toleranceLab)}. ${isC ? '' : 'Bulan ke-12 dihitung setelah 12 kali pembayaran.'}</p>
        <div class="calc-grid">${model.fields.map((f) => { const sv = (m.values || {})[f.id]; return InputField({ id: 'm3-' + f.id, label: f.label, prefix: 'Rp', disabled: !!m.fieldsOk, value: m.fieldsOk && sv !== undefined ? String(sv) : '', status: m.fieldsOk ? 'ok' : '', preview: true, live: 'money-prev' }); }).join('')}</div>
        <div id="m3-fb" class="fb" aria-live="polite">${m.fieldsOk ? `<div class="fb-ok">${icon('check', 18)} Semua hasil tepat.</div>` : ''}</div>
        ${m.fieldsOk ? '' : `<div class="btnrow">${Btn({ label: 'PERIKSA HASIL', action: 'm3-check', icon: 'check' })}${hintBtn()}</div>`}`, 'qcard')}
      <div id="m3-results">${m.fieldsOk ? resultsHTML() : ''}</div></main>`;

    return {
      html,
      actions: {
        hint() { UI.HintModal(data.hints.m3); },
        'go-next'() { nav('m4'); },
        'sheet-opened'() { /* tautan dibuka di tab baru oleh browser */ },
        'sheet-missing'() {
          UI.openModal({ title: 'Link spreadsheet belum diisi', body: '<p>Guru belum memasukkan link Google Spreadsheet. Beri tahu gurumu agar mengisi variabel <code>spreadsheetURL</code> di berkas <code>js/data.js</code>.</p>', actions: Btn({ label: 'MENGERTI', action: 'modal-close', variant: 'gold' }) });
        },
        'm3-check'() {
          const tol = data.SETTINGS.toleranceLab, got = {}; let all = true;
          model.fields.forEach((f) => {
            const v = V.normalizeCurrencyInput(val('m3-' + f.id)), ok = V.withinTolerance(v, f.exp, tol);
            got[f.id] = v; if (!ok) all = false;
            const fld = document.querySelector(`[data-field="m3-${f.id}"]`);
            fld.classList.remove('is-ok', 'is-bad'); fld.classList.add(ok ? 'is-ok' : 'is-bad');
            $('m3-' + f.id + '-msg').textContent = ok ? '✓' : data.labFieldHints[f.id];
          });
          const fb = $('m3-fb');
          if (!all) { fb.innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>Beberapa hasil belum tepat. Cek rumus di spreadsheet, lalu coba lagi.</span></div>`; audio.soft(); return; }
          S.saveMission('m3', { fieldsOk: true, values: got });
          m.fieldsOk = true; m.values = got;
          fb.innerHTML = `<div class="fb-ok">${icon('check', 18)} Semua hasil tepat. Sekarang amati polanya.</div>`;
          model.fields.forEach((f) => { $('m3-' + f.id).disabled = true; });
          document.querySelector('.qcard .btnrow').remove();
          $('m3-results').innerHTML = resultsHTML(); audio.success();
          $('m3-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
        'm3-finish'() {
          const chosen = {}; let all = true, missing = false;
          pats.forEach((p) => {
            const v = val('pat-' + p.id); chosen[p.id] = v;
            const fld = document.querySelector(`[data-field="pat-${p.id}"]`); fld.classList.remove('is-ok', 'is-bad');
            if (!v) { missing = true; all = false; return; }
            const ok = v === p.answer; if (!ok) all = false; fld.classList.add(ok ? 'is-ok' : 'is-bad');
          });
          const fb = $('m3-fb2');
          if (missing) { fb.innerHTML = '<div class="fb-soft">Pilih jawaban untuk ketiga pengamatan dulu.</div>'; return; }
          if (!all) { fb.innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>Lihat kembali grafiknya, lalu perbaiki pilihan yang bertanda.</span></div>`; audio.soft(); return; }
          S.saveMission('m3', { done: true, patterns: chosen });
          UI.SuccessModal({ title: 'Lab selesai!', message: 'Kalian sudah membongkar cicilan dan menemukan polanya. Saatnya memberi rekomendasi kepada keluarga.', cta: 'LANJUT KE MISSION 04', onCta: () => nav('m4') });
        },
      },
    };
  };

  /* ========================= MISSION 04 — RUANG KEPUTUSAN ========================= */
  views.m4 = function () {
    const t = team(), c = theCase(), m = t.missions.m4, isC = c.id === 'C';
    const sums = isC ? c.options.map((o) => M.summarize(c.loan, c.rate, o.periods)) : [M.summarize(c.loan, c.rate, c.periods)];
    const choices = isC
      ? [{ k: 'opsi1', l: 'Pilih Opsi 1 (24 bulan)' }, { k: 'opsi2', l: 'Pilih Opsi 2 (36 bulan)' }]
      : [{ k: 'dapat', l: 'Skema dapat dipertimbangkan' }, { k: 'kembali', l: 'Skema perlu dipertimbangkan kembali' }];
    const question = isC ? 'Bagaimana perbedaan tenor memengaruhi beban pembayaran bulanan dan total bunga?'
      : c.id === 'B' ? 'Jelaskan keputusan kalian berdasarkan hasil perhitungan. Jelaskan juga bagaimana dana arisan memengaruhi kebutuhan pinjaman dan beban pembayaran.'
        : 'Jelaskan keputusan kalian berdasarkan hasil perhitungan.';

    let summary;
    if (isC) {
      summary = `<div class="tablewrap"><table class="grid compare"><thead><tr><th></th><th>OPTION 1<br><small>24 bulan</small></th><th>OPTION 2<br><small>36 bulan</small></th></tr></thead><tbody>
        <tr><th scope="row">Anuitas</th><td>${rp(sums[0].annuity)}</td><td>${rp(sums[1].annuity)}</td></tr>
        <tr><th scope="row">Total Pembayaran</th><td>${rp(sums[0].totalPayment)}</td><td>${rp(sums[1].totalPayment)}</td></tr>
        <tr><th scope="row">Total Bunga</th><td>${rp(sums[0].totalInterest)}</td><td>${rp(sums[1].totalInterest)}</td></tr>
        <tr><th scope="row">Tenor</th><td>24 bulan</td><td>36 bulan</td></tr></tbody></table></div>`;
    } else {
      const s = sums[0];
      summary = `<div class="datagrid">${DataCard('Anuitas', rp(s.annuity), 'calculator')}${DataCard('Total pembayaran', rp(s.totalPayment), 'coins')}${DataCard('Total bunga', rp(s.totalInterest), 'coins')}
        ${DataCard('Bunga bulan 1 → 12', `${rp(s.month1.interest)} → ${rp(s.month12.interest)}`, 'chart')}${DataCard('Angsuran pokok bulan 1 → 12', `${rp(s.month1.principal)} → ${rp(s.month12.principal)}`, 'chart')}${DataCard('Sisa pinjaman bulan 12', rp(s.month12.closingBalance), 'chart')}</div>`;
      if (c.id === 'B') {
        const a = M.summarize(data.cases.A.loan, c.rate, c.periods);
        summary += `<h3 class="sub2">Perbandingan dengan Kasus A</h3><div class="tablewrap"><table class="grid compare"><thead><tr><th></th><th>Kasus A</th><th>Kasus B (kalian)</th></tr></thead><tbody>
          <tr><th scope="row">Pinjaman</th><td>${rp(a.principal)}</td><td>${rp(s.principal)}</td></tr>
          <tr><th scope="row">Anuitas</th><td>${rp(a.annuity)}</td><td>${rp(s.annuity)}</td></tr>
          <tr><th scope="row">Total bunga</th><td>${rp(a.totalInterest)}</td><td>${rp(s.totalInterest)}</td></tr></tbody></table></div>`;
      }
    }

    const chips = `<ul class="checks" id="m4-checks" aria-live="polite"><li data-k="choice">Pilihan dipilih</li><li data-k="len">Alasan minimal ${data.SETTINGS.minReasonChars} karakter</li><li data-k="num">Minimal ${data.SETTINGS.minNumericEvidence} data numerik</li></ul>`;
    const html = `<main class="page page-m">
      ${head({ ribbon: 'MISSION 04', title: 'RUANG KEPUTUSAN', lead: 'Perhitungan telah selesai. Kini keluarga menunggu rekomendasi tim kalian.' })}
      <div class="mgrid mgrid-m4">
      <aside class="illus illus-sungkem">${img('sungkem.png', 'illus-sungkem-img', 'Pasangan bersimpuh memohon restu')}<p class="illus-cap">Keluarga menunggu rekomendasi kalian.</p></aside>
      <div class="stack">
      ${WoodCard(`<h2 class="sub">Hasil perhitungan kalian</h2>${summary}`)}
      ${WoodCard(`${task('pilih keputusan dan jelaskan dengan data.')}
        <fieldset class="choices"><legend class="q">${isC ? 'Opsi mana yang kalian rekomendasikan?' : 'Bagaimana penilaian kalian terhadap skema ini?'}</legend>
          ${choices.map((x) => `<label class="choice"><input type="radio" name="m4-choice" value="${x.k}" data-input="m4-live" ${m.decision === x.k ? 'checked' : ''} ${m.done ? 'disabled' : ''}><span>${x.l}</span></label>`).join('')}</fieldset>
        <h2 class="q">${question}</h2><p class="small">Gunakan minimal dua data numerik sebagai bukti, misalnya besar anuitas, total bunga, sisa pinjaman, atau perubahan bunga. Yang dinilai adalah alasan kalian, bukan pilihannya.</p>
        ${InputField({ id: 'm4-reason', type: 'area', rows: 6, label: 'Alasan kelompok', value: m.reason || '', disabled: m.done, live: 'm4-live', placeholder: 'Tulis keputusan dan buktinya…' })}
        ${chips}<div id="m4-fb" class="fb" aria-live="polite"></div>
        <div class="btnrow">${m.done ? Btn({ label: 'BUKA REFLECTION ROOM', action: 'go-next', arrow: true }) : Btn({ label: 'KIRIM KEPUTUSAN', action: 'm4-submit', icon: 'check' }) + hintBtn()}</div>`, 'qcard')}
      </div></div>
    </main>`;

    function status() {
      const choice = document.querySelector('input[name="m4-choice"]:checked'), text = val('m4-reason');
      const st = { choice: !!choice, len: text.trim().length >= data.SETTINGS.minReasonChars, num: V.countNumericEvidence(text) >= data.SETTINGS.minNumericEvidence };
      document.querySelectorAll('#m4-checks li').forEach((li) => li.classList.toggle('is-ok', st[li.dataset.k]));
      return { st, choice, text };
    }
    return {
      html,
      mount() { status(); },
      actions: {
        hint() { UI.HintModal(data.hints.m4); },
        'go-next'() { nav('reflection'); },
        'm4-submit'() {
          const { st, choice, text } = status(), fb = $('m4-fb');
          const need = [];
          if (!st.choice) need.push('pilih salah satu keputusan');
          if (!st.len) need.push(`tulis alasan minimal ${data.SETTINGS.minReasonChars} karakter`);
          if (!st.num) need.push(`sertakan minimal ${data.SETTINGS.minNumericEvidence} data numerik dari hasil perhitungan`);
          if (need.length) { fb.innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>Sebelum dikirim: ${need.join(', ')}.</span></div>`; audio.soft(); return; }
          const label = choices.find((x) => x.k === choice.value).l;
          S.saveMission('m4', { done: true, decision: choice.value, decisionLabel: label, reason: text.trim() });
          PAJ.dataStore.saveTeamData(PAJ.buildTeamData());
          UI.SuccessModal({ title: 'Keputusan terkirim!', message: 'Rekomendasi kalian sudah tersimpan. Sekarang bandingkan cara berpikir kalian dengan tim satu kasus.', cta: 'BUKA REFLECTION ROOM', onCta: () => nav('reflection') });
        },
      },
      inputs: { 'm4-live'() { status(); } },
    };
  };

  /* ========================= REFLECTION ROOM ========================= */
  views.reflection = function () {
    const t = team(), c = theCase(), td = PAJ.buildTeamData(), done = t.reflection.done;
    const own = t.teamData ? Object.assign({}, td, { reflection: t.teamData.reflection }) : td;
    const isC = c.id === 'C';
    const heads = isC
      ? '<th>Tim</th><th>Anuitas 24 bln</th><th>Anuitas 36 bln</th><th>Total Bunga 24 bln</th><th>Total Bunga 36 bln</th><th>Keputusan</th>'
      : '<th>Tim</th><th>Anuitas</th><th>Bunga<br><small>bulan 1</small></th><th>Angsuran Pokok<br><small>bulan 1</small></th><th>Sisa Pinjaman<br><small>bulan 1</small></th><th>Keputusan</th>';
    const saved = t.reflection.answers || [];
    const html = `<main class="page page-m page-refl">
      ${head({ ribbon: 'SRAWUNG', title: 'Satu Kasus, Tiga Cara Berpikir', lead: `Kasus ${c.id}: Tim ${c.teams.join(', ')} mengerjakan kasus yang sama.` })}
      ${WoodCard(`<h2 class="sub">Hasil tim kalian dan tim satu kasus</h2>
        <p class="small">Data dibaca dari perangkat ini. Untuk menambahkan hasil tim di komputer lain, pakai kode tim di bagian bawah.</p>
        <div class="btnrow">${Btn({ label: 'Bandingkan dengan Tim Satu Kasus', action: 'compare', icon: 'users', variant: 'gold' })}</div>
        <div id="refl-wrap" class="tablewrap" hidden><table class="grid refl"><thead><tr>${heads}</tr></thead><tbody id="refl-body"></tbody></table></div>
        <p id="refl-empty" class="empty" hidden>Data tim lain belum tersedia.</p>
        <details class="share"><summary>Bandingkan lintas perangkat (kode tim)</summary>
          <p class="small">Tanpa server, data tidak tersinkron otomatis. Salin kode tim kalian, kirim ke tim lain, lalu tempel kode tim lain di sini.</p>
          <div class="btnrow">${Btn({ label: 'Salin kode tim kalian', action: 'copy-code', icon: 'copy', variant: 'wood' })}</div>
          <div class="field"><label for="code-in">Tempel kode tim lain</label><textarea id="code-in" rows="3" placeholder="Tempel kode di sini"></textarea><div class="field-msg" id="code-msg" aria-live="polite"></div></div>
          <div class="btnrow">${Btn({ label: 'Tambahkan data tim lain', action: 'add-code', variant: 'wood' })}</div></details>`)}
      ${WoodCard(`<h2 class="sub">Pertanyaan refleksi</h2>
        ${data.reflectionQuestions.map((q, i) => InputField({ id: 'refl-' + i, type: 'area', rows: 3, label: `${i + 1}. ${q}`, value: saved[i] || '', live: 'refl-save' })).join('')}
        <div id="refl-fb" class="fb" aria-live="polite"></div>
        <div class="btnrow">${Btn({ label: done ? 'LIHAT HALAMAN MISI SELESAI' : 'SELESAIKAN REFLEKSI', action: 'refl-done', arrow: true, big: true })}</div>`, 'qcard')}
      <div class="actions-center">${img('gamelan.png', 'refl-gamelan', 'Penabuh gamelan')}</div></main>`;

    async function load(announce) {
      const rows = await PAJ.dataStore.getCaseTeams(c.id);
      const mine = rows.find((r) => r.teamId === t.teamId) || own;
      const others = rows.filter((r) => r.teamId !== t.teamId);
      $('refl-body').innerHTML = UI.ReflectionCard(mine, true, c.id) + others.map((r) => UI.ReflectionCard(r, false, c.id)).join('');
      $('refl-wrap').hidden = false; $('refl-empty').hidden = others.length > 0;
      if (announce) UI.toast(others.length ? `${others.length} tim lain ditemukan.` : 'Data tim lain belum tersedia.');
    }
    const answers = () => data.reflectionQuestions.map((_, i) => val('refl-' + i).trim());
    return {
      html,
      actions: {
        compare() { load(true); },
        async 'copy-code'() {
          const code = PAJ.dataStore.exportCode(Object.assign({}, own, { reflection: answers().filter(Boolean).join(' | ') }));
          try { await navigator.clipboard.writeText(code); UI.toast('Kode tim disalin.'); }
          catch (e) { $('code-in').value = code; $('code-in').select(); $('code-msg').textContent = 'Salin kode di kotak ini (Ctrl+C), lalu hapus sebelum menempel kode tim lain.'; }
        },
        async 'add-code'() {
          const r = await PAJ.dataStore.importCode(val('code-in'));
          $('code-msg').textContent = r.ok ? `Data TIM ${r.teamId} ditambahkan.` : r.reason;
          if (r.ok) { $('code-in').value = ''; load(false); }
        },
        'refl-done'() {
          if (done) { nav('final'); return; }
          const a = answers(), min = data.SETTINGS.minReflectionChars;
          const bad = a.findIndex((x) => x.length < min);
          if (bad >= 0) { $('refl-fb').innerHTML = `<div class="fb-soft">${icon('lightbulb', 18)}<span>Jawab pertanyaan ${bad + 1} dulu (minimal ${min} karakter).</span></div>`; $('refl-' + bad).focus(); return; }
          S.saveReflection(a, true);
          UI.SuccessModal({ title: 'Refleksi tersimpan!', message: 'Semua misi sudah kalian selesaikan.', cta: 'LIHAT MISI SELESAI', onCta: () => nav('final') });
        },
      },
      inputs: { 'refl-save'() { if (!t.reflection.done) S.saveReflection(answers(), false); } },
    };
  };

  /* ========================= FINAL ========================= */
  views.final = function () {
    const t = team();
    const html = `<div class="final">
      <div class="sky"></div><div class="clouds"><i></i><i></i></div><div class="treeline"></div>
      ${img('pendopo.png', 'f-pendopo')}<div class="h-ground"></div>
      ${img('janur.png', 'h-janur h-janur-l')}${img('janur.png', 'h-janur h-janur-r')}
      ${img('couple.png', 'f-couple', 'Pengantin Jawa')}${img('gamelan.png', 'f-gamelan', 'Penabuh gamelan')}
      <div class="fx" aria-hidden="true">${Array.from({ length: 12 }, () => `<i class="dot" style="left:${(Math.random() * 100).toFixed(1)}%;top:${(15 + Math.random() * 60).toFixed(1)}%;animation-delay:${(-Math.random() * 6).toFixed(1)}s"></i>`).join('')}</div>
      <section class="final-card woodcard">${img('ornament.png', 'crest')}<h1>MISI SELESAI</h1>
        <p class="f-congrats">Selamat, TIM ${t.teamId}.</p>
        <p>Kalian telah membantu keluarga Pak Wiryo merencanakan pembiayaan hajat menggunakan matematika.</p>
        <blockquote>Matematika bukan hanya tentang menemukan angka.<br>Matematika membantu kita memahami pilihan dan mengambil keputusan.</blockquote>
        <p class="motto">RENCANAKAN DENGAN CERMAT.<br>HITUNG DENGAN TEPAT.<br>PUTUSKAN DENGAN BIJAK.</p>
        ${Btn({ label: 'KEMBALI KE BERANDA', action: 'go-home', big: true, icon: 'home' })}</section></div>`;
    return { html, actions: {} };
  };

  PAJ.views = views;
})();
