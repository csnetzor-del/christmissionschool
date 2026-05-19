/* =============================================================
   Christ Mission School — Interactive behaviors
   - Mobile nav toggle
   - Sticky header shadow on scroll
   - Smooth in-page anchors
   - Active nav link highlighting on scroll
   - IntersectionObserver reveal animations
   ============================================================= */

(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("primaryNav");

  if (navToggle && nav) {
    const navList = nav.querySelector(".nav__list");
    const headerCtas = document.querySelector(".header-ctas");
    if (navList && headerCtas) {
      const ctasLi = document.createElement("li");
      ctasLi.className = "mobile-ctas-item";
      const ctasClone = headerCtas.cloneNode(true);
      ctasClone.className = "mobile-ctas";
      ctasLi.appendChild(ctasClone);
      navList.appendChild(ctasLi);
    }

    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (nav.classList.contains("is-open")) {
          nav.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById("siteHeader");
  if (header) {
    const onScroll = function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = "0 8px 24px rgba(0,0,0,0.18)";
      } else {
        header.style.boxShadow = "none";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Active nav link based on visible section ---------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav__link");

  function currentPageBasename() {
    var p = (window.location.pathname || "").replace(/\\/g, "/");
    var parts = p.split("/").filter(Boolean);
    var last = parts.length ? parts[parts.length - 1] : "";
    if (!last) return "index.html";
    return last;
  }

  /**
   * Homepage sections use ids (home, admissions, …) but primary nav uses
   * page filenames. Map each section to the nav href(s) that should highlight.
   * Pure hash links still match with href === "#" + sectionId.
   */
  function navHrefMatchesSection(href, sectionId) {
    if (!href || !sectionId) return false;
    if (href === "#" + sectionId) return true;
    var page = currentPageBasename();
    if (page !== "index.html") return false;
    var map = {
      home: ["index.html", "#home"],
      admissions: ["admissions.html"],
      "mission-recruit": ["careers.html", "careers.html?apply=1", "careers-payment.html", "careers-apply.html"],
      mission: ["our-mission.html"]
    };
    var keys = map[sectionId];
    if (!keys) return false;
    var h = href.trim();
    var hashIdx = h.indexOf("#");
    var filePart = hashIdx >= 0 ? h.slice(0, hashIdx) : h;
    var lastFile = filePart.split("/").filter(Boolean).pop() || "";
    return keys.some(function (k) {
      if (k.charAt(0) === "#") return h === k;
      return lastFile === k || h === k;
    });
  }

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              const href = link.getAttribute("href") || "";
              link.classList.toggle("is-active", navHrefMatchesSection(href, id));
            });
          }
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach(function (s) {
      sectionObserver.observe(s);
    });
  }

  /* ---------- Reveal animations on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".hero__panel, .feature, .adm-card, .m-card, .calling__content, .section-head"
  );

  revealTargets.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = (i % 4) * 80 + "ms";
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- Year auto-update (footer copyright) ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Auto-sliding image galleries (.event-slider) ---------- */
  document.querySelectorAll(".event-slider[data-autoplay]").forEach(function (slider) {
    var slides = slider.querySelectorAll(".event-slider__slide");
    var dots = slider.querySelectorAll(".event-slider__dot");
    var captions = slider.querySelectorAll(".campus-slideshow__caption");
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;
    var interval = parseInt(slider.getAttribute("data-autoplay"), 10) || 4500;

    function setActive(index) {
      slides[current].classList.remove("active");
      if (dots[current]) {
        dots[current].classList.remove("active");
        dots[current].setAttribute("aria-selected", "false");
      }
      if (captions[current]) captions[current].classList.remove("active");

      current = (index + slides.length) % slides.length;

      slides[current].classList.add("active");
      if (dots[current]) {
        dots[current].classList.add("active");
        dots[current].setAttribute("aria-selected", "true");
      }
      if (captions[current]) captions[current].classList.add("active");
    }

    function next() {
      setActive(current + 1);
    }

    function start() {
      stop();
      timer = window.setInterval(next, interval);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        setActive(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    slider.addEventListener("focusin", stop);
    slider.addEventListener("focusout", start);

    start();
  });

  /* ---------- Admissions Form ---------- */
  const ADMISSION_FEE = 150;
  const ADMISSION_PAYMENTS_KEY = "cms_admission_payments_v1";

  function loadAdmissionPayments() {
    try {
      return JSON.parse(localStorage.getItem(ADMISSION_PAYMENTS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveAdmissionPayments(list) {
    try {
      localStorage.setItem(ADMISSION_PAYMENTS_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function syncAdmissionApplicationToServer(record) {
    return fetch("/api/admissions/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch(function () {
      return null;
    });
  }

  function syncAdmissionPaymentToServer(record) {
    return fetch("/api/admissions/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    }).catch(function () {
      return null;
    });
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result || "");
      };
      reader.onerror = function () {
        reject(new Error("read failed"));
      };
      reader.readAsDataURL(file);
    });
  }

  function admissionDocsForLocalStorage(documents) {
    return (documents || []).map(function (d) {
      return {
        field: d.field,
        label: d.label,
        fileName: d.fileName,
        size: d.size,
        type: d.type,
        storedOnServer: !!d.storedOnServer,
        serverFileName: d.serverFileName || "",
      };
    });
  }

  function collectAdmissionDocumentsFromForm(form) {
    var inputs = [];
    form.querySelectorAll(".adm-doc input[type='file']").forEach(function (input) {
      var file = input.files && input.files[0];
      if (!file) return;
      var card = input.closest(".adm-doc");
      var titleEl = card && card.querySelector(".adm-doc__title");
      inputs.push({
        input: input,
        file: file,
        meta: {
          field: input.name,
          label: titleEl ? titleEl.textContent.trim() : input.name,
          fileName: file.name,
          size: file.size,
          type: file.type,
        },
      });
    });
    if (!inputs.length) return Promise.resolve([]);
    return Promise.all(
      inputs.map(function (item) {
        return readFileAsDataUrl(item.file).then(function (dataUrl) {
          return Object.assign({}, item.meta, { dataUrl: dataUrl });
        });
      })
    );
  }

  const admForm = document.getElementById("admissionForm");
  if (admForm) {
    const MAX_BYTES = 2 * 1024 * 1024;

    /* ---- File uploads ---- */
    admForm.querySelectorAll(".adm-doc input[type='file']").forEach(function (input) {
      input.addEventListener("change", function () {
        const card = input.closest(".adm-doc");
        const btn = card.querySelector(".adm-doc__btn");
        const file = input.files && input.files[0];
        if (!file) {
          card.classList.remove("has-file");
          return;
        }
        if (file.size > MAX_BYTES) {
          alert('"' + file.name + '" is larger than 2 MB. Please choose a smaller file.');
          input.value = "";
          card.classList.remove("has-file");
          return;
        }
        card.classList.add("has-file");
        const trimmed = file.name.length > 22 ? file.name.slice(0, 19) + "..." : file.name;
        btn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
          '<path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
          "</svg> " + trimmed;
      });
    });

    /* ---- Signature pad ---- */
    const padWrap = document.getElementById("signaturePadWrap");
    const canvas = document.getElementById("signaturePad");
    const clearBtn = document.getElementById("signatureClear");
    const sigInput = document.getElementById("declare_sign");
    const sigError = document.getElementById("signatureError");
    let sigEmpty = true;

    function resizeCanvas() {
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      const data = sigEmpty ? null : canvas.toDataURL("image/png");
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      const ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0B1B3E";
      if (data) {
        const img = new Image();
        img.onload = function () { ctx.drawImage(img, 0, 0, rect.width, rect.height); };
        img.src = data;
      }
    }

    function setEmpty(empty) {
      sigEmpty = empty;
      if (padWrap) padWrap.setAttribute("data-empty", String(empty));
      if (sigInput) sigInput.value = empty ? "" : canvas.toDataURL("image/png");
      if (!empty) {
        if (padWrap) padWrap.classList.remove("is-invalid");
        if (sigError) sigError.hidden = true;
      }
    }

    function pointerPos(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - rect.left;
      const y = (e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0)) - rect.top;
      return { x: x, y: y };
    }

    if (canvas) {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      const ctx = canvas.getContext("2d");
      let drawing = false;
      let last = null;

      function start(e) {
        e.preventDefault();
        drawing = true;
        last = pointerPos(e);
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
      }
      function move(e) {
        if (!drawing) return;
        e.preventDefault();
        const p = pointerPos(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        last = p;
        if (sigEmpty) setEmpty(false);
      }
      function end() {
        if (!drawing) return;
        drawing = false;
        if (!sigEmpty) setEmpty(false);
      }

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", move);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("mouseleave", end);
      canvas.addEventListener("touchstart", start, { passive: false });
      canvas.addEventListener("touchmove", move, { passive: false });
      canvas.addEventListener("touchend", end);
      canvas.addEventListener("touchcancel", end);
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setEmpty(true);
      });
    }

    /* ---- Parent occupation: hide annual income when Unemployed ---- */
    function syncParentIncome(occuEl, incomeEl, wrapEl) {
      if (!occuEl || !incomeEl || !wrapEl) return;
      var unemployed = occuEl.value === "Unemployed";
      wrapEl.hidden = unemployed;
      wrapEl.setAttribute("aria-hidden", unemployed ? "true" : "false");
      if (unemployed) {
        incomeEl.value = "";
        incomeEl.disabled = true;
        incomeEl.classList.remove("is-invalid-field");
      } else {
        incomeEl.disabled = false;
      }
    }

    var fOccu = document.getElementById("f_occu");
    var fIncome = document.getElementById("f_income");
    var fIncomeWrap = document.getElementById("f_income_wrap");
    var mOccu = document.getElementById("m_occu");
    var mIncome = document.getElementById("m_income");
    var mIncomeWrap = document.getElementById("m_income_wrap");

    function syncAllParentIncome() {
      syncParentIncome(fOccu, fIncome, fIncomeWrap);
      syncParentIncome(mOccu, mIncome, mIncomeWrap);
    }

    if (fOccu) fOccu.addEventListener("change", function () { syncParentIncome(fOccu, fIncome, fIncomeWrap); });
    if (mOccu) mOccu.addEventListener("change", function () { syncParentIncome(mOccu, mIncome, mIncomeWrap); });
    syncAllParentIncome();

    /* ---- Live invalid-state cleanup as user fixes fields ---- */
    admForm.addEventListener("input", function (e) {
      if (admForm.classList.contains("was-validated")) {
        const target = e.target;
        if (target && target.checkValidity && target.checkValidity()) {
          target.classList.remove("is-invalid-field");
        }
      }
    });
    admForm.addEventListener("change", function (e) {
      const target = e.target;
      if (!target) return;
      // Class radio group fix
      if (target.name === "class_applying") {
        const grp = admForm.querySelector(".adm-radio-grid");
        if (grp) grp.classList.remove("is-invalid");
      }
      // Gender radio group fix
      if (target.name === "gender") {
        const grp = admForm.querySelector(".adm-inline-radios");
        if (grp) grp.classList.remove("is-invalid");
      }
      // Declaration checkbox fix
      if (target.id === "declare") {
        const wrap = admForm.querySelector(".adm-declaration");
        if (wrap && target.checked) wrap.classList.remove("is-invalid");
      }
      if (target.id === "f_occu" || target.id === "m_occu") {
        syncAllParentIncome();
      }
    });

    /* ---- Reset ---- */
    admForm.addEventListener("reset", function () {
      setTimeout(syncAllParentIncome, 0);
      admForm.classList.remove("was-validated");
      admForm.querySelectorAll(".adm-doc").forEach(function (card) {
        card.classList.remove("has-file");
        const btn = card.querySelector(".adm-doc__btn");
        if (btn) {
          btn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
            '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
            "</svg> Upload File";
        }
      });
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setEmpty(true);
      }
      admForm.querySelectorAll(".is-invalid").forEach(function (el) {
        el.classList.remove("is-invalid");
      });
      if (sigError) sigError.hidden = true;
    });

    /* ---- Submit & validate ---- */
    admForm.addEventListener("submit", function (e) {
      e.preventDefault();
      admForm.classList.add("was-validated");

      let firstInvalid = null;

      // Native HTML5 validity
      if (!admForm.checkValidity()) {
        firstInvalid = admForm.querySelector(":invalid");
      }

      // Signature must be drawn
      if (sigEmpty) {
        if (padWrap) padWrap.classList.add("is-invalid");
        if (sigError) sigError.hidden = false;
        if (!firstInvalid) firstInvalid = padWrap;
      }

      // Class radio group must have a choice
      const classChosen = admForm.querySelector("input[name='class_applying']:checked");
      if (!classChosen) {
        const grp = admForm.querySelector(".adm-radio-grid");
        if (grp) grp.classList.add("is-invalid");
        if (!firstInvalid) firstInvalid = grp;
      }

      // Gender radio group must have a choice
      const genderChosen = admForm.querySelector("input[name='gender']:checked");
      if (!genderChosen) {
        const grp = admForm.querySelector(".adm-inline-radios");
        if (grp) grp.classList.add("is-invalid");
        if (!firstInvalid) firstInvalid = grp;
      }

      // Declaration checkbox
      const declareBox = document.getElementById("declare");
      if (declareBox && !declareBox.checked) {
        const wrap = admForm.querySelector(".adm-declaration");
        if (wrap) wrap.classList.add("is-invalid");
        if (!firstInvalid) firstInvalid = wrap;
      }

      if (firstInvalid) {
        if (admForm.reportValidity) admForm.reportValidity();
        if (firstInvalid.scrollIntoView) {
          firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        const focusEl = firstInvalid.querySelector
          ? (firstInvalid.querySelector("input, select, textarea, button") || firstInvalid)
          : firstInvalid;
        if (focusEl && focusEl.focus) {
          setTimeout(function () { focusEl.focus({ preventScroll: true }); }, 350);
        }
        return;
      }

      function fdVal(fd, name) {
        const v = fd.get(name);
        return v == null ? "" : String(v).trim();
      }

      const fd = new FormData(admForm);
      const submitBtn = admForm.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      collectAdmissionDocumentsFromForm(admForm)
        .then(function (docs) {
          const submission = {
        id: "CMS-" + Date.now(),
        submittedAt: new Date().toISOString(),
        status: "Pending",
        payment: {
          amount: ADMISSION_FEE,
          currency: "INR",
          status: "Pending",
          method: "",
          reference: "",
          paidAt: null,
        },
        student: {
          classApplying: classChosen ? classChosen.value : "",
          fullName: fdVal(fd, "student_name"),
          dob: fdVal(fd, "dob"),
          gender: genderChosen ? genderChosen.value : "",
          nationality: fdVal(fd, "nationality"),
          religion: fdVal(fd, "religion"),
          bloodGroup: fdVal(fd, "blood_group"),
          aadhaar: fdVal(fd, "aadhaar_student"),
          mobile: fdVal(fd, "student_mobile"),
        },
        address: {
          address: fdVal(fd, "address"),
          city: fdVal(fd, "city"),
          district: fdVal(fd, "district"),
          state: fdVal(fd, "state"),
          pin: fdVal(fd, "pin"),
        },
        previousSchool: {
          name: fdVal(fd, "prev_school"),
          board: fdVal(fd, "board"),
          lastClass: fdVal(fd, "last_class"),
          tcNo: fdVal(fd, "tc_no"),
          tcDate: fdVal(fd, "tc_date"),
        },
        father: {
          name: fdVal(fd, "f_name"),
          qualification: fdVal(fd, "f_qual"),
          occupation: fdVal(fd, "f_occu"),
          mobile: fdVal(fd, "f_mobile"),
          email: fdVal(fd, "f_email"),
          aadhaar: fdVal(fd, "f_aadhaar"),
          income: fdVal(fd, "f_occu") === "Unemployed" ? "" : fdVal(fd, "f_income"),
          address: fdVal(fd, "f_address"),
        },
        mother: {
          name: fdVal(fd, "m_name"),
          qualification: fdVal(fd, "m_qual"),
          occupation: fdVal(fd, "m_occu"),
          mobile: fdVal(fd, "m_mobile"),
          email: fdVal(fd, "m_email"),
          aadhaar: fdVal(fd, "m_aadhaar"),
          income: fdVal(fd, "m_occu") === "Unemployed" ? "" : fdVal(fd, "m_income"),
          address: fdVal(fd, "m_address"),
        },
            documents: docs,
            declaration: {
              name: fdVal(fd, "declare_name"),
              date: fdVal(fd, "declare_date"),
              signature: sigInput ? sigInput.value : "",
              agreed: !!(declareBox && declareBox.checked),
            },
          };

          try {
            sessionStorage.setItem("cms_pending_submission", JSON.stringify(submission));
          } catch (err) {
            alert("Could not save your application (files may be too large). Please try again or use smaller uploads.");
            if (submitBtn) submitBtn.disabled = false;
            return;
          }
          window.location.href = "payment.html";
        })
        .catch(function () {
          alert("Could not read uploaded files. Please try again.");
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  /* ============================================================
     SHARED STORAGE HELPERS
     ============================================================ */
  const STORAGE_KEY = "cms_submissions_v1";
  const AUTH_KEY = "cms_admin_auth";
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "cms@2026";

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveAll(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function fmtINR(n) {
    return "₹" + Number(n || 0).toLocaleString("en-IN");
  }
  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  }
  function fmtDateOnly(val) {
    if (!val) return "—";
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });
    }
    return String(val);
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  var ADMISSION_DOC_SLOTS = [
    { field: "doc_photo_father", label: "Photo of Father", optional: true },
    { field: "doc_photo_mother", label: "Photo of Mother", optional: true },
    { field: "doc_birth", label: "Birth Certificate" },
    { field: "doc_aadhaar_student", label: "Aadhaar Card (Student)" },
    { field: "doc_aadhaar_father", label: "Aadhaar Card (Father)" },
    { field: "doc_aadhaar_mother", label: "Aadhaar Card (Mother)" },
    { field: "doc_report_card", label: "Previous School Report Card" },
    { field: "doc_tc", label: "Transfer Certificate (TC)", optional: true },
    { field: "doc_photo", label: "Passport Size Photograph" },
    { field: "doc_address", label: "Address Proof" },
    { field: "doc_medical", label: "Medical / Fitness Certificate", optional: true },
    { field: "doc_other", label: "Any Other Document", optional: true },
  ];

  function getAdmissionDocumentsForAdmin(app) {
    var byField = {};
    (app.documents || []).forEach(function (d) {
      if (d && d.field) byField[d.field] = d;
    });
    return ADMISSION_DOC_SLOTS.map(function (slot) {
      var doc = byField[slot.field];
      if (doc && (doc.fileName || doc.storedOnServer || doc.dataUrl)) {
        return Object.assign({}, doc, { label: doc.label || slot.label });
      }
      return {
        field: slot.field,
        label: slot.label,
        missing: true,
        optional: !!slot.optional,
      };
    });
  }

  function admissionDocHref(app, doc) {
    if (!doc) return "";
    if (doc.storedOnServer && app && app.id && doc.field) {
      return (
        "/api/admissions/applications/" +
        encodeURIComponent(app.id) +
        "/documents/" +
        encodeURIComponent(doc.field)
      );
    }
    return doc.dataUrl || "";
  }

  function admissionStatusPill(status) {
    var s = status || "Pending";
    var cls =
      s === "Approved" ? "pill--ok" : s === "Rejected" ? "pill--bad" : "pill--warn";
    return '<span class="pill ' + cls + '">' + esc(s) + "</span>";
  }

  function renderAdmissionDocumentCard(app, doc) {
    if (!doc) return "";
    if (doc.missing) {
      return (
        '<article class="detail-doc-card detail-doc-card--missing">' +
        '<div class="detail-doc-card__head">' +
        "<strong>" +
        esc(doc.label || doc.field) +
        "</strong>" +
        '<span class="cell-sub">' +
        (doc.optional ? "Not uploaded (optional)" : "Not uploaded") +
        "</span></div></article>"
      );
    }
    var href = admissionDocHref(app, doc);
    var mime = String(doc.type || "");
    var isImage = mime.indexOf("image/") === 0;
    var isPdf =
      mime.indexOf("pdf") >= 0 || /\.pdf$/i.test(doc.fileName || "");
    var sizeLabel = doc.size ? Math.round(Number(doc.size) / 1024) + " KB" : "";
    var html =
      '<article class="detail-doc-card">' +
      '<div class="detail-doc-card__head">' +
      "<strong>" +
      esc(doc.label || doc.field) +
      "</strong>" +
      '<span class="cell-sub">' +
      esc(doc.fileName || "—") +
      (sizeLabel ? " · " + esc(sizeLabel) : "") +
      "</span></div>";
    if (href) {
      html +=
        '<div class="detail-doc-card__actions">' +
        '<a class="pay-btn pay-btn--ghost pay-btn--small" href="' +
        esc(href) +
        '" target="_blank" rel="noopener">' +
        (isPdf ? "Open PDF" : "View full size") +
        "</a>" +
        '<a class="pay-btn pay-btn--ghost pay-btn--small" href="' +
        esc(href) +
        '" download="' +
        esc(doc.fileName || "document") +
        '" target="_blank" rel="noopener">Download</a>' +
        "</div>";
      if (isImage) {
        html +=
          '<a class="detail-doc-card__preview" href="' +
          esc(href) +
          '" target="_blank" rel="noopener">' +
          '<img src="' +
          esc(href) +
          '" alt="' +
          esc(doc.label || doc.fileName) +
          '"/>' +
          "</a>";
      } else if (isPdf) {
        html +=
          '<iframe class="detail-doc-card__pdf" src="' +
          esc(href) +
          '" title="' +
          esc(doc.label || doc.fileName || "PDF") +
          '"></iframe>';
      }
    } else if (doc.fileName) {
      html +=
        '<p class="cell-sub">Filename on record only. Start <code>node server.js</code>, open admin at <code>http://localhost:3000</code>, and refresh to load files.</p>';
    } else {
      html += '<p class="cell-sub">No file on record.</p>';
    }
    html += "</article>";
    return html;
  }

  /* ============================================================
     PAYMENT PAGE
     ============================================================ */
  const payMethods = document.getElementById("payMethods");
  if (payMethods) {
    const empty = document.getElementById("payEmpty");
    const grid = document.querySelector(".pay-grid");
    const rawPending = sessionStorage.getItem("cms_pending_submission");
    let pending = null;
    try {
      pending = rawPending ? JSON.parse(rawPending) : null;
    } catch (e) {}

    const payMethodsRoot =
      payMethods.closest(".pay-card--methods") ||
      payMethods.closest(".pay-card") ||
      payMethods.parentElement;
    let activeMethod = "UPI";
    payMethods.addEventListener("click", function (e) {
      const btn = e.target.closest(".pay-method");
      if (!btn) return;
      activeMethod = btn.getAttribute("data-method");
      payMethods.querySelectorAll(".pay-method").forEach(function (b) {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      payMethodsRoot.querySelectorAll(".pay-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === activeMethod);
      });
    });

    if (!pending) {
      if (grid) grid.style.display = "none";
      if (empty) empty.hidden = false;
    } else {
      const set = function (id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val || "—";
      };
      set("sumName", pending.student && pending.student.fullName);
      set("sumClass", pending.student && pending.student.classApplying);
      set(
        "sumParent",
        (pending.father && pending.father.name) ||
          (pending.declaration && pending.declaration.name) ||
          (pending.mother && pending.mother.name)
      );
      set(
        "sumPhone",
        (pending.father && pending.father.mobile) ||
          (pending.mother && pending.mother.mobile) ||
          (pending.student && pending.student.mobile)
      );
      set("sumId", pending.id);

      // Card number formatting
      const cardNum = document.getElementById("card_number");
      if (cardNum) {
        cardNum.addEventListener("input", function () {
          const digits = cardNum.value.replace(/\D/g, "").slice(0, 16);
          cardNum.value = digits.replace(/(.{4})/g, "$1 ").trim();
        });
      }
      const cardExp = document.getElementById("card_exp");
      if (cardExp) {
        cardExp.addEventListener("input", function () {
          let v = cardExp.value.replace(/\D/g, "").slice(0, 4);
          if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
          cardExp.value = v;
        });
      }

      function validateMethod() {
        if (activeMethod === "UPI") {
          const v = (document.getElementById("upi_id").value || "").trim();
          if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(v)) {
            alert("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
            return false;
          }
        } else if (activeMethod === "Card") {
          const num = (document.getElementById("card_number").value || "").replace(/\s+/g, "");
          const name = (document.getElementById("card_name").value || "").trim();
          const exp = (document.getElementById("card_exp").value || "").trim();
          const cvv = (document.getElementById("card_cvv").value || "").trim();
          if (name.length < 2) { alert("Please enter the cardholder name."); return false; }
          if (!/^\d{15,16}$/.test(num)) { alert("Card number must be 15 or 16 digits."); return false; }
          if (!/^\d{2}\/\d{2}$/.test(exp)) { alert("Expiry must be in MM/YY format."); return false; }
          if (!/^\d{3,4}$/.test(cvv)) { alert("CVV must be 3 or 4 digits."); return false; }
        } else if (activeMethod === "Net Banking") {
          if (!document.getElementById("bank_select").value) {
            alert("Please select your bank."); return false;
          }
        } else if (activeMethod === "Wallet") {
          if (!document.getElementById("wallet_select").value) {
            alert("Please select a wallet."); return false;
          }
          if (!/^\d{10}$/.test(document.getElementById("wallet_mobile").value || "")) {
            alert("Enter a valid 10-digit mobile number."); return false;
          }
        }
        return true;
      }

      // Pay now
      const payNow = document.getElementById("payNowBtn");
      const processing = document.getElementById("payProcessing");
      const success = document.getElementById("paySuccess");

      payNow.addEventListener("click", function () {
        if (!validateMethod()) return;
        processing.hidden = false;

        setTimeout(function () {
          const ref = "TXN-ADM-" + Date.now().toString().slice(-10) + Math.floor(Math.random() * 90 + 10);
          const paidAt = new Date().toISOString();
          const feeAmount = Number((pending.payment && pending.payment.amount) || ADMISSION_FEE);

          pending.payment.status = "Paid";
          pending.payment.method = activeMethod;
          pending.payment.reference = ref;
          pending.payment.paidAt = paidAt;
          pending.payment.amount = feeAmount;

          const payRecord = {
            id: "PAY-ADM-" + Date.now(),
            amount: feeAmount,
            currency: "INR",
            method: activeMethod,
            reference: ref,
            paidAt: paidAt,
            applicationId: pending.id,
            purpose: "Admission Application Fee",
            payerName: (pending.student && pending.student.fullName) || "",
            payerEmail: (pending.father && pending.father.email) || (pending.mother && pending.mother.email) || "",
            payerMobile: (pending.father && pending.father.mobile) || (pending.student && pending.student.mobile) || "",
          };

          const payList = loadAdmissionPayments();
          payList.unshift(payRecord);
          saveAdmissionPayments(payList);

          syncAdmissionPaymentToServer(payRecord);
          syncAdmissionApplicationToServer(pending);

          var forLocal = Object.assign({}, pending, {
            documents: admissionDocsForLocalStorage(pending.documents),
          });
          const list = loadAll();
          list.unshift(forLocal);
          saveAll(list);
          sessionStorage.removeItem("cms_pending_submission");

          processing.hidden = true;
          document.getElementById("recRef").textContent = ref;
          document.getElementById("recMethod").textContent = activeMethod;
          document.getElementById("recAppId").textContent = pending.id;
          var recAmt = document.getElementById("recAmountPaid");
          if (recAmt) recAmt.textContent = fmtINR(feeAmount);
          document.getElementById("recTime").textContent = fmtDate(paidAt);
          try {
            sessionStorage.setItem(
              "cms_admission_last_fee_txn",
              JSON.stringify({
                reference: ref,
                applicationId: pending.id,
                method: activeMethod,
                paidAt: paidAt,
                amount: feeAmount,
                studentName: (pending.student && pending.student.fullName) || "",
                classApplying: (pending.student && pending.student.classApplying) || "",
                parentName:
                  (pending.father && pending.father.name) ||
                  (pending.declaration && pending.declaration.name) ||
                  "",
                parentMobile:
                  (pending.father && pending.father.mobile) ||
                  (pending.student && pending.student.mobile) ||
                  "",
                parentEmail: (pending.father && pending.father.email) || (pending.mother && pending.mother.email) || "",
              })
            );
          } catch (storeErr) {}
          success.hidden = false;
        }, 1600);
      });

      // Handle return from SIB Gateway
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      if (status === 'success') {
          if (success) success.hidden = false;
          // In a real integration, you would fetch the final transaction details from the backend here
      } else if (status === 'failed') {
          alert("Payment was unsuccessful. Please try again or contact support.");
      }

    }
  }

  function dismissCareersBlockingOverlays() {
    ["careersPayProcessing", "careersSuccess", "careersPaySuccess"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = true;
    });
  }

  function enableCareersFormFields() {
    var form = document.getElementById("careersForm");
    if (!form) return;
    form.querySelectorAll("input, select, textarea, button").forEach(function (el) {
      el.disabled = false;
      el.removeAttribute("readonly");
      el.removeAttribute("aria-disabled");
    });
  }

  const CAREERS_PAYMENTS_STORE = "cms_careers_payments_v1";
  const CAREERS_FEE_ACK_KEY = "cms_careers_fee_ack_v1";
  const CAREERS_FEE_TXN_KEY = "cms_careers_last_fee_txn";

  function loadCareersPaymentsShared() {
    try {
      return JSON.parse(localStorage.getItem(CAREERS_PAYMENTS_STORE)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveCareersPaymentsShared(list) {
    try {
      localStorage.setItem(CAREERS_PAYMENTS_STORE, JSON.stringify(list));
    } catch (e2) {}
  }

  function getActiveCareersPaymentMeta() {
    try {
      var raw = sessionStorage.getItem(CAREERS_FEE_TXN_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function isPaymentAvailableLocal(paymentId) {
    if (!paymentId) return false;
    var pay = loadCareersPaymentsShared().find(function (x) {
      return x.id === paymentId;
    });
    if (!pay) return true;
    return pay.usageStatus !== "used";
  }

  function markPaymentUsedLocal(paymentId, applicationId, channel) {
    if (!paymentId) return;
    var list = loadCareersPaymentsShared();
    var idx = list.findIndex(function (x) {
      return x.id === paymentId;
    });
    if (idx < 0) return;
    list[idx].usageStatus = "used";
    list[idx].usedForApplicationId = applicationId;
    list[idx].usedAt = new Date().toISOString();
    list[idx].applicationChannel = channel || "online";
    saveCareersPaymentsShared(list);
  }

  function clearCareersFeeSession() {
    try {
      sessionStorage.removeItem(CAREERS_FEE_ACK_KEY);
      sessionStorage.removeItem(CAREERS_FEE_TXN_KEY);
    } catch (e) {}
    var paySec = document.getElementById("careersPaySection");
    var paidWs = document.getElementById("careersPaidWorkspace");
    if (paySec) paySec.hidden = false;
    if (paidWs) paidWs.hidden = true;
  }

  function buildFeePaymentFromMeta(meta) {
    if (!meta) return null;
    var ap = meta.applicant || {};
    return {
      paymentRecordId: meta.paymentRecordId || "",
      transactionReference: meta.reference || "",
      paymentMethod: meta.method || "",
      amount: meta.amount != null ? meta.amount : 100,
      currency: meta.currency || "INR",
      paidAt: meta.paidAt || "",
      payerName: ap.name || "",
      payerEmail: ap.email || "",
      payerPhone: ap.phone || "",
      linkSource: "session",
    };
  }

  function cmsEnsureCareersFeeForUse(channel, applicationId, applicationPayload) {
    return new Promise(function (resolve, reject) {
      var meta = getActiveCareersPaymentMeta();
      if (!meta || !meta.paymentRecordId) {
        reject(
          new Error("Please pay the ₹100 application fee before submitting or downloading the form.")
        );
        return;
      }
      var payId = meta.paymentRecordId;
      if (!isPaymentAvailableLocal(payId)) {
        clearCareersFeeSession();
        reject(
          new Error(
            "This ₹100 payment was already used for one application. Please pay again for a new application (online or offline)."
          )
        );
        return;
      }
      var appId =
        applicationId || "CMS-C-OFF-" + Date.now().toString(36).toUpperCase();
      fetch("/api/careers/payments/" + encodeURIComponent(payId) + "/consume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          applicationChannel: channel || "offline",
          application: applicationPayload || null,
        }),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, status: res.status, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            throw new Error(
              (result.body && result.body.message) ||
                "This payment cannot be used. Please pay ₹100 again."
            );
          }
          markPaymentUsedLocal(payId, appId, channel || "offline");
          clearCareersFeeSession();
          resolve({
            applicationId: appId,
            paymentRecordId: payId,
            feePayment: buildFeePaymentFromMeta(meta),
          });
        })
        .catch(function (err) {
          reject(err);
        });
    });
  }

  if (typeof window !== "undefined") {
    window.cmsDismissCareersOverlays = dismissCareersBlockingOverlays;
    window.cmsEnableCareersFormFields = enableCareersFormFields;
    window.cmsEnsureCareersFeeForUse = cmsEnsureCareersFeeForUse;
    window.cmsClearCareersFeeSession = clearCareersFeeSession;
    window.cmsGetActiveCareersPaymentMeta = getActiveCareersPaymentMeta;
  }

  /* ============================================================
     CAREERS APPLICATION FEE PAYMENT PAGE (careers-payment.html)
     ============================================================ */
  const careersPayMethods = document.getElementById("careersPayMethods");
  if (careersPayMethods) {
    const CAREERS_PAYMENTS_KEY = "cms_careers_payments_v1";
    const CAREERS_FEE_ACK = "cms_careers_fee_ack_v1";
    const cfg = Object.assign(
      { razorpayKeyId: "", careersOrderUrl: "", careersPaymentLink: "" },
      typeof window !== "undefined" && window.CMS_PAYMENT_CONFIG ? window.CMS_PAYMENT_CONFIG : {}
    );

    function loadCareersPayments() {
      try {
        return JSON.parse(localStorage.getItem(CAREERS_PAYMENTS_KEY)) || [];
      } catch (e) {
        return [];
      }
    }
    function saveCareersPayments(list) {
      try {
        localStorage.setItem(CAREERS_PAYMENTS_KEY, JSON.stringify(list));
      } catch (e) {}
    }

    function careersPayFmtDate(iso) {
      if (!iso) return "—";
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function validateCareersApplicant() {
      var name = (document.getElementById("careers_pay_name").value || "").trim();
      var email = (document.getElementById("careers_pay_email").value || "").trim();
      var phone = (document.getElementById("careers_pay_phone").value || "").trim();
      if (name.length < 2) {
        alert("Please enter your full name.");
        document.getElementById("careers_pay_name").focus();
        return null;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        document.getElementById("careers_pay_email").focus();
        return null;
      }
      if (!/^\d{10}$/.test(phone)) {
        alert("Please enter a valid 10-digit mobile number.");
        document.getElementById("careers_pay_phone").focus();
        return null;
      }
      return { name: name, email: email, phone: phone };
    }

    var activeCareersMethod = "UPI";
    var careersPayRoot =
      careersPayMethods.closest(".pay-card--methods") ||
      careersPayMethods.closest(".pay-card") ||
      careersPayMethods.parentElement;
    careersPayMethods.addEventListener("click", function (e) {
      var btn = e.target.closest(".pay-method");
      if (!btn) return;
      activeCareersMethod = btn.getAttribute("data-method");
      careersPayMethods.querySelectorAll(".pay-method").forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      careersPayRoot.querySelectorAll(".pay-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === activeCareersMethod);
      });
    });

    var cCardNum = document.getElementById("careers_card_number");
    if (cCardNum) {
      cCardNum.addEventListener("input", function () {
        var digits = cCardNum.value.replace(/\D/g, "").slice(0, 16);
        cCardNum.value = digits.replace(/(.{4})/g, "$1 ").trim();
      });
    }
    var cCardExp = document.getElementById("careers_card_exp");
    if (cCardExp) {
      cCardExp.addEventListener("input", function () {
        var v = cCardExp.value.replace(/\D/g, "").slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
        cCardExp.value = v;
      });
    }

    function validateCareersPayMethod() {
      if (activeCareersMethod === "UPI") {
        var v = (document.getElementById("careers_upi_id").value || "").trim();
        if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(v)) {
          alert("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
          return false;
        }
      } else if (activeCareersMethod === "Card") {
        var num = (document.getElementById("careers_card_number").value || "").replace(/\s+/g, "");
        var name = (document.getElementById("careers_card_name").value || "").trim();
        var exp = (document.getElementById("careers_card_exp").value || "").trim();
        var cvv = (document.getElementById("careers_card_cvv").value || "").trim();
        if (name.length < 2) {
          alert("Please enter the cardholder name.");
          return false;
        }
        if (!/^\d{15,16}$/.test(num)) {
          alert("Card number must be 15 or 16 digits.");
          return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(exp)) {
          alert("Expiry must be in MM/YY format.");
          return false;
        }
        if (!/^\d{3,4}$/.test(cvv)) {
          alert("CVV must be 3 or 4 digits.");
          return false;
        }
      } else if (activeCareersMethod === "Net Banking") {
        if (!document.getElementById("careers_bank_select").value) {
          alert("Please select your bank.");
          return false;
        }
      } else if (activeCareersMethod === "Wallet") {
        if (!document.getElementById("careers_wallet_select").value) {
          alert("Please select a wallet.");
          return false;
        }
        if (!/^\d{10}$/.test(document.getElementById("careers_wallet_mobile").value || "")) {
          alert("Enter a valid 10-digit mobile number.");
          return false;
        }
      }
      return true;
    }

    var careersProcessing = document.getElementById("careersPayProcessing");
    var careersSuccess = document.getElementById("careersPaySuccess");
    var careersPayBtn = document.getElementById("careersPayNowBtn");
    var gatewayNote = document.getElementById("careersGatewayNote");

    if (cfg.careersPaymentLink && String(cfg.careersPaymentLink).indexOf("http") === 0) {
      if (gatewayNote) {
        gatewayNote.hidden = false;
        gatewayNote.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px;margin-right:4px"><path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" stroke="currentColor" stroke-width="1.6"/></svg>' +
          "Your school has enabled a hosted payment link. The Pay button will open Razorpay (or your provider) in this tab.";
      }
    }

    function prefillCareersFormFromApplicant(applicant) {
      if (!applicant) return;
      var n = document.getElementById("c_name");
      var e = document.getElementById("c_email");
      var m = document.getElementById("c_mobile");
      if (n && applicant.name) n.value = applicant.name;
      if (e && applicant.email) e.value = applicant.email;
      if (m && applicant.phone) m.value = applicant.phone;
    }

    function populateCareersReceipt(txn) {
      if (!txn) return;
      var recRef = document.getElementById("careersRecRef");
      var recMethod = document.getElementById("careersRecMethod");
      var recTime = document.getElementById("careersRecTime");
      var recName = document.getElementById("careersRecName");
      var recEmail = document.getElementById("careersRecEmail");
      var recPhone = document.getElementById("careersRecPhone");
      if (recRef) recRef.textContent = txn.reference || txn.paymentRecordId || "—";
      if (recMethod) recMethod.textContent = txn.method || "—";
      if (recTime) recTime.textContent = careersPayFmtDate(txn.paidAt);
      if (txn.applicant) {
        if (recName) recName.textContent = txn.applicant.name || "—";
        if (recEmail) recEmail.textContent = txn.applicant.email || "—";
        if (recPhone) recPhone.textContent = txn.applicant.phone || "—";
      }
      if (global.CmsCareersReceipt && typeof global.CmsCareersReceipt.updatePanelEmblem === "function") {
        global.CmsCareersReceipt.updatePanelEmblem();
      }
    }

    function revealCareersPaidWorkspace(applicant, txn) {
      var paySec = document.getElementById("careersPaySection");
      var paidWs = document.getElementById("careersPaidWorkspace");
      dismissCareersBlockingOverlays();
      if (paySec) paySec.hidden = true;
      if (paidWs) paidWs.hidden = false;
      populateCareersReceipt(txn);
      prefillCareersFormFromApplicant(applicant || (txn && txn.applicant));
      enableCareersFormFields();
      if (paidWs) {
        window.requestAnimationFrame(function () {
          paidWs.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    function initCareersPortalOnLoad() {
      if (!document.getElementById("careersPaidWorkspace")) return;
      var ack = false;
      try {
        ack = sessionStorage.getItem(CAREERS_FEE_ACK) === "1";
      } catch (e) {}
      var txn = getActiveCareersPaymentMeta();
      if (ack && txn && txn.paymentRecordId && !isPaymentAvailableLocal(txn.paymentRecordId)) {
        clearCareersFeeSession();
        return;
      }
      if (!ack) {
        var paySec = document.getElementById("careersPaySection");
        var paidWs = document.getElementById("careersPaidWorkspace");
        if (paySec) paySec.hidden = false;
        if (paidWs) paidWs.hidden = true;
        return;
      }
      revealCareersPaidWorkspace(txn && txn.applicant, txn);
    }

    function finishCareersPayment(activeMethod, reference, applicant) {
      var paidAt = new Date().toISOString();
      var record = {
        id: "CMS-CPAY-" + Date.now().toString(36).toUpperCase(),
        purpose: "Careers application fee",
        amount: 100,
        currency: "INR",
        method: activeMethod,
        reference: reference,
        paidAt: paidAt,
        applicant: applicant,
        usageStatus: "available",
      };
      var list = loadCareersPayments();
      list.unshift(record);
      saveCareersPayments(list);
      fetch("/api/careers/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(function () {});
      try {
        sessionStorage.setItem(CAREERS_FEE_ACK, "1");
      } catch (e) {}
      var txnMeta = {
        paymentRecordId: record.id,
        reference: reference,
        method: activeMethod,
        paidAt: paidAt,
        amount: record.amount,
        currency: record.currency || "INR",
        applicant: applicant,
      };
      try {
        sessionStorage.setItem("cms_careers_last_fee_txn", JSON.stringify(txnMeta));
      } catch (e2) {}

      if (careersProcessing) careersProcessing.hidden = true;
      if (document.getElementById("careersPaidWorkspace")) {
        revealCareersPaidWorkspace(applicant, txnMeta);
        return;
      }
      var recRef = document.getElementById("careersRecRef");
      var recMethod = document.getElementById("careersRecMethod");
      var recTime = document.getElementById("careersRecTime");
      if (recRef) recRef.textContent = reference;
      if (recMethod) recMethod.textContent = activeMethod;
      if (recTime) recTime.textContent = careersPayFmtDate(paidAt);
      if (careersSuccess) careersSuccess.hidden = false;
    }

    function loadRazorpayScript() {
      return new Promise(function (resolve, reject) {
        if (window.Razorpay) {
          resolve();
          return;
        }
        var s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.async = true;
        s.onload = function () {
          resolve();
        };
        s.onerror = function () {
          reject(new Error("Razorpay script failed to load"));
        };
        document.head.appendChild(s);
      });
    }

    function runSimulatedCareersPayment(applicant) {
      if (careersProcessing) careersProcessing.hidden = false;
      window.setTimeout(function () {
        var ref = "TXN-C-" + Date.now().toString().slice(-10) + Math.floor(Math.random() * 90 + 10);
        finishCareersPayment(activeCareersMethod, ref, applicant);
      }, 1400);
    }

    if (careersPayBtn) {
      careersPayBtn.addEventListener("click", function () {
        var applicant = validateCareersApplicant();
        if (!applicant) return;

        if (cfg.careersPaymentLink && String(cfg.careersPaymentLink).indexOf("http") === 0) {
          try {
            sessionStorage.setItem(
              "cms_careers_pay_pending",
              JSON.stringify({ applicant: applicant, at: new Date().toISOString() })
            );
          } catch (e) {}
          window.location.href = cfg.careersPaymentLink;
          return;
        }

        if (!validateCareersPayMethod()) return;

        // Call our Node.js backend to initiate SIB payment
        if (careersProcessing) careersProcessing.hidden = false;
        fetch('/api/payment/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 100, // Careers fee
                purpose: 'Careers Application Fee',
                customerName: applicant.name,
                customerEmail: applicant.email,
                customerPhone: applicant.phone
            })
        })
        .then(r => r.json())
        .then(res => {
            if (res.success && res.gatewayUrl) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = res.gatewayUrl;
                Object.keys(res.payload).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = res.payload[key];
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
            } else {
                throw new Error(res.message || 'Payment initiation failed');
            }
        })
        .catch(function () {
            if (!validateCareersPayMethod()) {
              if (careersProcessing) careersProcessing.hidden = true;
              return;
            }
            runSimulatedCareersPayment(applicant);
        });
      });
    }

    /* careersPrintReceipt wired in careers-receipt.js */

    initCareersPortalOnLoad();
  }

  /* ============================================================
     DONATION PAGE
     ============================================================ */
  const donationForm = document.getElementById("donationForm");
  if (donationForm) {
    const DONATIONS_KEY = "cms_donations_v1";
    const amountsWrap = document.getElementById("donateAmounts");
    const customInput = document.getElementById("customAmount");
    const sumAmount = document.getElementById("sumAmount");
    const sumTotal = document.getElementById("sumTotal");
    const btnText = document.getElementById("donateBtnText");
    const amountErr = document.getElementById("amountError");
    let amount = 2500;

    function loadDonations() {
      try { return JSON.parse(localStorage.getItem(DONATIONS_KEY)) || []; }
      catch (e) { return []; }
    }
    function saveDonations(list) {
      try { localStorage.setItem(DONATIONS_KEY, JSON.stringify(list)); } catch (e) {}
    }

    function fmt(n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); }
    function updateAmountUI() {
      sumAmount.textContent = fmt(amount);
      sumTotal.textContent = fmt(amount);
      btnText.textContent = "DONATE " + fmt(amount) + " NOW";
    }
    updateAmountUI();

    amountsWrap.addEventListener("click", function (e) {
      const btn = e.target.closest(".donate-amount");
      if (!btn) return;
      amount = Number(btn.getAttribute("data-amount")) || 0;
      amountsWrap.querySelectorAll(".donate-amount").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      customInput.value = "";
      amountErr.hidden = true;
      updateAmountUI();
    });

    customInput.addEventListener("input", function () {
      const v = parseInt(customInput.value, 10);
      if (!isNaN(v) && v > 0) {
        amount = v;
        amountsWrap.querySelectorAll(".donate-amount").forEach(function (b) { b.classList.remove("is-active"); });
        amountErr.hidden = true;
        updateAmountUI();
      }
    });

    // Auto-uppercase PAN
    const panEl = document.getElementById("donor_pan");
    if (panEl) {
      panEl.addEventListener("input", function () {
        panEl.value = panEl.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      });
    }

    /* Payment method tabs */
    const donateMethods = document.getElementById("donatePayMethods");
    let activeDonateMethod = "UPI";
    donateMethods.addEventListener("click", function (e) {
      const btn = e.target.closest(".pay-method");
      if (!btn) return;
      activeDonateMethod = btn.getAttribute("data-method");
      donateMethods.querySelectorAll(".pay-method").forEach(function (b) {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", String(on));
      });
      donationForm.querySelectorAll(".pay-panel").forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === activeDonateMethod);
      });
    });

    /* Card formatting */
    const dnCardNum = document.getElementById("don_card_number");
    if (dnCardNum) {
      dnCardNum.addEventListener("input", function () {
        const digits = dnCardNum.value.replace(/\D/g, "").slice(0, 16);
        dnCardNum.value = digits.replace(/(.{4})/g, "$1 ").trim();
      });
    }
    const dnCardExp = document.getElementById("don_card_exp");
    if (dnCardExp) {
      dnCardExp.addEventListener("input", function () {
        let v = dnCardExp.value.replace(/\D/g, "").slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
        dnCardExp.value = v;
      });
    }

    /* Amount → words (Indian numbering, integer rupees) */
    function numberToWordsIN(n) {
      n = Math.floor(Number(n) || 0);
      if (n === 0) return "Zero Rupees Only";
      const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      function twoDigits(x) {
        if (x < 20) return ones[x];
        const t = Math.floor(x / 10), o = x % 10;
        return tens[t] + (o ? " " + ones[o] : "");
      }
      function threeDigits(x) {
        const h = Math.floor(x / 100), r = x % 100;
        let s = "";
        if (h) s += ones[h] + " Hundred";
        if (r) s += (h ? " " : "") + twoDigits(r);
        return s;
      }
      let result = "";
      const crore = Math.floor(n / 10000000); n %= 10000000;
      const lakh = Math.floor(n / 100000); n %= 100000;
      const thousand = Math.floor(n / 1000); n %= 1000;
      const rest = n;
      if (crore) result += twoDigits(crore) + " Crore ";
      if (lakh) result += twoDigits(lakh) + " Lakh ";
      if (thousand) result += twoDigits(thousand) + " Thousand ";
      if (rest) result += threeDigits(rest);
      return result.trim() + " Rupees Only";
    }

    /* Validation */
    function validateDonation() {
      // Amount
      if (!amount || amount < 50) {
        amountErr.hidden = false;
        amountsWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      // Required donor fields
      const name = (document.getElementById("donor_name").value || "").trim();
      const mobile = (document.getElementById("donor_mobile").value || "").trim();
      const email = (document.getElementById("donor_email").value || "").trim();
      if (name.length < 2) { alert("Please enter your full name."); document.getElementById("donor_name").focus(); return false; }
      if (!/^\d{10}$/.test(mobile)) { alert("Please enter a valid 10-digit mobile number."); document.getElementById("donor_mobile").focus(); return false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert("Please enter a valid email address."); document.getElementById("donor_email").focus(); return false; }
      // Optional PAN format if provided
      const pan = (document.getElementById("donor_pan").value || "").trim();
      if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
        alert("PAN looks invalid. Format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F).");
        document.getElementById("donor_pan").focus(); return false;
      }
      // Payment method specifics
      if (activeDonateMethod === "UPI") {
        const v = (document.getElementById("don_upi_id").value || "").trim();
        if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(v)) {
          alert("Please enter a valid UPI ID (e.g. name@okhdfcbank)."); return false;
        }
      } else if (activeDonateMethod === "Card") {
        const num = (document.getElementById("don_card_number").value || "").replace(/\s+/g, "");
        const cardName = (document.getElementById("don_card_name").value || "").trim();
        const exp = (document.getElementById("don_card_exp").value || "").trim();
        const cvv = (document.getElementById("don_card_cvv").value || "").trim();
        if (cardName.length < 2) { alert("Please enter the cardholder name."); return false; }
        if (!/^\d{15,16}$/.test(num)) { alert("Card number must be 15 or 16 digits."); return false; }
        if (!/^\d{2}\/\d{2}$/.test(exp)) { alert("Expiry must be in MM/YY format."); return false; }
        if (!/^\d{3,4}$/.test(cvv)) { alert("CVV must be 3 or 4 digits."); return false; }
      } else if (activeDonateMethod === "Net Banking") {
        if (!document.getElementById("don_bank_select").value) { alert("Please select your bank."); return false; }
      } else if (activeDonateMethod === "Wallet") {
        if (!document.getElementById("don_wallet_select").value) { alert("Please select a wallet."); return false; }
        if (!/^\d{10}$/.test(document.getElementById("don_wallet_mobile").value || "")) {
          alert("Enter a valid 10-digit mobile number."); return false;
        }
      }
      return true;
    }

    /* Submit */
    const processing = document.getElementById("donateProcessing");
    const receiptOverlay = document.getElementById("donateReceipt");

    function donateFmtDate(iso) {
      try {
        return new Date(iso).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
      } catch (e) {
        return iso || "—";
      }
    }

    function buildDonationRecord(txnRef) {
      const paidAt = new Date();
      const pan = (document.getElementById("donor_pan").value || "").trim();
      return {
        id: "CMS-DON-" + paidAt.getFullYear() + "-" + String(Date.now()).slice(-8),
        amount: amount,
        purpose: document.getElementById("donor_purpose").value,
        message: (document.getElementById("donor_message").value || "").trim(),
        anonymous: !!document.getElementById("donor_anonymous").checked,
        donor: {
          name: document.getElementById("donor_name").value.trim(),
          mobile: document.getElementById("donor_mobile").value.trim(),
          email: document.getElementById("donor_email").value.trim(),
          pan: pan,
        },
        payment: {
          method: activeDonateMethod,
          reference: txnRef,
        },
        createdAt: paidAt.toISOString(),
      };
    }

    function showDonationReceipt(record) {
      const recPanRow = document.getElementById("recPanRow");
      document.getElementById("recNo").textContent = record.id;
      document.getElementById("recAmount").textContent = fmt(record.amount);
      document.getElementById("recAmountWords").textContent = numberToWordsIN(record.amount);
      document.getElementById("recDonor").textContent = record.anonymous ? "Anonymous" : record.donor.name;
      document.getElementById("recMobile").textContent = record.donor.mobile;
      document.getElementById("recEmail").textContent = record.donor.email;
      if (record.donor.pan) {
        if (recPanRow) recPanRow.hidden = false;
        document.getElementById("recPan").textContent = record.donor.pan;
      } else if (recPanRow) {
        recPanRow.hidden = true;
      }
      document.getElementById("recPurpose").textContent = record.purpose || "—";
      document.getElementById("recTxn").textContent = record.payment.reference;
      document.getElementById("recPayMethod").textContent = record.payment.method;
      document.getElementById("recPayTime").textContent = donateFmtDate(record.createdAt);
    }

    function finishDonation(record) {
      const list = loadDonations();
      list.unshift(record);
      saveDonations(list);
      processing.hidden = true;
      showDonationReceipt(record);
      receiptOverlay.hidden = false;
    }

    function runSimulatedDonation(txnSeed) {
      const ref = txnSeed || "TXN-D-" + Date.now().toString().slice(-10) + Math.floor(Math.random() * 90 + 10);
      window.setTimeout(function () {
        finishDonation(buildDonationRecord(ref));
      }, 1400);
    }

    function redirectToSibGateway(res) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.gatewayUrl;
      Object.keys(res.payload).forEach(function (key) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = res.payload[key];
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    }

    donationForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateDonation()) return;
      processing.hidden = false;

      fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          purpose: document.getElementById("donor_purpose").value,
          customerName: document.getElementById("donor_name").value.trim(),
          customerEmail: document.getElementById("donor_email").value.trim(),
          customerPhone: document.getElementById("donor_mobile").value.trim(),
        }),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("Payment service unavailable");
          return r.json();
        })
        .then(function (res) {
          if (!res || !res.success) {
            throw new Error((res && res.message) || "Payment failed");
          }
          if (res.demoMode) {
            runSimulatedDonation(res.transactionId ? String(res.transactionId) : null);
            return;
          }
          if (res.gatewayUrl && res.payload) {
            redirectToSibGateway(res);
            return;
          }
          throw new Error(res.message || "Payment failed");
        })
        .catch(function () {
          runSimulatedDonation();
        });
    });

    document.getElementById("printReceiptBtn").addEventListener("click", function () { window.print(); });
    document.getElementById("closeReceipt").addEventListener("click", function () {
      receiptOverlay.hidden = true;
      donationForm.reset();
      amount = 2500;
      amountsWrap.querySelectorAll(".donate-amount").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-amount") === "2500");
      });
      updateAmountUI();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ============================================================
     CAREERS / JOIN OUR MISSION PAGE
     ============================================================ */
  const careersForm = document.getElementById("careersForm");
  if (careersForm) {
    const CAREERS_FEE_ACK = "cms_careers_fee_ack_v1";
    const careersFeeModal = document.getElementById("careersFeeModal");
    const careersFeeBar = document.getElementById("careersFeeBar");
    const careersApplyMain = document.getElementById("applyForm");
    const careersApplyPanel = document.getElementById("careersApplyPanel");

    function careersFeeAcked() {
      try {
        return sessionStorage.getItem(CAREERS_FEE_ACK) === "1";
      } catch (e) {
        return false;
      }
    }
    function careersFeeAck() {
      try {
        sessionStorage.setItem(CAREERS_FEE_ACK, "1");
      } catch (e) {}
    }
    function openCareersFeeModal() {
      if (!careersFeeModal) return;
      careersFeeModal.hidden = false;
      if (careersFeeBar) careersFeeBar.hidden = true;
      var payBtn = document.getElementById("careersFeePayOnlineBtn");
      if (payBtn) payBtn.focus();
    }
    function closeCareersFeeModal() {
      if (careersFeeModal) careersFeeModal.hidden = true;
      if (careersFeeBar && !careersFeeAcked()) {
        careersFeeBar.hidden = false;
      }
    }
    function unlockCareersApplication() {
      careersFeeAck();
      try {
        document.documentElement.classList.add("cms-careers-session-paid");
      } catch (e3) {}
      closeCareersFeeModal();
      if (careersFeeBar) careersFeeBar.hidden = true;
      if (careersApplyMain) careersApplyMain.classList.remove("careers-page--apply-locked");
      try {
        if (window.history && window.history.replaceState) {
          var path = window.location.pathname || "";
          var base = path.split("/").pop() || "careers.html";
          if (base === "careers.html") {
            window.history.replaceState(null, "", "careers.html");
          }
        }
      } catch (e2) {}
    }
    function lockCareersApplication() {
      if (careersApplyMain) careersApplyMain.classList.add("careers-page--apply-locked");
    }
    function showCareersApplyPanel() {
      if (!careersApplyPanel) return;
      careersApplyPanel.hidden = false;
      if (careersApplyMain) careersApplyMain.classList.remove("careers-page--form-collapsed");
      try {
        if (window.history && window.history.replaceState) {
          var path = window.location.pathname || "";
          if ((path.split("/").pop() || "") === "careers.html") {
            window.history.replaceState(null, "", "careers.html#applyForm");
          }
        }
      } catch (e5) {}
      careersApplyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      var firstInput = careersApplyPanel.querySelector(
        "input:not([type='hidden']):not([type='checkbox']):not([type='radio']), select, textarea"
      );
      if (firstInput) {
        setTimeout(function () {
          firstInput.focus();
        }, 450);
      }
    }
    function careersShouldOpenFeeOnLoad() {
      try {
        var sp = new URLSearchParams(window.location.search || "");
        if (sp.get("apply") === "1") return true;
      } catch (e) {}
      return (window.location.hash || "") === "#applyForm";
    }

    if (careersFeeModal && careersApplyMain) {
      if (!careersFeeAcked()) {
        lockCareersApplication();
        if (careersShouldOpenFeeOnLoad()) {
          window.requestAnimationFrame(function () {
            openCareersFeeModal();
          });
        }
      } else {
        closeCareersFeeModal();
        if (careersFeeBar) careersFeeBar.hidden = true;
        if (careersApplyMain) {
          careersApplyMain.classList.remove("careers-page--apply-locked");
        }
        try {
          document.documentElement.classList.add("cms-careers-session-paid");
        } catch (e4) {}
      }

      document.querySelectorAll('a[href="#applyForm"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          if (careersFeeAcked()) {
            showCareersApplyPanel();
            return;
          }
          openCareersFeeModal();
        });
      });

      var officeBtn = document.getElementById("careersFeeOfficeBtn");
      if (officeBtn) {
        officeBtn.addEventListener("click", function () {
          unlockCareersApplication();
          if (careersApplyPanel) {
            showCareersApplyPanel();
          } else {
            var formEl = document.getElementById("careersForm");
            if (formEl) {
              formEl.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        });
      }
      var closeFeeBtn = document.getElementById("careersFeeCloseBtn");
      if (closeFeeBtn) {
        closeFeeBtn.addEventListener("click", function () {
          closeCareersFeeModal();
        });
      }
      var barBtn = document.getElementById("careersFeeBarBtn");
      if (barBtn) {
        barBtn.addEventListener("click", function () {
          openCareersFeeModal();
        });
      }

      var careersFeePayMethods = document.getElementById("careersFeePayMethods");
      var careersFeeProcessingEl = document.getElementById("careersFeeProcessing");
      if (careersFeePayMethods) {
        var feeMethodsRoot =
          careersFeePayMethods.closest(".pay-card--methods") ||
          careersFeePayMethods.closest(".pay-card") ||
          careersFeePayMethods.parentElement;
        var activeCareersFeeMethod = "UPI";
        careersFeePayMethods.addEventListener("click", function (e) {
          var mBtn = e.target.closest(".pay-method");
          if (!mBtn) return;
          activeCareersFeeMethod = mBtn.getAttribute("data-method") || "UPI";
          careersFeePayMethods.querySelectorAll(".pay-method").forEach(function (b) {
            var on = b === mBtn;
            b.classList.toggle("is-active", on);
            b.setAttribute("aria-selected", String(on));
          });
          feeMethodsRoot.querySelectorAll(".pay-panel").forEach(function (p) {
            p.classList.toggle("is-active", p.getAttribute("data-panel") === activeCareersFeeMethod);
          });
        });

        var cfCardNum = document.getElementById("careers_fee_card_number");
        if (cfCardNum) {
          cfCardNum.addEventListener("input", function () {
            var digits = cfCardNum.value.replace(/\D/g, "").slice(0, 16);
            cfCardNum.value = digits.replace(/(.{4})/g, "$1 ").trim();
          });
        }
        var cfCardExp = document.getElementById("careers_fee_card_exp");
        if (cfCardExp) {
          cfCardExp.addEventListener("input", function () {
            var v = cfCardExp.value.replace(/\D/g, "").slice(0, 4);
            if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
            cfCardExp.value = v;
          });
        }

        function validateCareersFeeMethod() {
          if (activeCareersFeeMethod === "UPI") {
            var upiV = (document.getElementById("careers_fee_upi_id").value || "").trim();
            if (!/^[\w.\-]{2,}@[A-Za-z]{2,}$/.test(upiV)) {
              alert("Please enter a valid UPI ID (e.g. name@okhdfcbank).");
              return false;
            }
          } else if (activeCareersFeeMethod === "Card") {
            var num = (document.getElementById("careers_fee_card_number").value || "").replace(/\s+/g, "");
            var cname = (document.getElementById("careers_fee_card_name").value || "").trim();
            var exp = (document.getElementById("careers_fee_card_exp").value || "").trim();
            var cvv = (document.getElementById("careers_fee_card_cvv").value || "").trim();
            if (cname.length < 2) {
              alert("Please enter the cardholder name.");
              return false;
            }
            if (!/^\d{15,16}$/.test(num)) {
              alert("Card number must be 15 or 16 digits.");
              return false;
            }
            if (!/^\d{2}\/\d{2}$/.test(exp)) {
              alert("Expiry must be in MM/YY format.");
              return false;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
              alert("CVV must be 3 or 4 digits.");
              return false;
            }
          } else if (activeCareersFeeMethod === "Net Banking") {
            if (!document.getElementById("careers_fee_bank_select").value) {
              alert("Please select your bank.");
              return false;
            }
          } else if (activeCareersFeeMethod === "Wallet") {
            if (!document.getElementById("careers_fee_wallet_select").value) {
              alert("Please select a wallet.");
              return false;
            }
            if (!/^\d{10}$/.test(document.getElementById("careers_fee_wallet_mobile").value || "")) {
              alert("Enter a valid 10-digit mobile number.");
              return false;
            }
          }
          return true;
        }

        var careersFeePayBtn = document.getElementById("careersFeePayOnlineBtn");
        if (careersFeePayBtn) {
          careersFeePayBtn.addEventListener("click", function () {
            if (!validateCareersFeeMethod()) return;
            if (careersFeeProcessingEl) careersFeeProcessingEl.hidden = false;
            window.setTimeout(function () {
              if (careersFeeProcessingEl) careersFeeProcessingEl.hidden = true;
              unlockCareersApplication();
              showCareersApplyPanel();
            }, 1400);
          });
        }
      }

      var prePayModalBtn = document.getElementById("careersPrePayModalBtn");
      if (prePayModalBtn) {
        prePayModalBtn.addEventListener("click", function () {
          openCareersFeeModal();
        });
      }
    } else if (careersApplyMain && careersApplyPanel) {
      document.querySelectorAll('a[href="#applyForm"]').forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          showCareersApplyPanel();
        });
      });
    }

    var careersOpenApplyBtn = document.getElementById("careersOpenApplyBtn");
    if (careersOpenApplyBtn) {
      careersOpenApplyBtn.addEventListener("click", function () {
        if (careersFeeModal && !careersFeeAcked()) {
          openCareersFeeModal();
          return;
        }
        showCareersApplyPanel();
      });
    }
    var careersCloseApplyBtn = document.getElementById("careersCloseApplyBtn");
    if (careersApplyPanel && careersCloseApplyBtn) {
      careersCloseApplyBtn.addEventListener("click", function () {
        careersApplyPanel.hidden = true;
        if (careersApplyMain) careersApplyMain.classList.add("careers-page--form-collapsed");
        try {
          if (window.history && window.history.replaceState) {
            var pathClose = window.location.pathname || "";
            if ((pathClose.split("/").pop() || "") === "careers.html") {
              window.history.replaceState(null, "", "careers.html");
            }
          }
        } catch (e6) {}
        var openingsEl = document.getElementById("openings");
        if (openingsEl) openingsEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (careersApplyPanel) {
      var openHashApply = (window.location.hash || "") === "#applyForm";
      var applyQuery = false;
      try {
        applyQuery = new URLSearchParams(window.location.search || "").get("apply") === "1";
      } catch (e7) {}
      var needFeeFirstLoad = careersFeeModal && !careersFeeAcked();
      if ((openHashApply || applyQuery) && !needFeeFirstLoad) {
        window.requestAnimationFrame(function () {
          showCareersApplyPanel();
        });
      }
    }

    const CAREERS_KEY = "cms_careers_v1";
    const CAREERS_PAYMENTS_KEY = "cms_careers_payments_v1";
    const MAX_RESUME_BYTES = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_EXT = /\.(pdf|doc|docx)$/i;

    const resumeInput = document.getElementById("c_resume");
    const resumeDrop = document.getElementById("resumeDrop");
    const resumeChosen = document.getElementById("resumeChosen");
    const resumeName = document.getElementById("resumeChosenName");
    const resumeSize = document.getElementById("resumeChosenSize");
    const resumeRemove = document.getElementById("resumeRemove");
    const resumeErr = document.getElementById("resumeError");

    let resumeMeta = null; // { name, size, type, dataUrl }
    let resumeReady = false;
    let resumeLoading = false;

    function careersPortalFeeOk() {
      var paidWs = document.getElementById("careersPaidWorkspace");
      if (paidWs) {
        var meta = getActiveCareersPaymentMeta();
        if (!meta || !meta.paymentRecordId) return false;
        if (!isPaymentAvailableLocal(meta.paymentRecordId)) return false;
        try {
          if (sessionStorage.getItem(CAREERS_FEE_ACK) === "1") return true;
        } catch (e0) {}
        return !paidWs.hidden;
      }
      if (careersFeeModal && !careersFeeAcked()) return false;
      return true;
    }

    function postCareersJson(url, body) {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    function patchCareersApplication(id, patch) {
      return fetch("/api/careers/applications/" + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    }

    function resumeForLocalBackup(app, serverSaved) {
      if (!serverSaved || !app.resume) return app;
      return Object.assign({}, app, {
        resume: {
          name: app.resume.name,
          size: app.resume.size,
          type: app.resume.type,
          storedOnServer: true,
        },
      });
    }

    window.cmsCareersUpload = {
      isReady: function () {
        return resumeReady && !!resumeMeta;
      },
      isLoading: function () {
        return resumeLoading;
      },
    };

    function loadCareers() {
      try { return JSON.parse(localStorage.getItem(CAREERS_KEY)) || []; }
      catch (e) { return []; }
    }
    function loadCareersPaymentsForLink() {
      try {
        return JSON.parse(localStorage.getItem(CAREERS_PAYMENTS_KEY)) || [];
      } catch (e2) {
        return [];
      }
    }
    function normCareersEmail(e) {
      return String(e || "")
        .trim()
        .toLowerCase();
    }
    function normCareersPhone(p) {
      var d = String(p || "").replace(/\D/g, "");
      return d.length >= 10 ? d.slice(-10) : d;
    }
    /** Link one unused ₹100 fee payment to this application (session payment first). */
    function findCareersFeePaymentForSubmit(personal, submittedAt) {
      var email = normCareersEmail(personal.email);
      var phone = normCareersPhone(personal.mobile);
      if (!email || phone.length !== 10) return null;
      var hint = getActiveCareersPaymentMeta();
      if (
        hint &&
        hint.paymentRecordId &&
        isPaymentAvailableLocal(hint.paymentRecordId) &&
        hint.applicant &&
        normCareersEmail(hint.applicant.email) === email &&
        normCareersPhone(hint.applicant.phone) === phone
      ) {
        return buildFeePaymentFromMeta(hint);
      }
      var submittedMs = new Date(submittedAt).getTime();
      var list = loadCareersPaymentsForLink();
      var candidates = list.filter(function (rec) {
        if (rec.usageStatus === "used") return false;
        var ap = rec.applicant || {};
        if (normCareersEmail(ap.email) !== email) return false;
        if (normCareersPhone(ap.phone) !== phone) return false;
        var paidMs = new Date(rec.paidAt || 0).getTime();
        if (isNaN(paidMs)) return false;
        if (paidMs > submittedMs + 180000) return false;
        if (submittedMs - paidMs > 45 * 24 * 3600000) return false;
        return true;
      });
      candidates.sort(function (a, b) {
        return new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime();
      });
      var rec = candidates[0];
      if (!rec) return null;
      var ap2 = rec.applicant || {};
      return {
        paymentRecordId: rec.id || "",
        transactionReference: rec.reference || "",
        paymentMethod: rec.method || "",
        amount: rec.amount != null ? rec.amount : 100,
        currency: rec.currency || "INR",
        paidAt: rec.paidAt || "",
        payerName: ap2.name || "",
        payerEmail: ap2.email || "",
        payerPhone: ap2.phone || "",
        linkSource: "storage",
      };
    }
    function saveCareers(list) {
      try { localStorage.setItem(CAREERS_KEY, JSON.stringify(list)); }
      catch (e) {
        // If storage is full (resume payload too large) save without dataUrl
        try {
          const trimmed = list.map(function (a) {
            if (a.resume && a.resume.dataUrl) {
              return Object.assign({}, a, { resume: Object.assign({}, a.resume, { dataUrl: null, dataUrlOmitted: true }) });
            }
            return a;
          });
          localStorage.setItem(CAREERS_KEY, JSON.stringify(trimmed));
        } catch (e2) {}
      }
    }
    function humanSize(bytes) {
      if (!bytes && bytes !== 0) return "—";
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    function isAllowedResumeFile(file) {
      if (!file) return false;
      var name = String(file.name || "").trim().toLowerCase();
      if (/\.(pdf|doc|docx)$/i.test(name)) return true;
      var t = String(file.type || "").toLowerCase();
      if (t === "application/pdf" || t === "application/x-pdf") return true;
      if (t === "application/msword") return true;
      if (t === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return true;
      if (!t && /\.pdf$/i.test(name)) return true;
      return false;
    }

    function syncFileToInput(file) {
      if (!resumeInput || !file) return;
      try {
        var dt = new DataTransfer();
        dt.items.add(file);
        resumeInput.files = dt.files;
      } catch (e1) {}
    }

    function markResumeUiReady(on) {
      if (resumeDrop) resumeDrop.classList.toggle("is-ready", !!on);
      var box = document.getElementById("resumeUploadBox");
      if (box) box.classList.toggle("is-ready", !!on);
    }

    function handleResumePicked(file) {
      if (!file) return;
      syncFileToInput(file);
      setResume(file);
    }

    function showResumeError(msg) {
      if (!resumeErr) return;
      resumeErr.textContent = msg;
      resumeErr.hidden = false;
    }

    function setResume(file) {
      if (!file) {
        clearResume();
        return Promise.resolve(false);
      }
      if (!isAllowedResumeFile(file)) {
        showResumeError("Only PDF, DOC or DOCX files are accepted.");
        clearResume();
        return Promise.resolve(false);
      }
      if (file.size > MAX_RESUME_BYTES) {
        showResumeError("Resume is too large. Maximum size is 5 MB.");
        clearResume();
        return Promise.resolve(false);
      }
      if (resumeErr) resumeErr.hidden = true;
      resumeLoading = true;
      resumeReady = false;
      if (resumeChosen) resumeChosen.hidden = false;
      if (resumeName) resumeName.textContent = "Uploading " + file.name + "…";
      if (resumeSize) resumeSize.textContent = humanSize(file.size);

      return new Promise(function (resolve) {
        const reader = new FileReader();
        reader.onload = function (ev) {
          resumeMeta = {
            name: file.name,
            size: file.size,
            type: file.type || "",
            dataUrl: String((ev.target && ev.target.result) || ""),
          };
          resumeLoading = false;
          resumeReady = !!resumeMeta.dataUrl;
          if (resumeName) resumeName.textContent = file.name;
          if (resumeSize) resumeSize.textContent = humanSize(file.size);
          markResumeUiReady(resumeReady);
          resolve(resumeReady);
        };
        reader.onerror = function () {
          resumeLoading = false;
          resumeReady = false;
          resumeMeta = null;
          showResumeError("Could not read the file. Please try again.");
          clearResume();
          resolve(false);
        };
        reader.readAsDataURL(file);
      });
    }
    function clearResume() {
      resumeMeta = null;
      resumeReady = false;
      resumeLoading = false;
      if (resumeInput) resumeInput.value = "";
      if (resumeChosen) resumeChosen.hidden = true;
      markResumeUiReady(false);
    }

    if (resumeInput) {
      resumeInput.addEventListener("change", function () {
        handleResumePicked(resumeInput.files && resumeInput.files[0]);
      });
      resumeInput.addEventListener("input", function () {
        handleResumePicked(resumeInput.files && resumeInput.files[0]);
      });
    }
    if (resumeRemove) resumeRemove.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      clearResume();
    });

    // Drag & drop
    if (resumeDrop) ["dragenter", "dragover"].forEach(function (ev) {
      resumeDrop.addEventListener(ev, function (e) {
        e.preventDefault();
        resumeDrop.classList.add("is-dragover");
      });
    });
    if (resumeDrop) ["dragleave", "drop"].forEach(function (ev) {
      resumeDrop.addEventListener(ev, function (e) {
        e.preventDefault();
        resumeDrop.classList.remove("is-dragover");
      });
    });
    if (resumeDrop) resumeDrop.addEventListener("drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      resumeDrop.classList.remove("is-dragover");
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) handleResumePicked(file);
    });

    var resumeUploadBox = document.getElementById("resumeUploadBox");
    if (resumeUploadBox && resumeUploadBox !== resumeDrop) {
      ["dragenter", "dragover"].forEach(function (ev) {
        resumeUploadBox.addEventListener(ev, function (e) {
          e.preventDefault();
          if (resumeDrop) resumeDrop.classList.add("is-dragover");
        });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        resumeUploadBox.addEventListener(ev, function (e) {
          e.preventDefault();
          if (ev === "dragleave" && e.relatedTarget && resumeUploadBox.contains(e.relatedTarget)) return;
          if (resumeDrop) resumeDrop.classList.remove("is-dragover");
        });
      });
      resumeUploadBox.addEventListener("drop", function (e) {
        e.preventDefault();
        if (resumeDrop) resumeDrop.classList.remove("is-dragover");
        var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) handleResumePicked(file);
      });
    }

    function flashInvalid(el) {
      if (!el) return;
      el.classList.add("is-invalid");
      el.focus();
      el.addEventListener("input", function once() {
        el.classList.remove("is-invalid");
        el.removeEventListener("input", once);
      });
    }

    function validateCareers() {
      careersForm.classList.add("was-validated");
      const required = careersForm.querySelectorAll("[required]");
      for (const el of required) {
        if (el.type === "radio") {
          const group = careersForm.querySelectorAll('input[name="' + el.name + '"]');
          const checked = Array.prototype.some.call(group, function (r) { return r.checked; });
          if (!checked) {
            alert("Please select " + el.name.replace("c_", "").replace(/_/g, " ") + ".");
            return false;
          }
          continue;
        }
        if (el.type === "checkbox") {
          if (!el.checked) {
            alert("Please accept the declaration before submitting.");
            el.focus();
            return false;
          }
          continue;
        }
        if (el.type === "file") {
          continue;
        }
        const v = (el.value || "").trim();
        if (!v) {
          alert("Please complete all required fields.");
          flashInvalid(el);
          return false;
        }
      }

      const mobile = document.getElementById("c_mobile").value.trim();
      if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10-digit mobile number.");
        flashInvalid(document.getElementById("c_mobile"));
        return false;
      }
      const email = document.getElementById("c_email").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert("Please enter a valid email address.");
        flashInvalid(document.getElementById("c_email"));
        return false;
      }

      if (resumeLoading) {
        alert("Please wait — your résumé is still uploading.");
        if (resumeDrop) resumeDrop.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (!resumeReady || !resumeMeta) {
        showResumeError("Please upload your resume (PDF/DOC/DOCX, max 5 MB).");
        if (resumeDrop) resumeDrop.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      return true;
    }

    const successOverlay = document.getElementById("careersSuccess");
    const refEl = document.getElementById("careersRef");

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (successOverlay && !successOverlay.hidden) {
        successOverlay.hidden = true;
        dismissCareersBlockingOverlays();
        enableCareersFormFields();
      }
    });

    careersForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!careersPortalFeeOk()) {
        alert("Please complete the ₹100 application fee payment before submitting.");
        var paySec = document.getElementById("careersPaySection");
        if (paySec) paySec.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (careersFeeModal && !careersFeeAcked()) {
        openCareersFeeModal();
        return;
      }
      if (!validateCareers()) return;

      const submitBtn = document.getElementById("careersSubmitBtn");
      if (submitBtn) submitBtn.disabled = true;

      const now = new Date();
      const ref = "CMS-C-" + now.getFullYear()
        + "-" + String(now.getMonth() + 1).padStart(2, "0")
        + "-" + String(now.getTime()).slice(-5);

      const data = new FormData(careersForm);
      const application = {
        id: ref,
        createdAt: now.toISOString(),
        status: "New",
        personal: {
          name: data.get("c_name") || "",
          dob: data.get("c_dob") || "",
          gender: data.get("c_gender") || "",
          mobile: data.get("c_mobile") || "",
          email: data.get("c_email") || "",
          marital: data.get("c_marital") || "",
          father: data.get("c_father") || "",
          nationality: data.get("c_nationality") || "",
          address: data.get("c_address") || "",
          permAddress: data.get("c_perm_address") || "",
        },
        position: {
          role: data.get("c_position") || "",
          subject: data.get("c_subject") || "",
          grade: data.get("c_grade") || "",
          joinDate: data.get("c_join_date") || "",
        },
        education: {
          qualification: data.get("c_qual") || "",
          university: data.get("c_university") || "",
          year: data.get("c_year") || "",
          bed: data.get("c_bed") || "",
        },
        experience: {
          years: data.get("c_exp_years") || "",
          employer: data.get("c_exp_current") || "",
          designation: data.get("c_exp_role") || "",
          expectedSalary: data.get("c_salary") || "",
        },
        skills: data.get("c_skills") || "",
        languages: data.get("c_languages") || "",
        coverLetter: data.get("c_cover") || "",
        references: {
          ref1: {
            name: data.get("c_ref1_name") || "",
            relation: data.get("c_ref1_relation") || "",
            phone: data.get("c_ref1_phone") || "",
          },
          ref2: {
            name: data.get("c_ref2_name") || "",
            relation: data.get("c_ref2_relation") || "",
            phone: data.get("c_ref2_phone") || "",
          },
        },
        resume: resumeMeta,
        applicationChannel: "online",
      };

      application.feePayment = findCareersFeePaymentForSubmit(
        application.personal,
        application.createdAt
      );
      if (!application.feePayment || !application.feePayment.paymentRecordId) {
        alert(
          "A valid, unused ₹100 fee payment is required. Please pay again — one payment allows one application only (online or offline)."
        );
        clearCareersFeeSession();
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      function afterSaveSuccess(serverSaved) {
        const list = loadCareers();
        list.unshift(resumeForLocalBackup(application, serverSaved));
        saveCareers(list);
        if (application.feePayment && application.feePayment.paymentRecordId) {
          markPaymentUsedLocal(
            application.feePayment.paymentRecordId,
            ref,
            "online"
          );
        }
        clearCareersFeeSession();

        if (refEl) refEl.textContent = ref;
        if (successOverlay) successOverlay.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (window.CmsCareersForm && typeof window.CmsCareersForm.downloadFilled === "function") {
          window.CmsCareersForm.downloadFilled({
            applicationRef: ref,
            skipFeeConsume: true,
            name: application.personal.name,
            dob: application.personal.dob,
            gender: application.personal.gender,
            marital: application.personal.marital,
            father: application.personal.father,
            nationality: application.personal.nationality,
            mobile: application.personal.mobile,
            email: application.personal.email,
            address: application.personal.address,
            permAddress: application.personal.permAddress,
            position: application.position.role,
            subject: application.position.subject,
            grade: application.position.grade,
            joinDate: application.position.joinDate,
            qual: application.education.qualification,
            university: application.education.university,
            year: application.education.year,
            bed: application.education.bed,
            expYears: application.experience.years,
            salary: application.experience.expectedSalary,
            expOrg: application.experience.employer,
            expRole: application.experience.designation,
            skills: application.skills,
            languages: application.languages,
            cover: application.coverLetter,
            ref1Name: application.references.ref1.name,
            ref1Rel: application.references.ref1.relation,
            ref1Phone: application.references.ref1.phone,
            ref2Name: application.references.ref2.name,
            ref2Rel: application.references.ref2.relation,
            ref2Phone: application.references.ref2.phone,
          });
        }
      }

      postCareersJson("/api/careers/applications", application)
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, status: res.status, body: body };
          });
        })
        .then(function (result) {
          if (!result.ok) {
            var msg =
              (result.body && result.body.message) ||
              "Could not save your application.";
            if (result.status === 409) {
              clearCareersFeeSession();
              msg +=
                " Please pay ₹100 again for a new application.";
            }
            throw new Error(msg);
          }
          afterSaveSuccess(true);
        })
        .catch(function (err) {
          var msg = err && err.message ? err.message : "";
          if (
            msg &&
            (msg.indexOf("Could not save") >= 0 ||
              msg.indexOf("already used") >= 0 ||
              msg.indexOf("pay ₹100") >= 0 ||
              msg.indexOf("Payment") >= 0 ||
              msg.indexOf("fee payment") >= 0)
          ) {
            alert(msg);
            if (submitBtn) submitBtn.disabled = false;
            return;
          }
          const list = loadCareers();
          list.unshift(application);
          saveCareers(list);
          afterSaveSuccess(false);
          alert(
            "Application saved on this device only. Start the server (node server.js) and use http://localhost:3000 so the admin dashboard receives submissions."
          );
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    var careersDoneBtnEl = document.getElementById("careersDoneBtn");
    if (careersDoneBtnEl) {
      careersDoneBtnEl.addEventListener("click", function () {
        if (successOverlay) successOverlay.hidden = true;
        dismissCareersBlockingOverlays();
        careersForm.reset();
        careersForm.classList.remove("was-validated");
        clearResume();
        enableCareersFormFields();
        clearCareersFeeSession();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ============================================================
     ADMIN LOGIN
     ============================================================ */
  const loginForm = document.getElementById("adminLoginForm");
  if (loginForm) {
    if (sessionStorage.getItem(AUTH_KEY) === "1") {
      window.location.replace("admin-dashboard.html");
    }
    const togglePass = document.getElementById("togglePass");
    const passInput = document.getElementById("admin_pass");
    if (togglePass && passInput) {
      togglePass.addEventListener("click", function () {
        const isPw = passInput.type === "password";
        passInput.type = isPw ? "text" : "password";
        togglePass.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
      });
    }
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const u = (document.getElementById("admin_user").value || "").trim();
      const p = (document.getElementById("admin_pass").value || "").trim();
      const err = document.getElementById("loginError");
      if (u === ADMIN_USER && p === ADMIN_PASS) {
        err.hidden = true;
        sessionStorage.setItem(AUTH_KEY, "1");
        sessionStorage.setItem("cms_admin_user", u);
        window.location.href = "admin-dashboard.html";
      } else {
        err.hidden = false;
      }
    });
  }

  /* ============================================================
     ADMIN DASHBOARD
     ============================================================ */
  const admTableBody = document.getElementById("admTableBody");
  if (admTableBody) {
    if (sessionStorage.getItem(AUTH_KEY) !== "1") {
      window.location.replace("admin-login.html");
      return;
    }

    const adminWho = document.getElementById("adminWho");
    if (adminWho) adminWho.textContent = sessionStorage.getItem("cms_admin_user") || "Administrator";

    const RECYCLE_BIN_KEY = "cms_admin_recycle_v1";
    const RECYCLE_TYPE_LABELS = {
      admission_app: "Admission application",
      admission_payment: "Admission fee payment",
      donation: "Donation",
      career_app: "Career application",
      career_payment: "Careers fee payment",
    };

    function loadRecycleBin() {
      try {
        return JSON.parse(localStorage.getItem(RECYCLE_BIN_KEY)) || [];
      } catch (e) {
        return [];
      }
    }
    function saveRecycleBin(list) {
      try {
        localStorage.setItem(RECYCLE_BIN_KEY, JSON.stringify(list));
      } catch (e) {}
    }
    function updateRecycleBadge() {
      const el = document.getElementById("recycleCount");
      const tab = document.getElementById("recycleTabBtn");
      const n = loadRecycleBin().length;
      if (el) {
        el.textContent = String(n);
        el.hidden = n === 0;
      }
      if (tab) tab.classList.toggle("admin-tab--has-badge", n > 0);
    }
    function adminRecycleSummary(type, record) {
      if (!record) return "—";
      if (type === "admission_app") {
        return ((record.student && record.student.fullName) || record.id || "Application") + " · " + (record.id || "");
      }
      if (type === "admission_payment") {
        return (record.payerName || "Payment") + " · " + (record.reference || record.id || "");
      }
      if (type === "donation") {
        return (record.anonymous ? "Anonymous" : (record.donor && record.donor.name) || "Donor") + " · " + fmtINR(record.amount);
      }
      if (type === "career_app") {
        const per = record.personal || {};
        const pos = record.position || {};
        return (per.name || record.id || "Applicant") + " · " + (pos.role || pos.subject || "");
      }
      if (type === "career_payment") {
        return (record.payerName || (record.applicant && record.applicant.name) || "Payment") + " · " + (record.reference || record.id || "");
      }
      return record.id || "—";
    }
    function adminRecycleAdd(type, record, summary) {
      const bin = loadRecycleBin();
      bin.unshift({
        recycleId: "RCY-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        type: type,
        deletedAt: new Date().toISOString(),
        summary: summary || adminRecycleSummary(type, record),
        record: record,
      });
      saveRecycleBin(bin);
      updateRecycleBadge();
    }
    function adminRecycleMoveMany(type, items) {
      (items || []).forEach(function (item) {
        adminRecycleAdd(type, item);
      });
    }
    function switchToRecycleTab() {
      const btn = document.querySelector('.admin-tab[data-tab="recycle"]');
      if (btn) btn.click();
    }

    document.getElementById("logoutBtn").addEventListener("click", function () {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem("cms_admin_user");
      window.location.href = "admin-login.html";
    });

    const searchEl = document.getElementById("adminSearch");
    const statusEl = document.getElementById("filterStatus");
    const payEl = document.getElementById("filterPayment");
    const classEl = document.getElementById("filterClass");
    const emptyEl = document.getElementById("adminEmpty");

    const statTotal = document.getElementById("statTotal");
    const statPending = document.getElementById("statPending");
    const statApproved = document.getElementById("statApproved");
    const statRevenue = document.getElementById("statRevenue");
    const admPayTableBody = document.getElementById("admPayTableBody");
    const admPayEmpty = document.getElementById("admPayEmpty");
    var admissionServerApps = null;
    var admissionServerPayments = null;

    function fetchAdmissionApplicationsServer() {
      return fetch("/api/admissions/applications")
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then(function (data) {
          const server = Array.isArray(data) ? data : [];
          const local = loadAll();
          const map = {};
          local.forEach(function (s) {
            map[s.id] = s;
          });
          server.forEach(function (s) {
            map[s.id] = s;
          });
          admissionServerApps = Object.values(map).sort(function (a, b) {
            return new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime();
          });
          saveAll(admissionServerApps);
          return admissionServerApps;
        });
    }

    function fetchAdmissionPaymentsServer() {
      return fetch("/api/admissions/payments")
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then(function (data) {
          admissionServerPayments = Array.isArray(data) ? data : [];
          try {
            localStorage.setItem(ADMISSION_PAYMENTS_KEY, JSON.stringify(admissionServerPayments));
          } catch (e) {}
          return admissionServerPayments;
        });
    }

    function loadAdmissionPaymentsAdmin() {
      if (admissionServerPayments) return admissionServerPayments.slice();
      return loadAdmissionPayments();
    }

    function saveAdmissionPaymentsAdmin(list) {
      admissionServerPayments = list.slice();
      saveAdmissionPayments(list);
    }

    function admPayRowHtml(p) {
      return (
        '<tr data-pay-id="' + esc(p.id) + '">' +
        '<td class="cell-id">' + esc(p.id) + '</td>' +
        '<td class="cell-id">' + esc(p.reference || "—") + '</td>' +
        '<td>' + esc(fmtINR(p.amount)) + "</td>" +
        '<td>' + esc(p.method || "—") + "</td>" +
        '<td>' + esc(fmtDate(p.paidAt)) + "</td>" +
        '<td>' + esc(p.payerName || "—") + "</td>" +
        '<td class="cell-id">' + esc(p.applicationId || "—") + "</td>" +
        '<td>' + esc(p.payerMobile || "—") + "</td>" +
        '<td class="cell-actions">' +
        '<button type="button" class="btn-icon" title="View payment" data-adm-pay-action="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
        "</td>" +
        "</tr>"
      );
    }

    function renderAdmissionFees() {
      if (!admPayTableBody) return;
      const all = loadAdmissionPaymentsAdmin().slice().sort(function (a, b) {
        return new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime();
      });
      admPayTableBody.innerHTML = all.map(admPayRowHtml).join("");
      if (admPayEmpty) admPayEmpty.hidden = all.length > 0;
    }

    function refreshAdmissionFromServer(done) {
      Promise.all([
        fetchAdmissionApplicationsServer().catch(function () { return []; }),
        fetchAdmissionPaymentsServer().catch(function () { return []; }),
      ]).then(function () {
        if (done) done();
      });
    }

    function rowHtml(s) {
      const student = s.student || {};
      const father = s.father || {};
      const pay = s.payment || {};
      const payClass = pay.status === "Paid" ? "pill--paid" : pay.status === "Failed" ? "pill--failed" : "pill--pending";
      const statusClass = s.status === "Approved" ? "pill--approved" : s.status === "Rejected" ? "pill--rejected" : "pill--pending";
      return (
        '<tr data-id="' + esc(s.id) + '">' +
        '<td class="cell-id">' + esc(s.id) + '</td>' +
        '<td>' +
          '<div class="cell-student">' + esc(student.fullName || "—") + '</div>' +
          '<div class="cell-sub">DOB ' + esc(student.dob || "—") + '</div>' +
        '</td>' +
        '<td>' + esc(student.classApplying || "—") + '</td>' +
        '<td>' + esc(father.name || (s.declaration && s.declaration.name) || "—") + '</td>' +
        '<td>' +
          '<div>' + esc(father.mobile || student.mobile || "—") + '</div>' +
          '<div class="cell-sub">' + esc(father.email || "") + '</div>' +
        '</td>' +
        '<td>' + esc(fmtDate(s.submittedAt)) + '</td>' +
        '<td>' +
          '<span class="pill ' + payClass + '">' + esc(pay.status || "Pending") + '</span>' +
          '<div class="cell-sub">' + fmtINR(pay.amount) + ' · ' + esc(pay.method || "") + '</div>' +
          (pay.reference ? '<div class="cell-sub" title="Receipt / transaction no.">' + esc(pay.reference) + '</div>' : "") +
        '</td>' +
        '<td><span class="pill ' + statusClass + '">' + esc(s.status || "Pending") + '</span></td>' +
        '<td class="cell-actions">' +
          '<button class="btn-icon" title="View" data-action="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
          '<button class="btn-icon btn-icon--danger" title="Delete" data-action="delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</td>' +
        '</tr>'
      );
    }

    function populateClassFilter(all) {
      const classes = Array.from(new Set(all.map(function (s) { return s.student && s.student.classApplying; }).filter(Boolean))).sort();
      const cur = classEl.value;
      classEl.innerHTML = '<option value="">All Classes</option>' +
        classes.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join("");
      if (classes.indexOf(cur) > -1) classEl.value = cur;
    }

    function applyFilters(all) {
      const q = (searchEl.value || "").trim().toLowerCase();
      const status = statusEl.value;
      const ps = payEl.value;
      const cls = classEl.value;
      return all.filter(function (s) {
        if (status && (s.status || "Pending") !== status) return false;
        if (ps && (s.payment && s.payment.status || "Pending") !== ps) return false;
        if (cls && (s.student && s.student.classApplying) !== cls) return false;
        if (q) {
          const hay = [
            s.id, s.student && s.student.fullName, s.father && s.father.name,
            s.father && s.father.mobile, s.student && s.student.mobile,
            s.father && s.father.email, s.student && s.student.classApplying,
            s.payment && s.payment.reference
          ].join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    function render() {
      const all = loadAll();
      populateClassFilter(all);
      const filtered = applyFilters(all);

      statTotal.textContent = String(all.length);
      statPending.textContent = String(all.filter(function (s) { return (s.status || "Pending") === "Pending"; }).length);
      statApproved.textContent = String(all.filter(function (s) { return s.status === "Approved"; }).length);
      const paidSum = all.reduce(function (acc, s) {
        return acc + (s.payment && s.payment.status === "Paid" ? Number(s.payment.amount || 0) : 0);
      }, 0);
      statRevenue.textContent = fmtINR(paidSum);

      admTableBody.innerHTML = filtered.map(rowHtml).join("");
      emptyEl.hidden = filtered.length > 0;
      renderAdmissionFees();
    }

    [searchEl, statusEl, payEl, classEl].forEach(function (el) {
      el.addEventListener("input", render);
      el.addEventListener("change", render);
    });

    var admPayClearBtn = document.getElementById("admPayClearBtn");
    if (admPayClearBtn) {
      admPayClearBtn.addEventListener("click", function () {
        const all = loadAdmissionPaymentsAdmin();
        if (!all.length) {
          alert("There are no admission fee payments to clear.");
          return;
        }
        if (!confirm("Move ALL " + all.length + " admission fee payment record(s) to the Recycle Bin?")) return;
        adminRecycleMoveMany("admission_payment", all);
        saveAdmissionPaymentsAdmin([]);
        renderAdmissionFees();
        switchToRecycleTab();
      });
    }

    var admPayExportBtn = document.getElementById("admPayExportBtn");
    if (admPayExportBtn) {
      admPayExportBtn.addEventListener("click", function () {
        const all = loadAdmissionPaymentsAdmin();
        if (!all.length) {
          alert("No admission fee payments to export.");
          return;
        }
        const cols = ["Payment ID", "Transaction Ref", "Amount", "Method", "Paid At", "Student", "Application ID", "Mobile", "Email"];
        const rows = all.map(function (p) {
          return [p.id, p.reference, p.amount, p.method, p.paidAt, p.payerName, p.applicationId, p.payerMobile, p.payerEmail];
        });
        const csv = [cols].concat(rows).map(function (row) {
          return row.map(function (v) {
            if (v == null) return "";
            const s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? '"' + s + '"' : s;
          }).join(",");
        }).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "cms-admission-fees-" + new Date().toISOString().slice(0, 10) + ".csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    if (admPayTableBody) {
      admPayTableBody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-adm-pay-action]");
        if (!btn) return;
        const row = e.target.closest("tr[data-pay-id]");
        if (!row) return;
        const id = row.getAttribute("data-pay-id");
        const p = loadAdmissionPaymentsAdmin().find(function (x) { return x.id === id; });
        if (!p) return;
        alert(
          "Payment " + p.id + "\n" +
          "Amount: " + fmtINR(p.amount) + "\n" +
          "Method: " + (p.method || "—") + "\n" +
          "Receipt: " + (p.reference || "—") + "\n" +
          "Paid: " + fmtDate(p.paidAt) + "\n" +
          "Application: " + (p.applicationId || "—")
        );
      });
    }

    // Add sample application (for testing & demo purposes)
    const seedBtn = document.getElementById("seedBtn");
    if (seedBtn) {
      seedBtn.addEventListener("click", function () {
        const now = new Date();
        const id = "CMS-" + now.getTime();
        const sample = {
          id: id,
          submittedAt: now.toISOString(),
          status: "Pending",
          payment: {
            amount: 150,
            currency: "INR",
            status: "Paid",
            method: "UPI",
            reference: "TXN" + now.getTime().toString().slice(-10) + "47",
            paidAt: now.toISOString()
          },
          student: {
            classApplying: "Class 5",
            fullName: "Aaradhya Sharma",
            dob: "2015-08-12",
            gender: "Female",
            nationality: "Indian",
            religion: "Hinduism",
            bloodGroup: "B+",
            aadhaar: "1234 5678 9012",
            mobile: ""
          },
          address: {
            address: "House No. 24, Lane 3, Mirganj Road",
            city: "Purnea",
            district: "Purnea",
            state: "Bihar",
            pin: "854304"
          },
          previousSchool: {
            name: "Bal Bharti Public School",
            board: "CBSE",
            lastClass: "Class 4",
            tcNo: "BBPS-2025-0418",
            tcDate: "2025-03-31"
          },
          father: {
            name: "Rajesh Sharma",
            qualification: "M.Com",
            occupation: "Business",
            mobile: "9876543210",
            email: "rajesh.sharma@example.com",
            aadhaar: "5678 9012 3456",
            income: "₹5,00,000 – ₹10,00,000",
            address: ""
          },
          mother: {
            name: "Priya Sharma",
            qualification: "B.Ed",
            occupation: "Homemaker",
            mobile: "9876501234",
            email: "priya.sharma@example.com",
            aadhaar: "9012 3456 7890",
            income: "Below ₹2,00,000",
            address: ""
          },
          documents: [
            { field: "doc_birth", label: "Birth Certificate", fileName: "birth-cert.pdf", size: 184320, type: "application/pdf" },
            { field: "doc_aadhaar_student", label: "Aadhaar Card (Student)", fileName: "aadhaar-student.jpg", size: 220000, type: "image/jpeg" },
            { field: "doc_photo", label: "Passport Size Photograph", fileName: "passport-photo.jpg", size: 90000, type: "image/jpeg" }
          ],
          declaration: {
            name: "Rajesh Sharma",
            date: now.toISOString().slice(0, 10),
            signature: "",
            agreed: true
          }
        };
        const all = loadAll();
        all.unshift(sample);
        saveAll(all);
        render();
      });
    }

    // Clear all stored applications
    const clearBtnEl = document.getElementById("clearBtn");
    if (clearBtnEl) {
      clearBtnEl.addEventListener("click", function () {
        const all = loadAll();
        if (!all.length) { alert("There are no applications to clear."); return; }
        if (confirm("Move ALL " + all.length + " application(s) to the Recycle Bin?")) {
          adminRecycleMoveMany("admission_app", all);
          saveAll([]);
          render();
          switchToRecycleTab();
        }
      });
    }

    // Export CSV
    document.getElementById("exportBtn").addEventListener("click", function () {
      const all = loadAll();
      if (!all.length) { alert("No applications to export."); return; }
      const cols = [
        "Application ID", "Submitted At", "Status",
        "Student Name", "DOB", "Gender", "Class",
        "Father Name", "Father Mobile", "Father Email",
        "Mother Name", "Mother Mobile",
        "Address", "City", "District", "State", "PIN",
        "Payment Status", "Payment Method", "Amount", "Transaction Ref", "Paid At"
      ];
      const rows = all.map(function (s) {
        const st = s.student || {}, f = s.father || {}, m = s.mother || {}, a = s.address || {}, p = s.payment || {};
        return [
          s.id, s.submittedAt, s.status,
          st.fullName, st.dob, st.gender, st.classApplying,
          f.name, f.mobile, f.email,
          m.name, m.mobile,
          a.address, a.city, a.district, a.state, a.pin,
          p.status, p.method, p.amount, p.reference, p.paidAt
        ];
      });
      const csv = [cols].concat(rows).map(function (row) {
        return row.map(function (v) {
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? '"' + s + '"' : s;
        }).join(",");
      }).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cms-applications-" + new Date().toISOString().slice(0,10) + ".csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    /* ---- Modal ---- */
    const modal = document.getElementById("appModal");
    const modalBody = document.getElementById("modalBody");
    const modalTitle = document.getElementById("modalTitle");
    const modalSub = document.getElementById("modalSubtitle");
    let currentId = null;

    function detailRow(label, value) {
      return '<div class="detail-row"><strong>' + esc(label) + '</strong><span>' + esc(value || "—") + '</span></div>';
    }
    function detailSection(title, rows) {
      return '<section class="detail-section"><h4>' + esc(title) + '</h4>' + rows + '</section>';
    }

    function detailRowHtml(label, innerHtml) {
      return (
        '<div class="detail-row"><strong>' +
        esc(label) +
        "</strong><span>" +
        innerHtml +
        "</span></div>"
      );
    }

    function renderAdmissionModalBody(s) {
      currentId = s.id;
      modalTitle.textContent = (s.student && s.student.fullName) || "Application Details";
      modalSub.textContent = "Application ID " + s.id + " · Submitted " + fmtDate(s.submittedAt);

      const st = s.student || {}, f = s.father || {}, m = s.mother || {}, a = s.address || {}, ps = s.previousSchool || {}, p = s.payment || {}, d = s.declaration || {};
      const docs = getAdmissionDocumentsForAdmin(s)
        .map(function (doc) {
          return renderAdmissionDocumentCard(s, doc);
        })
        .join("");
      const sigImg = d.signature ? '<div class="detail-sig"><img src="' + d.signature + '" alt="Signature"/></div>' : '<span class="cell-sub">No signature on file.</span>';

      const pOverview = s.payment || {};
      const payPill =
        '<span class="pill ' +
        (pOverview.status === "Paid" ? "pill--ok" : "pill--warn") +
        '">' +
        esc(pOverview.status || "Pending") +
        "</span>";

      modalBody.innerHTML =
        '<div class="detail-grid">' +
          detailSection("Application overview",
            detailRow("Application ID", s.id) +
            detailRowHtml("Status", admissionStatusPill(s.status)) +
            detailRow("Submitted", fmtDate(s.submittedAt)) +
            detailRowHtml("Payment", payPill + " · " + esc(fmtINR(pOverview.amount)))
          ) +
          detailSection("Student",
            detailRow("Full Name", st.fullName) +
            detailRow("Date of Birth", fmtDateOnly(st.dob)) +
            detailRow("Gender", st.gender) +
            detailRow("Class Applying", st.classApplying) +
            detailRow("Nationality", st.nationality) +
            detailRow("Religion", st.religion) +
            detailRow("Blood Group", st.bloodGroup) +
            detailRow("Aadhaar", st.aadhaar) +
            detailRow("Mobile", st.mobile)
          ) +
          detailSection("Payment & receipt",
            detailRow("Application ID (school)", s.id) +
            detailRow("Payment status", p.status) +
            detailRow("Amount paid", fmtINR(p.amount)) +
            detailRow("Payment method", p.method) +
            detailRow("Receipt / transaction number", p.reference || "—") +
            detailRow("Paid at", fmtDate(p.paidAt))
          ) +
          detailSection("Address",
            detailRow("Address", a.address) +
            detailRow("City / Town", a.city) +
            detailRow("District", a.district) +
            detailRow("State", a.state) +
            detailRow("PIN", a.pin)
          ) +
          detailSection("Previous School",
            detailRow("School Name", ps.name) +
            detailRow("Board", ps.board) +
            detailRow("Last Class", ps.lastClass) +
            detailRow("TC Number", ps.tcNo) +
            detailRow("TC Date", fmtDateOnly(ps.tcDate))
          ) +
          detailSection("Father / Guardian",
            detailRow("Name", f.name) +
            detailRow("Qualification", f.qualification) +
            detailRow("Occupation", f.occupation) +
            detailRow("Mobile", f.mobile) +
            detailRow("Email", f.email) +
            detailRow("Aadhaar", f.aadhaar) +
            detailRow("Annual Income", f.occupation === "Unemployed" ? "Not applicable" : f.income) +
            detailRow("Address", f.address)
          ) +
          detailSection("Mother / Guardian",
            detailRow("Name", m.name) +
            detailRow("Qualification", m.qualification) +
            detailRow("Occupation", m.occupation) +
            detailRow("Mobile", m.mobile) +
            detailRow("Email", m.email) +
            detailRow("Aadhaar", m.aadhaar) +
            detailRow("Annual Income", m.occupation === "Unemployed" ? "Not applicable" : m.income) +
            detailRow("Address", m.address)
          ) +
          detailSection("Declaration",
            detailRow("Signed By", d.name) +
            detailRow("Date", fmtDateOnly(d.date)) +
            detailRow("Agreed", d.agreed ? "Yes" : "No") +
            '<div class="detail-row"><strong>Signature</strong><span>' + sigImg + '</span></div>'
          ) +
        '</div>' +
        '<div class="detail-section detail-section--span-2 adm-modal-docs"><h4>Documents &amp; uploads</h4><p class="cell-sub adm-modal-docs__hint">All file slots from the admission form — preview images and PDFs below, or open in a new tab.</p><div class="detail-doc-grid">' + docs + '</div></div>';

    }

    function openModal(id) {
      currentId = id;
      modalBody.innerHTML = '<p class="cell-sub">Loading application…</p>';
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      function show() {
        const all = admissionServerApps || loadAll();
        const s = all.find(function (x) {
          return x.id === id;
        });
        if (!s) {
          closeModal();
          return;
        }
        renderAdmissionModalBody(s);
      }
      fetchAdmissionApplicationsServer().then(show).catch(show);
    }
    function closeModal() {
      modal.hidden = true;
      currentId = null;
      document.body.style.overflow = "";
    }

    admTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-action]");
      const row = e.target.closest("tr[data-id]");
      if (!btn || !row) return;
      const id = row.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (action === "view") openModal(id);
      if (action === "delete") {
        if (confirm("Move this application to the Recycle Bin?")) {
          const all = loadAll();
          const s = all.find(function (x) { return x.id === id; });
          if (s) adminRecycleAdd("admission_app", s);
          saveAll(all.filter(function (x) { return x.id !== id; }));
          render();
          switchToRecycleTab();
        }
      }
    });

    modal.addEventListener("click", function (e) {
      if (e.target.matches("[data-close]")) closeModal();
      const action = e.target.closest("[data-action]");
      if (!action || !currentId) return;
      const verb = action.getAttribute("data-action");
      if (verb === "approve" || verb === "reject") {
        const all = loadAll();
        const idx = all.findIndex(function (s) { return s.id === currentId; });
        if (idx > -1) {
          all[idx].status = verb === "approve" ? "Approved" : "Rejected";
          saveAll(all);
        }
        closeModal();
        render();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) closeModal();
    });

    refreshAdmissionFromServer(render);

    /* ---- Tabs (Applications / Donations) ---- */
    const tabBtns = document.querySelectorAll(".admin-tab");
    const panes = document.querySelectorAll(".admin-pane");
    tabBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        const target = b.getAttribute("data-tab");
        if (target === "applications") {
          refreshAdmissionFromServer(render);
        }
        tabBtns.forEach(function (x) {
          const on = x === b;
          x.classList.toggle("is-active", on);
          x.setAttribute("aria-selected", String(on));
        });
        panes.forEach(function (p) {
          p.hidden = p.getAttribute("data-pane") !== target;
        });
        if (target === "recycle") renderRecycleBin();
        if (target === "donations") renderDonations();
        if (target === "careers") {
          Promise.all([
            fetchCareersApplicationsServer().catch(function () {
              careersServerApps = loadCareers();
            }),
            fetchCareersPaymentsServer().catch(function () {}),
          ]).finally(function () {
            renderCareers();
            renderCareersFees();
          });
        }
      });
    });

    /* ---- Donations ---- */
    const DONATIONS_KEY = "cms_donations_v1";
    const donTableBody = document.getElementById("donTableBody");
    const donEmpty = document.getElementById("donEmpty");
    const donSearch = document.getElementById("donSearch");
    const donFilterPurpose = document.getElementById("donFilterPurpose");
    const donFilterMethod = document.getElementById("donFilterMethod");
    const donStatCount = document.getElementById("donStatCount");
    const donStatAvg = document.getElementById("donStatAvg");
    const donStatMax = document.getElementById("donStatMax");
    const donStatTotal = document.getElementById("donStatTotal");

    function loadDonations() {
      try { return JSON.parse(localStorage.getItem(DONATIONS_KEY)) || []; }
      catch (e) { return []; }
    }
    function saveDonations(list) {
      try { localStorage.setItem(DONATIONS_KEY, JSON.stringify(list)); } catch (e) {}
    }
    function donRowHtml(d) {
      const donor = d.donor || {};
      const pay = d.payment || {};
      return (
        '<tr data-id="' + esc(d.id) + '">' +
        '<td class="cell-id">' + esc(d.id) + '</td>' +
        '<td>' +
          '<div class="cell-student">' + esc(d.anonymous ? "Anonymous" : (donor.name || "—")) + '</div>' +
          '<div class="cell-sub">' + esc(donor.mobile || "") + (donor.email ? ' · ' + esc(donor.email) : "") + '</div>' +
        '</td>' +
        '<td><strong>' + fmtINR(d.amount) + '</strong></td>' +
        '<td>' + esc(d.purpose || "—") + '</td>' +
        '<td>' + esc(pay.method || "—") + '</td>' +
        '<td class="cell-sub" style="font-family: ui-monospace, Menlo, monospace; font-size: 11.5px;">' + esc(pay.reference || "—") + '</td>' +
        '<td>' + esc(fmtDate(d.createdAt)) + '</td>' +
        '<td class="cell-actions">' +
          '<button class="btn-icon" title="View" data-don-action="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
          '<button class="btn-icon btn-icon--danger" title="Delete" data-don-action="delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</td>' +
        '</tr>'
      );
    }
    function populateDonationPurposes(all) {
      const purposes = Array.from(new Set(all.map(function (d) { return d.purpose; }).filter(Boolean))).sort();
      const cur = donFilterPurpose.value;
      donFilterPurpose.innerHTML = '<option value="">All Purposes</option>' +
        purposes.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join("");
      if (purposes.indexOf(cur) > -1) donFilterPurpose.value = cur;
    }
    function applyDonationFilters(all) {
      const q = (donSearch.value || "").trim().toLowerCase();
      const purpose = donFilterPurpose.value;
      const method = donFilterMethod.value;
      return all.filter(function (d) {
        if (purpose && d.purpose !== purpose) return false;
        if (method && (d.payment && d.payment.method) !== method) return false;
        if (q) {
          const hay = [
            d.id, d.donor && d.donor.name, d.donor && d.donor.mobile, d.donor && d.donor.email,
            d.payment && d.payment.reference, d.purpose
          ].join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }
    function renderDonations() {
      const all = loadDonations();
      populateDonationPurposes(all);
      const filtered = applyDonationFilters(all);
      donStatCount.textContent = String(all.length);
      const sum = all.reduce(function (a, d) { return a + Number(d.amount || 0); }, 0);
      const max = all.reduce(function (a, d) { return Math.max(a, Number(d.amount || 0)); }, 0);
      donStatTotal.textContent = fmtINR(sum);
      donStatAvg.textContent = fmtINR(all.length ? Math.round(sum / all.length) : 0);
      donStatMax.textContent = fmtINR(max);
      donTableBody.innerHTML = filtered.map(donRowHtml).join("");
      donEmpty.hidden = filtered.length > 0;
    }
    [donSearch, donFilterPurpose, donFilterMethod].forEach(function (el) {
      el.addEventListener("input", renderDonations);
      el.addEventListener("change", renderDonations);
    });
    document.getElementById("donExportBtn").addEventListener("click", function () {
      const all = loadDonations();
      if (!all.length) { alert("No donations to export."); return; }
      const cols = ["Receipt No", "Date", "Donor", "Mobile", "Email", "PAN", "Amount (INR)", "Purpose", "Method", "Transaction Ref", "Anonymous", "Message"];
      const rows = all.map(function (d) {
        const dn = d.donor || {}, p = d.payment || {};
        return [d.id, d.createdAt, dn.name, dn.mobile, dn.email, dn.pan, d.amount, d.purpose, p.method, p.reference, d.anonymous ? "Yes" : "No", d.message];
      });
      const csv = [cols].concat(rows).map(function (r) {
        return r.map(function (v) {
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? '"' + s + '"' : s;
        }).join(",");
      }).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cms-donations-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });
    document.getElementById("donClearBtn").addEventListener("click", function () {
      const all = loadDonations();
      if (!all.length) { alert("There are no donations to clear."); return; }
      if (confirm("Move ALL " + all.length + " donation(s) to the Recycle Bin?")) {
        adminRecycleMoveMany("donation", all);
        saveDonations([]);
        renderDonations();
        switchToRecycleTab();
      }
    });

    /* Donation row actions — View opens the same modal with donor details */
    donTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-don-action]");
      const row = e.target.closest("tr[data-id]");
      if (!btn || !row) return;
      const id = row.getAttribute("data-id");
      const action = btn.getAttribute("data-don-action");
      const all = loadDonations();
      const d = all.find(function (x) { return x.id === id; });
      if (!d) return;
      if (action === "delete") {
        if (confirm("Move this donation to the Recycle Bin?")) {
          adminRecycleAdd("donation", d);
          saveDonations(all.filter(function (x) { return x.id !== id; }));
          renderDonations();
          switchToRecycleTab();
        }
        return;
      }
      if (action === "view") {
        const dn = d.donor || {}, p = d.payment || {};
        modalTitle.textContent = d.anonymous ? "Anonymous Donor" : (dn.name || "Donation");
        modalSub.textContent = "Receipt " + d.id + " · " + fmtDate(d.createdAt);
        modalBody.innerHTML =
          '<div class="detail-grid">' +
            '<section class="detail-section"><h4>Donation</h4>' +
              '<div class="detail-row"><strong>Amount</strong><span style="color: var(--gold-deep); font-weight: 700; font-size: 18px;">' + esc(fmtINR(d.amount)) + '</span></div>' +
              '<div class="detail-row"><strong>Purpose</strong><span>' + esc(d.purpose || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Anonymous</strong><span>' + (d.anonymous ? "Yes" : "No") + '</span></div>' +
              '<div class="detail-row"><strong>Message</strong><span>' + esc(d.message || "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section"><h4>Donor</h4>' +
              '<div class="detail-row"><strong>Name</strong><span>' + esc(dn.name || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Mobile</strong><span>' + esc(dn.mobile || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Email</strong><span>' + esc(dn.email || "—") + '</span></div>' +
              '<div class="detail-row"><strong>PAN</strong><span>' + esc(dn.pan || "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section"><h4>Payment</h4>' +
              '<div class="detail-row"><strong>Method</strong><span>' + esc(p.method || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Transaction Ref</strong><span>' + esc(p.reference || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Status</strong><span>' + esc(p.status || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Paid At</strong><span>' + esc(fmtDate(p.paidAt)) + '</span></div>' +
            '</section>' +
          '</div>';
        // Hide Approve/Reject in donation view
        const foot = document.querySelector(".adm-modal__foot");
        if (foot) foot.style.display = "none";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
      }
    });

    // When closing modal, restore default footer (Approve / Reject for admissions)
    const DEFAULT_MODAL_FOOTER =
      '<button type="button" class="pay-btn pay-btn--ghost" data-action="reject">Reject</button>' +
      '<button type="button" class="pay-btn pay-btn--primary" data-action="approve">Approve</button>';
    modal.addEventListener("click", function (e) {
      if (e.target.matches("[data-close]")) {
        const foot = document.querySelector(".adm-modal__foot");
        if (foot) {
          foot.style.display = "";
          foot.innerHTML = DEFAULT_MODAL_FOOTER;
        }
        document.body.style.overflow = "";
      }
    });

    /* ---- Career Applications ---- */
    const CAREERS_KEY = "cms_careers_v1";
    const careersTableBody = document.getElementById("careersTableBody");
    const careersEmpty = document.getElementById("careersEmpty");
    const careersSearch = document.getElementById("careersSearch");
    const careersFilterPosition = document.getElementById("careersFilterPosition");
    const careersFilterStatus = document.getElementById("careersFilterStatus");
    const careersStatTotal = document.getElementById("careersStatTotal");
    const careersStatNew = document.getElementById("careersStatNew");
    const careersStatShort = document.getElementById("careersStatShort");
    const careersStatHired = document.getElementById("careersStatHired");
    const CAREERS_PAYMENTS_KEY_ADMIN = "cms_careers_payments_v1";
    const careersPayTableBody = document.getElementById("careersPayTableBody");
    const careersPayEmpty = document.getElementById("careersPayEmpty");
    var careersServerApps = null;
    var careersServerPayments = null;

    function fetchCareersApplicationsServer() {
      return fetch("/api/careers/applications")
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then(function (data) {
          careersServerApps = Array.isArray(data) ? data : [];
          try {
            localStorage.setItem(CAREERS_KEY, JSON.stringify(careersServerApps));
          } catch (e) {}
          return careersServerApps;
        });
    }

    function fetchCareersPaymentsServer() {
      return fetch("/api/careers/payments")
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then(function (data) {
          careersServerPayments = Array.isArray(data) ? data : [];
          try {
            localStorage.setItem(CAREERS_PAYMENTS_KEY_ADMIN, JSON.stringify(careersServerPayments));
          } catch (e) {}
          return careersServerPayments;
        });
    }

    function careersResumeHref(a) {
      var r = a && a.resume;
      if (!r) return "";
      if (r.storedOnServer) {
        return "/api/careers/applications/" + encodeURIComponent(a.id) + "/resume";
      }
      return r.dataUrl || "";
    }

    function loadCareersPaymentsAdmin() {
      if (careersServerPayments) return careersServerPayments.slice();
      try {
        return JSON.parse(localStorage.getItem(CAREERS_PAYMENTS_KEY_ADMIN)) || [];
      } catch (e) {
        return [];
      }
    }
    function saveCareersPaymentsAdmin(list) {
      try {
        localStorage.setItem(CAREERS_PAYMENTS_KEY_ADMIN, JSON.stringify(list));
      } catch (e) {}
    }
    /** Match stored fee payment to an application (for older records without feePayment). */
    function adminResolveCareersFeePayment(a) {
      if (a.feePayment && (a.feePayment.transactionReference || a.feePayment.paymentRecordId)) {
        return a.feePayment;
      }
      const per = a.personal || {};
      const email = String(per.email || "")
        .trim()
        .toLowerCase();
      const phone = String(per.mobile || "")
        .replace(/\D/g, "")
        .slice(-10);
      if (!email || phone.length !== 10) return null;
      const submittedMs = new Date(a.createdAt || 0).getTime();
      const list = loadCareersPaymentsAdmin();
      const candidates = list.filter(function (rec) {
        const ap = rec.applicant || {};
        if (String(ap.email || "")
          .trim()
          .toLowerCase() !== email) {
          return false;
        }
        if (String(ap.phone || "")
          .replace(/\D/g, "")
          .slice(-10) !== phone) {
          return false;
        }
        const paidMs = new Date(rec.paidAt || 0).getTime();
        if (isNaN(paidMs) || paidMs > submittedMs + 180000) return false;
        if (submittedMs - paidMs > 45 * 24 * 3600000) return false;
        return true;
      });
      candidates.sort(function (x, y) {
        return new Date(y.paidAt || 0).getTime() - new Date(x.paidAt || 0).getTime();
      });
      const rec = candidates[0];
      if (!rec) return null;
      const ap2 = rec.applicant || {};
      return {
        paymentRecordId: rec.id,
        transactionReference: rec.reference,
        paymentMethod: rec.method,
        amount: rec.amount,
        currency: rec.currency || "INR",
        paidAt: rec.paidAt,
        payerName: ap2.name,
        payerEmail: ap2.email,
        payerPhone: ap2.phone,
        linkSource: "retro-match",
      };
    }

    function careersPayRowHtml(p) {
      const ap = p.applicant || {};
      return (
        '<tr data-pay-id="' + esc(p.id) + '">' +
        '<td class="cell-id">' + esc(p.id) + '</td>' +
        '<td class="cell-id">' + esc(p.reference || "—") + '</td>' +
        '<td>' + esc(fmtINR(p.amount)) + " " + esc(p.currency || "INR") + "</td>" +
        '<td>' + esc(p.method || "—") + "</td>" +
        '<td>' + esc(fmtDate(p.paidAt)) + "</td>" +
        '<td>' + esc(ap.name || "—") + "</td>" +
        '<td><span class="cell-sub">' + esc(ap.email || "—") + "</span></td>" +
        '<td>' + esc(ap.phone || "—") + "</td>" +
        '<td class="cell-actions">' +
        '<button type="button" class="btn-icon" title="View payment" data-careers-pay-action="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
        "</td>" +
        "</tr>"
      );
    }

    function renderCareersFees() {
      if (!careersPayTableBody) return;
      const all = loadCareersPaymentsAdmin().slice().sort(function (a, b) {
        return new Date(b.paidAt || 0).getTime() - new Date(a.paidAt || 0).getTime();
      });
      careersPayTableBody.innerHTML = all.map(careersPayRowHtml).join("");
      if (careersPayEmpty) careersPayEmpty.hidden = all.length > 0;
    }

    function loadCareers() {
      if (careersServerApps) return careersServerApps.slice();
      try {
        return JSON.parse(localStorage.getItem(CAREERS_KEY)) || [];
      } catch (e) {
        return [];
      }
    }
    function saveCareers(list) {
      careersServerApps = list.slice();
      try {
        localStorage.setItem(CAREERS_KEY, JSON.stringify(list));
      } catch (e) {}
    }
    function statusPill(s) {
      const cls = (s === "Hired") ? "pill--paid"
        : (s === "Shortlisted") ? "pill--gold"
        : (s === "Rejected") ? "pill--rejected"
        : "pill--pending";
      return '<span class="pill ' + cls + '">' + esc(s || "New") + '</span>';
    }
    function careersRowHtml(a) {
      const per = a.personal || {};
      const pos = a.position || {};
      const exp = a.experience || {};
      const resume = a.resume || null;
      const fee = adminResolveCareersFeePayment(a);
      const feeCell = fee && fee.transactionReference
        ? '<div class="cell-id" title="' + esc(fee.paymentRecordId || "") + '">' + esc(fee.transactionReference) + "</div>" +
          '<div class="cell-sub">' + esc(fee.paymentMethod || "") + " · " + esc(fmtDate(fee.paidAt)) + "</div>"
        : '<span class="cell-sub">Not linked</span>';
      const resumeHref = careersResumeHref(a);
      const resumeCell = resumeHref
        ? '<a class="btn-icon" href="' + esc(resumeHref) + '" download="' + esc((resume && resume.name) || "resume") + '" title="Download resume" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
        : '<span class="cell-sub">—</span>';
      return (
        '<tr data-id="' + esc(a.id) + '">' +
        '<td class="cell-id">' + esc(a.id) + '</td>' +
        '<td>' +
          '<div class="cell-student">' + esc(per.name || "—") + '</div>' +
          '<div class="cell-sub">' + esc(per.gender || "") + (per.dob ? ' · DOB ' + esc(per.dob) : "") + '</div>' +
        '</td>' +
        '<td>' +
          '<div>' + esc(pos.role || "—") + '</div>' +
          (pos.subject ? '<div class="cell-sub">' + esc(pos.subject) + '</div>' : "") +
        '</td>' +
        '<td>' + feeCell + "</td>" +
        '<td>' + esc(exp.years ? exp.years + " yrs" : "Fresher") + '</td>' +
        '<td>' +
          '<div>' + esc(per.mobile || "—") + '</div>' +
          '<div class="cell-sub">' + esc(per.email || "") + '</div>' +
        '</td>' +
        '<td>' + esc(fmtDate(a.createdAt)) + '</td>' +
        '<td>' + resumeCell + '</td>' +
        '<td>' + statusPill(a.status) + '</td>' +
        '<td class="cell-actions">' +
          '<button class="btn-icon" title="View" data-careers-action="view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.6"/></svg></button>' +
          '<button class="btn-icon btn-icon--danger" title="Delete" data-careers-action="delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '</td>' +
        '</tr>'
      );
    }
    function populateCareersPositions(all) {
      const positions = Array.from(new Set(
        all.map(function (a) { return a.position && a.position.role; }).filter(Boolean)
      )).sort();
      const cur = careersFilterPosition.value;
      careersFilterPosition.innerHTML = '<option value="">All Positions</option>' +
        positions.map(function (p) { return '<option value="' + esc(p) + '">' + esc(p) + '</option>'; }).join("");
      if (positions.indexOf(cur) > -1) careersFilterPosition.value = cur;
    }
    function applyCareersFilters(all) {
      const q = (careersSearch.value || "").trim().toLowerCase();
      const pos = careersFilterPosition.value;
      const st = careersFilterStatus.value;
      return all.filter(function (a) {
        if (pos && (a.position && a.position.role) !== pos) return false;
        if (st && (a.status || "New") !== st) return false;
        if (q) {
          const per = a.personal || {}; const ps = a.position || {};
          const fee = adminResolveCareersFeePayment(a);
          const hay = [
            a.id, per.name, per.mobile, per.email, ps.role, ps.subject,
            fee && fee.transactionReference, fee && fee.paymentRecordId
          ].join(" ").toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }
    function renderCareers() {
      const all = loadCareers();
      populateCareersPositions(all);
      const filtered = applyCareersFilters(all);
      careersStatTotal.textContent = String(all.length);
      careersStatNew.textContent = String(all.filter(function (a) { return (a.status || "New") === "New"; }).length);
      careersStatShort.textContent = String(all.filter(function (a) { return a.status === "Shortlisted"; }).length);
      careersStatHired.textContent = String(all.filter(function (a) { return a.status === "Hired"; }).length);
      careersTableBody.innerHTML = filtered.map(careersRowHtml).join("");
      careersEmpty.hidden = filtered.length > 0;
      renderCareersFees();
    }
    [careersSearch, careersFilterPosition, careersFilterStatus].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", renderCareers);
      el.addEventListener("change", renderCareers);
    });

    document.getElementById("careersExportBtn").addEventListener("click", function () {
      const all = loadCareers();
      if (!all.length) { alert("No career applications to export."); return; }
      const cols = [
        "Application Ref", "Submitted",
        "Fee payment ID", "Receipt txn no", "Fee method", "Fee amount", "Fee paid at", "Fee payer email",
        "Name", "Gender", "DOB", "Mobile", "Email", "Address", "Position", "Subject", "Grade", "Earliest Join",
        "Qualification", "University", "Year", "B.Ed.", "Experience (yrs)", "Employer", "Designation", "Expected Salary",
        "Skills", "Languages", "Cover letter", "Resume File", "Resume Size (bytes)", "Status"
      ];
      const rows = all.map(function (a) {
        const p = a.personal || {}, ps = a.position || {}, ed = a.education || {}, ex = a.experience || {}, r = a.resume || {};
        const fee = adminResolveCareersFeePayment(a) || {};
        return [
          a.id, a.createdAt,
          fee.paymentRecordId || "", fee.transactionReference || "", fee.paymentMethod || "", fee.amount != null ? fee.amount : "", fee.paidAt || "", fee.payerEmail || "",
          p.name, p.gender, p.dob, p.mobile, p.email, p.address,
          ps.role, ps.subject, ps.grade, ps.joinDate,
          ed.qualification, ed.university, ed.year, ed.bed,
          ex.years, ex.employer, ex.designation, ex.expectedSalary,
          a.skills, a.languages, a.coverLetter || "",
          r && r.name || "", r && r.size || "",
          a.status || "New"
        ];
      });
      const csv = [cols].concat(rows).map(function (r) {
        return r.map(function (v) {
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? '"' + s + '"' : s;
        }).join(",");
      }).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cms-careers-" + new Date().toISOString().slice(0, 10) + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

    document.getElementById("careersClearBtn").addEventListener("click", function () {
      const all = loadCareers();
      if (!all.length) { alert("There are no career applications to clear."); return; }
      if (confirm("Move ALL " + all.length + " career application(s) to the Recycle Bin?")) {
        adminRecycleMoveMany("career_app", all);
        saveCareers([]);
        renderCareers();
        switchToRecycleTab();
      }
    });

    careersTableBody.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-careers-action]");
      const row = e.target.closest("tr[data-id]");
      if (!btn || !row) return;
      const id = row.getAttribute("data-id");
      const action = btn.getAttribute("data-careers-action");
      const all = loadCareers();
      const a = all.find(function (x) { return x.id === id; });
      if (!a) return;

      if (action === "download") {
        const href = careersResumeHref(a);
        if (!href) {
          alert("Resume file is unavailable for this application.");
          return;
        }
        const link = document.createElement("a");
        link.href = href;
        link.download = (a.resume && a.resume.name) || a.id + "-resume";
        if (a.resume && a.resume.storedOnServer) link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }

      if (action === "delete") {
        if (confirm("Move this career application to the Recycle Bin?")) {
          adminRecycleAdd("career_app", a);
          saveCareers(all.filter(function (x) { return x.id !== id; }));
          renderCareers();
          switchToRecycleTab();
        }
        return;
      }

      if (action === "view") {
        const per = a.personal || {}, pos = a.position || {}, ed = a.education || {}, ex = a.experience || {}, r = a.resume || null;
        const fee = adminResolveCareersFeePayment(a);
        modalTitle.textContent = per.name || "Career Application";
        modalSub.textContent = "Application ref. " + a.id + " · Submitted " + fmtDate(a.createdAt);

        const resumeHrefModal = careersResumeHref(a);
        const resumeBlock = r
          ? '<div class="detail-row"><strong>File</strong><span>' + esc(r.name || "—") + ' <span class="cell-sub">(' + esc(r.size ? (Math.round(r.size / 1024) + " KB") : "—") + ')</span></span></div>'
            + (resumeHrefModal
                ? '<div class="detail-row"><strong>Action</strong><span><a class="pay-btn pay-btn--ghost pay-btn--small" href="' + esc(resumeHrefModal) + '" download="' + esc(r.name || (a.id + "-resume")) + '" target="_blank" rel="noopener"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Download Resume</a></span></div>'
                : '<div class="detail-row"><strong>Action</strong><span class="cell-sub">Resume file not stored.</span></div>')
          : '<div class="detail-row"><strong>Resume</strong><span class="cell-sub">No file uploaded.</span></div>';

        const feeSectionHtml =
          fee && (fee.transactionReference || fee.paymentRecordId)
            ? '<section class="detail-section detail-section--span-2"><h4>₹100 fee — payment &amp; receipt</h4>' +
              '<div class="detail-row"><strong>School payment record ID</strong><span class="cell-id">' + esc(fee.paymentRecordId || "—") + "</span></div>" +
              '<div class="detail-row"><strong>Receipt / transaction number</strong><span class="cell-id">' + esc(fee.transactionReference || "—") + "</span></div>" +
              '<div class="detail-row"><strong>Payment method</strong><span>' + esc(fee.paymentMethod || "—") + "</span></div>" +
              '<div class="detail-row"><strong>Amount</strong><span>' + esc(fmtINR(fee.amount)) + " " + esc(fee.currency || "INR") + "</span></div>" +
              '<div class="detail-row"><strong>Paid at</strong><span>' + esc(fmtDate(fee.paidAt)) + "</span></div>" +
              '<div class="detail-row"><strong>Payer name (at checkout)</strong><span>' + esc(fee.payerName || "—") + "</span></div>" +
              '<div class="detail-row"><strong>Payer email</strong><span>' + esc(fee.payerEmail || "—") + "</span></div>" +
              '<div class="detail-row"><strong>Payer mobile</strong><span>' + esc(fee.payerPhone || "—") + "</span></div>" +
              (fee.linkSource
                ? '<div class="detail-row"><strong>How linked</strong><span>' + esc(String(fee.linkSource)) + "</span></div>"
                : "") +
              "</section>"
            : '<section class="detail-section detail-section--span-2"><h4>₹100 fee — payment &amp; receipt</h4>' +
              '<p class="cell-sub" style="margin:0">No matching fee payment found for this application. Check that the candidate used the same email and mobile on the payment page as on the form, or open <strong>Careers fee payments</strong> below to look up the receipt manually.</p></section>';

        modalBody.innerHTML =
          '<div class="detail-grid">' +
            feeSectionHtml +
            '<section class="detail-section"><h4>Personal</h4>' +
              '<div class="detail-row"><strong>Name</strong><span>' + esc(per.name || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Gender</strong><span>' + esc(per.gender || "—") + '</span></div>' +
              '<div class="detail-row"><strong>DOB</strong><span>' + esc(per.dob || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Mobile</strong><span>' + esc(per.mobile || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Email</strong><span>' + esc(per.email || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Marital</strong><span>' + esc(per.marital || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Address</strong><span>' + esc(per.address || "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section"><h4>Position</h4>' +
              '<div class="detail-row"><strong>Role</strong><span>' + esc(pos.role || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Subject</strong><span>' + esc(pos.subject || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Grade</strong><span>' + esc(pos.grade || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Earliest Joining</strong><span>' + esc(pos.joinDate || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Status</strong><span>' + statusPill(a.status) + '</span></div>' +
            '</section>' +
            '<section class="detail-section"><h4>Education</h4>' +
              '<div class="detail-row"><strong>Qualification</strong><span>' + esc(ed.qualification || "—") + '</span></div>' +
              '<div class="detail-row"><strong>University</strong><span>' + esc(ed.university || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Year</strong><span>' + esc(ed.year || "—") + '</span></div>' +
              '<div class="detail-row"><strong>B.Ed.</strong><span>' + esc(ed.bed || "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section"><h4>Experience</h4>' +
              '<div class="detail-row"><strong>Total Years</strong><span>' + esc(ex.years ? ex.years + " yrs" : "Fresher") + '</span></div>' +
              '<div class="detail-row"><strong>Employer</strong><span>' + esc(ex.employer || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Designation</strong><span>' + esc(ex.designation || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Expected Salary</strong><span>' + (ex.expectedSalary ? esc(fmtINR(ex.expectedSalary)) : "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section detail-section--span-2"><h4>Skills, Languages &amp; Cover Letter</h4>' +
              '<div class="detail-row"><strong>Skills</strong><span>' + esc(a.skills || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Languages</strong><span>' + esc(a.languages || "—") + '</span></div>' +
              '<div class="detail-row"><strong>Why Join CMS</strong><span>' + esc(a.coverLetter || "—") + '</span></div>' +
            '</section>' +
            '<section class="detail-section detail-section--span-2"><h4>Resume</h4>' + resumeBlock + '</section>' +
          '</div>';

        // Repurpose Approve/Reject footer to Shortlist / Reject / Hire
        const foot = document.querySelector(".adm-modal__foot");
        if (foot) {
          foot.style.display = "";
          foot.innerHTML =
            '<button type="button" class="pay-btn pay-btn--ghost" data-careers-status="Rejected">Reject</button>' +
            '<button type="button" class="pay-btn pay-btn--ghost" data-careers-status="Shortlisted">Shortlist</button>' +
            '<button type="button" class="pay-btn pay-btn--primary" data-careers-status="Hired">Mark Hired</button>';

          foot.querySelectorAll("button[data-careers-status]").forEach(function (b) {
            b.addEventListener("click", function () {
              const target = b.getAttribute("data-careers-status");
              const list = loadCareers();
              const idx = list.findIndex(function (x) { return x.id === id; });
              if (idx > -1) {
                list[idx].status = target;
                saveCareers(list);
                fetch("/api/careers/applications/" + encodeURIComponent(id), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: target }),
                }).catch(function () {});
                renderCareers();
              }
              modal.hidden = true;
              document.body.style.overflow = "";
            });
          });
        }

        modal.hidden = false;
        document.body.style.overflow = "hidden";
      }
    });

    var careersPayExportBtnEl = document.getElementById("careersPayExportBtn");
    if (careersPayExportBtnEl) {
      careersPayExportBtnEl.addEventListener("click", function () {
        var allPay = loadCareersPaymentsAdmin();
        if (!allPay.length) {
          alert("No careers fee payments to export.");
          return;
        }
        var cols = [
          "School payment ID", "Receipt txn no", "Amount", "Currency", "Method", "Paid at", "Purpose",
          "Payer name", "Payer email", "Payer mobile"
        ];
        var rows = allPay.map(function (p) {
          var ap = p.applicant || {};
          return [
            p.id, p.reference, p.amount, p.currency || "INR", p.method, p.paidAt, p.purpose || "",
            ap.name, ap.email, ap.phone
          ];
        });
        var csv = [cols].concat(rows).map(function (r) {
          return r.map(function (v) {
            if (v == null) return "";
            var s = String(v).replace(/"/g, '""');
            return /[",\n]/.test(s) ? '"' + s + '"' : s;
          }).join(",");
        }).join("\n");
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "cms-careers-fees-" + new Date().toISOString().slice(0, 10) + ".csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    var careersPayClearBtnEl = document.getElementById("careersPayClearBtn");
    if (careersPayClearBtnEl) {
      careersPayClearBtnEl.addEventListener("click", function () {
        var allPay = loadCareersPaymentsAdmin();
        if (!allPay.length) {
          alert("No careers fee payment records to clear.");
          return;
        }
        if (confirm("Move ALL " + allPay.length + " careers fee payment record(s) to the Recycle Bin?")) {
          adminRecycleMoveMany("career_payment", allPay);
          saveCareersPaymentsAdmin([]);
          renderCareersFees();
          switchToRecycleTab();
        }
      });
    }

    if (careersPayTableBody) {
      careersPayTableBody.addEventListener("click", function (e) {
        var btn = e.target.closest("button[data-careers-pay-action]");
        var row = e.target.closest("tr[data-pay-id]");
        if (!btn || !row) return;
        var payId = row.getAttribute("data-pay-id");
        var allPay = loadCareersPaymentsAdmin();
        var p = allPay.find(function (x) { return x.id === payId; });
        if (!p) return;
        var ap = p.applicant || {};
        modalTitle.textContent = "Careers fee payment";
        modalSub.textContent = (p.id || "") + " · Paid " + fmtDate(p.paidAt);
        modalBody.innerHTML =
          '<div class="detail-grid">' +
            '<section class="detail-section detail-section--span-2"><h4>Receipt &amp; payment</h4>' +
            '<div class="detail-row"><strong>School payment record ID</strong><span class="cell-id">' + esc(p.id) + "</span></div>" +
            '<div class="detail-row"><strong>Receipt / transaction number</strong><span class="cell-id">' + esc(p.reference || "—") + "</span></div>" +
            '<div class="detail-row"><strong>Method</strong><span>' + esc(p.method || "—") + "</span></div>" +
            '<div class="detail-row"><strong>Amount</strong><span>' + esc(fmtINR(p.amount)) + "</span></div>" +
            '<div class="detail-row"><strong>Currency</strong><span>' + esc(p.currency || "INR") + "</span></div>" +
            '<div class="detail-row"><strong>Paid at</strong><span>' + esc(fmtDate(p.paidAt)) + "</span></div>" +
            '<div class="detail-row"><strong>Purpose</strong><span>' + esc(p.purpose || "—") + "</span></div>" +
            "</section>" +
            '<section class="detail-section detail-section--span-2"><h4>Payer (entered at checkout)</h4>' +
            '<div class="detail-row"><strong>Name</strong><span>' + esc(ap.name || "—") + "</span></div>" +
            '<div class="detail-row"><strong>Email</strong><span>' + esc(ap.email || "—") + "</span></div>" +
            '<div class="detail-row"><strong>Mobile</strong><span>' + esc(ap.phone || "—") + "</span></div>" +
            "</section>" +
          "</div>";
        var footPay = document.querySelector(".adm-modal__foot");
        if (footPay) footPay.style.display = "none";
        modal.hidden = false;
        document.body.style.overflow = "hidden";
      });
    }

    /* ---- Recycle bin ---- */
    const recycleTableBody = document.getElementById("recycleTableBody");
    const recycleEmpty = document.getElementById("recycleEmpty");
    const recycleFilterType = document.getElementById("recycleFilterType");

    function adminRecyclePurgeServer(item) {
      const rec = item.record || {};
      const id = rec.id;
      if (!id) return Promise.resolve();
      if (item.type === "admission_app") {
        return fetch("/api/admissions/applications/" + encodeURIComponent(id), { method: "DELETE" }).catch(function () {});
      }
      if (item.type === "admission_payment") {
        return fetch("/api/admissions/payments/" + encodeURIComponent(id), { method: "DELETE" }).catch(function () {});
      }
      if (item.type === "career_app") {
        return fetch("/api/careers/applications/" + encodeURIComponent(id), { method: "DELETE" }).catch(function () {});
      }
      return Promise.resolve();
    }

    function adminRecycleRestore(recycleId) {
      const bin = loadRecycleBin();
      const idx = bin.findIndex(function (x) { return x.recycleId === recycleId; });
      if (idx < 0) return;
      const item = bin[idx];
      const rec = item.record;
      if (!rec) return;

      function existsIn(list, id) {
        return (list || []).some(function (x) { return x && x.id === id; });
      }

      if (item.type === "admission_app") {
        const list = loadAll();
        if (existsIn(list, rec.id)) {
          alert("This application is already in the active list.");
          return;
        }
        list.unshift(rec);
        saveAll(list);
        syncAdmissionApplicationToServer(rec);
        render();
      } else if (item.type === "admission_payment") {
        const list = loadAdmissionPaymentsAdmin();
        if (existsIn(list, rec.id)) {
          alert("This payment record is already in the active list.");
          return;
        }
        list.unshift(rec);
        saveAdmissionPaymentsAdmin(list);
        renderAdmissionFees();
      } else if (item.type === "donation") {
        const list = loadDonations();
        if (existsIn(list, rec.id)) {
          alert("This donation is already in the active list.");
          return;
        }
        list.unshift(rec);
        saveDonations(list);
        renderDonations();
      } else if (item.type === "career_app") {
        const list = loadCareers();
        if (existsIn(list, rec.id)) {
          alert("This career application is already in the active list.");
          return;
        }
        list.unshift(rec);
        saveCareers(list);
        fetch("/api/careers/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rec),
        }).catch(function () {});
        renderCareers();
      } else if (item.type === "career_payment") {
        const list = loadCareersPaymentsAdmin();
        if (existsIn(list, rec.id)) {
          alert("This payment record is already in the active list.");
          return;
        }
        list.unshift(rec);
        saveCareersPaymentsAdmin(list);
        renderCareersFees();
      }

      bin.splice(idx, 1);
      saveRecycleBin(bin);
      updateRecycleBadge();
      renderRecycleBin();
    }

    function adminRecyclePurge(recycleId) {
      const bin = loadRecycleBin();
      const idx = bin.findIndex(function (x) { return x.recycleId === recycleId; });
      if (idx < 0) return;
      const item = bin[idx];
      adminRecyclePurgeServer(item).finally(function () {
        bin.splice(idx, 1);
        saveRecycleBin(bin);
        updateRecycleBadge();
        renderRecycleBin();
      });
    }

    function adminRecyclePurgeAll() {
      const bin = loadRecycleBin();
      if (!bin.length) return;
      Promise.all(bin.map(function (item) { return adminRecyclePurgeServer(item); })).finally(function () {
        saveRecycleBin([]);
        updateRecycleBadge();
        renderRecycleBin();
      });
    }

    function recycleRowHtml(item) {
      return (
        '<tr data-recycle-id="' + esc(item.recycleId) + '">' +
        "<td>" + esc(RECYCLE_TYPE_LABELS[item.type] || item.type) + "</td>" +
        "<td><div class=\"cell-student\">" + esc(item.summary || "—") + "</div></td>" +
        '<td class="cell-sub">' + esc(fmtDate(item.deletedAt)) + "</td>" +
        '<td class="cell-actions">' +
        '<button type="button" class="btn-icon btn-recycle-restore" title="Restore" data-recycle-action="restore">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        '<button type="button" class="btn-icon btn-icon--danger btn-recycle-purge" title="Delete permanently" data-recycle-action="purge">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m1 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h12z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
        "</td></tr>"
      );
    }

    function renderRecycleBin() {
      if (!recycleTableBody) return;
      let all = loadRecycleBin();
      const ft = recycleFilterType && recycleFilterType.value;
      if (ft) all = all.filter(function (x) { return x.type === ft; });
      recycleTableBody.innerHTML = all.map(recycleRowHtml).join("");
      if (recycleEmpty) recycleEmpty.hidden = all.length > 0;
    }

    if (recycleFilterType) {
      recycleFilterType.addEventListener("change", renderRecycleBin);
    }
    const recycleEmptyBtn = document.getElementById("recycleEmptyBtn");
    if (recycleEmptyBtn) {
      recycleEmptyBtn.addEventListener("click", function () {
        const n = loadRecycleBin().length;
        if (!n) {
          alert("Recycle bin is already empty.");
          return;
        }
        if (confirm("Permanently delete ALL " + n + " item(s) in the recycle bin? This cannot be undone.")) {
          adminRecyclePurgeAll();
        }
      });
    }
    if (recycleTableBody) {
      recycleTableBody.addEventListener("click", function (e) {
        const btn = e.target.closest("[data-recycle-action]");
        const row = e.target.closest("tr[data-recycle-id]");
        if (!btn || !row) return;
        const recycleId = row.getAttribute("data-recycle-id");
        const action = btn.getAttribute("data-recycle-action");
        if (action === "restore") {
          adminRecycleRestore(recycleId);
          return;
        }
        if (action === "purge") {
          if (confirm("Permanently delete this item? This cannot be undone.")) {
            adminRecyclePurge(recycleId);
          }
        }
      });
    }
    updateRecycleBadge();

    Promise.all([
      fetchCareersApplicationsServer().catch(function () {
        careersServerApps = loadCareers();
        return careersServerApps;
      }),
      fetchCareersPaymentsServer().catch(function () {
        return loadCareersPaymentsAdmin();
      }),
    ]).finally(function () {
      renderCareers();
    });
  }
})();
