(function () {
  "use strict";

  /* ---------------- Math helpers ---------------- */
  function Un(a, b, n) { return a + (n - 1) * b; }
  function Sn(a, b, n) { return (n / 2) * (2 * a + (n - 1) * b); }
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
  var sections = ["barisan", "deret", "rangkuman", "lkpd", "guru"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
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

  var saveBtn = document.getElementById("lk-save");
  var saveNote = document.getElementById("lk-save-note");
  if (saveBtn && ls) {
    saveBtn.addEventListener("click", function () {
      ls.setItem(LKPD_KEY, JSON.stringify(collectLkpdFields()));
      saveNote.textContent = "Tersimpan di perangkat ini pada " + new Date().toLocaleTimeString("id-ID");
      saveNote.classList.add("show-saved");
    });
    var saved = ls.getItem(LKPD_KEY);
    if (saved) {
      try { applyLkpdFields(JSON.parse(saved)); saveNote.textContent = "Memuat jawaban tersimpan sebelumnya."; } catch (e) {}
    }
  } else if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveNote.textContent = "Penyimpanan browser tidak tersedia di perangkat ini.";
    });
  }

  var resetBtn = document.getElementById("lk-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!confirm("Kosongkan semua jawaban LKPD di perangkat ini?")) return;
      applyLkpdFields({});
      document.querySelectorAll("[data-lkpd]").forEach(function (el) { el.style.borderColor = ""; });
      if (ls) ls.removeItem(LKPD_KEY);
      saveNote.textContent = "Jawaban telah dikosongkan.";
      saveNote.classList.remove("show-saved");
    });
  }

  var printBtn = document.getElementById("lk-print");
  if (printBtn) {
    printBtn.addEventListener("click", function () { window.print(); });
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
  var guruBtn = document.getElementById("guru-gate-btn");
  var guruGate = document.getElementById("guruGate");
  var guruContent = document.getElementById("guruContent");
  if (guruBtn) {
    guruBtn.addEventListener("click", function () {
      guruContent.classList.add("show");
      guruGate.style.display = "none";
    });
  }
})();
