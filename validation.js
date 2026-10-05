/* ==========================================================
   validation.js — normalisasi & validasi jawaban siswa
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});

  /**
   * Ubah teks seperti "Rp3.765.878", "3765877.78", "3.765.877,78", "3,765,878"
   * menjadi angka. Mengembalikan NaN bila tidak bisa dibaca.
   */
  function normalizeCurrencyInput(raw) {
    if (raw === null || raw === undefined) return NaN;
    let s = String(raw).toLowerCase().replace(/rp/g, '').replace(/\s+/g, '').replace(/[^0-9.,-]/g, '');
    if (!s || !/\d/.test(s)) return NaN;
    const neg = s.startsWith('-');
    s = s.replace(/-/g, '');
    const hasDot = s.includes('.'), hasComma = s.includes(',');
    if (hasDot && hasComma) {
      // Pemisah desimal = yang muncul paling akhir
      const dec = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
      const thou = dec === '.' ? ',' : '.';
      s = s.split(thou).join('').replace(dec, '.');
    } else if (hasDot) {
      s = /^\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s; // 3.765.878 → ribuan; 3765877.78 → desimal
    } else if (hasComma) {
      s = /^\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
    }
    const n = Number(s);
    return Number.isFinite(n) ? (neg ? -n : n) : NaN;
  }

  /** Bilangan biasa (tenor, persen): koma dianggap desimal */
  function parsePlainNumber(raw) {
    const s = String(raw === null || raw === undefined ? '' : raw).replace('%', '').replace(',', '.').replace(/\s+/g, '');
    if (!s) return NaN;
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  /** Persen per bulan: terima "1", "1%", "1,0" dan juga bentuk desimal 0.01 */
  function parsePercent(raw) {
    const n = parsePlainNumber(raw);
    if (!Number.isFinite(n)) return NaN;
    return n > 0 && n < 0.5 ? n * 100 : n;
  }

  function withinTolerance(value, expected, tolerance) {
    return Number.isFinite(value) && Math.abs(value - expected) <= tolerance;
  }

  /** Hitung jumlah data numerik berbeda dalam teks, mis. "3.765.878" dihitung 1 */
  function countNumericEvidence(text) {
    const tokens = String(text || '').match(/\d[\d.,]*/g) || [];
    return new Set(tokens.map((t) => t.replace(/[.,]+$/, ''))).size;
  }

  PAJ.validation = { normalizeCurrencyInput, parsePlainNumber, parsePercent, withinTolerance, countNumericEvidence };
})();
