/* ==========================================================
   math.js — seluruh logika matematika anuitas (tanpa UI)
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});

  /** A = P × i(1+i)^n / ((1+i)^n − 1) */
  function calculateAnnuity(P, rate, periods) {
    if (rate === 0) return P / periods;
    const f = Math.pow(1 + rate, periods);
    return (P * rate * f) / (f - 1);
  }
  /** Bunga = saldo awal × i */
  function calculateInterest(balance, rate) { return balance * rate; }
  /** Angsuran pokok = anuitas − bunga */
  function calculatePrincipalPayment(annuity, interest) { return annuity - interest; }
  /** Sisa pinjaman = saldo awal − angsuran pokok */
  function calculateRemainingBalance(balance, principalPayment) { return balance - principalPayment; }
  function calculateTotalPayment(annuity, periods) { return annuity * periods; }
  function calculateTotalInterest(totalPayment, principal) { return totalPayment - principal; }

  /**
   * Tabel amortisasi lengkap. Anuitas tidak dibulatkan agar sisa akhir ≈ 0;
   * pembulatan hanya dilakukan saat ditampilkan.
   */
  function buildSchedule(P, rate, periods) {
    const annuity = calculateAnnuity(P, rate, periods);
    const rows = [];
    let balance = P;
    for (let k = 1; k <= periods; k++) {
      const interest = calculateInterest(balance, rate);
      const principal = calculatePrincipalPayment(annuity, interest);
      let closing = calculateRemainingBalance(balance, principal);
      if (Math.abs(closing) < 0.005) closing = 0; // buang sisa floating point
      rows.push({ period: k, openingBalance: balance, annuity, interest, principal, closingBalance: closing });
      balance = closing;
    }
    return rows;
  }

  /** Ringkasan satu skema pinjaman (dipakai Mission 03, 04, dan Reflection Room) */
  function summarize(P, rate, periods) {
    const schedule = buildSchedule(P, rate, periods);
    const annuity = schedule[0].annuity;
    const totalPayment = calculateTotalPayment(annuity, periods);
    const totalInterest = calculateTotalInterest(totalPayment, P);
    const m = (k) => schedule[Math.min(k, periods) - 1];
    return {
      principal: P, rate, periods, annuity, totalPayment, totalInterest, schedule,
      month1: m(1), month12: m(12), last: m(periods),
    };
  }

  /** Dana yang masih harus dipenuhi lewat pembiayaan */
  function requiredFunding(c) {
    return c.totalCost - c.savings - (c.additionalFund || 0);
  }

  PAJ.math = {
    calculateAnnuity, calculateInterest, calculatePrincipalPayment, calculateRemainingBalance,
    calculateTotalPayment, calculateTotalInterest, buildSchedule, summarize, requiredFunding,
  };
})();
