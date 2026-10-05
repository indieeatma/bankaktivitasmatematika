/* ==========================================================
   data.js — data kasus, teks, dan pengaturan game
   ----------------------------------------------------------
   Link Google Spreadsheet kelas ada di baris `spreadsheetURL` di bawah.
   Semua tim mengerjakan di file yang sama, pada sheet yang berbeda.
   ========================================================== */
const spreadsheetURL = "https://docs.google.com/spreadsheets/d/1UYKQUmaDjZPubybx3IQh8k6whYTnRpXOVbefCgzSaWs/edit?usp=sharing";

(function () {
  const PAJ = (window.PAJ = window.PAJ || {});

  /** Pengaturan yang boleh disesuaikan guru */
  const SETTINGS = {
    toleranceAnnuity: 100,   // Mission 02: toleransi pembulatan anuitas (±Rp)
    toleranceLab: 500,       // Mission 03: toleransi pembulatan hasil spreadsheet (±Rp)
    minReasonChars: 30,      // Mission 04: panjang minimum alasan
    minNumericEvidence: 2,   // Mission 04: jumlah minimum data numerik dalam alasan
    minReflectionChars: 10,  // Reflection Room: panjang minimum tiap jawaban
  };

  /** Data kasus. Pinjaman sengaja tidak ditampilkan di Case Brief agar Mission 01 bermakna. */
  const cases = {
    A: {
      id: 'A', icon: 'wedding',
      title: 'Warisan yang Dipertahankan',
      teams: ['01', '02', '03'],
      totalCost: 120000000, savings: 40000000, loan: 80000000, rate: 0.01, periods: 24,
      story: [
        'Keluarga Pak Wiryo sedang mempersiapkan pernikahan putrinya, Sekar. Mereka ingin mempertahankan beberapa tradisi yang bermakna bagi keluarga. Setiap keluarga punya pilihannya sendiri, dan ini adalah pilihan keluarga Pak Wiryo.',
        'Estimasi biaya hajat adalah Rp120.000.000, sedangkan tabungan keluarga baru Rp40.000.000. Kekurangannya akan dipenuhi lewat pinjaman koperasi yang dibayar dengan anuitas bulanan.',
      ],
      tasks: [
        'Menentukan besar anuitas.',
        'Membuat tabel amortisasi.',
        'Menghitung bunga dan angsuran pokok.',
        'Menganalisis perubahan sisa pinjaman.',
        'Membuat keputusan berdasarkan hasil perhitungan.',
      ],
    },
    B: {
      id: 'B', icon: 'users',
      title: 'Gotong Royong untuk Sebuah Hajat',
      teams: ['04', '05', '06'],
      totalCost: 120000000, savings: 40000000, additionalFund: 30000000, loan: 50000000, rate: 0.01, periods: 24,
      story: [
        'Keluarga Pak Wiryo menyiapkan hajat pernikahan Sekar dengan biaya Rp120.000.000. Tabungan keluarga Rp40.000.000.',
        'Sebelum acara, keluarga memperoleh tambahan dana Rp30.000.000 dari arisan keluarga. Dana ini membantu mengurangi kebutuhan pinjaman.',
      ],
      note: 'Arisan hanya tambahan sumber dana, bukan anuitas. Anuitas tetap dipakai untuk menghitung pembayaran pinjaman.',
      tasks: [
        'Menghitung anuitas.',
        'Membuat tabel amortisasi.',
        'Menentukan bunga, angsuran pokok, dan sisa pinjaman bulan pertama.',
        'Membandingkan hasil dengan Kasus A.',
        'Menganalisis pengaruh dana arisan terhadap kebutuhan pinjaman dan beban pembayaran.',
      ],
    },
    C: {
      id: 'C', icon: 'calendar',
      title: 'Mempersiapkan Hajat Sejak Jauh Hari',
      teams: ['07', '08', '09'],
      totalCost: 120000000, savings: 40000000, loan: 80000000, rate: 0.01,
      options: [
        { key: '1', name: '24 Bulan', periods: 24 },
        { key: '2', name: '36 Bulan', periods: 36 },
      ],
      story: [
        'Keluarga Pak Wiryo mulai merencanakan hajat Sekar jauh-jauh hari. Biaya yang diperkirakan Rp120.000.000, tabungan keluarga Rp40.000.000.',
        'Kekurangan dananya akan dipenuhi lewat koperasi. Koperasi menawarkan dua pilihan tenor dengan bunga yang sama, dan keluarga ingin memilih yang paling sesuai dengan kondisi mereka.',
      ],
      tasks: [
        'Menghitung anuitas Opsi 1 (24 bulan) dan Opsi 2 (36 bulan).',
        'Membandingkan pembayaran bulanan.',
        'Menghitung total pembayaran dan total bunga.',
        'Menganalisis konsekuensi tenor.',
        'Membuat keputusan berdasarkan kondisi keluarga.',
      ],
    },
  };

  /** Pemetaan tim → kasus dibangun dari data di atas */
  const teamCaseMap = {};
  Object.values(cases).forEach((c) => c.teams.forEach((t) => (teamCaseMap[t] = c.id)));
  const TEAM_IDS = Object.keys(teamCaseMap).sort();

  const missions = [
    { key: 'm1', no: '01', name: 'Memahami Hajat', short: 'Temukan dana yang masih harus dipenuhi keluarga.', icon: 'coins' },
    { key: 'm2', no: '02', name: 'Menghitung Anuitas', short: 'Tentukan besar cicilan tetap tiap bulan.', icon: 'calculator' },
    { key: 'm3', no: '03', name: 'Anuitas Lab', short: 'Bongkar bunga dan angsuran pokok dengan spreadsheet.', icon: 'table' },
    { key: 'm4', no: '04', name: 'Ruang Keputusan', short: 'Beri rekomendasi berdasarkan data.', icon: 'lightbulb' },
  ];

  /** Petunjuk. Tidak pernah memberikan jawaban langsung. */
  const hints = {
    m1: 'Bandingkan total kebutuhan dengan dana yang sudah dimiliki.',
    m1B: 'Dana yang sudah tersedia mencakup tabungan dan dana tambahan dari arisan.',
    m1wrong: 'Gunakan selisih antara total kebutuhan dan dana yang sudah tersedia.',
    m2: 'Gunakan rumus anuitas dengan M sebagai pokok pinjaman, i sebagai bunga per periode, dan n sebagai jumlah periode. Kalkulator bantu dapat menghitung (1+i)^−n untuk kalian.',
    m2close: 'Sudah dekat. Periksa kembali pembulatan dan nilai (1+i)^n yang kalian pakai.',
    m3: 'Bunga periode pertama dihitung dari saldo awal periode tersebut.',
    m4: 'Gunakan minimal dua angka hasil perhitungan sebagai bukti keputusan.',
  };

  /** Petunjuk per kolom Mission 03 (hanya muncul untuk kolom yang belum tepat) */
  const labFieldHints = {
    i1: 'Bunga = saldo awal × i. Saldo awal bulan pertama adalah pokok pinjaman.',
    p1: 'Angsuran pokok = anuitas − bunga.',
    s1: 'Sisa pinjaman = saldo awal − angsuran pokok.',
    i12: 'Saldo awal bulan ke-12 sama dengan sisa pinjaman bulan ke-11.',
    p12: 'Angsuran pokok = anuitas − bunga pada bulan ke-12.',
    s12: 'Sisa pinjaman = saldo awal bulan ke-12 − angsuran pokok bulan ke-12.',
    ti: 'Total bunga = total pembayaran (anuitas × n) − pokok pinjaman.',
    a24: 'Gunakan rumus anuitas dengan n = 24.',
    a36: 'Gunakan rumus anuitas dengan n = 36.',
    tp24: 'Total pembayaran = anuitas × jumlah bulan.',
    tp36: 'Total pembayaran = anuitas × jumlah bulan.',
    ti24: 'Total bunga = total pembayaran − pokok pinjaman.',
    ti36: 'Total bunga = total pembayaran − pokok pinjaman.',
  };

  /** Pengamatan pola setelah grafik muncul */
  const patternChecks = {
    AB: [
      { id: 'pb', label: 'Bunga tiap bulan cenderung…', answer: 'turun' },
      { id: 'pp', label: 'Angsuran pokok tiap bulan cenderung…', answer: 'naik' },
      { id: 'ps', label: 'Sisa pinjaman cenderung…', answer: 'turun' },
    ],
    C: [
      { id: 'pa', label: 'Dibanding 24 bulan, cicilan bulanan 36 bulan…', answer: 'lebih kecil', options: ['lebih kecil', 'sama', 'lebih besar'] },
      { id: 'pi', label: 'Dibanding 24 bulan, total bunga 36 bulan…', answer: 'lebih besar', options: ['lebih kecil', 'sama', 'lebih besar'] },
      { id: 'ps', label: 'Sisa pinjaman habis lebih awal pada tenor…', answer: '24 bulan', options: ['24 bulan', '36 bulan', 'sama saja'] },
    ],
  };

  const reflectionQuestions = [
    'Apakah hasil perhitungan kalian sama dengan tim lain?',
    'Jika berbeda, pada bagian mana?',
    'Apakah cara berpikir kalian sama?',
    'Apa yang dapat kalian pelajari dari tim lain?',
  ];

  PAJ.data = { SETTINGS, cases, teamCaseMap, TEAM_IDS, missions, hints, labFieldHints, patternChecks, reflectionQuestions };
})();
