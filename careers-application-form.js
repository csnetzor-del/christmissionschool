/**
 * Christ Mission School — auto-generated Join Our Mission application.
 * Filled from careers-apply.html; print or Save as PDF in the browser.
 */
(function (global) {
  var FORM_REF = "CMS-APP-2026";
  var SCHOOL = "Christ Mission School";
  var ADDRESS = "Mirganj, Purnea, Bihar – 854304";
  var TAGLINE = "Excellence Through Education";
  var MISSION_LINE = "Empowering Minds · Nurturing Faith · Shaping Futures";

  function esc(s) {
    if (s == null || s === "") return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cell(v, blank) {
    var t = (v == null ? "" : String(v)).trim();
    if (!t) return blank ? '<span class="cms-job__blank">&nbsp;</span>' : "—";
    return esc(t);
  }

  function checked(val, option) {
    return String(val || "").toLowerCase() === String(option).toLowerCase()
      ? '<span class="cms-job__tick">✓</span>'
      : '<span class="cms-job__box"></span>';
  }

  function readForm(form) {
    form = form || document.getElementById("careersForm");
    if (!form) return {};
    var fd = new FormData(form);
    function g(name) {
      return (fd.get(name) || "").toString().trim();
    }
    return {
      name: g("c_name"),
      dob: g("c_dob"),
      gender: g("c_gender"),
      marital: g("c_marital"),
      father: g("c_father"),
      nationality: g("c_nationality") || "Indian",
      mobile: g("c_mobile"),
      email: g("c_email"),
      address: g("c_address"),
      permAddress: g("c_perm_address"),
      position: g("c_position"),
      subject: g("c_subject"),
      grade: g("c_grade"),
      joinDate: g("c_join_date"),
      qual: g("c_qual"),
      university: g("c_university"),
      year: g("c_year"),
      bed: g("c_bed"),
      expYears: g("c_exp_years"),
      salary: g("c_salary"),
      expOrg: g("c_exp_current"),
      expRole: g("c_exp_role"),
      skills: g("c_skills"),
      languages: g("c_languages"),
      cover: g("c_cover"),
      ref1Name: g("c_ref1_name"),
      ref1Rel: g("c_ref1_relation"),
      ref1Phone: g("c_ref1_phone"),
      ref2Name: g("c_ref2_name"),
      ref2Rel: g("c_ref2_relation"),
      ref2Phone: g("c_ref2_phone"),
    };
  }

  function readReceiptFromDom() {
    function t(id) {
      var el = document.getElementById(id);
      if (!el) return "";
      var v = (el.textContent || "").trim();
      return v === "—" ? "" : v;
    }
    return {
      txnId: t("careersRecRef"),
      payName: t("careersRecName"),
      payEmail: t("careersRecEmail"),
      payPhone: t("careersRecPhone"),
      payMethod: t("careersRecMethod"),
      paidAtDisplay: t("careersRecTime"),
      feeAmount: "₹100.00",
    };
  }

  function readPayment() {
    var out = readReceiptFromDom();
    var name = document.getElementById("careers_pay_name");
    var email = document.getElementById("careers_pay_email");
    var phone = document.getElementById("careers_pay_phone");
    if (name && name.value.trim()) out.payName = out.payName || name.value.trim();
    if (email && email.value.trim()) out.payEmail = out.payEmail || email.value.trim();
    if (phone && phone.value.trim()) out.payPhone = out.payPhone || phone.value.trim();
    try {
      var raw = sessionStorage.getItem("cms_careers_last_fee_txn");
      if (raw) {
        var p = JSON.parse(raw);
        out.txnId = out.txnId || p.reference || p.paymentRecordId || "";
        out.paidAt = out.paidAt || p.paidAt || "";
        out.payMethod = out.payMethod || p.method || "";
        out.feeAmount =
          p.amount != null ? "₹" + Number(p.amount).toFixed(2) : out.feeAmount || "₹100.00";
        if (p.applicant) {
          if (!out.payName && p.applicant.name) out.payName = p.applicant.name;
          if (!out.payEmail && p.applicant.email) out.payEmail = p.applicant.email;
          if (!out.payPhone && p.applicant.phone) out.payPhone = p.applicant.phone;
        }
      }
    } catch (e) {}
    if (!out.feeAmount) out.feeAmount = "₹100.00";
    return out;
  }

  function mergeData(extra) {
    var d = readForm();
    var pay = readPayment();
    if (!d.name && pay.payName) d.name = pay.payName;
    if (!d.email && pay.payEmail) d.email = pay.payEmail;
    if (!d.mobile && pay.payPhone) d.mobile = pay.payPhone;
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (extra[k] != null && extra[k] !== "") d[k] = extra[k];
      });
    }
    d.formRef = FORM_REF;
    d.applicationRef = (extra && extra.applicationRef) || d.applicationRef || "";
    d.txnId = pay.txnId || d.txnId || "";
    d.paidAt = pay.paidAt || d.paidAt || "";
    d.paidAtDisplay = pay.paidAtDisplay || d.paidAtDisplay || "";
    d.payMethod = pay.payMethod || d.payMethod || "";
    d.feeAmount = pay.feeAmount || d.feeAmount || "₹100.00";
    d.channel = d.applicationRef ? "Online portal (submitted)" : "Online portal";
    return d;
  }

  function resolveLogo(logoDataUrl) {
    if (logoDataUrl && /^data:image\//i.test(logoDataUrl)) return logoDataUrl;
    if (global.CMS_SCHOOL_EMBLEM_DATA_URL) return global.CMS_SCHOOL_EMBLEM_DATA_URL;
    return logoDataUrl || "";
  }

  function applicationSummary(data, blank, appRef, formRef, today, generated) {
    return (
      '<section class="cms-job__block cms-job__block--summary">' +
      '<div class="cms-job__summary-top">' +
      '<div class="cms-job__summary-head">' +
      '<h2 class="cms-job__title">Application for Employment</h2>' +
      '<p class="cms-job__subtitle">Teaching &amp; staff positions · Christ Mission School, Purnea · Session 2026–27</p>' +
      "</div>" +
      photoBox() +
      "</div>" +
      '<table class="cms-job__info" aria-label="Application details">' +
      "<tbody>" +
      "<tr><th>Form reference</th><td>" +
      esc(formRef) +
      " (online portal)</td><th>Application ID</th><td>" +
      cell(appRef, blank) +
      "</td></tr>" +
      "<tr><th>Application date</th><td>" +
      (blank ? cell("", true) : esc(today)) +
      "</td><th>Generated on</th><td>" +
      (blank ? cell("", true) : esc(generated)) +
      "</td></tr>" +
      "<tr><th>Submission channel</th><td colspan=\"3\">" +
      cell(data.channel || "Online portal", blank) +
      "</td></tr>" +
      "</tbody></table></section>"
    );
  }

  function paymentSection(data, blank) {
    if (blank || !data.txnId) return "";
    return (
      '<section class="cms-job__block cms-job__block--payment">' +
      '<h3 class="cms-job__sec"><span class="cms-job__sec-num">8</span>Payment confirmation</h3>' +
      '<p class="cms-job__pay-intro">Careers application processing fee — verified through the online portal.</p>' +
      '<table class="cms-job__info cms-job__info--payment" aria-label="Payment details">' +
      "<tbody>" +
      "<tr><th>Payment status</th><td><span class=\"cms-job__paid\">PAID</span></td><th>Amount</th><td>" +
      cell(data.feeAmount, false) +
      "</td></tr>" +
      "<tr><th>Transaction ID</th><td colspan=\"3\"><strong>" +
      cell(data.txnId, false) +
      "</strong></td></tr>" +
      "<tr><th>Applicant name</th><td>" +
      cell(data.name, false) +
      "</td><th>Mobile</th><td>" +
      cell(data.mobile, false) +
      "</td></tr>" +
      "<tr><th>Email</th><td>" +
      cell(data.email, false) +
      "</td><th>Payment method</th><td>" +
      cell(data.payMethod, false) +
      "</td></tr>" +
      "<tr><th>Payment date &amp; time</th><td colspan=\"3\">" +
      cell(data.paidAtDisplay || data.paidAt, false) +
      "</td></tr>" +
      "</tbody></table></section>"
    );
  }

  function secHead(num, title) {
    return (
      '<section class="cms-job__block"><h3 class="cms-job__sec"><span class="cms-job__sec-num">' +
      esc(String(num)) +
      "</span>" +
      esc(title) +
      "</h3>"
    );
  }

  function secEnd() {
    return "</section>";
  }

  function styles() {
    return (
      "@page{size:A4;margin:12mm 14mm}" +
      "body{font-family:'Segoe UI',system-ui,Georgia,serif;font-size:10.5pt;color:#0b1b3e;margin:0;line-height:1.45;background:#fff}" +
      ".cms-job{max-width:186mm;margin:0 auto;padding:0;position:relative}" +
      ".cms-job__banner{background:linear-gradient(90deg,#0b1b3e,#1a3a6e);color:#fff;text-align:center;padding:10px 14px;font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;font-weight:600}" +
      ".cms-job__badge{position:absolute;top:0;right:0;background:#d4a24c;color:#0b1b3e;font-size:7pt;font-weight:700;padding:5px 10px;text-transform:uppercase;letter-spacing:.08em}" +
      ".cms-job__head{text-align:center;padding:14px 16px 12px;border-bottom:3px solid #d4a24c;background:linear-gradient(180deg,#faf6ee 0%,#fff 100%)}" +
      ".cms-job__summary-top{display:flex;gap:14px;align-items:flex-start;justify-content:space-between;margin-bottom:12px}" +
      ".cms-job__summary-head{flex:1;min-width:0;padding-right:8px}" +
      ".cms-job__summary-head .cms-job__title,.cms-job__summary-head .cms-job__subtitle{text-align:left}" +
      ".cms-job__summary-head .cms-job__subtitle{margin-bottom:0}" +
      ".cms-job__logo{width:88px;height:88px;object-fit:contain;border-radius:50%;background:#fff;padding:4px;box-shadow:0 2px 8px rgba(11,27,62,.12);margin:0 auto 10px;display:block}" +
      ".cms-job__photo{flex:0 0 28mm;width:28mm;height:35mm;margin-left:auto;border:2px dashed #8b6914;display:flex;align-items:center;justify-content:center;text-align:center;font-size:7.5pt;line-height:1.35;color:#5a6584;background:#fff;padding:4px;box-sizing:border-box}" +
      ".cms-job__photo span{display:block;max-width:24mm}" +
      ".cms-job__school h1{margin:0;font-size:17pt;letter-spacing:.06em;color:#0b1b3e;font-weight:700}" +
      ".cms-job__school p{margin:4px 0 0;font-size:9.5pt;color:#3d4f6f}" +
      ".cms-job__tagline{color:#8b6914;font-style:italic;font-size:9pt;margin-top:6px}" +
      ".cms-job__mission{font-size:8.5pt;color:#5a6584;margin-top:2px}" +
      ".cms-job__block{margin-bottom:14px;page-break-inside:avoid}" +
      ".cms-job__block--summary{margin:14px 0 16px;padding:12px 14px;border:1px solid #c5d4e8;border-radius:6px;background:#f8fafc}" +
      ".cms-job__block--payment{background:#fffbf0;border-color:#d4a24c}" +
      ".cms-job__block--sign{margin-top:18px;padding-top:12px;border-top:2px solid #0b1b3e}" +
      ".cms-job__title{text-align:center;font-weight:700;font-size:14pt;margin:0 0 4px;color:#0b1b3e}" +
      ".cms-job__subtitle{text-align:center;font-size:9.5pt;color:#5a6584;margin:0 0 12px}" +
      ".cms-job__info{width:100%;border-collapse:collapse;font-size:9.5pt;margin:0}" +
      ".cms-job__info th,.cms-job__info td{border:1px solid #b8c5d9;padding:7px 10px;text-align:left;vertical-align:top}" +
      ".cms-job__info th{width:22%;background:#eef2f8;color:#3d4f6f;font-size:8pt;text-transform:uppercase;letter-spacing:.04em;font-weight:600}" +
      ".cms-job__info td{width:28%;font-weight:500}" +
      ".cms-job__paid{display:inline-block;background:#2e7d32;color:#fff;font-size:8pt;font-weight:700;padding:2px 8px;border-radius:3px;letter-spacing:.06em}" +
      ".cms-job__pay-intro{margin:0 0 8px;font-size:9pt;color:#5a6584}" +
      ".cms-job__sec{display:flex;align-items:center;gap:8px;font-weight:700;font-size:10pt;margin:0 0 10px;padding:0 0 6px;color:#0b1b3e;border-bottom:2px solid #0b1b3e}" +
      ".cms-job__sec-num{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;background:#0b1b3e;color:#fff;border-radius:4px;font-size:9pt}" +
      ".cms-job__row{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:8px}" +
      ".cms-job__row--3{grid-template-columns:1fr 1fr 1fr}" +
      ".cms-job__field label{display:block;font-size:7.5pt;color:#5a6584;font-weight:600;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}" +
      ".cms-job__field .v{border-bottom:1.5px solid #0b1b3e;min-height:22px;padding:4px 2px;font-size:10.5pt}" +
      ".cms-job__data{width:100%;border-collapse:collapse;margin:0 0 8px;font-size:9.5pt}" +
      ".cms-job__data th,.cms-job__data td{border:1px solid #0b1b3e;padding:7px 9px;text-align:left}" +
      ".cms-job__data th{background:#0b1b3e;color:#fff;font-size:7.5pt;text-transform:uppercase;letter-spacing:.04em;font-weight:600}" +
      ".cms-job__checks{display:flex;flex-wrap:wrap;gap:12px;font-size:10pt;padding:6px 2px;min-height:22px;align-items:center;border-bottom:1.5px solid #0b1b3e}" +
      ".cms-job__box{display:inline-block;width:12px;height:12px;border:1.5px solid #0b1b3e;vertical-align:middle}" +
      ".cms-job__tick{display:inline-block;width:12px;height:12px;border:1.5px solid #2e7d32;text-align:center;line-height:10px;font-size:9px;font-weight:bold;background:#e8f5e9;color:#2e7d32;vertical-align:middle}" +
      ".cms-job__para{border:1px solid #b8c5d9;border-radius:4px;min-height:64px;padding:10px 12px;font-size:10pt;white-space:pre-wrap;background:#fff;margin-bottom:4px}" +
      ".cms-job__docs{font-size:9.5pt;margin:0;padding:0 0 0 18px;list-style:decimal}" +
      ".cms-job__docs li{margin:5px 0;padding-left:4px}" +
      ".cms-job__foot{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:20px;align-items:end}" +
      ".cms-job__sig{border-top:1.5px solid #0b1b3e;padding-top:8px;font-size:9pt;text-align:center;margin-top:48px;color:#3d4f6f}" +
      ".cms-job__decl{font-size:9.5pt;margin:0 0 14px;padding:10px 12px;border-left:4px solid #d4a24c;background:#faf6ee;line-height:1.5}" +
      ".cms-job__footnote{font-size:8pt;color:#5a6584;text-align:center;margin-top:14px;padding-top:10px;border-top:1px solid #dde4ef}" +
      ".cms-job__office{margin-top:12px;border:1px dashed #8b6914;padding:10px 12px;font-size:8.5pt;color:#5a6584;background:#fff}" +
      ".cms-job__blank{color:transparent}" +
      ".cms-job-actions{position:sticky;top:0;z-index:10;padding:12px 16px;background:#0b1b3e;border-bottom:3px solid #d4a24c;text-align:center}" +
      ".cms-job-actions__btn{font-family:system-ui,sans-serif;font-size:14px;font-weight:600;padding:10px 22px;border-radius:8px;border:none;cursor:pointer;background:#d4a24c;color:#0b1b3e}" +
      ".cms-job-actions__hint{margin:8px 0 0;font-size:12px;color:#c5d4e8}" +
      "@media print{.cms-job__badge{position:static;float:right;margin:0 0 10px 10px}.cms-job__block{page-break-inside:avoid}.cms-job-actions{display:none!important}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
    );
  }

  function printActionBar(fileName) {
    return (
      '<div class="cms-job-actions no-print">' +
      '<button type="button" class="cms-job-actions__btn" onclick="window.print()">Download Application (PDF)</button>' +
      '<p class="cms-job-actions__hint">Click above, then choose <strong>Save as PDF</strong> in the print dialog.</p>' +
      "</div>"
    );
  }

  function field(label, value, blank) {
    return (
      '<div class="cms-job__field"><label>' +
      label +
      '</label><div class="v">' +
      cell(value, blank) +
      "</div></div>"
    );
  }

  function photoBox() {
    return (
      '<div class="cms-job__photo" aria-label="Passport-size photograph">' +
      "<span>Affix passport-size photograph</span></div>"
    );
  }

  function fieldFull(label, value, blank) {
    return (
      '<div class="cms-job__row"><div class="cms-job__field" style="grid-column:1/-1"><label>' +
      label +
      '</label><div class="v">' +
      cell(value, blank) +
      "</div></div></div>"
    );
  }

  function formatDate(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function buildHtml(data, blank, logoDataUrl) {
    data = data || {};
    var appRef = data.applicationRef || (blank ? "" : "DRAFT");
    var formRef = data.formRef || FORM_REF;
    var today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    var generated = new Date().toLocaleString("en-IN");
    var logo = resolveLogo(logoDataUrl);
    var fileSlug = (appRef || "application").replace(/[^\w-]+/g, "_");

    return (
      "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"/><title>" +
      esc(SCHOOL) +
      " — Join Our Mission Application</title><style>" +
      styles() +
      "</style></head><body>" +
      printActionBar("CMS-Application-" + fileSlug + ".html") +
      '<article class="cms-job">' +
      (blank ? "" : '<div class="cms-job__badge">Auto-generated</div>') +
      '<div class="cms-job__banner">Join Our Mission · Careers Application · Session 2026–27</div>' +
      '<header class="cms-job__head">' +
      (logo
        ? '<img class="cms-job__logo" src="' + logo + '" alt="Christ Mission School emblem" width="88" height="88"/>'
        : "") +
      '<div class="cms-job__school">' +
      "<h1>" +
      esc(SCHOOL) +
      "</h1>" +
      "<p>" +
      esc(ADDRESS) +
      "</p>" +
      '<p class="cms-job__tagline">' +
      esc(TAGLINE) +
      "</p>" +
      '<p class="cms-job__mission">' +
      esc(MISSION_LINE) +
      "</p>" +
      "</div></header>" +
      applicationSummary(data, blank, appRef, formRef, today, generated) +
      secHead(1, "Personal information") +
      '<div class="cms-job__row">' +
      field("Full name (block letters)", data.name, blank) +
      field("Date of birth", data.dob, blank) +
      "</div>" +
      '<div class="cms-job__row cms-job__row--3">' +
      '<div class="cms-job__field"><label>Gender</label><div class="cms-job__checks">' +
      "<span>" +
      checked(data.gender, "Male") +
      " Male</span><span>" +
      checked(data.gender, "Female") +
      " Female</span><span>" +
      checked(data.gender, "Other") +
      " Other</span></div></div>" +
      field("Marital status", data.marital, blank) +
      field("Nationality", data.nationality, blank) +
      "</div>" +
      '<div class="cms-job__row">' +
      field("Father&rsquo;s / husband&rsquo;s name", data.father, blank) +
      field("Mobile number", data.mobile, blank) +
      "</div>" +
      '<div class="cms-job__row">' +
      field("Email address", data.email, blank) +
      field("Earliest joining date", data.joinDate, blank) +
      "</div>" +
      fieldFull("Current address", data.address, blank) +
      fieldFull("Permanent address (if different)", data.permAddress, blank) +
      secEnd() +
      secHead(2, "Position applied for") +
      '<div class="cms-job__row cms-job__row--3">' +
      field("Post / role", data.position, blank) +
      field("Subject / specialisation", data.subject, blank) +
      field("Preferred grade level", data.grade, blank) +
      "</div>" +
      '<div class="cms-job__row">' +
      field("Expected monthly salary (₹)", data.salary, blank) +
      field("Total teaching experience (years)", data.expYears, blank) +
      "</div>" +
      secEnd() +
      secHead(3, "Educational qualifications") +
      '<table class="cms-job__data"><thead><tr><th>Degree / examination</th><th>Board / university</th><th>Year</th><th>Subjects / major</th></tr></thead><tbody><tr>' +
      "<td>" +
      cell(data.qual, blank) +
      "</td><td>" +
      cell(data.university, blank) +
      "</td><td>" +
      cell(data.year, blank) +
      "</td><td>" +
      cell(data.subject, blank) +
      "</td></tr>" +
      (blank
        ? "<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>"
        : "") +
      "</tbody></table>" +
      '<div class="cms-job__row">' +
      field("B.Ed. / D.El.Ed. status", data.bed, blank) +
      field("Languages for instruction", data.languages, blank) +
      "</div>" +
      secEnd() +
      secHead(4, "Professional experience") +
      '<table class="cms-job__data"><thead><tr><th>Organisation</th><th>Designation</th><th>Duration</th><th>Key responsibilities / skills</th></tr></thead><tbody><tr>' +
      "<td>" +
      cell(data.expOrg, blank) +
      "</td><td>" +
      cell(data.expRole, blank) +
      "</td><td>" +
      (blank ? "&nbsp;" : cell(data.expYears ? data.expYears + " years" : "", false)) +
      "</td><td>" +
      cell(data.skills, blank) +
      "</td></tr></tbody></table>" +
      secEnd() +
      secHead(5, "Motivation — Why join Christ Mission School?") +
      '<div class="cms-job__para">' +
      (blank ? "&nbsp;" : cell(data.cover, false)) +
      "</div>" +
      secEnd() +
      secHead(6, "References (not relatives)") +
      '<table class="cms-job__data"><thead><tr><th>Name</th><th>Relationship</th><th>Contact number</th></tr></thead><tbody>' +
      "<tr><td>" +
      cell(data.ref1Name, blank) +
      "</td><td>" +
      cell(data.ref1Rel, blank) +
      "</td><td>" +
      cell(data.ref1Phone, blank) +
      "</td></tr><tr><td>" +
      cell(data.ref2Name, blank) +
      "</td><td>" +
      cell(data.ref2Rel, blank) +
      "</td><td>" +
      cell(data.ref2Phone, blank) +
      "</td></tr></tbody></table>" +
      secEnd() +
      secHead(7, "Documents to attach (copies)") +
      '<ol class="cms-job__docs">' +
      "<li>Recent passport-size photograph (2 copies)</li>" +
      "<li>Valid photo ID (Aadhaar / voter ID / passport)</li>" +
      "<li>Educational certificates &amp; mark sheets</li>" +
      "<li>B.Ed. / D.El.Ed. certificate (if applicable)</li>" +
      "<li>Experience / relieving letters (if any)</li>" +
      "<li>Careers application fee receipt (₹100)</li>" +
      "</ol>" +
      secEnd() +
      paymentSection(data, blank) +
      '<section class="cms-job__block cms-job__block--sign">' +
      '<p class="cms-job__decl">I declare that the information given in this application is true to the best of my knowledge. I am willing to serve in a mission school environment in Purnea, Bihar, and understand that false information may disqualify my candidature.</p>' +
      '<div class="cms-job__foot">' +
      '<div><div class="cms-job__sig">Signature of applicant</div></div>' +
      '<div><div class="cms-job__sig">Date</div></div>' +
      "</div></section>" +
      '<div class="cms-job__office"><strong>Office use only:</strong> Received __________ | Interview __________ | Decision __________</div>' +
      '<p class="cms-job__footnote">Auto-generated by the Christ Mission School careers portal (' +
      esc(formRef) +
      "). Print, sign, and submit with all documents listed in Section 7 at the Mirganj campus during office hours.</p>" +
      "</article></body></html>"
    );
  }

  function openPrintWithLogo(data, blank) {
    function show(logo) {
      var html = buildHtml(data, !!blank, logo);
      if (global.CmsPrint && typeof global.CmsPrint.open === "function") {
        var opened = global.CmsPrint.open(html, { autoPrint: false });
        if (!opened) {
          alert(
            "Could not open the application form. Allow pop-ups, or run the site at http://localhost:3000/careers-apply.html"
          );
        }
        return opened;
      }
      alert(
        "Please allow pop-ups. Open http://localhost:3000/careers-apply.html (not the file directly) to download the form."
      );
      return false;
    }
    if (global.CmsPrint && typeof global.CmsPrint.loadSchoolLogo === "function") {
      return global.CmsPrint.loadSchoolLogo().then(show);
    }
    return show("");
  }

  function openPrint(data, blank) {
    return openPrintWithLogo(data, blank);
  }

  function downloadBlank() {
    return openPrint({}, true);
  }

  function buildOfflineApplicationPayload(extra) {
    var d = mergeData(extra || {});
    var meta =
      global.cmsGetActiveCareersPaymentMeta &&
      global.cmsGetActiveCareersPaymentMeta();
    return {
      id: (extra && extra.applicationRef) || "",
      createdAt: new Date().toISOString(),
      status: "Offline form",
      applicationChannel: "offline",
      personal: {
        name: d.name || "",
        dob: d.dob || "",
        gender: d.gender || "",
        mobile: d.mobile || "",
        email: d.email || "",
        marital: d.marital || "",
        father: d.father || "",
        nationality: d.nationality || "Indian",
        address: d.address || "",
        permAddress: d.permAddress || "",
      },
      position: {
        role: d.position || "",
        subject: d.subject || "",
        grade: d.grade || "",
        joinDate: d.joinDate || "",
      },
      education: {
        qualification: d.qual || "",
        university: d.university || "",
        year: d.year || "",
        bed: d.bed || "",
      },
      experience: {
        years: d.expYears || "",
        employer: d.expOrg || "",
        designation: d.expRole || "",
        expectedSalary: d.salary || "",
      },
      skills: d.skills || "",
      languages: d.languages || "",
      coverLetter: d.cover || "",
      feePayment:
        meta && global.cmsGetActiveCareersPaymentMeta
          ? {
              paymentRecordId: meta.paymentRecordId || "",
              transactionReference: meta.reference || "",
              paymentMethod: meta.method || "",
              amount: meta.amount != null ? meta.amount : 100,
              currency: meta.currency || "INR",
              paidAt: meta.paidAt || "",
            }
          : null,
    };
  }

  function downloadFilled(extra) {
    extra = extra || {};
    if (extra.skipFeeConsume) {
      return openPrint(mergeData(extra), false);
    }
    var run = function (appRef) {
      return openPrint(
        mergeData(
          Object.assign({}, extra, appRef ? { applicationRef: appRef } : {})
        ),
        false
      );
    };
    if (typeof global.cmsEnsureCareersFeeForUse === "function") {
      var appId =
        (extra && extra.applicationRef) ||
        "CMS-C-OFF-" + Date.now().toString(36).toUpperCase();
      var payload = buildOfflineApplicationPayload(
        Object.assign({}, extra || {}, { applicationRef: appId })
      );
      payload.id = appId;
      return global
        .cmsEnsureCareersFeeForUse("offline", appId, payload)
        .then(function (result) {
          return run(result.applicationId || appId);
        })
        .catch(function (err) {
          alert(
            (err && err.message) ||
              "Please pay the ₹100 fee first. One payment is valid for one application only."
          );
        });
    }
    return run((extra && extra.applicationRef) || "");
  }

  function wireButtons() {
    var fillBtn = document.getElementById("careersDownloadFilledBtn");
    var previewBtn = document.getElementById("careersPreviewFormBtn");
    var successBtn = document.getElementById("careersSuccessFormBtn");

    if (fillBtn) {
      fillBtn.addEventListener("click", function (e) {
        e.preventDefault();
        downloadFilled();
      });
    }
    if (previewBtn) {
      previewBtn.addEventListener("click", function (e) {
        e.preventDefault();
        downloadFilled();
      });
    }
    if (successBtn) {
      successBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var refEl = document.getElementById("careersRef");
        downloadFilled({
          applicationRef: refEl ? refEl.textContent.trim() : "",
        });
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireButtons);
  } else {
    wireButtons();
  }

  global.CmsCareersForm = {
    FORM_REF: FORM_REF,
    readForm: readForm,
    mergeData: mergeData,
    buildHtml: buildHtml,
    openPrint: openPrint,
    downloadBlank: downloadBlank,
    downloadFilled: downloadFilled,
  };
})(typeof window !== "undefined" ? window : this);
