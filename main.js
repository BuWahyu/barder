(function () {
  "use strict";

  /* ---------------- Math helpers ---------------- */
  function Un(a, b, n) {
    return a + (n - 1) * b;
  }
  function Sn(a, b, n) {
    return (n / 2) * (2 * a + (n - 1) * b);
  }
  function UnG(a, r, n) {
    return a * Math.pow(r, n - 1);
  }
  function SnG(a, r, n) {
    if (r === 1) return a * n;
    return (a * (Math.pow(r, n) - 1)) / (r - 1);
  }
  function fmt(x) {
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

  /* ---------------- Hero staircase widget ---------------- */
  var heroChart = document.getElementById("heroChart");
  var heroB = document.getElementById("heroB");
  var heroBVal = document.getElementById("heroBVal");
  var HERO_A = 4,
    HERO_N = 8,
    HERO_MAXB = 8;

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
        btns.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        var target = btn.getAttribute("data-tab");
        var panels = document.querySelectorAll(".tab-panel");
        panels.forEach(function (p) {
          p.classList.remove("active");
        });
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

  /* ---------------- FIXED: Navigasi Per Section (Step-by-Step) ---------------- */
  // 'beranda' diubah menjadi 'pendahuluan' agar menyembunyikan hero sekaligus peta konsep
  var ALL_SECTIONS = [
    "pendahuluan",
    "barisan",
    "deret",
    "barisan-geo",
    "deret-geo",
    "rangkuman",
    "lkpd",
    "guru",
  ];
  var UNLOCK_KEY = "unlocked-sections-barisan-deret-v1";

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

  function getActiveSection() {
    if (!ls) return "pendahuluan";
    return ls.getItem(UNLOCK_KEY) || "pendahuluan";
  }

  function saveActiveSection(id) {
    if (!ls) return;
    try {
      ls.setItem(UNLOCK_KEY, id);
    } catch (e) {}
  }

  function showSection(targetId) {
    // Normalisasi pemanggilan navigasi bernilai umum ke id section spesifik pertama
    if (targetId === "beranda" || targetId === "pendahuluan")
      targetId = "pendahuluan";
    if (targetId === "aritmetika") targetId = "barisan";
    if (targetId === "geometri") targetId = "barisan-geo";

    if (ALL_SECTIONS.indexOf(targetId) === -1) return;

    // Sembunyikan seluruh section kecuali id yang dipilih
    ALL_SECTIONS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.classList.remove("section-locked"); // Reset state dari style CSS lama
        if (id === targetId) {
          el.style.setProperty("display", "block", "important");
        } else {
          el.style.setProperty("display", "none", "important");
        }
      }
    });

    // Perbarui penanda active link pada sistem top-nav/navbar
    var targetHref = "#" + targetId;
    if (targetId === "pendahuluan") targetHref = "#beranda";
    if (targetId === "barisan" || targetId === "deret")
      targetHref = "#aritmetika";
    if (targetId === "barisan-geo" || targetId === "deret-geo")
      targetHref = "#geometri";

    var navLinks = document.querySelectorAll("[data-nav]");
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === targetHref);
    });

    saveActiveSection(targetId);

    // Auto-scroll ke atas halaman baru agar tidak membingungkan pengguna
    window.scrollTo({ top: 0, behavior: "smooth" });
    updateProgress();
  }

  // Mengembalikan sesi halaman aktif pengguna saat pertama kali dibuka / memprioritaskan hash URL
  var initialSection = getActiveSection();
  if (window.location.hash) {
    initialSection = window.location.hash.slice(1);
  }
  showSection(initialSection);

  // Pasang sistem tombol lanjut antar materi
  document
    .querySelectorAll(".next-section-btn[data-unlock]")
    .forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-unlock");
        showSection(targetId);
      });
    });

  // Hubungkan semua tautan jangkar (navigasi atas, menu mobile, DAN tombol hero)
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      // Validasi tujuan navigasi yang valid
      if (
        id &&
        (ALL_SECTIONS.indexOf(id) !== -1 ||
          id === "beranda" ||
          id === "aritmetika" ||
          id === "geometri" ||
          id === "barisan-geo")
      ) {
        e.preventDefault();
        showSection(id);
      }
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
        "<li>U" +
        n +
        " = " +
        fmt(a) +
        " + (" +
        n +
        " \u2212 1)(" +
        fmt(b) +
        ")</li>" +
        "<li>U" +
        n +
        " = " +
        fmt(a) +
        " + (" +
        (n - 1) +
        ")(" +
        fmt(b) +
        ") = " +
        fmt(result) +
        "</li>";
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
        "<li>S" +
        n +
        " = " +
        n +
        "/2 (2(" +
        fmt(a) +
        ") + (" +
        (n - 1) +
        ")(" +
        fmt(b) +
        "))</li>" +
        "<li>U" +
        n +
        " = " +
        fmt(lastTerm) +
        " \u2192 S" +
        n +
        " = " +
        n +
        "/2 (" +
        fmt(a) +
        " + " +
        fmt(lastTerm) +
        ") = " +
        fmt(result) +
        "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 12);
      var running = 0;
      var vals = [];
      for (var i = 1; i <= count; i++) {
        running += Un(a, b, i);
        vals.push(running);
      }
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
        "<li>U" +
        n +
        " = " +
        fmt(a) +
        " \u00D7 " +
        fmt(r) +
        "^(" +
        n +
        " \u2212 1)</li>" +
        "<li>U" +
        n +
        " = " +
        fmt(a) +
        " \u00D7 " +
        fmt(r) +
        "^" +
        (n - 1) +
        " = " +
        fmt(result) +
        "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 10);
      var vals = [];
      for (var i = 1; i <= count; i++) vals.push(UnG(a, r, i));
      var maxAbs = Math.max.apply(
        null,
        vals
          .map(function (v) {
            return Math.abs(v);
          })
          .concat([1]),
      );
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
        "<li>S" +
        n +
        " = " +
        fmt(a) +
        "(" +
        fmt(r) +
        "^" +
        n +
        " \u2212 1) / (" +
        fmt(r) +
        " \u2212 1)</li>" +
        "<li>U" +
        n +
        " = " +
        fmt(lastTerm) +
        " \u2192 S" +
        n +
        " = " +
        fmt(result) +
        "</li>";
      resultBox.classList.add("show");

      viz.innerHTML = "";
      var count = Math.min(n, 10);
      var running = 0;
      var vals = [];
      for (var i = 1; i <= count; i++) {
        running += UnG(a, r, i);
        vals.push(running);
      }
      var maxAbs = Math.max.apply(
        null,
        vals
          .map(function (v) {
            return Math.abs(v);
          })
          .concat([1]),
      );
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
        inp.style.borderColor =
          inp.value.trim() === "" ? "" : ok ? "#0EA5A0" : "#F0A93C";
        if (!ok) allOk = false;
      });
      feedback.textContent = allOk
        ? "✓ Semua benar!"
        : "✗ Periksa kembali perhitunganmu";
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
    data.conclusion =
      (document.getElementById("lk-conclusion") || {}).value || "";
    return data;
  }

  function applyLkpdFields(data) {
    if (!data) return;
    document.querySelectorAll("[data-lkpd]").forEach(function (el) {
      var key = el.getAttribute("data-lkpd");
      if (data[key] !== undefined) el.value = data[key];
    });
    if (document.getElementById("lk-group"))
      document.getElementById("lk-group").value = data.group || "";
    if (document.getElementById("lk-members"))
      document.getElementById("lk-members").value = data.members || "";
    if (document.getElementById("lk-conclusion"))
      document.getElementById("lk-conclusion").value = data.conclusion || "";
  }

  var saveBtn = document.getElementById("lk-save");
  var saveNote = document.getElementById("lk-save-note");
  if (saveBtn && ls) {
    saveBtn.addEventListener("click", function () {
      ls.setItem(LKPD_KEY, JSON.stringify(collectLkpdFields()));
      saveNote.textContent =
        "Tersimpan di perangkat ini pada " +
        new Date().toLocaleTimeString("id-ID");
      saveNote.classList.add("show-saved");
    });
    var saved = ls.getItem(LKPD_KEY);
    if (saved) {
      try {
        applyLkpdFields(JSON.parse(saved));
        saveNote.textContent = "Memuat jawaban tersimpan sebelumnya.";
      } catch (e) {}
    }
  } else if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveNote.textContent =
        "Penyimpanan browser tidak tersedia di perangkat ini.";
    });
  }

  var resetBtn = document.getElementById("lk-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!confirm("Kosongkan semua jawaban LKPD di perangkat ini?")) return;
      applyLkpdFields({});
      document.querySelectorAll("[data-lkpd]").forEach(function (el) {
        el.style.borderColor = "";
      });
      if (ls) ls.removeItem(LKPD_KEY);
      saveNote.textContent = "Jawaban telah dikosongkan.";
      saveNote.classList.remove("show-saved");
    });
  }

  var printBtn = document.getElementById("lk-print");
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print();
    });
  }

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
      refSaveNote.textContent =
        "Refleksi tersimpan pada " + new Date().toLocaleTimeString("id-ID");
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
