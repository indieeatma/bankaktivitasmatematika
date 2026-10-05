/* ==========================================================
   charts.js — grafik SVG sederhana (garis & batang), tanpa library
   Bekerja offline dan responsif lewat viewBox.
   ========================================================== */
(function () {
  const PAJ = (window.PAJ = window.PAJ || {});
  const W = 560, H = 270, M = { l: 62, r: 16, t: 16, b: 38 };

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
  }
  function shortRp(v) {
    if (v >= 1e6) return (Math.round(v / 1e5) / 10).toString().replace('.', ',') + ' jt';
    if (v >= 1e3) return Math.round(v / 1e3) + ' rb';
    return String(Math.round(v));
  }

  /**
   * opts: { title, type: 'line'|'bar', series: [{name,color,values:[...]}], xLabel }
   * Semua seri berbagi sumbu x (periode 1..n terpanjang).
   */
  function renderChart(opts) {
    const n = Math.max.apply(null, opts.series.map((s) => s.values.length));
    const maxV = niceMax(Math.max.apply(null, opts.series.map((s) => Math.max.apply(null, s.values))));
    const pw = W - M.l - M.r, ph = H - M.t - M.b;
    const x = (i) => M.l + (n === 1 ? pw / 2 : (i * pw) / (n - 1));
    const y = (v) => M.t + ph - (v / maxV) * ph;
    let g = '';
    for (let k = 0; k <= 4; k++) {
      const v = (maxV * k) / 4, yy = y(v);
      g += `<line x1="${M.l}" x2="${W - M.r}" y1="${yy}" y2="${yy}" class="ch-grid"/><text x="${M.l - 8}" y="${yy + 4}" text-anchor="end" class="ch-tick">${shortRp(v)}</text>`;
    }
    const step = n > 24 ? 6 : 4;
    for (let i = 0; i < n; i++) {
      if (i === 0 || (i + 1) % step === 0 || i === n - 1) g += `<text x="${x(i)}" y="${H - 16}" text-anchor="middle" class="ch-tick">${i + 1}</text>`;
    }
    g += `<text x="${M.l + pw / 2}" y="${H - 2}" text-anchor="middle" class="ch-axis">${opts.xLabel || 'Bulan ke-'}</text>`;
    const bw = Math.max(3, Math.min(14, (pw / n) * 0.6 / opts.series.length));
    opts.series.forEach((s, si) => {
      if (opts.type === 'bar') {
        s.values.forEach((v, i) => {
          const off = (si - (opts.series.length - 1) / 2) * (bw + 1);
          g += `<rect x="${x(i) + off - bw / 2}" y="${y(v)}" width="${bw}" height="${M.t + ph - y(v)}" rx="1.5" fill="${s.color}"><title>${s.name} — bulan ${i + 1}: ${PAJ.UI.rp(v)}</title></rect>`;
        });
      } else {
        const d = s.values.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
        g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="7 5"' : ''}/>`;
        s.values.forEach((v, i) => {
          if (n <= 24 || (i + 1) % 3 === 0 || i === n - 1) g += `<circle cx="${x(i)}" cy="${y(v)}" r="3.4" fill="${s.color}"><title>${s.name} — bulan ${i + 1}: ${PAJ.UI.rp(v)}</title></circle>`;
        });
      }
    });
    const legend = opts.series.length > 1
      ? `<div class="ch-legend">${opts.series.map((s) => `<span><i style="background:${s.color}"></i>${s.name}</span>`).join('')}</div>` : '';
    return `<figure class="chart"><figcaption>${opts.title}</figcaption>${legend}
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opts.title}">${g}</svg></figure>`;
  }
  PAJ.charts = { renderChart };
})();
