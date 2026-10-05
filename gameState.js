/* ==========================================================
   gameState.js — progres game (localStorage) + lapisan data tim
   ----------------------------------------------------------
   Logika data dipisah dari UI. `PAJ.dataStore` memakai antarmuka
   async (Promise) sehingga mudah diganti dengan Firebase/Supabase:
     saveTeamData(td) · getCaseTeams(caseId) · importCode(code) · exportCode(td)
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});
  const KEY = 'paj.pernikahanAdatJawa.v1';
  const memoryFallback = { v: null };

  const storage = {
    read() { try { return localStorage.getItem(KEY); } catch (e) { return memoryFallback.v; } },
    write(v) { try { localStorage.setItem(KEY, v); } catch (e) { memoryFallback.v = v; } },
  };

  function emptyTeam(teamId) {
    return {
      teamId, caseId: PAJ.data.teamCaseMap[teamId], briefSeen: false,
      missions: { m1: { done: false }, m2: { done: false }, m3: { done: false }, m4: { done: false } },
      reflection: { done: false, answers: [] },
      teamData: null,
    };
  }

  function load() {
    let db = null;
    try { db = JSON.parse(storage.read() || 'null'); } catch (e) { db = null; }
    if (!db || typeof db !== 'object') db = {};
    db.selectedTeam = db.selectedTeam || null;
    // Dua kanal terpisah: efek suara (sfx) dan backsound (bgm). Migrasi dari pengaturan lama.
    if (typeof db.sfx !== 'boolean' || typeof db.bgm !== 'boolean') { const off = !!db.soundSet && !db.sound; db.sfx = !off; db.bgm = !off; }
    if (typeof db.sfxVolume !== 'number') db.sfxVolume = 0.7;
    if (typeof db.volume !== 'number') db.volume = 0.4;
    db.teams = db.teams || {};
    db.imported = db.imported || {};
    return db;
  }
  let db = load();
  function persist() { storage.write(JSON.stringify(db)); }

  const state = {
    /** true bila salah satu kanal suara menyala (untuk ikon di header) */
    sound() { return db.sfx || db.bgm; },
    sfx() { return db.sfx; }, bgm() { return db.bgm; },
    setSfx(on) { db.sfx = !!on; persist(); }, setBgm(on) { db.bgm = !!on; persist(); },
    sfxVolume() { return db.sfxVolume; }, setSfxVolume(v) { db.sfxVolume = Math.max(0, Math.min(1, v)); persist(); },
    volume() { return db.volume; },
    setVolume(v) { db.volume = Math.max(0, Math.min(1, v)); persist(); },

    selectedTeamId() { return db.selectedTeam; },
    selectTeam(id) {
      db.selectedTeam = id;
      if (!db.teams[id]) db.teams[id] = emptyTeam(id);
      persist();
    },
    clearSelection() { db.selectedTeam = null; persist(); },
    /** Objek progres tim aktif (atau null) */
    current() { return db.selectedTeam ? db.teams[db.selectedTeam] || null : null; },
    teamProgress(id) { return db.teams[id] || null; },
    completedCount(t) { t = t || state.current(); return t ? ['m1', 'm2', 'm3', 'm4'].filter((k) => t.missions[k].done).length : 0; },
    percent(t) { return state.completedCount(t) * 25; },

    /** Status kartu mission: locked | open | completed */
    missionStatus(key, t) {
      t = t || state.current();
      if (!t) return 'locked';
      if (key === 'reflection') {
        if (t.reflection.done) return 'completed';
        return state.completedCount(t) === 4 ? 'open' : 'locked';
      }
      if (t.missions[key].done) return 'completed';
      const order = ['m1', 'm2', 'm3', 'm4'];
      const idx = order.indexOf(key);
      return idx === 0 || t.missions[order[idx - 1]].done ? 'open' : 'locked';
    },
    canEnter(route, t) {
      t = t || state.current();
      if (!t) return false;
      if (['m1', 'm2', 'm3', 'm4', 'reflection'].includes(route)) return state.missionStatus(route, t) !== 'locked';
      if (route === 'final') return t.reflection.done;
      return true;
    },
    nextRoute(t) {
      t = t || state.current();
      if (!t) return 'teams';
      for (const k of ['m1', 'm2', 'm3', 'm4']) if (!t.missions[k].done) return k;
      return t.reflection.done ? 'final' : 'reflection';
    },

    /** Simpan sebagian data mission (merge dangkal) */
    saveMission(key, patch) {
      const t = state.current();
      t.missions[key] = Object.assign({}, t.missions[key], patch);
      persist();
      return t.missions[key];
    },
    markBriefSeen() { const t = state.current(); t.briefSeen = true; persist(); },
    saveReflection(answers, done) {
      const t = state.current();
      t.reflection = { done: !!done, answers };
      if (t.teamData) t.teamData.reflection = answers.filter(Boolean).join(' | ');
      persist();
    },
    setTeamData(td) { state.current().teamData = td; persist(); },

    resetTeam(id) { db.teams[id] = emptyTeam(id); persist(); },
    resetAll() { db = { selectedTeam: null, sfx: db.sfx, bgm: db.bgm, sfxVolume: db.sfxVolume, volume: db.volume, teams: {}, imported: {} }; persist(); },

    /** Akses internal untuk dataStore */
    _db() { return db; },
    _persist: persist,
  };

  /* ---------- Struktur data tim untuk Reflection Room ---------- */
  /**
   * Bentuk teamData (A/B):
   * { teamId, caseId, annuity, interestMonth1, principalMonth1, remainingBalanceMonth1,
   *   interestMonth12, principalMonth12, remainingBalanceMonth12, totalInterest, decision, reason, reflection }
   * Bentuk teamData (C): { teamId, caseId, annuity24, annuity36, totalPayment24/36, totalInterest24/36, decision, reason, reflection }
   */
  function buildTeamData() {
    const t = state.current();
    const m3 = t.missions.m3, m4 = t.missions.m4;
    const base = { teamId: t.teamId, caseId: t.caseId, decision: m4.decisionLabel || '', reason: m4.reason || '', reflection: '', updatedAt: Date.now() };
    const v = m3.values || {};
    if (t.caseId === 'C') {
      return Object.assign(base, {
        annuity24: v.a24, annuity36: v.a36, totalPayment24: v.tp24, totalPayment36: v.tp36,
        totalInterest24: v.ti24, totalInterest36: v.ti36,
      });
    }
    return Object.assign(base, {
      annuity: (t.missions.m2 || {}).a, interestMonth1: v.i1, principalMonth1: v.p1, remainingBalanceMonth1: v.s1,
      interestMonth12: v.i12, principalMonth12: v.p12, remainingBalanceMonth12: v.s12, totalInterest: v.ti,
    });
  }

  /* ---------- dataStore: lokal (satu perangkat) ---------- */
  const NUM_FIELDS = ['annuity', 'interestMonth1', 'principalMonth1', 'remainingBalanceMonth1', 'interestMonth12',
    'principalMonth12', 'remainingBalanceMonth12', 'totalInterest', 'annuity24', 'annuity36', 'totalPayment24',
    'totalPayment36', 'totalInterest24', 'totalInterest36'];

  function sanitize(td) {
    if (!td || typeof td !== 'object') return null;
    if (!PAJ.data.teamCaseMap[td.teamId] || PAJ.data.teamCaseMap[td.teamId] !== td.caseId) return null;
    const out = { teamId: String(td.teamId), caseId: String(td.caseId) };
    NUM_FIELDS.forEach((f) => { if (typeof td[f] === 'number' && Number.isFinite(td[f])) out[f] = td[f]; });
    ['decision', 'reason', 'reflection'].forEach((f) => { out[f] = String(td[f] || '').slice(0, 1200); });
    return out;
  }

  const dataStore = {
    async saveTeamData(td) { /* ganti dengan tulis ke Firebase/Supabase */ state.setTeamData(td); },
    /** Semua data tim untuk satu kasus: tim lokal (perangkat ini) + data yang ditempel */
    async getCaseTeams(caseId) {
      const found = {};
      Object.values(db.imported).forEach((td) => { if (td.caseId === caseId) found[td.teamId] = td; });
      Object.values(db.teams).forEach((t) => {
        if (t.caseId === caseId && t.teamData && t.missions.m4.done) found[t.teamId] = t.teamData;
      });
      return Object.values(found).sort((a, b) => a.teamId.localeCompare(b.teamId));
    },
    exportCode(td) { return btoa(unescape(encodeURIComponent(JSON.stringify(td)))); },
    async importCode(code) {
      let parsed;
      try { parsed = JSON.parse(decodeURIComponent(escape(atob(String(code).trim())))); } catch (e) { return { ok: false, reason: 'Kode tidak dapat dibaca.' }; }
      const td = sanitize(parsed);
      if (!td) return { ok: false, reason: 'Kode tidak valid.' };
      const mine = state.current();
      if (mine && td.caseId !== mine.caseId) return { ok: false, reason: 'Kode ini berasal dari kasus lain.' };
      if (mine && td.teamId === mine.teamId) return { ok: false, reason: 'Ini kode milik tim kalian sendiri.' };
      db.imported[td.teamId] = td; persist();
      return { ok: true, teamId: td.teamId };
    },
  };

  PAJ.state = state;
  PAJ.dataStore = dataStore;
  PAJ.buildTeamData = buildTeamData;
})();
