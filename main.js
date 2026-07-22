(function () {
  "use strict";

  /* ---------------- Math helpers ---------------- */
  function Un(a, b, n) { return a + (n - 1) * b; }
  function Sn(a, b, n) { return (n / 2) * (2 * a + (n - 1) * b); }
  function UnG(a, r, n) { return a * Math.pow(r, n - 1); }
  function SnG(a, r, n) {
    if (r === 1) return a * n;
    return a * (Math.pow(r, n) - 1) / (r - 1);
  }
  function fmt(x) {
    // Nice number formatting: integers plain, decimals trimmed, Indonesian thousand-ish spacing skipped for simplicity
    if (Number.isInteger(x)) return x.toLocaleString("id-ID");
    return x.toLocaleString("id-ID", { maximumFractionDigits: 3 });
  }

  /* ---------------- Progress bar ---------------- */
  var progressBar = document.getElementById("progressBar");
  function updateProgress() {
    var h = document.documentElement;
    var scrollTop = h.scrollTop || document.body.scrollTop;
    var height = h.scrollHeight - h.clientHeight;
    var pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + "%";
  }
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.getElementById("navToggle");
  var mobilePanel = document.getElementById("mobilePanel");
  if (navToggle && mobilePanel) {
    navToggle.addEventListener("click", function () {
      var open = mobilePanel.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobilePanel.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobilePanel.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------- Active nav link on scroll ---------------- */
  var navLinks = document.querySelectorAll("[data-nav]");
  // Maps each observed section id to the nav link href that should light up.
  // Barisan/Deret Aritmetika both point to #aritmetika; Barisan/Deret Geometri both point to #geometri.
  var sectionNavMap = {
    "barisan": "#aritmetika",
    "deret": "#aritmetika",
    "barisan-geo": "#geometri",
    "deret-geo": "#geometri",
    "rangkuman": "#rangkuman",
    "lkpd": "#lkpd",
    "guru": "#guru"
  };
  var sections = Object.keys(sectionNavMap)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var targetHref = sectionNavMap[entry.target.id];
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === targetHref);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ---------------- Hero staircase widget ---------------- */
  var heroChart = document.getElementById("heroChart");
  var heroB = document.getElementById("heroB");
  var heroBVal = document.getElementById("heroBVal");
  var HERO_A = 4, HERO_N = 8, HERO_MAXB = 8;

  function renderHeroChart(b) {
    if (!heroChart) return;
    heroChart.innerHTML = "";
    var maxVal = HERO_A + (HERO_N - 1) * HERO_MAXB;
    for (var i = 0; i < HERO_N; i++) {
      var val = Un(HERO_A, b, i + 1);
      var pct = Math.max(4, (val / maxVal) * 100);
      var bar = document.createElement("div");
      bar.className = "stair-bar";
      bar.style.height = pct + "%";
      var label = document.createElement("span");
      label.textContent = val;
      bar.appendChild(label);
      heroChart.appendChild(bar);
    }
  }
  if (heroB && heroBVal) {
    heroB.addEventListener("input", function () {
      heroBVal.textContent = heroB.value;
      renderHeroChart(parseInt(heroB.value, 10));
    });
    renderHeroChart(parseInt(heroB.value, 10));
  }

  /* ---------------- Tabs ---------------- */
  document.querySelectorAll(".tab-list").forEach(function (list) {
    var btns = list.querySelectorAll(".tab-btn");
    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        btns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var target = btn.getAttribute("data-tab");
        var panels = document.querySelectorAll(".tab-panel");
        panels.forEach(function (p) { p.classList.remove("active"); });
        var panel = document.getElementById(target);
        if (panel) panel.classList.add("active");
      });
    });
  });

  /* ---------------- Accordion examples ---------------- */
  document.querySelectorAll(".example-header").forEach(function (header) {
    header.addEventListener("click", function () {
      var example = header.closest(".example");
      example.classList.toggle("open");
    });
  });

  /* ---------------- Progressive section unlock ---------------- */
  var LOCKABLE_SECTIONS = ["deret", "barisan-geo", "deret-geo", "rangkuman", "lkpd", "guru"];
  var WRAPPER_UNLOCK_MAP = {
    "aritmetika": ["barisan", "deret"],
    "geometri": ["barisan-geo", "deret-geo"]
  };
  var UNLOCK_KEY = "unlocked-sections-barisan-deret-v1";

  function safeLS() {
    try {
      var testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  var unlockLs = safeLS();

  function getUnlockedSet() {
    if (!unlockLs) return {};
    try {
      var raw = unlockLs.getItem(UNLOCK_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveUnlockedSet(set) {
    if (!unlockLs) return;
    try { unlockLs.setItem(UNLOCK_KEY, JSON.stringify(set)); } catch (e) {}
  }

  function unlockSectionById(id) {
    if (LOCKABLE_SECTIONS.indexOf(id) === -1) return;
    var el = document.getElementById(id);
    if (el) el.classList.remove("section-locked");
    var set = getUnlockedSet();
    set[id] = true;
    saveUnlockedSet(set);
  }

  function unlockTarget(id) {
    if (WRAPPER_UNLOCK_MAP[id]) {
      WRAPPER_UNLOCK_MAP[id].forEach(unlockSectionById);
    } else {
      unlockSectionById(id);
    }
  }

  // Restore previously unlocked sections (so a returning student doesn't get re-locked)
  var previouslyUnlocked = getUnlockedSet();
  Object.keys(previouslyUnlocked).forEach(function (id) {
    if (previouslyUnlocked[id]) unlockSectionById(id);
  });

  // Wire up "next section" buttons
  document.querySelectorAll(".next-section-btn[data-unlock]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var targetId = btn.getAttribute("data-unlock");
      unlockTarget(targetId);
      var targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // Any in-page anchor link (top nav, mobile panel, hero shortcuts) should also
  // unlock the section it points to, so navigation never lands on a hidden section.
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function () {
      var id = a.getAttribute("href").slice(1);
      if (id) unlockTarget(id);
    });
  });

  /* ---------------- Barisan calculator ---------------- */
  var barBtn = document.getElementById("bar-calc-btn");
  if (barBtn) {
    barBtn.addEventListener("click", function () {
      var a = parseFloat(document.getElementById("bar-a").value) || 0;
      var b = parseFloat(document.getElementById("bar-b").value) || 0;
      var n = parseInt(document.getElementById("bar-n").value, 10) || 1;
      n = Math.max(1, Math.min(n, 200));
      var result = Un(a, b, n);

      var headline = document.getElementById("bar-headline");
      var steps = document.getElementById("bar-steps");
      var resultBox = document.getElementById("bar-result");
      var viz = document.getElementById("bar-viz");

      headline.textContent = "U" + n + " = " + fmt(result);
      steps.innerHTML =
        "<li>Un = a + (n \u2212 1)b</li>" +
        "<li>U" + n + " = " + fmt(a) + " + (" + n + " \u2212 1)(" + fmt(b) + ")</li>" +
        "<li>U" + n + " = " + fmt(a) + " + (" + (n - 1) + ")(" + fmt(b) + ") = " + fmt(result) + "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 12);
      var vals = [];
      for (var i = 1; i <= count; i++) vals.push(Un(a, b, i));
      var maxAbs = Math.max.apply(null, vals.map(Math.abs).concat([1]));
      vals.forEach(function (v) {
        var bar = document.createElement("i");
        var pct = Math.max(4, (Math.abs(v) / maxAbs) * 100);
        bar.style.height = pct + "%";
        if (v < 0) bar.classList.add("neg");
        bar.title = v;
        viz.appendChild(bar);
      });
    });
  }

  /* ---------------- Deret calculator ---------------- */
  var derBtn = document.getElementById("der-calc-btn");
  if (derBtn) {
    derBtn.addEventListener("click", function () {
      var a = parseFloat(document.getElementById("der-a").value) || 0;
      var b = parseFloat(document.getElementById("der-b").value) || 0;
      var n = parseInt(document.getElementById("der-n").value, 10) || 1;
      n = Math.max(1, Math.min(n, 200));
      var lastTerm = Un(a, b, n);
      var result = Sn(a, b, n);

      var headline = document.getElementById("der-headline");
      var steps = document.getElementById("der-steps");
      var resultBox = document.getElementById("der-result");
      var viz = document.getElementById("der-viz");

      headline.textContent = "S" + n + " = " + fmt(result);
      steps.innerHTML =
        "<li>Sn = n/2 (2a + (n \u2212 1)b)</li>" +
        "<li>S" + n + " = " + n + "/2 (2(" + fmt(a) + ") + (" + (n - 1) + ")(" + fmt(b) + "))</li>" +
        "<li>U" + n + " = " + fmt(lastTerm) + " \u2192 S" + n + " = " + n + "/2 (" + fmt(a) + " + " + fmt(lastTerm) + ") = " + fmt(result) + "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 12);
      var running = 0;
      var vals = [];
      for (var i = 1; i <= count; i++) { running += Un(a, b, i); vals.push(running); }
      var maxAbs = Math.max.apply(null, vals.map(Math.abs).concat([1]));
      vals.forEach(function (v) {
        var bar = document.createElement("i");
        var pct = Math.max(4, (Math.abs(v) / maxAbs) * 100);
        bar.style.height = pct + "%";
        if (v < 0) bar.classList.add("neg");
        bar.title = v;
        viz.appendChild(bar);
      });
    });
  }

  /* ---------------- Barisan Geometri calculator ---------------- */
  var bargBtn = document.getElementById("barg-calc-btn");
  if (bargBtn) {
    bargBtn.addEventListener("click", function () {
      var a = parseFloat(document.getElementById("barg-a").value) || 0;
      var r = parseFloat(document.getElementById("barg-r").value);
      if (isNaN(r)) r = 0;
      var n = parseInt(document.getElementById("barg-n").value, 10) || 1;
      n = Math.max(1, Math.min(n, 30));
      var result = UnG(a, r, n);

      var headline = document.getElementById("barg-headline");
      var steps = document.getElementById("barg-steps");
      var resultBox = document.getElementById("barg-result");
      var viz = document.getElementById("barg-viz");

      headline.textContent = "U" + n + " = " + fmt(result);
      steps.innerHTML =
        "<li>Un = a \u00D7 r^(n \u2212 1)</li>" +
        "<li>U" + n + " = " + fmt(a) + " \u00D7 " + fmt(r) + "^(" + n + " \u2212 1)</li>" +
        "<li>U" + n + " = " + fmt(a) + " \u00D7 " + fmt(r) + "^" + (n - 1) + " = " + fmt(result) + "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 10);
      var vals = [];
      for (var i = 1; i <= count; i++) vals.push(UnG(a, r, i));
      var maxAbs = Math.max.apply(null, vals.map(function (v) { return Math.abs(v); }).concat([1]));
      vals.forEach(function (v) {
        var bar = document.createElement("i");
        var pct = Math.max(4, (Math.abs(v) / maxAbs) * 100);
        bar.style.height = (isFinite(pct) ? pct : 100) + "%";
        if (v < 0) bar.classList.add("neg");
        bar.title = v;
        viz.appendChild(bar);
      });
    });
  }

  /* ---------------- Deret Geometri calculator ---------------- */
  var dergBtn = document.getElementById("derg-calc-btn");
  if (dergBtn) {
    dergBtn.addEventListener("click", function () {
      var a = parseFloat(document.getElementById("derg-a").value) || 0;
      var r = parseFloat(document.getElementById("derg-r").value);
      if (isNaN(r)) r = 0;
      var n = parseInt(document.getElementById("derg-n").value, 10) || 1;
      n = Math.max(1, Math.min(n, 30));
      var lastTerm = UnG(a, r, n);
      var result = SnG(a, r, n);

      var headline = document.getElementById("derg-headline");
      var steps = document.getElementById("derg-steps");
      var resultBox = document.getElementById("derg-result");
      var viz = document.getElementById("derg-viz");

      headline.textContent = "S" + n + " = " + fmt(result);
      steps.innerHTML =
        "<li>Sn = a(r^n \u2212 1) / (r \u2212 1)</li>" +
        "<li>S" + n + " = " + fmt(a) + "(" + fmt(r) + "^" + n + " \u2212 1) / (" + fmt(r) + " \u2212 1)</li>" +
        "<li>U" + n + " = " + fmt(lastTerm) + " \u2192 S" + n + " = " + fmt(result) + "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 10);
      var running = 0;
      var vals = [];
      for (var i = 1; i <= count; i++) { running += UnG(a, r, i); vals.push(running); }
      var maxAbs = Math.max.apply(null, vals.map(function (v) { return Math.abs(v); }).concat([1]));
      vals.forEach(function (v) {
        var bar = document.createElement("i");
        var pct = Math.max(4, (Math.abs(v) / maxAbs) * 100);
        bar.style.height = (isFinite(pct) ? pct : 100) + "%";
        if (v < 0) bar.classList.add("neg");
        bar.title = v;
        viz.appendChild(bar);
      });
    });
  }

  /* ---------------- Quiz check (latihan mandiri) ---------------- */
  function numbersMatch(userVal, answerVal) {
    var u = parseFloat(String(userVal).replace(/\./g, "").replace(",", "."));
    var a = parseFloat(answerVal);
    if (isNaN(u) || isNaN(a)) return false;
    return Math.abs(u - a) < 0.01;
  }

  document.querySelectorAll(".quiz-check").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".quiz-row");
      var input = row.querySelector("input");
      var feedback = row.querySelector(".quiz-feedback");
      var answer = input.getAttribute("data-answer");
      var ok = numbersMatch(input.value, answer);
      feedback.textContent = ok ? "✓ Benar!" : "✗ Coba lagi";
      feedback.className = "quiz-feedback " + (ok ? "correct" : "wrong");
    });
  });

  document.querySelectorAll(".quiz-toggle-explain").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var explain = btn.nextElementSibling;
      var showing = explain.classList.toggle("show");
      btn.textContent = showing ? "Sembunyikan penjelasan" : "Lihat penjelasan";
    });
  });

  /* ---------------- LKPD step check ---------------- */
  document.querySelectorAll(".lkpd-check").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var step = btn.closest(".lkpd-step");
      var feedback = btn.parentElement.querySelector(".quiz-feedback");
      var inputs = step.querySelectorAll("input[data-answer]");
      var allOk = true;
      inputs.forEach(function (inp) {
        var ok = numbersMatch(inp.value, inp.getAttribute("data-answer"));
        inp.style.borderColor = inp.value.trim() === "" ? "" : (ok ? "#0EA5A0" : "#F0A93C");
        if (!ok) allOk = false;
      });
      feedback.textContent = allOk ? "✓ Semua benar!" : "✗ Periksa kembali perhitunganmu";
      feedback.className = "quiz-feedback " + (allOk ? "correct" : "wrong");
    });
  });

  /* ---------------- LKPD save / load / reset (localStorage) ---------------- */
  var LKPD_KEY = "lkpd-barisan-deret-v1";
  var REF_KEY = "refleksi-barisan-deret-v1";

  function collectLkpdFields() {
    var data = {};
    document.querySelectorAll("[data-lkpd]").forEach(function (el) {
      data[el.getAttribute("data-lkpd")] = el.value;
    });
    data.group = (document.getElementById("lk-group") || {}).value || "";
    data.members = (document.getElementById("lk-members") || {}).value || "";
    data.conclusion = (document.getElementById("lk-conclusion") || {}).value || "";
    data.nama = (document.getElementById("lk-nama") || {}).value || "";
    data.kelas = (document.getElementById("lk-kelas") || {}).value || "";
    data.absen = (document.getElementById("lk-absen") || {}).value || "";
    return data;
  }

  function applyLkpdFields(data) {
    if (!data) return;
    document.querySelectorAll("[data-lkpd]").forEach(function (el) {
      var key = el.getAttribute("data-lkpd");
      if (data[key] !== undefined) el.value = data[key];
    });
    if (document.getElementById("lk-group")) document.getElementById("lk-group").value = data.group || "";
    if (document.getElementById("lk-members")) document.getElementById("lk-members").value = data.members || "";
    if (document.getElementById("lk-conclusion")) document.getElementById("lk-conclusion").value = data.conclusion || "";
    if (document.getElementById("lk-nama")) document.getElementById("lk-nama").value = data.nama || "";
    if (document.getElementById("lk-kelas")) document.getElementById("lk-kelas").value = data.kelas || "";
    if (document.getElementById("lk-absen")) document.getElementById("lk-absen").value = data.absen || "";
  }

  function safeLocalStorage() {
    try {
      var testKey = "__test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      return null;
    }
  }
  var ls = safeLocalStorage();

  var saveButtons = [
    { btn: document.getElementById("lk-save-1"), note: document.getElementById("lk-save-note-1") },
    { btn: document.getElementById("lk-save-2"), note: document.getElementById("lk-save-note-2") }
  ];
  saveButtons.forEach(function (pair) {
    if (!pair.btn) return;
    if (ls) {
      pair.btn.addEventListener("click", function () {
        ls.setItem(LKPD_KEY, JSON.stringify(collectLkpdFields()));
        if (pair.note) {
          pair.note.textContent = "Tersimpan di perangkat ini pada " + new Date().toLocaleTimeString("id-ID");
          pair.note.classList.add("show-saved");
        }
      });
    } else {
      pair.btn.addEventListener("click", function () {
        if (pair.note) pair.note.textContent = "Penyimpanan browser tidak tersedia di perangkat ini.";
      });
    }
  });
  if (ls) {
    var saved = ls.getItem(LKPD_KEY);
    if (saved) {
      try {
        applyLkpdFields(JSON.parse(saved));
        saveButtons.forEach(function (pair) {
          if (pair.note) pair.note.textContent = "Memuat jawaban tersimpan sebelumnya.";
        });
      } catch (e) {}
    }
  }

  var resetBtn = document.getElementById("lk-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!confirm("Kosongkan semua jawaban LKPD di perangkat ini? (Nama, kelas, dan nomor absen tidak akan dihapus)")) return;
      var identity = {
        nama: (document.getElementById("lk-nama") || {}).value || "",
        kelas: (document.getElementById("lk-kelas") || {}).value || "",
        absen: (document.getElementById("lk-absen") || {}).value || ""
      };
      applyLkpdFields({});
      if (document.getElementById("lk-nama")) document.getElementById("lk-nama").value = identity.nama;
      if (document.getElementById("lk-kelas")) document.getElementById("lk-kelas").value = identity.kelas;
      if (document.getElementById("lk-absen")) document.getElementById("lk-absen").value = identity.absen;
      document.querySelectorAll("[data-lkpd]").forEach(function (el) { el.style.borderColor = ""; });
      if (ls) {
        var data = collectLkpdFields();
        ls.setItem(LKPD_KEY, JSON.stringify(data));
      }
      saveButtons.forEach(function (pair) {
        if (!pair.note) return;
        pair.note.textContent = "Jawaban telah dikosongkan.";
        pair.note.classList.remove("show-saved");
      });
    });
  }

  /* ---------------- LKPD print sheet (identity + jawaban, tanpa input) ---------------- */
  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getLkpdValue(key) {
    var el = document.querySelector('[data-lkpd="' + key + '"]');
    if (!el) el = document.getElementById(key);
    return el ? el.value.trim() : "";
  }

  function printRowHtml(letter, label, key) {
    var value = getLkpdValue(key);
    var valueHtml = value
      ? escapeHtml(value)
      : '<span class="print-blank">&nbsp;</span>';
    return (
      '<div class="print-row">' +
      '<span class="print-item-label">' + letter + ". " + escapeHtml(label) + "</span>" +
      '<span class="print-sep">:</span>' +
      '<span class="print-item-value">' + valueHtml + "</span>" +
      "</div>"
    );
  }

  function conclusionHtml(label, key) {
    var value = getLkpdValue(key);
    var body;
    if (value) {
      body = '<div class="print-conclusion-text">' + escapeHtml(value).replace(/\n/g, "<br>") + "</div>";
    } else {
      body =
        '<div class="print-conclusion-line"></div>' +
        '<div class="print-conclusion-line"></div>' +
        '<div class="print-conclusion-line"></div>';
    }
    return '<div class="print-conclusion"><h4>' + escapeHtml(label) + "</h4>" + body + "</div>";
  }

  var LKPD_CASES = {
    1: {
      heading: "LKPD Interaktif — Studi Kasus Aritmetika &amp; Geometri",
      subheading: "Studi Kasus 1 — Proyek Konser Amal Pensi Sekolah",
      steps: [
        {
          title: "Langkah 1 — Identifikasi Masalah",
          items: [
            { label: "Suku pertama (a)", key: "a" },
            { label: "Beda (b)", key: "b" },
            { label: "Banyak baris (n)", key: "n" }
          ]
        },
        {
          title: "Langkah 2 — Kapasitas Baris Terakhir (Konsep Barisan)",
          items: [
            { label: "Cara / perhitungan", key: "u15work" },
            { label: "Hasil U15", key: "u15" }
          ]
        },
        {
          title: "Langkah 3 — Kapasitas Total Gedung (Konsep Deret)",
          items: [
            { label: "Cara / perhitungan", key: "s15work" },
            { label: "Hasil S15", key: "s15" }
          ]
        },
        {
          title: "Langkah 4 — Analisis &amp; Pengambilan Keputusan (HOTS)",
          items: [
            { label: "Estimasi pendapatan (Rp)", key: "pendapatan" },
            { label: "Tercapai / tidak?", key: "tercapai" }
          ]
        }
      ],
      conclusion: { label: "Kesimpulan Studi Kasus 1", key: "lk-conclusion" }
    },
    2: {
      heading: "LKPD Interaktif — Studi Kasus Aritmetika &amp; Geometri",
      subheading: "Studi Kasus 2 — Gerakan Menanam Berantai (Geometri)",
      steps: [
        {
          title: "Langkah 1 — Identifikasi Masalah",
          items: [
            { label: "Penanam baru minggu ke-1 (a)", key: "g-a" },
            { label: "Rasio (r)", key: "g-r" },
            { label: "Lama program / minggu (n)", key: "g-n" }
          ]
        },
        {
          title: "Langkah 2 — Penanam Baru di Minggu Terakhir (Konsep Barisan)",
          items: [
            { label: "Cara / perhitungan", key: "g-u6work" },
            { label: "Hasil U6", key: "g-u6" }
          ]
        },
        {
          title: "Langkah 3 — Total Pohon Tertanam (Konsep Deret)",
          items: [
            { label: "Cara / perhitungan", key: "g-s6work" },
            { label: "Hasil S6", key: "g-s6" }
          ]
        },
        {
          title: "Langkah 4 — Analisis &amp; Pengambilan Keputusan (HOTS)",
          items: [
            { label: "Selisih dari target (pohon)", key: "g-selisih" },
            { label: "Tercapai / tidak?", key: "g-tercapai" }
          ]
        }
      ],
      conclusion: { label: "Kesimpulan Studi Kasus 2", key: "g-conclusion" }
    }
  };

  function buildPrintSheetHtml(caseNum) {
    var data = LKPD_CASES[caseNum];
    if (!data) return "";
    var nama = getLkpdValue("lk-nama");
    var kelas = getLkpdValue("lk-kelas");
    var absen = getLkpdValue("lk-absen");
    var blank = '<span class="print-blank-line">&nbsp;</span>';

    var html = '<div class="print-page">';
    html += "<h1>" + data.heading + "</h1>";
    html += "<h2>" + escapeHtml(data.subheading) + "</h2>";
    html += '<div class="print-identity">';
    html += "<div><strong>Nama</strong> : " + (nama ? escapeHtml(nama) : blank) + "</div>";
    html += "<div><strong>Kelas</strong> : " + (kelas ? escapeHtml(kelas) : blank) + "</div>";
    html += "<div><strong>Nomor Absen</strong> : " + (absen ? escapeHtml(absen) : blank) + "</div>";
    html += "</div>";
    html += '<div class="print-jawaban-label">Jawaban :</div>';

    data.steps.forEach(function (step) {
      html += '<div class="print-step"><h4>' + step.title + "</h4>";
      step.items.forEach(function (item, i) {
        html += printRowHtml(String.fromCharCode(97 + i), item.label, item.key);
      });
      html += "</div>";
    });

    html += conclusionHtml(data.conclusion.label, data.conclusion.key);
    html += '<div class="print-footer-note">Dicetak dari LKPD Interaktif Barisan &amp; Deret pada ' + new Date().toLocaleDateString("id-ID") + "</div>";
    html += "</div>";
    return html;
  }

  function sanitizeFileNamePart(str) {
    return String(str || "")
      .replace(/[\\/:*?"<>|]/g, "-") // characters not allowed in filenames
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildPrintFileName(caseNum) {
    var kelas = sanitizeFileNamePart(getLkpdValue("lk-kelas")) || "Kelas";
    var absen = sanitizeFileNamePart(getLkpdValue("lk-absen")) || "Absen";
    var nama = sanitizeFileNamePart(getLkpdValue("lk-nama")) || "Nama";
    return "LKPD " + caseNum + " - " + kelas + " - " + absen + " - " + nama;
  }

  // Self-contained CSS for the dedicated print window/tab. Kept inline (not in
  // style.css) so the print window is a fully standalone document — this is
  // what makes printing reliable on mobile browsers, since there's no other
  // page content around it that could accidentally show up.
  var PRINT_SHEET_CSS =
    "*{box-sizing:border-box}" +
    "body{margin:0;padding:24px;font-family:Arial,'Segoe UI',Roboto,Helvetica,sans-serif;color:#111;font-size:14px;line-height:1.5}" +
    ".print-page{max-width:720px;margin:0 auto}" +
    ".print-page h1{font-size:1.2rem;margin:0 0 2px}" +
    ".print-page h2{font-size:1.05rem;margin:0 0 18px;font-weight:700}" +
    ".print-identity{margin-bottom:18px}" +
    ".print-identity div{font-size:.95rem;margin-bottom:6px;display:flex;gap:6px}" +
    ".print-identity strong{min-width:110px;display:inline-block}" +
    ".print-blank-line{flex:1;border-bottom:1px dotted #000;min-width:160px}" +
    ".print-jawaban-label{font-weight:800;text-decoration:underline;margin:6px 0 14px;font-size:1rem}" +
    ".print-step{margin-bottom:14px;page-break-inside:avoid}" +
    ".print-step h4{font-size:.95rem;margin:0 0 6px;font-weight:700}" +
    ".print-row{display:flex;align-items:baseline;gap:8px;padding-left:22px;margin-bottom:6px;font-size:.92rem}" +
    ".print-item-label{min-width:230px}" +
    ".print-sep{flex:none}" +
    ".print-item-value{flex:1}" +
    ".print-blank{display:inline-block;width:100%;border-bottom:1px dotted #000;min-height:1.1em}" +
    ".print-conclusion{margin-top:18px;page-break-inside:avoid}" +
    ".print-conclusion h4{font-size:.95rem;margin:0 0 8px;font-weight:700}" +
    ".print-conclusion-text{font-size:.92rem;white-space:pre-wrap}" +
    ".print-conclusion-line{border-bottom:1px dotted #000;height:1.4em;margin-bottom:4px}" +
    ".print-footer-note{margin-top:26px;font-size:.78rem;color:#555}" +
    "@media print{body{padding:0}@page{margin:14mm 12mm}}";

  function printLkpd(caseNum) {
    var bodyHtml = buildPrintSheetHtml(caseNum);
    var fileTitle = buildPrintFileName(caseNum);

    // Print in a dedicated, self-contained tab/window instead of the current
    // page. This is far more reliable on mobile browsers (Android Chrome /
    // iOS Safari), which can otherwise snapshot the current page for
    // printing before our DOM changes have actually been painted, resulting
    // in the full page being printed instead of just the LKPD answer sheet.
    var printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Popup diblokir oleh browser. Mohon izinkan pop-up/tab baru di pengaturan browser, lalu coba tekan tombol cetak lagi.");
      return;
    }

    var doc =
      "<!DOCTYPE html><html lang=\"id\"><head><meta charset=\"UTF-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
      "<title>" + escapeHtml(fileTitle) + "</title>" +
      "<style>" + PRINT_SHEET_CSS + "</style>" +
      "</head><body>" +
      bodyHtml +
      "<script>" +
      "window.addEventListener('load', function () {" +
      "  setTimeout(function () {" +
      "    window.focus();" +
      "    window.print();" +
      "  }, 150);" +
      "});" +
      "window.addEventListener('afterprint', function () { window.close(); });" +
      "</" + "script>" +
      "</body></html>";

    printWin.document.open();
    printWin.document.write(doc);
    printWin.document.close();
  }

  var printBtn1 = document.getElementById("lk-print-1");
  if (printBtn1) printBtn1.addEventListener("click", function () { printLkpd(1); });
  var printBtn2 = document.getElementById("lk-print-2");
  if (printBtn2) printBtn2.addEventListener("click", function () { printLkpd(2); });

  var refSaveBtn = document.getElementById("lk-ref-save");
  var refSaveNote = document.getElementById("lk-ref-save-note");
  if (refSaveBtn && ls) {
    refSaveBtn.addEventListener("click", function () {
      var data = {
        r1: document.getElementById("lk-ref1").value,
        r2: document.getElementById("lk-ref2").value,
        r3: document.getElementById("lk-ref3").value,
      };
      ls.setItem(REF_KEY, JSON.stringify(data));
      refSaveNote.textContent = "Refleksi tersimpan pada " + new Date().toLocaleTimeString("id-ID");
      refSaveNote.classList.add("show-saved");
    });
    var savedRef = ls.getItem(REF_KEY);
    if (savedRef) {
      try {
        var d = JSON.parse(savedRef);
        document.getElementById("lk-ref1").value = d.r1 || "";
        document.getElementById("lk-ref2").value = d.r2 || "";
        document.getElementById("lk-ref3").value = d.r3 || "";
      } catch (e) {}
    }
  }

  /* ---------------- Guru gate ---------------- */
  var GURU_PASSWORD = "847693";
  var guruForm = document.getElementById("guru-gate-form");
  var guruPassInput = document.getElementById("guru-gate-pass");
  var guruError = document.getElementById("guru-gate-error");
  var guruGate = document.getElementById("guruGate");
  var guruContent = document.getElementById("guruContent");
  if (guruForm) {
    guruForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var entered = (guruPassInput.value || "").trim();
      if (entered === GURU_PASSWORD) {
        guruContent.classList.add("show");
        guruGate.style.display = "none";
      } else {
        guruError.style.display = "block";
        guruPassInput.value = "";
        guruPassInput.focus();
      }
    });
  }
})();
