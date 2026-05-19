/**
 * Auto-generated careers application fee receipt (print / download).
 */
(function (global) {
  var SCHOOL = "Christ Mission School";
  var ADDRESS = "Mirganj, Purnea, Bihar – 854304";
  var TAGLINE = "Excellence Through Education";
  var PURPOSE = "Careers application processing fee (Join Our Mission)";

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

  function assetUrl(path) {
    try {
      return new URL(path, window.location.href).href;
    } catch (e) {
      return path;
    }
  }

  var EMBLEM_PATHS = ["assets/cms-school-emblem.jpg"];

  function getEmbeddedEmblem() {
    var url = global.CMS_SCHOOL_EMBLEM_DATA_URL;
    return url && /^data:image\//i.test(url) ? url : "";
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

  function imagePathToDataUrl(path) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        var url = imageElementToDataUrl(img);
        resolve(url);
      };
      img.onerror = function () {
        resolve("");
      };
      img.src = assetUrl(path);
    });
  }

  function emblemFromDom() {
    var img = document.getElementById("careersRecEmblem");
    if (!img || !img.src) return Promise.resolve("");
    if (/^data:image\//i.test(img.src)) return Promise.resolve(img.src);
    if (img.complete && img.naturalWidth) {
      return Promise.resolve(imageElementToDataUrl(img));
    }
    return new Promise(function (resolve) {
      img.addEventListener(
        "load",
        function () {
          resolve(imageElementToDataUrl(img));
        },
        { once: true }
      );
      img.addEventListener(
        "error",
        function () {
          resolve("");
        },
        { once: true }
      );
    });
  }

  function loadSchoolLogo() {
    if (logoDataUrlCache) return Promise.resolve(logoDataUrlCache);
    var paths = EMBLEM_PATHS;
    function tryFetch(index) {
      if (index >= paths.length) return Promise.resolve("");
      return fetch(assetUrl(paths[index]))
        .then(function (res) {
          if (!res.ok) throw new Error("not found");
          return res.blob();
        })
        .then(function (blob) {
          return blobToDataUrl(blob);
        })
        .then(function (dataUrl) {
          if (dataUrl) return dataUrl;
          return tryFetch(index + 1);
        })
        .catch(function () {
          return tryFetch(index + 1);
        });
    }
    function tryImage(index) {
      if (index >= paths.length) return Promise.resolve("");
      return imagePathToDataUrl(paths[index]).then(function (dataUrl) {
        if (dataUrl) return dataUrl;
        return tryImage(index + 1);
      });
    }
    return tryFetch(0).then(function (dataUrl) {
      if (dataUrl) {
        logoDataUrlCache = dataUrl;
        return dataUrl;
      }
      return tryImage(0);
    });
  }

  /** Ensures emblem is embedded as data URL (required for downloaded .html files). */
  function resolveEmblemDataUrl() {
    var embedded = getEmbeddedEmblem();
    if (embedded) {
      logoDataUrlCache = embedded;
      return Promise.resolve(embedded);
    }
    if (logoDataUrlCache) return Promise.resolve(logoDataUrlCache);
    return loadSchoolLogo()
      .then(function (logo) {
        if (logo) return logo;
        return emblemFromDom();
      })
      .then(function (logo) {
        if (logo && /^data:image\//i.test(logo)) {
          logoDataUrlCache = logo;
          return logo;
        }
        var paths = EMBLEM_PATHS;
        function tryImg(i) {
          if (i >= paths.length) return Promise.resolve("");
          return imagePathToDataUrl(paths[i]).then(function (url) {
            if (url) return url;
            return tryImg(i + 1);
          });
        }
        return tryImg(0);
      })
      .then(function (logo) {
        if (logo && /^data:image\//i.test(logo)) {
          logoDataUrlCache = logo;
        }
        return logo || "";
      });
  }

  function emblemSealBlock(logoDataUrl) {
    if (logoDataUrl) {
      return (
        '<div class="rcpt__sig-emblem">' +
        '<img src="' +
        logoDataUrl +
        '" alt="Christ Mission School official emblem" width="110" height="110"/>' +
        '<p class="rcpt__sig-emblem-cap">Christ Mission School · Mirganj</p>' +
        "</div>"
      );
    }
    return (
      '<div class="rcpt__sig-emblem rcpt__sig-emblem--text">' +
      "<p><strong>Christ Mission School</strong><br/>Mirganj, Purnea, Bihar</p>" +
      "</div>"
    );
  }

  function readFromDom() {
    function t(id) {
      var el = document.getElementById(id);
      if (!el) return "";
      return (el.textContent || "").trim();
    }
    return {
      reference: t("careersRecRef"),
      name: t("careersRecName"),
      email: t("careersRecEmail"),
      phone: t("careersRecPhone"),
      method: t("careersRecMethod"),
      paidAt: t("careersRecTime"),
      amount: "₹100.00",
    };
  }

  function readFromSession() {
    try {
      var raw = sessionStorage.getItem("cms_careers_last_fee_txn");
      if (!raw) return null;
      var p = JSON.parse(raw);
      var a = p.applicant || {};
      return {
        reference: p.reference || p.paymentRecordId || "",
        name: a.name || "",
        email: a.email || "",
        phone: a.phone || "",
        method: p.method || "",
        paidAt: p.paidAt || "",
        amount: p.amount != null ? "₹" + Number(p.amount).toFixed(2) : "₹100.00",
      };
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
      name: dom.name || ses.name || "",
      email: dom.email || ses.email || "",
      phone: dom.phone || ses.phone || "",
      method: dom.method || ses.method || "",
      paidAt: dom.paidAt || ses.paidAt || "",
      amount: dom.amount || ses.amount || "₹100.00",
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
      ".rcpt__foot{padding:14px 20px;background:#f4efe3;border-top:1px solid #e5dec9;font-size:8.5pt;color:#5a6584;text-align:center;line-height:1.5}" +
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
    var safeName = esc(downloadName || "CMS-Careers-Receipt.html");
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
      "CMS-Careers-Receipt-" +
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
      " — Payment Receipt</title><style>" +
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
      '<p class="rcpt__title">Official Payment Receipt · Join Our Mission Careers</p>' +
      '<div class="rcpt__amt"><p class="rcpt__amt-label">Amount received</p>' +
      '<p class="rcpt__amt-val">' +
      val(data.amount) +
      '</p><p class="rcpt__amt-words">One hundred rupees only · Non-refundable</p></div>' +
      '<div class="rcpt__body"><dl class="rcpt__grid">' +
      row("Transaction ID", data.reference, true) +
      row("Applicant name", data.name) +
      row("Mobile number", data.phone) +
      row("Email address", data.email, true) +
      row("Payment method", data.method) +
      row("Payment date &amp; time", data.paidAtDisplay || data.paidAt) +
      row("Purpose", PURPOSE, true) +
      row("Receipt issued", issued) +
      "</dl></div>" +
      '<div class="rcpt__sig">' +
      emblemSealBlock(logoDataUrl) +
      '<span class="rcpt__sig-ack">Applicant acknowledgement</span>' +
      "</div>" +
      "</div>" +
      '<footer class="rcpt__foot">Computer-generated receipt · Christ Mission School careers portal · Mirganj, Purnea</footer>' +
      "</article></div></body></html>"
    );


  }

  function downloadHtmlFile(html, filename) {
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "CMS-Careers-Receipt.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 800);
    return true;
  }

  function openHtmlViewer(html, opts) {
    opts = opts || {};
    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var w = window.open(url, "_blank");
    if (w) {
      w.addEventListener("load", function () {
        try {
          var doc = w.document;
          var dl = doc.getElementById("cmsReceiptDownload");
          if (dl) {
            var b2 = new Blob([html], { type: "text/html;charset=utf-8" });
            dl.href = URL.createObjectURL(b2);
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

    var frame = document.getElementById("cmsPrintFrame");
    if (!frame) {
      frame = document.createElement("iframe");
      frame.id = "cmsPrintFrame";
      frame.setAttribute("title", "Receipt preview");
      frame.style.cssText =
        "position:fixed;left:0;top:0;width:100%;height:100%;border:0;z-index:99999;background:#fff";
      document.body.appendChild(frame);
    }
    frame.srcdoc = html;
    if (opts.autoPrint) {
      frame.onload = function () {
        try {
          frame.contentWindow.print();
        } catch (e3) {}
      };
    }
    return true;
  }

  function prepareReceipt(extra) {
    var data = collect(extra);
    if (!data.reference && !data.name) {
      return Promise.reject(new Error("no_data"));
    }
    return resolveEmblemDataUrl().then(function (logo) {
      lastReceiptHtml = buildHtml(data, logo);
      return { data: data, html: lastReceiptHtml };
    });
  }

  function openPrint(extra) {
    return prepareReceipt(extra)
      .then(function (pack) {
        return openHtmlViewer(pack.html, { autoPrint: false });
      })
      .catch(function (err) {
        if (err && err.message === "no_data") {
          alert("No payment receipt data found. Complete payment first.");
        }
        return false;
      });
  }

  function downloadReceipt(extra) {
    return prepareReceipt(extra)
      .then(function (pack) {
        var ref = (pack.data.reference || "payment").replace(/[^\w-]+/g, "_");
        downloadHtmlFile(pack.html, "CMS-Careers-Receipt-" + ref + ".html");
        return true;
      })
      .catch(function (err) {
        if (err && err.message === "no_data") {
          alert("No payment receipt data found. Complete payment first.");
        }
        return false;
      });
  }

  function updatePanelEmblem() {
    var img = document.getElementById("careersRecEmblem");
    if (!img) return;
    var embedded = getEmbeddedEmblem();
    if (embedded) {
      img.src = embedded;
      img.style.display = "block";
      return;
    }
    resolveEmblemDataUrl().then(function (dataUrl) {
      if (dataUrl) {
        img.src = dataUrl;
        img.style.display = "block";
      }
    });
  }

  function wireButtons() {
    var printBtn = document.getElementById("careersPrintReceipt");
    if (printBtn) {
      printBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openPrint();
      });
    }
    var dlBtn = document.getElementById("careersDownloadReceipt");
    if (dlBtn) {
      dlBtn.addEventListener("click", function (e) {
        e.preventDefault();
        downloadReceipt();
      });
    }
    var pdfBtn = document.getElementById("careersSavePdfReceipt");
    if (pdfBtn) {
      pdfBtn.addEventListener("click", function (e) {
        e.preventDefault();
        openPrint();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      wireButtons();
      resolveEmblemDataUrl();
    });
  } else {
    wireButtons();
    resolveEmblemDataUrl();
  }

  global.CmsPrint = {
    open: openHtmlViewer,
    assetUrl: assetUrl,
    loadSchoolLogo: resolveEmblemDataUrl,
  };
  global.CmsCareersReceipt = {
    collect: collect,
    buildHtml: buildHtml,
    openPrint: openPrint,
    downloadReceipt: downloadReceipt,
    prepareReceipt: prepareReceipt,
    updatePanelEmblem: updatePanelEmblem,
    loadSchoolLogo: resolveEmblemDataUrl,
  };
})(typeof window !== "undefined" ? window : this);
