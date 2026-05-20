/**
 * Admission application fee receipt (₹150) — print / download.
 */
(function (global) {
  var SCHOOL = "Christ Mission School";
  var ADDRESS = "Mirganj, Purnea, Bihar – 854304";
  var TAGLINE = "Excellence Through Education";
  var PURPOSE = "Admission application processing fee (Session 2026–2027)";
  var FEE_LABEL = "One hundred fifty rupees only · Non-refundable";

  var logoDataUrlCache = null;
  var lastReceiptHtml = "";

  function esc(s) {
    if (s == null || s === "") return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function val(v) {
    var t = (v == null ? "" : String(v)).trim();
    return t && t !== "—" ? esc(t) : "—";
  }

  /** jsPDF Helvetica cannot render ₹ — use Rs. for PDF only */
  function formatAmountForPdf(amount) {
    if (amount == null || amount === "") return "Rs. 150";
    var s = String(amount).trim();
    if (s === "—") return "Rs. 150";
    var num = parseFloat(s.replace(/[^\d.]/g, ""));
    if (!isNaN(num) && isFinite(num)) {
      var formatted = Number(num).toLocaleString("en-IN", {
        minimumFractionDigits: num % 1 ? 2 : 0,
        maximumFractionDigits: 2,
      });
      return "Rs. " + formatted;
    }
    return s.replace(/\u20B9/g, "Rs.").replace(/₹/g, "Rs.").trim() || "Rs. 150";
  }

  function assetUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (e) {
      return path;
    }
  }

  function blobToDataUrl(blob) {
    return new Promise(function (resolve) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result || "");
      };
      reader.onerror = function () {
        resolve("");
      };
      reader.readAsDataURL(blob);
    });
  }

  function imageElementToDataUrl(img) {
    try {
      if (!img || !img.naturalWidth) return "";
      var c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      return c.toDataURL("image/jpeg", 0.92);
    } catch (e) {
      return "";
    }
  }

  function getEmbeddedEmblem() {
    var url = global.CMS_SCHOOL_EMBLEM_DATA_URL;
    return url && /^data:image\//i.test(url) ? url : "";
  }

  function loadSchoolLogo() {
    if (logoDataUrlCache) return Promise.resolve(logoDataUrlCache);
    var embedded = getEmbeddedEmblem();
    if (embedded) {
      logoDataUrlCache = embedded;
      return Promise.resolve(embedded);
    }
    return fetch(assetUrl("assets/cms-logo.png"))
      .then(function (res) {
        if (!res.ok) throw new Error("not found");
        return res.blob();
      })
      .then(blobToDataUrl)
      .then(function (url) {
        logoDataUrlCache = url || "";
        return logoDataUrlCache;
      })
      .catch(function () {
        return "";
      });
  }

  function getJsPdf() {
    if (global.jspdf && global.jspdf.jsPDF) {
      return Promise.resolve(global.jspdf.jsPDF);
    }
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-cms-jspdf="1"]');
      if (existing) {
        existing.addEventListener("load", function () {
          if (global.jspdf && global.jspdf.jsPDF) resolve(global.jspdf.jsPDF);
          else reject(new Error("jspdf_load"));
        });
        existing.addEventListener("error", function () {
          reject(new Error("jspdf_load"));
        });
        return;
      }
      var s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js";
      s.defer = true;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-cms-jspdf", "1");
      s.onload = function () {
        if (global.jspdf && global.jspdf.jsPDF) resolve(global.jspdf.jsPDF);
        else reject(new Error("jspdf_load"));
      };
      s.onerror = function () {
        reject(new Error("jspdf_load"));
      };
      document.head.appendChild(s);
    });
  }

  function emblemSealBlock(logoDataUrl) {
    if (logoDataUrl) {
      return (
        '<div class="rcpt__sig-emblem">' +
        '<img src="' +
        logoDataUrl +
        '" alt="School logo" width="110" height="110"/>' +
        '<p class="rcpt__sig-emblem-cap">Christ Mission School</p></div>'
      );
    }
    return (
      '<div class="rcpt__sig-emblem rcpt__sig-emblem--text"><p><strong>Christ Mission School</strong><br/>Purnea, Bihar</p></div>'
    );
  }

  function readFromDom() {
    function t(id) {
      var el = document.getElementById(id);
      if (!el) return "";
      return (el.textContent || "").trim();
    }
    return {
      reference: t("recRef"),
      applicationId: t("recAppId"),
      method: t("recMethod"),
      paidAt: t("recTime"),
      amount: t("recAmountPaid") || "₹150.00",
      studentName: t("sumName"),
      classApplying: t("sumClass"),
      parentName: t("sumParent"),
      parentMobile: t("sumPhone"),
    };
  }

  function readFromSession() {
    try {
      var raw = sessionStorage.getItem("cms_admission_last_fee_txn");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function fmtDate(isoOrDisplay) {
    if (!isoOrDisplay) return "—";
    var s = String(isoOrDisplay).trim();
    if (s === "—") return s;
    if (/\d{1,2}\s+\w{3}\s+\d{4}/.test(s) && s.indexOf("T") === -1) return s;
    var d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function collect(extra) {
    var dom = readFromDom();
    var ses = readFromSession() || {};
    var out = {
      reference: dom.reference || ses.reference || "",
      applicationId: dom.applicationId || ses.applicationId || "",
      studentName: dom.studentName || ses.studentName || "",
      classApplying: dom.classApplying || ses.classApplying || "",
      parentName: dom.parentName || ses.parentName || "",
      parentMobile: dom.parentMobile || ses.parentMobile || "",
      parentEmail: ses.parentEmail || "",
      method: dom.method || ses.method || "",
      paidAt: dom.paidAt || ses.paidAt || "",
      amount:
        dom.amount ||
        (ses.amount != null ? "₹" + Number(ses.amount).toLocaleString("en-IN") : "₹150"),
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        if (extra[k] != null && String(extra[k]).trim() !== "") out[k] = extra[k];
      });
    }
    out.paidAtDisplay = fmtDate(out.paidAt);
    return out;
  }

  function styles() {
    return (
      "@page{size:A4;margin:14mm}" +
      "body{font-family:Georgia,'Times New Roman',serif;margin:0;color:#0b1b3e;font-size:11pt;background:#eef2f7}" +
      ".rcpt-actions{position:sticky;top:0;z-index:10;display:flex;flex-wrap:wrap;gap:10px;justify-content:center;padding:12px 16px;background:#0b1b3e;border-bottom:3px solid #d4a24c}" +
      ".rcpt-actions button,.rcpt-actions a{font-family:system-ui,sans-serif;font-size:14px;font-weight:600;padding:10px 18px;border-radius:8px;border:none;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:6px}" +
      ".rcpt-actions .btn-print{background:#d4a24c;color:#0b1b3e}" +
      ".rcpt-actions .btn-dl{background:#fff;color:#0b1b3e;border:1px solid #c5d4e8}" +
      ".rcpt-wrap{padding:16px}" +
      ".rcpt{max-width:180mm;margin:0 auto;border:2px solid #0b1b3e;border-radius:6px;overflow:hidden;background:#fff}" +
      ".rcpt__head{background:linear-gradient(135deg,#0b1b3e,#1a3a6e);color:#fff;padding:16px 20px;display:flex;gap:14px;align-items:center;justify-content:space-between}" +
      ".rcpt__brand{flex:1;min-width:0}" +
      ".rcpt__brand h1{margin:0;font-size:14pt;letter-spacing:.06em}" +
      ".rcpt__brand p{margin:4px 0 0;font-size:9pt;opacity:.9}" +
      ".rcpt__stamp{margin-left:auto;text-align:center;background:#2e7d32;color:#fff;padding:8px 14px;border-radius:4px;font-weight:bold;font-size:11pt;letter-spacing:.08em;flex-shrink:0}" +
      ".rcpt__title{text-align:center;padding:12px;background:#faf6ee;border-bottom:1px solid #e5dec9;font-size:12pt;font-weight:bold}" +
      ".rcpt__amt{text-align:center;padding:20px;background:#fff8e6;border-bottom:2px solid #d4a24c}" +
      ".rcpt__amt-label{font-size:9pt;text-transform:uppercase;letter-spacing:.1em;color:#5a6584}" +
      ".rcpt__amt-val{font-size:28pt;font-weight:bold;color:#0b1b3e;margin:6px 0}" +
      ".rcpt__amt-words{font-size:9.5pt;color:#5a6584;font-style:italic}" +
      ".rcpt__body{padding:16px 20px}" +
      ".rcpt__grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 24px}" +
      ".rcpt__row{font-size:10pt}" +
      ".rcpt__row dt{font-size:8pt;text-transform:uppercase;color:#5a6584;letter-spacing:.04em;margin:0 0 2px}" +
      ".rcpt__row dd{margin:0;font-weight:600;color:#0b1b3e;word-break:break-word}" +
      ".rcpt__row--full{grid-column:1/-1}" +
      ".rcpt__foot{padding:14px 20px;background:#f4efe3;border-top:3px solid #d4a24c;font-size:8pt;color:#5a6584;text-align:center;line-height:1.55;display:flex;flex-direction:column;gap:5px;align-items:center}" +
      ".rcpt__foot strong{font-size:9pt;color:#0b1b3e;font-weight:700}" +
      ".rcpt__sig{margin-top:24px;padding:0 20px 16px;display:flex;justify-content:space-between;align-items:flex-end;gap:32px;font-size:9pt}" +
      ".rcpt__sig-emblem{flex:0 0 auto;text-align:center}" +
      ".rcpt__sig-emblem img{width:110px;height:110px;object-fit:contain;border-radius:50%;background:#fff;padding:4px;box-shadow:0 2px 10px rgba(11,27,62,.12)}" +
      ".rcpt__sig-emblem-cap{margin:8px 0 0;font-size:8pt;color:#5a6584;font-weight:600;letter-spacing:.03em}" +
      ".rcpt__sig-emblem--text p{margin:0;font-size:9pt;color:#0b1b3e;line-height:1.45}" +
      ".rcpt__sig-ack{flex:1;max-width:220px;margin-left:auto;border-top:1px solid #0b1b3e;padding-top:8px;text-align:center;color:#0b1b3e}" +
      "@media print{.rcpt-actions{display:none!important}.rcpt-wrap{padding:0}body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}}"
    );
  }

  function actionBar(downloadName) {
    var safeName = esc(downloadName || "CMS-Admission-Receipt.html");
    return (
      '<div class="rcpt-actions no-print">' +
      '<button type="button" class="btn-print" onclick="window.print()">Save as PDF (Print)</button>' +
      '<a class="btn-dl" id="cmsReceiptDownload" download="' +
      safeName +
      '" href="#">Download receipt file</a>' +
      "</div>"
    );
  }

  function buildHtml(data, logoDataUrl) {
    data = data || collect();
    var issued = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    var dlName =
      "CMS-Admission-Receipt-" +
      (data.reference || "payment").replace(/[^\w-]+/g, "_") +
      ".html";

    function row(label, value, full) {
      return (
        '<div class="rcpt__row' +
        (full ? " rcpt__row--full" : "") +
        '"><dt>' +
        label +
        "</dt><dd>" +
        val(value) +
        "</dd></div>"
      );
    }

    return (
      "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"/><title>" +
      esc(SCHOOL) +
      " — Admission Fee Receipt</title><style>" +
      styles() +
      "</style></head><body>" +
      actionBar(dlName) +
      '<div class="rcpt-wrap"><article class="rcpt">' +
      '<header class="rcpt__head">' +
      '<div class="rcpt__brand"><h1>' +
      esc(SCHOOL) +
      "</h1><p>" +
      esc(ADDRESS) +
      "</p><p>" +
      esc(TAGLINE) +
      '</p></div><span class="rcpt__stamp">PAID</span></header>' +
      '<p class="rcpt__title">Official Payment Receipt · Admission Application</p>' +
      '<div class="rcpt__amt"><p class="rcpt__amt-label">Amount received</p>' +
      '<p class="rcpt__amt-val">' +
      val(data.amount) +
      '</p><p class="rcpt__amt-words">' +
      esc(FEE_LABEL) +
      "</p></div>" +
      '<div class="rcpt__body"><dl class="rcpt__grid">' +
      row("Transaction ID", data.reference, true) +
      row("Application ID", data.applicationId, true) +
      row("Student name", data.studentName) +
      row("Class applying for", data.classApplying) +
      row("Parent / guardian", data.parentName) +
      row("Contact mobile", data.parentMobile) +
      row("Payment method", data.method) +
      row("Payment date &amp; time", data.paidAtDisplay || data.paidAt) +
      row("Purpose", PURPOSE, true) +
      row("Receipt issued", issued) +
      "</dl></div>" +
      '<div class="rcpt__sig">' +
      emblemSealBlock(logoDataUrl) +
      "</div>" +
      "</article></div>" +
      '<footer class="rcpt__foot"><span>This is a computer-generated receipt. No physical signature is required.</span>' +
      "<strong>Christ Mission School</strong>" +
      "<span>Admissions Portal · Mirganj, Purnea, Bihar 854304</span></footer>" +
      "</body></html>"
    );
  }

  function downloadHtmlFile(html, filename) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "CMS-Admission-Receipt.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 800);
    return true;
  }

  function openInNewWindow(html, autoPrint) {
    try {
      var w = window.open("about:blank", "_blank");
      if (!w) return false;
      w.document.open();
      w.document.write(html);
      w.document.close();
      try {
        var dl = w.document.getElementById("cmsReceiptDownload");
        if (dl) {
          var blob = new Blob([html], { type: "text/html;charset=utf-8" });
          dl.href = URL.createObjectURL(blob);
        }
      } catch (e) {}
      w.focus();
      if (autoPrint) {
        setTimeout(function () {
          try {
            w.print();
          } catch (e2) {}
        }, 400);
      }
      return true;
    } catch (e3) {
      return false;
    }
  }

  function ensurePrintHost() {
    var host = document.getElementById("cmsAdmReceiptHost");
    if (host) return host;
    host = document.createElement("div");
    host.id = "cmsAdmReceiptHost";
    host.hidden = true;
    host.innerHTML =
      '<div class="adm-rcpt-overlay" role="dialog" aria-modal="true" aria-label="Admission fee receipt">' +
      '<div class="adm-rcpt-overlay__toolbar">' +
      '<p class="adm-rcpt-overlay__hint">Use <strong>Print / Save PDF</strong>, then choose &ldquo;Save as PDF&rdquo; or your printer.</p>' +
      '<div class="adm-rcpt-overlay__btns">' +
      '<button type="button" class="pay-btn pay-btn--primary" id="cmsAdmReceiptPrintBtn">Print / Save PDF</button>' +
      '<button type="button" class="pay-btn pay-btn--ghost" id="cmsAdmReceiptCloseBtn">Close</button>' +
      "</div>" +
      "</div>" +
      '<iframe class="adm-rcpt-overlay__frame" title="Admission payment receipt"></iframe>' +
      "</div>";
    document.body.appendChild(host);
    host.querySelector("#cmsAdmReceiptCloseBtn").addEventListener("click", function () {
      host.hidden = true;
    });
    host.querySelector("#cmsAdmReceiptPrintBtn").addEventListener("click", function () {
      var frame = host.querySelector("iframe");
      if (frame && frame.contentWindow) {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (e) {}
      }
    });
    return host;
  }

  function showReceiptViewer(html, opts) {
    opts = opts || {};
    var host = ensurePrintHost();
    var frame = host.querySelector("iframe");
    if (!frame) return false;
    frame.srcdoc = html;
    host.hidden = false;
    if (opts.autoPrint) {
      frame.onload = function () {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (e) {}
      };
    }
    return true;
  }

  function openHtmlViewer(html, opts) {
    opts = opts || {};
    if (openInNewWindow(html, opts.autoPrint)) return true;

    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var w = window.open(url, "_blank");
    if (w) {
      w.addEventListener("load", function () {
        try {
          var dl = w.document.getElementById("cmsReceiptDownload");
          if (dl) {
            dl.href = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
          }
        } catch (e) {}
        if (opts.autoPrint) {
          try {
            w.focus();
            w.print();
          } catch (e2) {}
        }
        setTimeout(function () {
          URL.revokeObjectURL(url);
        }, 60000);
      });
      return true;
    }
    URL.revokeObjectURL(url);

    return showReceiptViewer(html, opts);
  }

  function prepareReceipt(extra) {
    var data = collect(extra);
    if (!data.reference && !data.applicationId) {
      return Promise.reject(new Error("no_data"));
    }
    return loadSchoolLogo().then(function (logo) {
      lastReceiptHtml = buildHtml(data, logo);
      return { data: data, html: lastReceiptHtml };
    });
  }

  function openPrint(extra) {
    var popup = null;
    try {
      popup = window.open("about:blank", "_blank");
    } catch (e) {}

    var host = null;
    var frame = null;
    if (!popup) {
      host = ensurePrintHost();
      host.hidden = false;
      frame = host.querySelector("iframe");
      if (frame) {
        frame.srcdoc =
          "<!DOCTYPE html><html><body style=\"font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#0b1b3e\"><p>Preparing your receipt…</p></body></html>";
      }
    }

    return prepareReceipt(extra)
      .then(function (pack) {
        if (popup) {
          popup.document.open();
          popup.document.write(pack.html);
          popup.document.close();
          popup.focus();
          setTimeout(function () {
            try {
              popup.print();
            } catch (e2) {}
          }, 350);
          return true;
        }
        if (showReceiptViewer(pack.html, { autoPrint: false })) {
          return true;
        }
        return openHtmlViewer(pack.html, { autoPrint: false });
      })
      .catch(function (err) {
        if (host) host.hidden = true;
        if (err && err.message === "no_data") {
          alert("No payment receipt data found. Complete the ₹150 payment first.");
          return false;
        }
        alert("Could not open the receipt. Try Download PDF receipt, or allow pop-ups for this site.");
        return false;
      });
  }

  function buildPdfDocument(JsPDF, data, logoDataUrl) {
    var doc = new JsPDF({ unit: "mm", format: "a4" });
    var pageW = doc.internal.pageSize.getWidth();
    var pageH = doc.internal.pageSize.getHeight();
    var cardW = 178;
    var cardX = (pageW - cardW) / 2;
    var pad = 11;
    var innerX = cardX + pad;
    var innerW = cardW - pad * 2;
    var labelW = 52;
    var valueX = innerX + labelW;
    var valueW = innerW - labelW;
    var center = pageW / 2;

    function pdfVal(value) {
      if (value == null || String(value).trim() === "") return "—";
      return String(value).trim();
    }

    function rowDivider() {
      doc.setDrawColor(235, 238, 245);
      doc.setLineWidth(0.2);
      doc.line(innerX, y, innerX + innerW, y);
      y += 2.5;
    }

    function detailRow(label, value, isFirst) {
      if (!isFirst) rowDivider();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(90, 101, 132);
      doc.text(String(label).toUpperCase(), innerX, y + 3.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(11, 27, 62);
      var lines = doc.splitTextToSize(pdfVal(value), valueW);
      doc.setFont("helvetica", "normal");
      doc.text(lines, valueX, y + 3.5);
      y += Math.max(7, lines.length * 4.2) + 2;
    }

    var cardY = 46;
    var y = cardY;
    var headerH = 36;

    doc.setFillColor(11, 27, 62);
    doc.roundedRect(cardX, cardY, cardW, headerH, 3, 3, "F");
    if (logoDataUrl) {
      try {
        var fmt = /png/i.test(logoDataUrl) ? "PNG" : "JPEG";
        doc.addImage(logoDataUrl, fmt, cardX + pad, cardY + 7, 20, 20);
      } catch (imgErr) {}
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(SCHOOL, center, cardY + 14, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(ADDRESS, center, cardY + 20, { align: "center" });
    doc.text(TAGLINE, center, cardY + 25, { align: "center" });
    doc.setFillColor(46, 125, 50);
    doc.roundedRect(cardX + cardW - pad - 22, cardY + 8, 22, 9, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PAID", cardX + cardW - pad - 11, cardY + 14, { align: "center" });

    y = cardY + headerH + 8;
    doc.setTextColor(11, 27, 62);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Official Payment Receipt", center, y, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(90, 101, 132);
    doc.text("Admission Application Fee", center, y + 5, { align: "center" });

    y += 12;
    var amtH = 22;
    doc.setFillColor(255, 248, 230);
    doc.roundedRect(innerX, y, innerW, amtH, 2, 2, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(90, 101, 132);
    doc.text("Amount received", innerX + 8, y + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(11, 27, 62);
    doc.text(formatAmountForPdf(data.amount), innerX + innerW - 8, y + 14, { align: "right" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.8);
    doc.setTextColor(90, 101, 132);
    doc.text("Non-refundable processing fee", innerX + 8, y + 17);

    y += amtH + 6;

    detailRow("Transaction ID", data.reference, true);
    detailRow("Application ID", data.applicationId);
    detailRow("Student name", data.studentName);
    detailRow("Class applying for", data.classApplying);
    detailRow("Parent / guardian", data.parentName);
    detailRow("Contact mobile", data.parentMobile);
    detailRow("Payment method", data.method);
    detailRow("Payment date & time", data.paidAtDisplay || data.paidAt);
    detailRow("Purpose", PURPOSE);
    detailRow(
      "Receipt issued",
      new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    );

    y += 4;
    var footerH = 12;
    doc.setFillColor(244, 239, 227);
    doc.rect(cardX, y, cardW, footerH, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.3);
    doc.setTextColor(90, 101, 132);
    doc.text("Computer-generated receipt · No physical signature required", center, y + 5, {
      align: "center",
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(11, 27, 62);
    doc.text("Christ Mission School · Admissions · Mirganj, Purnea 854304", center, y + 9, {
      align: "center",
    });

    var cardH = y + footerH - cardY;

    doc.setDrawColor(11, 27, 62);
    doc.setLineWidth(0.55);
    doc.roundedRect(cardX, cardY, cardW, cardH, 3, 3, "S");
    doc.setDrawColor(212, 162, 76);
    doc.setLineWidth(0.8);
    doc.line(cardX + 8, cardY + headerH, cardX + cardW - 8, cardY + headerH);

    return doc;
  }

  function downloadPdf(extra) {
    return prepareReceipt(extra)
      .then(function (pack) {
        return getJsPdf().then(function (JsPDF) {
          var doc = buildPdfDocument(JsPDF, pack.data, logoDataUrlCache);
          var ref = (pack.data.reference || "payment").replace(/[^\w-]+/g, "_");
          doc.save("CMS-Admission-Receipt-" + ref + ".pdf");
          return true;
        });
      })
      .catch(function (err) {
        if (err && err.message === "no_data") {
          alert("No payment receipt data found. Complete the ₹150 payment first.");
          return false;
        }
        if (err && err.message === "jspdf_load") {
          alert("PDF library could not load. Check your internet connection, or use Print receipt.");
        } else {
          alert("Could not create the PDF file. Opening print view instead.");
        }
        return openPrint(extra);
      });
  }

  function downloadReceipt(extra) {
    return prepareReceipt(extra)
      .then(function (pack) {
        var ref = (pack.data.reference || "payment").replace(/[^\w-]+/g, "_");
        downloadHtmlFile(pack.html, "CMS-Admission-Receipt-" + ref + ".html");
        return true;
      })
      .catch(function (err) {
        if (err && err.message === "no_data") {
          alert("No payment receipt data found. Complete the ₹150 payment first.");
          return false;
        }
        alert("Could not download the receipt. Please try again.");
        return false;
      });
  }

  function wireButtons() {
    var pdfBtn = document.getElementById("downloadAdmissionPdf");
    if (pdfBtn) {
      pdfBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        downloadPdf();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireButtons);
  } else {
    wireButtons();
  }

  global.CMSAdmissionReceipt = {
    collect: collect,
    openPrint: openPrint,
    downloadPdf: downloadPdf,
    downloadReceipt: downloadReceipt,
    prepareReceipt: prepareReceipt,
  };
})(typeof window !== "undefined" ? window : this);
